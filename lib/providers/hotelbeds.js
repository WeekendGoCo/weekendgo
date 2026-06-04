/**
 * @file hotelbeds.js
 * @description مزود HBX / Hotelbeds
 * @status SANDBOX — حساب PRUEBAS جاهز للاختبار
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   HBX_API_KEY    = 3fd12cf6865b443922d5919a26c8d12a
 *   HBX_SECRET     = <Secret من لوحة developer.hotelbeds.com>
 *
 * التوثيق: X-Signature = SHA256(ApiKey + Secret + UnixTimestamp)
 * Base URL Sandbox: https://api.test.hotelbeds.com
 * Base URL Prod:    https://api.hotelbeds.com
 */

const crypto = require('crypto');
const { PROVIDERS, applyMarkup } = require('./types');

const BASE_URL = process.env.HBX_USE_PROD === 'true'
  ? 'https://api.hotelbeds.com'
  : 'https://api.test.hotelbeds.com';   // Sandbox افتراضياً

/**
 * هل المزود متاح؟ — يتحقق من وجود بيانات الاعتماد
 */
function isAvailable() {
  return !!(process.env.HBX_API_KEY && process.env.HBX_SECRET);
}

/**
 * يبني headers المصادقة لكل طلب
 * X-Signature = SHA256(apiKey + secret + epoch_seconds)
 */
function buildHeaders() {
  const apiKey    = process.env.HBX_API_KEY;
  const secret    = process.env.HBX_SECRET;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash('sha256')
    .update(apiKey + secret + timestamp)
    .digest('hex');

  return {
    'Api-key':     apiKey,
    'X-Signature': signature,
    'Accept':      'application/json',
    'Content-Type': 'application/json',
  };
}

/**
 * البحث عن وجهة (اسم مدينة → destination code)
 * يستخدم Hotels Content API
 * @param {string} query
 * @returns {Promise<Array>} Location[]
 */
async function searchLocations(query) {
  if (!isAvailable()) return [];

  // Hotelbeds لا يملك location search مباشرة —
  // نستخدم قاموس المدن الداخلي (cities_map)
  // وإذا لم يوجد نعيد مصفوفة فارغة
  // سيُستبدل هذا بـ DB lookup في المرحلة الثانية
  const CITY_MAP = getCityMap();
  const q = query.toLowerCase().trim();
  const matches = CITY_MAP.filter(c =>
    c.nameAr.includes(q) ||
    c.nameEn.toLowerCase().includes(q)
  ).slice(0, 5);

  return matches.map(c => ({
    id:          c.hbxCode,
    name:        c.nameAr,
    nameEn:      c.nameEn,
    type:        'city',
    country:     c.country,
    cityName:    c.nameEn,
    providerKey: PROVIDERS.HBX,
  }));
}

/**
 * البحث عن فنادق
 * @param {{ destCode, checkIn, checkOut, adults, children }} params
 * @returns {Promise<Array>} Hotel[]
 */
