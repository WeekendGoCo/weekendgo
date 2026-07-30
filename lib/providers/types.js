// lib/providers/types.js
// Shared interfaces for all price providers

/**
 * @typedef {Object} SearchParams
 * @property {string} destCode       - Provider-specific destination code
 * @property {string} checkIn        - YYYY-MM-DD
 * @property {string} checkOut       - YYYY-MM-DD
 * @property {number} adults
 * @property {number} rooms
 */

/**
 * @typedef {Object} HotelPrice
 * @property {string} hotel_id       - Provider-prefixed ID e.g. "hbx-1234"
 * @property {string} provider       - "hotelbeds" | "hotelsnl" | "mock"
 * @property {string} name
 * @property {number} stars
 * @property {number} net_price      - Price before markup
 * @property {number} final_price    - Price after markup
 * @property {string} currency
 * @property {string} image
 * @property {string} address
 * @property {number|null} rating
 */

// Markup rules per provider (can be moved to DB later)
const MARKUP = {
  hotelbeds: 1.05,   // 5%
  hotelsnl:  1.08,   // 8%
  mock:      1.00,
};

/**
 * Apply markup to a net price
 * @param {number} netPrice
 * @param {string} provider
 * @returns {number}
 */
function applyMarkup(netPrice, provider) {
  const factor = MARKUP[provider] ?? 1.05;
  return Math.round(netPrice * factor);
}

module.exports = { MARKUP, applyMarkup };
