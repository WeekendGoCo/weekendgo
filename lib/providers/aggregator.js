/**
 * @file aggregator.js
 * @description Price Aggregator — يجمع نتائج كل المزودين ويختار الأرخص
 *
 * المنطق:
 *   1. يُشغّل searchHotels() لكل مزود مُفعَّل بـ Promise.allSettled
 *   2. يجمع كل النتائج في مصفوفة واحدة
 *   3. يُجمّع الفنادق المتكررة (نفس الاسم/المدينة) ويحتفظ بالأرخص
 *   4. يُرتّب النتائج تصاعدياً حسب السعر
 *
 * الإضافة المستقبلية: GIATA mapping لمطابقة hotel_id بين المزودين
 */

const hotelbeds  = require('./hotelbeds');
const booking    = require('./booking');
const webbeds    = require('./webbeds');
const ratehawk   = require('./ratehawk');
const tbo        = require('./tbo');
const hotelsnl   = require('./hotelsnl');
const { getCityMap } = require('./hotelbeds');

/** قائمة كل المزودين بترتيب الأولوية */
const ALL_PROVIDERS = [
  hotelbeds,
  hotelsnl,
  booking,
  webbeds,
  ratehawk,
  tbo,
];

/**
 * البحث عن وجهة عبر كل المزودين المتاحين
 * يُعيد أول نتيجة ناجحة (للـ location search نكتفي بمزود واحد)
 *
 * @param {string} query
 * @returns {Promise<{ results: Array, source: string }>}
 */
async function searchLocations(query) {
  // أولاً: قاموس HBX الداخلي (أسرع — لا يحتاج API call)
  const hbxResults = await hotelbeds.searchLocations(query);
  if (hbxResults.length > 0) {
    return { results: hbxResults, source: 'hotelbeds_local' };
  }

  // ثانياً: باقي المزودين المتاحين
  for (const provider of [hotelsnl, booking]) {
    if (!provider.isAvailable()) continue;
    try {
      const results = await provider.searchLocations(query);
      if (results.length > 0) return { results, source: results[0].providerKey };
    } catch (_) { /* جرّب المزود التالي */ }
  }

  return { results: [], source: null };
}

/**
 * بناء params كل مزود من params الموحّدة
 */
function buildProviderParams(provider, unified) {
  const { destId, checkIn, checkOut, adults, children } = unified;

  switch (provider) {
    case hotelbeds:
      return { destCode: destId, checkIn, checkOut, adults, children };
    case booking:
      return { destId,           checkIn, checkOut, adults, children };
    case webbeds:
      return { cityCode: destId, checkIn, checkOut, adults, children };
    case ratehawk:
      return { regionId: destId, checkIn, checkOut, adults, children };
    case tbo:
      return { cityCode: destId, checkIn, checkOut, adults, children };
    case hotelsnl:
      return { locationId: destId, checkIn, checkOut, adults, children };
    default:
      return unified;
  }
}

/**
 * البحث عن فنادق عبر كل المزودين المتاحين
 * يختار الأرخص لكل فندق
 *
 * @param {{ destId, checkIn, checkOut, adults, children }} params
 * @returns {Promise<{ hotels: Array, providersSummary: Object }>}
 */
async function searchHotels(params) {
  const activeProviders = ALL_PROVIDERS.filter(p => p.isAvailable());

  if (activeProviders.length === 0) {
    return { hotels: [], providersSummary: { error: 'no_providers_available' } };
  }

  // شغّل كل المزودين بالتوازي
  const results = await Promise.allSettled(
    activeProviders.map(async (provider) => {
      const providerParams = buildProviderParams(provider, params);
      const hotels = await provider.searchHotels(providerParams);
      return { provider: provider.constructor?.name ?? 'unknown', hotels };
    })
  );

  // سجّل ملخص الأداء
  const providersSummary = {};
  const allHotels = [];

  results.forEach((result, i) => {
    const providerName = activeProviders[i].constructor?.name ?? `provider_${i}`;
    if (result.status === 'fulfilled') {
      providersSummary[providerName] = { count: result.value.hotels.length, status: 'ok' };
      allHotels.push(...result.value.hotels);
    } else {
      providersSummary[providerName] = { count: 0, status: 'error', error: result.reason?.message };
    }
  });

  // دمج الفنادق: إذا نفس الاسم + نفس المدينة → احتفظ بالأرخص
  const merged = mergeByLowestPrice(allHotels);

  // ترتيب تصاعدي حسب السعر
  merged.sort((a, b) => a.price - b.price);

  return { hotels: merged, providersSummary };
}

/**
 * يدمج الفنادق المتكررة ويحتفظ بالأرخص
 * المفتاح: normalizedName + location
 */
function mergeByLowestPrice(hotels) {
  const map = new Map();

  for (const hotel of hotels) {
    const key = `${normalize(hotel.name)}__${normalize(hotel.location)}`;
    const existing = map.get(key);

    if (!existing || hotel.price < existing.price) {
      map.set(key, hotel);
    }
  }

  return Array.from(map.values());
}

function normalize(str) {
  return (str ?? '')
    .toLowerCase()
    .replace(/[\s\-_]+/g, '')
    .trim();
}

/**
 * تحويل اسم المدينة إلى dest codes لكل مزود
 * يستخدم قاموس HBX الداخلي حالياً (سيُنقل لـ DB لاحقاً)
 */
function resolveCityForAllProviders(cityName) {
  const map = getCityMap();
  const q   = cityName.toLowerCase().trim();
  const entry = map.find(c =>
    c.nameAr.includes(q) || c.nameEn.toLowerCase().includes(q)
  );

  if (!entry) return null;

  return {
    hbxCode:  entry.hbxCode,
    // نفس الكود مؤقتاً لباقي المزودين — سيُحدَّث عند توفر mapping
    cityCode: entry.hbxCode,
  };
}

module.exports = { searchLocations, searchHotels, resolveCityForAllProviders };
