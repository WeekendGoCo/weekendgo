# WEEKENDGO — وثيقة المشروع المحدثة
## Updated Technical Brief — يونيو 2026 (محدث)

**آخر تحديث:** يونيو 2026 - مرحلة متقدمة  
**الحالة:** قيد التطوير النشط — مرحلة ما قبل الإطلاق (Pre-Production)  
**الموعد النهائي:** ATM دبي 2026 (14-17 سبتمبر 2026)

---

## 🔄 ملخص التحديثات الأخيرة (Recent Updates)

### ✅ تم إنجازه مؤخراً
- **أساس النظام المعماري:** تم توضيح بنية Price Aggregation النهائية
- **خارطة طريق المزودين:** تم تحديد الأولويات (WebBeds → HBX → Hotels.nl)
- **قرار قاعدة البيانات:** PostgreSQL مع Redis caching (الانتقال من SQLite)
- **نظام Deduplication:** GIATA ID mapping للفنادق المكررة
- **مصدر الصور:** Cloudinary + Hotelbeds Content API
- **معايير Certification:** تم تحديد متطلبات HBX/WebBeds بدقة

### 🔴 الفجوات الحرجة المتبقية
1. **`/api/locations/search`** ← غير موجود — يمنع أي بحث فعلي
2. **Database Migration** ← SQLite → PostgreSQL (حرج قبل أي بيانات حقيقية)
3. **Hotel Detail Page** ← مفقود (مطلوب للـ Certification)
4. **Booking Flow** ← 3-step form (Critical path)
5. **Provider Integration** ← HBX يعمل بـ Sandbox فقط

---

## 🏗️ البنية المعمارية المحدثة

### المعادلة الهندسية للبحث

```
SearchQuery (location, checkIn, checkout, guests)
    ↓ [Normalize & Validate]
    ↓
[Location Resolution Service]
    • Input: "دبي" أو "Dubai"
    • Logic: Query cities_map table
    • Output: { booking_id, hotelbeds_id, travelport_id, ... }
    ↓
[Parallel API Calls] — Promise.allSettled()
    ├─ HBX/Hotelbeds (Primary)
    │   └─ Request format: destination_id, checkIn/checkOut, currency
    ├─ WebBeds/DOTW (Fallback)
    │   └─ Request format: city_code, dates, guests
    ├─ Hotels.nl (Fast)
    │   └─ Request format: city, dates (max 15 results)
    └─ RateHawk/TBO (if enabled)
    ↓
[Price Merger Engine]
    • Group by GIATA ID (master hotel identifier)
    • Calculate unified price (provider-specific markups)
    • Select "cheapest available" per hotel
    ↓
[Cache Layer] — Redis TTL: 30 minutes
    • Key: md5(location + checkIn + checkout + guests)
    • Value: { hotels: [...], merged_count, sources, timestamp }
    ↓
[Return Results to UI]
    • Enhanced with images from Cloudinary
    • Sorted by price/rating
```

### Schema التخزين المقترح

