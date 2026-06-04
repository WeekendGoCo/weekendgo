/**
 * @file types.js
 * @description الأنواع والثوابت المشتركة لكل مزودي الأسعار
 *
 * كل مزود يجب أن يُصدّر:
 *   - isAvailable()  → bool   : هل المزود مُفعَّل في البيئة الحالية؟
 *   - searchLocations(query)  → Promise<Location[]>
 *   - searchHotels(params)    → Promise<Hotel[]>
 *
 * Location: { id, name, type, country, cityName, providerKey }
 * Hotel:    { id, name, location, stars, rating, reviews,
 *             price, currency, image, provider, rawData }
 */

/** @enum حالات المزود */
const PROVIDER_STATUS = {
  ACTIVE:   'active',    // يعمل ومُختبر
  SANDBOX:  'sandbox',   // sandbox جاهز للاختبار
  PENDING:  'pending',   // ينتظر موافقة المزود
  DISABLED: 'disabled',  // معطّل يدوياً
};

/** أسماء المزودين (مفاتيح ثابتة) */
const PROVIDERS = {
  HBX:         'hotelbeds',
  BOOKING:     'booking',
  WEBBEDS:     'webbeds',
  RATEHAWK:    'ratehawk',
  TBO:         'tbo',
  HOTELS_NL:   'hotels_nl',
  TRAVELPORT:  'travelport',
  SERPAPI:     'serpapi',
};

/**
 * هامش الربح الافتراضي لكل مزود (net-to-gross)
 * القيمة = معامل الضرب على سعر المزود للوصول للسعر النهائي
 * مثال: 1.10 = أضف 10% ربح
 */
const MARKUP = {
  [PROVIDERS.HBX]:        1.08,  // Hotelbeds wholesale → +8%
  [PROVIDERS.BOOKING]:    1.05,  // Booking retail      → +5%
  [PROVIDERS.WEBBEDS]:    1.08,  // WebBeds wholesale   → +8%
  [PROVIDERS.RATEHAWK]:   1.07,
  [PROVIDERS.TBO]:        1.07,
  [PROVIDERS.HOTELS_NL]:  1.10,
  [PROVIDERS.SERPAPI]:    1.05,  // سعر تقديري فقط
};

/**
 * بناء سعر المستخدم النهائي
 * @param {number} netPrice  - سعر المزود الصافي
 * @param {string} provider  - مفتاح المزود
 * @returns {number}
 */
function applyMarkup(netPrice, provider) {
  const factor = MARKUP[provider] ?? 1.08;
  return Math.round(netPrice * factor);
}

module.exports = { PROVIDER_STATUS, PROVIDERS, MARKUP, applyMarkup };
