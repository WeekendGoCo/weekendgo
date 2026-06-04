/**
 * @file webbeds.js
 * @description مزود WebBeds (DOTW Legacy) — APITUDE REST/JSON
 * @status PENDING — ينتظر موافقة WebBeds
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   WEBBEDS_COMPANY_CODE = 2298535
 *   WEBBEDS_LOGIN        = Weekend.Go
 *   WEBBEDS_PASSWORD     = <كلمة المرور>
 *
 * تحذير حاسم: Look-to-Book Ratio
 *   يجب تطبيق Static Content Caching في PostgreSQL
 *   حصر الاستعلام اللحظي على الأسعار والتوافر فقط
 *   مخالفة هذا تؤدي لحظر الحساب
 *
 * جهة الدعم: Ahmed Tulpa — dotwconnect.com
 *
 * لتفعيله: أزل التعليق عن سطر DISABLED أدناه
 */

const { PROVIDERS, applyMarkup } = require('./types');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  المزود معطّل — ينتظر موافقة WebBeds
const DISABLED = true;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = 'https://api.webbeds.com/v1'; // تأكد من الـ endpoint الفعلي عند التفعيل

function isAvailable() {
  if (DISABLED) return false;
  return !!(process.env.WEBBEDS_COMPANY_CODE && process.env.WEBBEDS_PASSWORD);
}

async function searchLocations(_query) {
  // WebBeds لا يملك location search — يعتمد على city codes ثابتة
  return [];
}

async function searchHotels({ cityCode, checkIn, checkOut, adults = 2, children = [] }) {
  if (!isAvailable()) return [];

  const payload = {
    companyCode: process.env.WEBBEDS_COMPANY_CODE,
    login:       process.env.WEBBEDS_LOGIN,
    password:    process.env.WEBBEDS_PASSWORD,
    cityCode,
    checkIn,
    checkOut,
    rooms: [{ adults, children }],
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/hotels/search`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[WebBeds] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    console.error(`[WebBeds] HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const hotels = data?.hotels ?? [];

  return hotels.map(h => {
    const netPrice   = parseFloat(h.price ?? 0);
    const finalPrice = applyMarkup(netPrice, PROVIDERS.WEBBEDS);

    return {
      id:          h.hotelCode,
      name:        h.hotelName,
      location:    cityCode,
      stars:       h.stars ?? null,
      rating:      null,
      reviews:     null,
      price:       finalPrice,
      netPrice:    netPrice,
      currency:    h.currency ?? 'USD',
      image:       null,
      provider:    PROVIDERS.WEBBEDS,
      cancellable: false,
      rawData:     h,
    };
  });
}

module.exports = { isAvailable, searchLocations, searchHotels };
