// /api/hotels/search — POST
// Priority: HBX Hotelbeds Sandbox → Mock data fallback
// Body: { destination, checkIn, checkOut, adults, rooms }

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface SearchBody {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
}

interface HotelResult {
  hotel_id: string;
  name: string;
  stars: number;
  price: number;
  currency: string;
  image: string;
  address: string;
  rating?: number;
  provider: string;
}

// ── HBX/Hotelbeds helpers ───────────────────────────────────────────────────

function hbxSignature(): string {
  const apiKey = process.env.HBX_API_KEY ?? "";
  const secret = process.env.HBX_API_SECRET ?? "";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const hash = crypto
    .createHash("sha256")
    .update(apiKey + secret + timestamp)
    .digest("hex");
  return hash;
}

async function searchHBX(params: {
  destCode: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
}): Promise<HotelResult[]> {
  const apiKey = process.env.HBX_API_KEY;
  if (!apiKey) throw new Error("HBX_API_KEY not set");

  const baseUrl = "https://api.test.hotelbeds.com/hotel-api/1.0";
  const url = `${baseUrl}/hotels`;

  const body = {
    stay: { checkIn: params.checkIn, checkOut: params.checkOut },
    occupancies: [{ rooms: params.rooms, adults: params.adults, children: 0 }],
    destination: { code: params.destCode },
    filter: { maxHotels: 20, minCategory: 3 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-key": apiKey,
      "X-Signature": hbxSignature(),
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HBX error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const hotels = data?.hotels?.hotels ?? [];

  return hotels.map((h: any) => {
    const minRate = h.minRate ?? h.rooms?.[0]?.rates?.[0]?.net ?? 0;
    const price = Math.round(parseFloat(minRate) * 1.05); // 5% markup
    return {
      hotel_id: `hbx-${h.code}`,
      name: h.name,
      stars: h.categoryCode ? parseInt(h.categoryCode) : 3,
      price,
      currency: data.hotels.currency ?? "USD",
      image: h.images?.[0]
        ? `https://photos.hotelbeds.com/giata/${h.images[0].path}`
        : "/images/hotel-placeholder.jpg",
      address: `${h.zoneName ?? ""}, ${h.destinationName ?? ""}`,
      rating: h.reviews?.[0]?.rate ?? undefined,
      provider: "hotelbeds",
    };
  });
}

// ── Mock fallback (dev / no credentials) ───────────────────────────────────

function mockHotels(destination: string): HotelResult[] {
  const names = [
    "فندق الفخامة الكبرى",
    "منتجع الواحة الفاخرة",
    "بالاس هوتيل الدولي",
    "ذا لاكشري كوليكشن",
    "فندق روز راحة",
  ];
  return names.map((name, i) => ({
    hotel_id: `mock-${i + 1}`,
    name,
    stars: 5 - (i % 2),
    price: 350 + i * 80,
    currency: "USD",
    image: `/images/hotel-placeholder.jpg`,
    address: destination,
    rating: 8.5 - i * 0.3,
    provider: "mock",
  }));
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: SearchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { destination, checkIn, checkOut, adults = 2, rooms = 1 } = body;

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "destination, checkIn, checkOut required" },
      { status: 400 }
    );
  }

  // Resolve destination → provider codes
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
  let hbxCode = "DXB"; // default

  try {
    const locRes = await fetch(
      `${baseUrl}/api/locations/search?query=${encodeURIComponent(destination)}`
    );
    if (locRes.ok) {
      const locData = await locRes.json();
      if (locData.results?.[0]?.hbxCode) {
        hbxCode = locData.results[0].hbxCode;
      }
    }
  } catch {
    // non-fatal — use default hbxCode
  }

  // Try HBX first
  try {
    const hotels = await searchHBX({
      destCode: hbxCode,
      checkIn,
      checkOut,
      adults,
      rooms,
    });
    return NextResponse.json({ hotels, source: "hotelbeds" });
  } catch (hbxErr) {
    console.warn("HBX search failed:", hbxErr);
  }

  // Fallback to mock
  const hotels = mockHotels(destination);
  return NextResponse.json({ hotels, source: "mock" });
}