```sql
-- Layer 1: Static Content (Updated weekly via cron)
CREATE TABLE cities (
    id UUID PRIMARY KEY,
    name_ar VARCHAR NOT NULL,
    name_en VARCHAR NOT NULL,
    country_code VARCHAR(2),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    -- Provider mappings
    booking_id VARCHAR,
    hotelbeds_id VARCHAR,
    travelport_id VARCHAR,
    webbed_id VARCHAR,
    created_at TIMESTAMP
);

CREATE TABLE hotels (
    id UUID PRIMARY KEY,
    giata_id VARCHAR UNIQUE,  -- Master identifier
    name_ar VARCHAR NOT NULL,
    name_en VARCHAR NOT NULL,
    city_id UUID REFERENCES cities(id),
    stars INT,
    address_ar TEXT,
    address_en TEXT,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    phone VARCHAR,
    email VARCHAR,
    amenities JSONB,
    description_ar TEXT,
    description_en TEXT,
    -- Provider-specific IDs
    provider_ids JSONB,  -- { "hotelbeds": "XXX", "booking": "YYY" }
    images_count INT,
    last_updated TIMESTAMP
);

CREATE TABLE hotel_images (
    id UUID PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    cloudinary_url VARCHAR NOT NULL,
    original_source VARCHAR,  -- 'hotelbeds' | 'tbo' | 'unsplash'
    width INT,
    height INT,
    alt_text_ar VARCHAR,
    alt_text_en VARCHAR,
    priority INT,  -- Lower = higher priority in display
    created_at TIMESTAMP
);

-- Layer 2: Live Pricing (TTL: 30 minutes)
CREATE TABLE price_cache (
    id UUID PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    provider VARCHAR,  -- 'hotelbeds' | 'webbed' | 'hotels_nl'
    check_in DATE,
    check_out DATE,
    guests INT,
    room_type VARCHAR,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    availability BOOLEAN,
    cached_at TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(hotel_id, provider, check_in, check_out, guests)
);

CREATE TABLE search_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    location_query VARCHAR,
    check_in DATE,
    check_out DATE,
    guests INT,
    results_count INT,
    duration_ms INT,
    sources JSONB,  -- ["hotelbeds", "webbed", "hotels_nl"]
    created_at TIMESTAMP
);

-- Layer 3: User Data
CREATE TABLE users (
    id UUID PRIMARY KEY,
    google_id VARCHAR UNIQUE,
    name_ar VARCHAR,
    name_en VARCHAR,
    email VARCHAR UNIQUE,
    avatar_url VARCHAR,
    phone VARCHAR,
    country_code VARCHAR(2),
    language VARCHAR(2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_searches (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    location VARCHAR,
    check_in DATE,
    check_out DATE,
    guests INT,
    created_at TIMESTAMP
);

CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    hotel_id UUID REFERENCES hotels(id),
    added_at TIMESTAMP,
    UNIQUE(user_id, hotel_id)
);
```

---

## 🔗 خطة التكامل مع المزودين (Providers Roadmap)

### المرحلة 1: HBX/Hotelbeds (أسبوع 1-2)

**الحالة الحالية:** Sandbox API key موجود (3fd12cf...)

```javascript
// Next.js Route Handler: /app/api/hotels/search/route.ts
import { searchHotelbeds } from '@/lib/providers/hotelbeds';

export async function POST(req: Request) {
  const { location, checkIn, checkOut, guests } = await req.json();
  
  // 1. Resolve location
  const cityId = await resolveCityToHotelbeds(location);
  
  // 2. Call HBX API
  try {
    const result = await searchHotelbeds({
      destinationId: cityId,
      checkIn,    // YYYY-MM-DD
      checkOut,   // YYYY-MM-DD
      roomCount: 1,
      guests: [{ numberOfAdults: guests }],
      currency: 'AED'  // or from user locale
    });
    
    // 3. Transform response
    const hotels = result.hotels.map(h => ({
      id: h.code,
      name_en: h.name,
      stars: h.category,
      price: h.minRate,
      currency: h.currency,
      images: h.images.map(img => img.path),
      provider: 'hotelbeds'
    }));
    
    // 4. Cache for 30 min
    await cacheResults(location, checkIn, checkOut, guests, hotels);
    
    return Response.json({ hotels, provider: 'hotelbeds' });
  } catch (err) {
    console.error('HBX Error:', err);
    return Response.json({ error: 'Provider unavailable' }, { status: 503 });
  }
}
```

**نقاط التنفيذ الحرجة:**
- [ ] إضافة `HOTELBEDS_API_KEY` إلى `.env.local`
- [ ] معالجة تحويل الوجهات (location → HBX destinationId)
- [ ] Error handling للحالات: "Sold Out" | "Invalid Dates" | "Rate Limit"
- [ ] Rate limiting: 1000 req/day (Hotelbeds quota)
- [ ] Unit tests للـ response transformation

---

### المرحلة 2: WebBeds/DOTW (أسبوع 3-4)

**الحالة الحالية:** انتظار موافقة + Company Code: 2298535

