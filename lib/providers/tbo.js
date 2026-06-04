/**
 * @file tbo.js
 * @description مزود TBO Holidays — XML/JSON API
 * @status PENDING — ينتظر موافقة TBO
 *
 * بيانات الاعتماد المطلوبة في .env:
 *   TBO_CLIENT_ID = <ClientID>
 *   TBO_USERNAME  = <Username>
 *   TBO_PASSWORD  = <Password>
 *
 * لتفعيله: أزل التعليق عن سطر DISABLED أدناه
 */

const { PROVIDERS, applyMarkup } = require('./types');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  المزود معطّل — ينتظر موافقة TBO
const DISABLED = true;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = 'https://api.tbo.com/hotel/v1';

function isAvailable() {
  if (DISABLED) return false;
  return !!(process.env.TBO_CLIENT_ID && process.env.TBO_USERNAME);
}

async function searchLocations(_query) {
  // TBO يعمل بـ city codes ثابتة
  return [];
}

async function searchHotels({ cityCode, checkIn, checkOut, adults = 2, children = [] }) {
  if (!isAvailable()) return [];

  const payload = {
    ClientId:  process.env.TBO_CLIENT_ID,
    UserName:  process.env.TBO_USERNAME,
    Password:  process.env.TBO_PASSWORD,
    Language:  'AR',
    CityCode:  cityCode,
    CheckIn:   checkIn,
    CheckOut:  checkOut,
    GuestNationality: 'SA',
    NoOfRooms: 1,
    RoomGuests: [{ NoOfAdults: adults, NoOfChild: children.length, ChildAge: children }],
    ResponseTime: 23,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/search`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[TBO] Network error:', err.message);
    return [];
  }

  if (!res.ok) {
    console.error(`[TBO] HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const hotels = data?.Hotels?.Hotel ?? [];

  return hotels.map(h => {
    const netPrice   = parseFloat(h.Rooms?.Room?.[0]?.TotalFare ?? 0);
    const finalPrice = applyMarkup(netPrice, PROVIDERS.TBO);

    return {
      id:          h.HotelCode,
      name:        h.HotelName,
      location:    cityCode,
      stars:       parseInt(h.StarRating ?? 0),
      rating:      null,
      reviews:     null,
      price:       finalPrice,
      netPrice:    netPrice,
      currency:    h.Currency ?? 'USD',
      image:       h.HotelPicture ?? null,
      provider:    PROVIDERS.TBO,
      cancellable: false,
      rawData:     h,
    };
  });
}

module.exports = { isAvailable, searchLocations, searchHotels };
