/**
 * @file ratehawk.js
 * @description مزود RateHawk — ETG API V3
 * @status PENDING — ينتظر موافقة RateHawk
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   RATEHAWK_KEY_ID  = <key_id من لوحة RateHawk>
 *   RATEHAWK_API_KEY = <api_key>
 *
 * المصادقة: HTTP Basic Auth (key_id:api_key)
 * التوثيق: https://docs.ratehawk.com
 *
 * لتفعيله: أزل التعليق عن سطر DISABLED أدناه
 */

const { PROVIDERS, applyMarkup } = require('./types');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  المزود معطّل — ينتظر موافقة RateHawk
const DISABLED = true;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = 'https://api.ratehawk.com/en/api/b2b/v3';

function isAvailable() {
  if (DISABLED) return false;
  return !!(process.env.RATEHAWK_KEY_ID && process.env.RATEHAWK_API_KEY);
}

function buildAuth() {
  const creds = Buffer.from(
    `${process.env.RATEHAWK_KEY_ID}:${process.env.RATEHAWK_API_KEY}`
  ).toString('base64');
  return `Basic ${creds}`;
}

async function searchLocations(query) {
  if (!isAvailable()) return [];

  const res = await fetch(
    `${BASE_URL}/search/serp/geo/?query=${encodeURIComponent(query)}&language=ar`,
    { headers: { Authorization: buildAuth() } }
  );

  if (!res.ok) return [];
  const data = await res.json();

  return (data?.data?.regions ?? []).map(r => ({
    id:          r.id,
    name:        r.name,
    type:        r.type,
    country:     r.country?.name ?? '',
    cityName:    r.name,
    providerKey: PROVIDERS.RATEHAWK,
  }));
}

async function searchHotels({ regionId, checkIn, checkOut, adults = 2, children = [] }) {
  if (!isAvailable()) return [];

  const payload = {
    checkin:       checkIn,
    checkout:      checkOut,
    guests:        [{ adults, children }],
    region_id:     regionId,
    currency:      'USD',
    language:      'ar',
    residency:     'ae',
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/search/serp/region/`, {
      method:  'POST',
      headers: { Authorization: buildAuth(), 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[RateHawk] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    console.error(`[RateHawk] HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const hotels = data?.data?.hotels ?? [];

  return hotels.map(h => {
    const netPrice   = parseFloat(h.rates?.[0]?.payment_options?.payment_types?.[0]?.show_amount ?? 0);
    const finalPrice = applyMarkup(netPrice, PROVIDERS.RATEHAWK);

    return {
      id:          h.id,
      name:        h.name,
      location:    h.region?.name ?? '',
      stars:       h.star_rating ?? null,
      rating:      h.rates?.[0]?.review_score ?? null,
      reviews:     null,
      price:       finalPrice,
      netPrice:    netPrice,
      currency:    'USD',
      image:       h.images?.[0] ?? null,
      provider:    PROVIDERS.RATEHAWK,
      cancellable: h.rates?.[0]?.payment_options?.payment_types?.[0]?.cancellation_penalties?.free_cancellation_before != null,
      rawData:     h,
    };
  });
}

module.exports = { isAvailable, searchLocations, searchHotels };