```javascript
// /lib/providers/webbed-aggregator.ts
export async function searchWebBeds(params) {
  const { location, checkIn, checkOut, guests } = params;
  
  const request = {
    CompanyCode: process.env.WEBBED_COMPANY_CODE,
    Username: process.env.WEBBED_USERNAME,
    Password: process.env.WEBBED_PASSWORD,
    Authentication: buildAuthToken(),
    
    HotelSearchRequest: {
      SearchCriteria: {
        Destination: {
          CityCode: location  // Must be IATA or WebBeds code
        },
        StayPeriod: {
          CheckInDate: checkIn,
          CheckOutDate: checkOut,
          NumberOfNights: calculateNights(checkIn, checkOut)
        },
        RoomRequirements: [{
          NumberOfAdults: guests,
          NumberOfChildren: 0
        }],
        Currency: 'AED'
      },
      SearchPreferences: {
        HotelPreference: 'Premium',  // Our requirement
        AvailabilityOnly: true,
        MaxProperties: 100
      }
    }
  };
  
  return await axios.post(WEBBED_API_ENDPOINT, request, {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**نقاط التنفيذ:**
- [ ] Credentials configuration (.env)
- [ ] WebBeds authentication flow
- [ ] Wholesale pricing calculation (markup rules)
- [ ] Look-to-Book ratio tracking
- [ ] Image sourcing from WebBeds Content API

---

### المرحلة 3: Hotels.nl (أسبوع 2 - Parallel)

**الحالة الحالية:** Ready (200 req/day, 15 hotels/search)

```javascript
// /lib/providers/hotelsnl.ts
export async function searchHotelsNL(params) {
  const { location, checkIn, checkOut, guests } = params;
  
  const response = await fetch('https://hotelsnl.com/api/v1/hotels', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HOTELSNL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      city: location,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      limit: 15
    })
  });
  
  return await response.json();
}
```

**ملاحظات:**
- سريع جداً (response < 500ms)
- محدود بـ 15 فندق لكن كافي كمصدر backup
- يعمل الآن — يمكن تفعيله في الحال

---

## 🛠️ قرارات تقنية (Architecture Decisions)

### 1. Caching Strategy

**اختيار:** Redis (production) + In-Memory (development)

```typescript
// /lib/cache/hotel-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedResults(searchKey: string) {
  const cached = await redis.get(`search:${searchKey}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedResults(
  searchKey: string,
  data: HotelResult[],
  ttl: number = 30 * 60  // 30 minutes
) {
  await redis.setex(
    `search:${searchKey}`,
    ttl,
    JSON.stringify(data)
  );
}

// Search key = md5(location + checkIn + checkout + guests + currency)
```

**البدائل المرفوضة:**
- ❌ PostgreSQL caching: بطيء جداً لـ 30 min TTL
- ❌ Browser Cache: غير موثوق للبيانات الحساسة
- ✅ Redis: سريع + distributed + expires automatically

---

### 2. Database Migration Plan

**الخطوات:**

```bash
# 1. التثبيت والإعداد (Week 1)
npm install pg @types/pg
export DATABASE_URL=postgresql://user:pass@localhost:5432/weekendgo

# 2. Schema creation
psql $DATABASE_URL < schema.sql

# 3. Data import (if needed)
node scripts/migrate-sqlite-to-pg.js

# 4. Connection pooling
npm install pg-pool

# 5. Update .env
POSTGRES_URL=$DATABASE_URL
REDIS_URL=redis://localhost:6379
```

**نقاط حرجة:**
- Backup SQLite قبل الانتقال
- تشغيل migrations على development أولاً
- لا تمس users table (يحتوي Google OAuth IDs)

---

### 3. Image Sourcing & CDN

**الحل المختار:** Cloudinary CDN + Hotelbeds Content API

```typescript
// /lib/image/image-service.ts
import cloudinary from 'cloudinary';

export async function syncHotelImages(hotelId: string) {
  // 1. جلب من Hotelbeds Content API
  const images = await hotelbeds.getImages(hotelId);
  
  // 2. Upload إلى Cloudinary
  for (const img of images) {
    const result = await cloudinary.v2.uploader.upload(img.url, {
      folder: `weekendgo/hotels/${hotelId}`,
      quality: 'auto',
      fetch_format: 'auto',
      responsive_width: true
    });
    
    // 3. Save reference in DB
    await db.hotelImages.create({
      hotel_id: hotelId,
      cloudinary_url: result.secure_url,
      original_source: 'hotelbeds',
      width: result.width,
      height: result.height
    });
  }
}

// استخدام في الـ frontend
// <img src={cloudinaryUrl} alt="..." loading="lazy" />
```

**الفوائد:**
- Auto optimization (WebP, responsive, compression)
- CDN global (سريع من أي مكان)
- Transform URLs (crop, resize, effects)
- Analytics (who/when loaded each image)

---

## 📊 متطلبات Certification المحدثة

### HBX/Hotelbeds Certification

| المتطلب | الحالة | الموعد |
|---------|--------|-------|
| ✅ Server-side API calls | إنجاز | Done |
| ✅ API Key في .env فقط | إنجاز | Done |
| ✅ Availability Search | UI جاهز | Done |
| ❌ Hotel Detail Page | غير موجود | Week 2 |
| ❌ Booking Flow (3 steps) | غير موجود | Week 3-4 |
| ❌ Confirmation Page | غير موجود | Week 4 |
| ❌ Error Handling | غير موجود | Week 2-3 |
| ❌ Caching Rules | غير موجود | Week 1 |
| ⚠️ SSL/HTTPS Prod | بدون deployment | Week 5 |
| ❌ Look-to-Book tracking | بدون WebBeds | Week 3 |

**الحد الأدنى للـ Certification:**
- Hotel Detail page + basic booking form
- Error messages واضحة
- SSL certificate

---

## 🚀 خطة التنفيذ الفورية (Next 4 Weeks)

### الأسبوع 1: الأساس
```
[Mon-Tue]
□ إعداد PostgreSQL locally
□ تشغيل migrations
□ إضافة HBX API Key إلى .env
□ اختبار اتصال HBX Sandbox

[Wed-Thu]
□ بناء /api/locations/search (City resolution)
□ اختبار transform response
□ إعداد Redis locally

[Fri]
□ Integration testing
□ قائمة المدن (cities table) — Arabic/English
□ Code review
```

**Deliverable:** `/api/hotels/search` يعمل مع HBX sandbox

---

### الأسبوع 2: Aggregation + Caching
```
[Mon-Wed]
□ بناء Price Aggregator (Promise.allSettled)
□ Redis caching layer
□ Merge logic (GIATA deduplication)

[Thu-Fri]
□ Hotels.nl integration (quick)
□ Testing with multiple queries
□ Performance monitoring
```

**Deliverable:** Multi-provider search with results in < 2 seconds

---

### الأسبوع 3: Hotel Detail + Booking Form
```
[Mon-Tue]
□ /hotel/[id] page (Info + images + availability)
□ Room selection UI
□ Guest requirements form

[Wed-Thu]
□ /hotel/[id]/book step 1 (Room choice)
□ Step 2 (Guest data)
□ Step 3 (Payment form stub)

[Fri]
□ Confirmation page
□ Email notification stub
□ Testing end-to-end
```

**Deliverable:** Full booking flow UI (payment backend in next week)

---

### الأسبوع 4: Certification Readiness
```
[Mon-Wed]
□ Error handling (Sold out, invalid dates, etc.)
□ Proper HTTP status codes
□ User-friendly error messages (AR/EN)
□ Rate limiting

[Thu-Fri]
□ Final QA
□ Documentation
□ Prepare for Certification submission
□ WebBeds readiness (if credentials arrive)
```

**Deliverable:** Certification-ready codebase

---

## 📝 Configuration (Environment Variables)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weekendgo
REDIS_URL=redis://localhost:6379

# Providers API Keys
HOTELBEDS_API_KEY=3fd12cf...
HOTELBEDS_API_SECRET=xxx
WEBBED_USERNAME=xxx
WEBBED_PASSWORD=xxx
WEBBED_COMPANY_CODE=2298535
HOTELSNL_API_KEY=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
OAUTH_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# General
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
LOG_LEVEL=debug
```

---

## 🐛 Known Issues & Solutions

### Issue #1: Location Resolution Fails
**المشكلة:** City names → Provider IDs mapping غير موجود

**الحل:**
```sql
CREATE TABLE city_mappings (
  id UUID PRIMARY KEY,
  name_ar VARCHAR UNIQUE,
  name_en VARCHAR UNIQUE,
  hotelbeds_id VARCHAR,
  webbed_code VARCHAR,
  booking_id VARCHAR,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8)
);