async function searchHotels({ destCode, checkIn, checkOut, adults = 2, children = [] }) {
  if (!isAvailable()) return [];

  const payload = {
    stay: {
      checkIn,
      checkOut,
    },
    occupancies: [
      {
        rooms:    1,
        adults:   Number(adults),
        children: children.length,
        paxes:    children.map(age => ({ type: 'CH', age })),
      },
    ],
    destination: {
      code: destCode,
    },
    filter: {
      maxHotels: 20,
      maxRooms:  1,
    },
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/hotel-api/1.0/hotels`, {
      method:  'POST',
      headers: buildHeaders(),
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[HBX] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(`[HBX] HTTP ${res.status}:`, text.slice(0, 300));
    return [];
  }

  const data = await res.json();
  const hotels = data?.hotels?.hotels ?? [];

  return hotels.map(h => {
    const room      = h.rooms?.[0];
    const rate      = room?.rates?.[0];
    const netPrice  = parseFloat(rate?.net ?? 0);
    const finalPrice = applyMarkup(netPrice, PROVIDERS.HBX);

    return {
      id:           h.code,
      name:         h.name,
      location:     h.destinationCode,
      stars:        h.categoryCode?.replace('EST', '') || '3',
      rating:       null,    // يحتاج Content API في خطوة منفصلة
      reviews:      null,
      price:        finalPrice,
      netPrice:     netPrice,
      currency:     rate?.currency ?? 'EUR',
      image:        null,    // يُجلب من Hotelbeds Content API
      provider:     PROVIDERS.HBX,
      cancellable:  rate?.cancellationPolicies?.length > 0,
      rawData:      h,
    };
  });
}

/**
 * قاموس المدن: اسم عربي/إنجليزي → HBX destination code
 * سيُنقل لقاعدة البيانات لاحقاً
 */
function getCityMap() {
  return [
    { nameAr: 'دبي',             nameEn: 'Dubai',           hbxCode: 'DXB', country: 'الإمارات' },
    { nameAr: 'أبوظبي',          nameEn: 'Abu Dhabi',       hbxCode: 'AUH', country: 'الإمارات' },
    { nameAr: 'مكة المكرمة',     nameEn: 'Makkah',          hbxCode: 'MKX', country: 'السعودية' },
    { nameAr: 'المدينة المنورة', nameEn: 'Madinah',         hbxCode: 'MED', country: 'السعودية' },
    { nameAr: 'الرياض',          nameEn: 'Riyadh',          hbxCode: 'RUH', country: 'السعودية' },
    { nameAr: 'جدة',             nameEn: 'Jeddah',          hbxCode: 'JED', country: 'السعودية' },
    { nameAr: 'إسطنبول',         nameEn: 'Istanbul',        hbxCode: 'IST', country: 'تركيا' },
    { nameAr: 'القاهرة',         nameEn: 'Cairo',           hbxCode: 'CAI', country: 'مصر' },
    { nameAr: 'باريس',           nameEn: 'Paris',           hbxCode: 'PAR', country: 'فرنسا' },
    { nameAr: 'لندن',            nameEn: 'London',          hbxCode: 'LON', country: 'المملكة المتحدة' },
    { nameAr: 'بانكوك',          nameEn: 'Bangkok',         hbxCode: 'BKK', country: 'تايلاند' },
    { nameAr: 'كوالالمبور',      nameEn: 'Kuala Lumpur',    hbxCode: 'KUL', country: 'ماليزيا' },
    { nameAr: 'المنامة',         nameEn: 'Manama',          hbxCode: 'BAH', country: 'البحرين' },
    { nameAr: 'مسقط',            nameEn: 'Muscat',          hbxCode: 'MCT', country: 'عُمان' },
    { nameAr: 'الدوحة',          nameEn: 'Doha',            hbxCode: 'DOH', country: 'قطر' },
    { nameAr: 'الكويت',          nameEn: 'Kuwait City',     hbxCode: 'KWI', country: 'الكويت' },
    { nameAr: 'بيروت',           nameEn: 'Beirut',          hbxCode: 'BEY', country: 'لبنان' },
    { nameAr: 'عمّان',           nameEn: 'Amman',           hbxCode: 'AMM', country: 'الأردن' },
    { nameAr: 'أثينا',           nameEn: 'Athens',          hbxCode: 'ATH', country: 'اليونان' },
    { nameAr: 'روما',            nameEn: 'Rome',            hbxCode: 'ROM', country: 'إيطاليا' },
    { nameAr: 'برشلونة',         nameEn: 'Barcelona',       hbxCode: 'BCN', country: 'إسبانيا' },
    { nameAr: 'مدريد',           nameEn: 'Madrid',          hbxCode: 'MAD', country: 'إسبانيا' },
    { nameAr: 'أمستردام',        nameEn: 'Amsterdam',       hbxCode: 'AMS', country: 'هولندا' },
    { nameAr: 'فيينا',           nameEn: 'Vienna',          hbxCode: 'VIE', country: 'النمسا' },
    { nameAr: 'نيويورك',         nameEn: 'New York',        hbxCode: 'NYC', country: 'الولايات المتحدة' },
    { nameAr: 'لوس أنجلوس',      nameEn: 'Los Angeles',     hbxCode: 'LAX', country: 'الولايات المتحدة' },
    { nameAr: 'طوكيو',           nameEn: 'Tokyo',           hbxCode: 'TYO', country: 'اليابان' },
    { nameAr: 'سنغافورة',        nameEn: 'Singapore',       hbxCode: 'SIN', country: 'سنغافورة' },
    { nameAr: 'ميلانو',          nameEn: 'Milan',           hbxCode: 'MIL', country: 'إيطاليا' },
    { nameAr: 'فرانكفورت',       nameEn: 'Frankfurt',       hbxCode: 'FRA', country: 'ألمانيا' },
  ];
}

module.exports = { isAvailable, searchLocations, searchHotels, getCityMap };
