// lib/providers/hotelbeds.js
const crypto = require("crypto");
const { applyMarkup } = require("./types");

const DISABLED = false;
const BASE_URL = "https://api.test.hotelbeds.com/hotel-api/1.0";

function signature() {
  const key = process.env.HBX_API_KEY ?? "";
  const secret = process.env.HBX_API_SECRET ?? "";
  const ts = Math.floor(Date.now() / 1000).toString();
  return crypto.createHash("sha256").update(key + secret + ts).digest("hex");
}

/**
 * Search hotels via HBX/Hotelbeds Sandbox
 * @param {{ destCode: string, checkIn: string, checkOut: string, adults: number, rooms: number }} params
 * @returns {Promise<import('./types').HotelPrice[]>}
 */
async function search(params) {
  if (DISABLED) throw new Error("Hotelbeds provider disabled");

  const apiKey = process.env.HBX_API_KEY;
  if (!apiKey) throw new Error("HBX_API_KEY not configured");

  const body = {
    stay: { checkIn: params.checkIn, checkOut: params.checkOut },
    occupancies: [{ rooms: params.rooms, adults: params.adults, children: 0 }],
    destination: { code: params.destCode },
    filter: { maxHotels: 20, minCategory: 3 },
  };

  const res = await fetch(`${BASE_URL}/hotels`, {
    method: "POST",
    headers: {
      "Api-key": apiKey,
      "X-Signature": signature(),
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`HBX ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const hotels = data?.hotels?.hotels ?? [];
  const currency = data?.hotels?.currency ?? "USD";

  return hotels.map((h) => {
    const netPrice = parseFloat(h.minRate ?? h.rooms?.[0]?.rates?.[0]?.net ?? "0");
    return {
      hotel_id: `hbx-${h.code}`,
      provider: "hotelbeds",
      name: h.name,
      stars: h.categoryCode ? parseInt(h.categoryCode) : 3,
      net_price: netPrice,
      final_price: applyMarkup(netPrice, "hotelbeds"),
      currency,
      image: h.images?.[0]
        ? `https://photos.hotelbeds.com/giata/${h.images[0].path}`
        : null,
      address: [h.zoneName, h.destinationName].filter(Boolean).join(", "),
      rating: h.reviews?.[0]?.rate ?? null,
    };
  });
}

module.exports = { search, DISABLED };
