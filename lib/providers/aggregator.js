// lib/providers/aggregator.js
// Runs all active providers via Promise.allSettled and merges by lowest price

const hotelbeds = require("./hotelbeds");
// Add more providers here as they go live:
// const hotelsnl = require("./hotelsnl");
// const ratehawk = require("./ratehawk");

const PROVIDERS = [
  hotelbeds,
  // hotelsnl,
];

/**
 * Search all active providers and merge by lowest price.
 * @param {object} params - { destCode, hbxCode, checkIn, checkOut, adults, rooms }
 * @returns {Promise<{ hotels: HotelPrice[], providerStats: object[] }>}
 */
async function aggregateSearch(params) {
  const results = await Promise.allSettled(
    PROVIDERS
      .filter((p) => !p.DISABLED)
      .map((p) => p.search(params))
  );

  const providerStats = results.map((r, i) => ({
    provider: PROVIDERS[i].constructor?.name ?? `provider-${i}`,
    status: r.status,
    count: r.status === "fulfilled" ? r.value.length : 0,
    error: r.status === "rejected" ? r.reason?.message : null,
  }));

  // Flatten all results
  const allHotels = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Merge: keep lowest final_price per normalized hotel name
  // (until we have a proper GIATA mapping, we key by lowercased name)
  const byName = new Map();
  for (const hotel of allHotels) {
    const key = hotel.name.toLowerCase().trim();
    const existing = byName.get(key);
    if (!existing || hotel.final_price < existing.final_price) {
      byName.set(key, hotel);
    }
  }

  const hotels = [...byName.values()].sort((a, b) => a.final_price - b.final_price);

  return { hotels, providerStats };
}

module.exports = { aggregateSearch };
