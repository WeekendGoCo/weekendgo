/**
 * @file booking.js
 * @description مزود Booking.com — Demand API v3.2
 * @status PENDING — ينتظر موافقة Booking.com
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   BOOKING_TOKEN = kPyMKBzaUbOzcnL4yOQ5
 *
 * تنبيه تقني (من التقرير):
 *   - معرّف الغرفة accommodation.products.room يجب أن يُمرَّر كـ String حصراً
 *   - الإصدار v3.2 يشترط كائن booker (بلد المسافر) ومصفوفة guests مع أعمار الأطفال
 *
 * لتفعيله: أزل التعليق عن سطر DISABLED أدناه بعد الحصول على موافقة Booking.com
 */

const { PROVIDERS, applyMarkup } = require('./types');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  المزود معطّل — أزل هذا السطر للتفعيل بعد الموافقة
const DISABLED = true;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = 'https://demand-api.booking.com/v1.2';

function isAvailable() {
  if (DISABLED) return false;
  return !!process.env.BOOKING_TOKEN;
}

/**
 * Location search — Booking.com يستخدم dest_id رقمي
 * مثال: دبي = -2140479
 */
async function searchLocations(query) {
  if (!isAvailable()) return [];

  const res = await fetch(
    `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`,
    {
      headers: {
        'x-rapidapi-key':  process.env.RAPIDAPI_KEY ?? '',
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
      },
    }
  );

  const json = await res.json();
  if (!json?.data) return [];

  return json.data.map(item => ({
    id:          item.dest_id,
    name:        item.label,
    type:        item.dest_type,
    country:     item.country,
    cityName:    item.city_name,
    providerKey: PROVIDERS.BOOKING,
  }));
}

/**
 * Hotel search — Demand API v3.2
 */
async function searchHotels({ destId, checkIn, checkOut, adults = 2, children = [], bookerCountry = 'SA' }) {
  if (!isAvailable()) return [];

  const payload = {
    booker: { country: bookerCountry },
    checkin:  checkIn,
    checkout: checkOut,
    guests: [
      {
        // adults
        ...Array.from({ length: adults }, () => ({ type: 'adult' })),
        // children — يجب تمرير العمر لكل طفل
        ...children.map(age => ({ type: 'child', age })),
      },
    ],
    accommodations: [{ id: String(destId) }],  // ← String إلزامي في v3.2
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/accommodations/search`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BOOKING_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Booking] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    console.error(`[Booking] HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const items = data?.accommodations ?? [];

  return items.map(h => {
    const netPrice   = h.price?.total?.value ?? 0;
    const finalPrice = applyMarkup(netPrice, PROVIDERS.BOOKING);

    return {
      id:          String(h.id),
      name:        h.name,
      location:    h.location?.city ?? '',
      stars:       h.starRating ?? null,
      rating:      h.guestRating?.score ?? null,
      reviews:     h.guestRating?.count ?? null,
      price:       finalPrice,
      netPrice:    netPrice,
      currency:    h.price?.total?.currency ?? 'USD',
      image:       h.photos?.[0]?.url ?? null,
      provider:    PROVIDERS.BOOKING,
      cancellable: h.products?.[0]?.cancellationPolicy?.freeCancellation ?? false,
      rawData:     h,
    };
  });
}

module.exports = { isAvailable, searchLocations, searchHotels };