-- Seed data
INSERT INTO city_mappings (name_ar, name_en, hotelbeds_id, webbed_code)
VALUES 
  ('دبي', 'Dubai', '2520', 'DXB'),
  ('الرياض', 'Riyadh', '2520', 'RUH'),
  ...
```

**Timeline:** Week 1, Day 1

---

### Issue #2: Price Calculation Formula Unclear
**المشكلة:** هل نطبق markup على جميع المزودين أم مختلف لكل واحد؟

**القرار:** Per-provider markup rules

```typescript
// /lib/pricing/markup-rules.ts
const MARKUP_RULES = {
  hotelbeds: {
    base_markup: 1.15,        // 15% margin
    tier_1_hotels: 1.10,      // 5-star: 10%
    tier_2_hotels: 1.20,      // 3-4 star: 20%
    weekend_multiplier: 1.05  // +5% on weekends
  },
  webbed: {
    base_markup: 1.12,
    wholesale_discount: 0.95
  },
  hotels_nl: {
    base_markup: 1.25         // Higher margin (lower volume)
  }
};

export function calculateFinalPrice(
  basePrice: number,
  provider: string,
  hotelStar: number,
  date: Date
): number {
  let rule = MARKUP_RULES[provider];
  let markup = rule.base_markup;
  
  if (provider === 'hotelbeds') {
    markup = hotelStar >= 5 ? rule.tier_1_hotels : rule.tier_2_hotels;
    if (isWeekend(date)) markup *= rule.weekend_multiplier;
  }
  
  return basePrice * markup;
}
```

---

### Issue #3: Database Transaction Handling
**المشكلة:** When multiple providers return simultaneously, concurrent writes might conflict

**الحل:** PostgreSQL transactions + optimistic locking

```typescript
async function batchUpsertHotels(hotels: HotelData[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const hotel of hotels) {
      await client.query(
        `INSERT INTO hotels (id, name_en, name_ar, giata_id, provider_ids)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (giata_id) 
         DO UPDATE SET provider_ids = provider_ids || $5`,
        [uuid(), hotel.name, hotel.name, hotel.giata_id, 
         JSON.stringify({ [hotel.provider]: hotel.provider_id })]
      );
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

## 📋 Checklist للتطوير

### Database Setup
- [ ] PostgreSQL تثبيت و تشغيل locally
- [ ] Database created
- [ ] Schema migrations applied
- [ ] Sample data seeded (10 cities minimum)

### API Endpoints
- [ ] `POST /api/hotels/search` — Multi-provider search
- [ ] `GET /api/locations/search` — City autocomplete
- [ ] `GET /api/hotels/[id]` — Hotel detail
- [ ] `POST /api/bookings/create` — Booking creation
- [ ] `GET /api/user/favorites` — User favorites list

### Error Handling
- [ ] HTTP 400 — Invalid input validation
- [ ] HTTP 503 — Provider unavailable
- [ ] HTTP 429 — Rate limit exceeded
- [ ] HTTP 500 — Server error with logging

### Testing
- [ ] Unit tests for price calculation
- [ ] Integration tests for provider APIs
- [ ] E2E tests for search → booking flow
- [ ] Load testing (simulate ATM traffic)

---

## ⚠️ Risks & Mitigations

| الخطر | الاحتمالية | التأثير | الحل |
|------|-----------|--------|------|
| HBX/WebBeds تأخر الموافقة | عالية | تأخير الإطلاق | Hotels.nl كـ fallback جاهز |
| SQLite → PG migration fails | متوسطة | بيانات تالفة | Backup + test migration أولاً |
| Image API quota exceeded | متوسطة | صور missing | Cloudinary backup + local CDN |
| Rate limiting من providers | عالية | Requests rejected | Implement backoff + caching |
| Performance degradation | متوسطة | Search time > 3s | Optimize queries + add indexing |

---

## 📞 Contact Points

**مراسلات المزودين المعلقة:**
- Hotelbeds: API key موجود ✅
- WebBeds: انتظار موافقة (PO-pending)
- Hotels.nl: جاهز ✅
- RateHawk: طلب مرسل (no response yet)
- TBO: طلب مرسل (no response yet)

**بيانات الاعتماد المخزنة:**
- Google OAuth: ✅ في .env
- HBX: ⚠️ يجب إضافة إلى .env
- WebBeds: ⏳ في انتظار الموافقة
- Cloudinary: ⏳ حساب يحتاج تفعيل

---

*آخر تحديث: يونيو 2026 - نسخة 2.0*  
*الإصدار: Technical Deep-Dive (بدون تفاصيل Design)*
