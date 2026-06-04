/**
 * @file hotelsnl.js
 * @description مزود Hotels.nl — POST JSON API
 * @status READY — يحتاج فقط API Key في .env
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   HOTELS_NL_API_KEY = <API Key>
 *
 * قيود مهمة:
 *   - 5 طلبات / دقيقة لكل IP
 *   - 200 طلب / يوم
 *   - يعيد أرخص سعر لـ 15 فندق كحد أقصى
 *   - يستخدم hotelsnl_hash كمعرّف حتمي لإتمام الحجز
 *
 * مسار العمل: Search → Details → Book (عبر Finalization URL)
 */

const { PROVIDERS, applyMarkup } = require('./types');

const BASE_URL = 'https://api.hotels.nl/v1';

function isAvailable() {
  return !!process.env.HOTELS_NL_API_KEY;
}

async function searchLocations(query) {
  if (!isAvailable()) return [];

  let res;
  try {
    res = await fetch(`${BASE_URL}/locations/search?q=${encodeURIComponent(query)}`, {
      headers: { 'X-API-Key': process.env.HOTELS_NL_API_KEY },
    });
  } catch (err) {
    console.error('[Hotels.nl] Network error:', err.message);
    return [];
  }

  if (!res.ok) return [];

  const data = await res.json();
  return (data?.locations ?? []).map(l => ({
    id:          l.id,
    name:        l.name,
    type:        l.type,
    country:     l.country,
    cityName:    l.city,
    providerKey: PROVIDERS.HOTELS_NL,
  }));
}

async function searchHotels({ locationId, checkIn, checkOut, adults = 2, children = [] }) {
  if (!isAvailable()) return [];

  const payload = {
    location_id:  locationId,
    check_in:     checkIn,
    check_out:    checkOut,
    adults,
    children:     children.length,
    children_ages: children,
    currency:     'USD',
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/hotels/search`, {
      method:  'POST',
      headers: {
        'X-API-Key':    process.env.HOTELS_NL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Hotels.nl] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    console.error(`[Hotels.nl] HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const hotels = data?.hotels ?? [];

  return hotels.map(h => {
    const netPrice   = parseFloat(h.price ?? 0);
    const finalPrice = applyMarkup(netPrice, PROVIDERS.HOTELS_NL);

    return {
      id:          h.id,
      name:        h.name,
      location:    h.location ?? '',
      stars:       h.stars ?? null,
      rating:      h.rating ?? null,
      reviews:     h.review_count ?? null,
      price:       finalPrice,
      netPrice:    netPrice,
      currency:    h.currency ?? 'USD',
      image:       h.images?.[0] ?? null,
      provider:    PROVIDERS.HOTELS_NL,
      cancellable: h.free_cancellation ?? false,
      bookingHash: h.hotelsnl_hash,    // مطلوب لإتمام الحجز
      rawData:     h,
    };
  });
}

module.exports = { isAvailable, searchLocations, searchHotels };
