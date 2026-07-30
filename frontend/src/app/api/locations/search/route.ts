// /api/locations/search?query=dubai
// Returns: { destId, destType, label } compatible with Booking.com + HBX

import { NextRequest, NextResponse } from "next/server";

// Static city mapping: name variants → provider IDs
const CITIES_MAP: Record<string, {
  name_ar: string;
  name_en: string;
  booking_dest_id: string;
  booking_dest_type: string;
  hbx_dest_code: string;
  hbx_dest_type: string;
}> = {
  // UAE
  "dubai": { name_ar: "دبي", name_en: "Dubai", booking_dest_id: "-782831", booking_dest_type: "city", hbx_dest_code: "DXB", hbx_dest_type: "city" },
  "دبي": { name_ar: "دبي", name_en: "Dubai", booking_dest_id: "-782831", booking_dest_type: "city", hbx_dest_code: "DXB", hbx_dest_type: "city" },
  "abu dhabi": { name_ar: "أبوظبي", name_en: "Abu Dhabi", booking_dest_id: "-782609", booking_dest_type: "city", hbx_dest_code: "AUH", hbx_dest_type: "city" },
  "أبوظبي": { name_ar: "أبوظبي", name_en: "Abu Dhabi", booking_dest_id: "-782609", booking_dest_type: "city", hbx_dest_code: "AUH", hbx_dest_type: "city" },
  "abu zabi": { name_ar: "أبوظبي", name_en: "Abu Dhabi", booking_dest_id: "-782609", booking_dest_type: "city", hbx_dest_code: "AUH", hbx_dest_type: "city" },
  "sharjah": { name_ar: "الشارقة", name_en: "Sharjah", booking_dest_id: "-783394", booking_dest_type: "city", hbx_dest_code: "SHJ", hbx_dest_type: "city" },
  "الشارقة": { name_ar: "الشارقة", name_en: "Sharjah", booking_dest_id: "-783394", booking_dest_type: "city", hbx_dest_code: "SHJ", hbx_dest_type: "city" },

  // Saudi Arabia
  "riyadh": { name_ar: "الرياض", name_en: "Riyadh", booking_dest_id: "-801452", booking_dest_type: "city", hbx_dest_code: "RUH", hbx_dest_type: "city" },
  "الرياض": { name_ar: "الرياض", name_en: "Riyadh", booking_dest_id: "-801452", booking_dest_type: "city", hbx_dest_code: "RUH", hbx_dest_type: "city" },
  "jeddah": { name_ar: "جدة", name_en: "Jeddah", booking_dest_id: "-800453", booking_dest_type: "city", hbx_dest_code: "JED", hbx_dest_type: "city" },
  "جدة": { name_ar: "جدة", name_en: "Jeddah", booking_dest_id: "-800453", booking_dest_type: "city", hbx_dest_code: "JED", hbx_dest_type: "city" },
  "mecca": { name_ar: "مكة المكرمة", name_en: "Mecca", booking_dest_id: "-800595", booking_dest_type: "city", hbx_dest_code: "MKE", hbx_dest_type: "city" },
  "مكة": { name_ar: "مكة المكرمة", name_en: "Mecca", booking_dest_id: "-800595", booking_dest_type: "city", hbx_dest_code: "MKE", hbx_dest_type: "city" },
  "medina": { name_ar: "المدينة المنورة", name_en: "Medina", booking_dest_id: "-800560", booking_dest_type: "city", hbx_dest_code: "MED", hbx_dest_type: "city" },
  "المدينة": { name_ar: "المدينة المنورة", name_en: "Medina", booking_dest_id: "-800560", booking_dest_type: "city", hbx_dest_code: "MED", hbx_dest_type: "city" },

  // Egypt
  "cairo": { name_ar: "القاهرة", name_en: "Cairo", booking_dest_id: "-290692", booking_dest_type: "city", hbx_dest_code: "CAI", hbx_dest_type: "city" },
  "القاهرة": { name_ar: "القاهرة", name_en: "Cairo", booking_dest_id: "-290692", booking_dest_type: "city", hbx_dest_code: "CAI", hbx_dest_type: "city" },
  "sharm el sheikh": { name_ar: "شرم الشيخ", name_en: "Sharm El Sheikh", booking_dest_id: "-290795", booking_dest_type: "city", hbx_dest_code: "SSH", hbx_dest_type: "city" },
  "شرم الشيخ": { name_ar: "شرم الشيخ", name_en: "Sharm El Sheikh", booking_dest_id: "-290795", booking_dest_type: "city", hbx_dest_code: "SSH", hbx_dest_type: "city" },
  "hurghada": { name_ar: "الغردقة", name_en: "Hurghada", booking_dest_id: "-290697", booking_dest_type: "city", hbx_dest_code: "HRG", hbx_dest_type: "city" },
  "الغردقة": { name_ar: "الغردقة", name_en: "Hurghada", booking_dest_id: "-290697", booking_dest_type: "city", hbx_dest_code: "HRG", hbx_dest_type: "city" },

  // Morocco
  "marrakech": { name_ar: "مراكش", name_en: "Marrakech", booking_dest_id: "-38833", booking_dest_type: "city", hbx_dest_code: "RAK", hbx_dest_type: "city" },
  "مراكش": { name_ar: "مراكش", name_en: "Marrakech", booking_dest_id: "-38833", booking_dest_type: "city", hbx_dest_code: "RAK", hbx_dest_type: "city" },

  // Turkey
  "istanbul": { name_ar: "إسطنبول", name_en: "Istanbul", booking_dest_id: "-755070", booking_dest_type: "city", hbx_dest_code: "IST", hbx_dest_type: "city" },
  "إسطنبول": { name_ar: "إسطنبول", name_en: "Istanbul", booking_dest_id: "-755070", booking_dest_type: "city", hbx_dest_code: "IST", hbx_dest_type: "city" },
  "اسطنبول": { name_ar: "إسطنبول", name_en: "Istanbul", booking_dest_id: "-755070", booking_dest_type: "city", hbx_dest_code: "IST", hbx_dest_type: "city" },

  // Popular destinations
  "london": { name_ar: "لندن", name_en: "London", booking_dest_id: "-2601889", booking_dest_type: "city", hbx_dest_code: "LON", hbx_dest_type: "city" },
  "لندن": { name_ar: "لندن", name_en: "London", booking_dest_id: "-2601889", booking_dest_type: "city", hbx_dest_code: "LON", hbx_dest_type: "city" },
  "paris": { name_ar: "باريس", name_en: "Paris", booking_dest_id: "-1456928", booking_dest_type: "city", hbx_dest_code: "PAR", hbx_dest_type: "city" },
  "باريس": { name_ar: "باريس", name_en: "Paris", booking_dest_id: "-1456928", booking_dest_type: "city", hbx_dest_code: "PAR", hbx_dest_type: "city" },
  "new york": { name_ar: "نيويورك", name_en: "New York", booking_dest_id: "20088325", booking_dest_type: "city", hbx_dest_code: "NYC", hbx_dest_type: "city" },
  "نيويورك": { name_ar: "نيويورك", name_en: "New York", booking_dest_id: "20088325", booking_dest_type: "city", hbx_dest_code: "NYC", hbx_dest_type: "city" },
  "maldives": { name_ar: "المالديف", name_en: "Maldives", booking_dest_id: "104", booking_dest_type: "country", hbx_dest_code: "MLE", hbx_dest_type: "city" },
  "المالديف": { name_ar: "المالديف", name_en: "Maldives", booking_dest_id: "104", booking_dest_type: "country", hbx_dest_code: "MLE", hbx_dest_type: "city" },
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = query.toLowerCase();

  // 1. Exact match
  if (CITIES_MAP[key]) {
    const city = CITIES_MAP[key];
    return NextResponse.json({
      results: [{
        destId: city.booking_dest_id,
        destType: city.booking_dest_type,
        label: city.name_ar,
        labelEn: city.name_en,
        hbxCode: city.hbx_dest_code,
        hbxType: city.hbx_dest_type,
      }]
    });
  }

  // 2. Partial match (startsWith)
  const partialMatches = Object.entries(CITIES_MAP)
    .filter(([k]) => k.startsWith(key) || k.includes(key))
    .slice(0, 5)
    .map(([, city]) => ({
      destId: city.booking_dest_id,
      destType: city.booking_dest_type,
      label: city.name_ar,
      labelEn: city.name_en,
      hbxCode: city.hbx_dest_code,
      hbxType: city.hbx_dest_type,
    }));

  // Deduplicate by destId
  const seen = new Set<string>();
  const unique = partialMatches.filter(r => {
    if (seen.has(r.destId)) return false;
    seen.add(r.destId);
    return true;
  });

  return NextResponse.json({ results: unique });
}
