# WEEKENDGO — وثيقة المشروع الشاملة (النسخة 3)
## Updated Master Brief — يونيو 2026

**آخر تحديث:** يونيو 04، 2026  
**الحالة:** قيد التطوير النشط — مرحلة ما قبل الإطلاق  
**الموعد النهائي:** ATM دبي 2026 — 14 إلى 17 سبتمبر 2026  
**رقم Badge ATM:** 631477481 (طباعة قبل الموعد بأسبوعين — لا يُقبل الهاتف)

---

## 🆕 ما الجديد في النسخة 3

| التحديث | التفاصيل |
|---------|---------|
| مصفوفة المزودين الكاملة | 10 مزودين موثقين بالكامل |
| بيانات اعتماد جديدة | Travelport، WebBeds، Expedia، Hotels.com |
| Booking.com v3.2 | تفاصيل تقنية حرجة (String IDs) |
| WebHotelier | مزود جديد للفنادق الفاخرة |
| خارطة طريق المطورين | 4 مراحل واضحة |
| تحذيرات أمنية | معالجة Rate Limiting و Look-to-Book |

---

## 1. ما هو WeekendGo؟

منصة سفر وسياحة **فاخرة** باللغتين العربية والإنجليزية (RTL/LTR)، تعمل كـ **Price Aggregator** — تجمع أسعار الفنادق والرحلات من مزودين متعددين وتعرض الأرخص للمستخدم.

**الفلسفة الهندسية:** "الانسيابية الفاخرة" — Middleware Architecture يضمن عزل API Keys عن المتصفح بالكامل.

**الهدف التجاري:** إطلاق نسخة مستقرة قبل معرض **ATM دبي 2026**.

---

## 2. البنية التقنية

### Stack المستخدم
```
Backend:   Node.js + Express (server.js) — Port 3000
Database:  SQLite (مؤقت) → PostgreSQL (الهدف)
Cache:     Redis (TTL: 30 دقيقة للأسعار)
Frontend:  Next.js 16 + React 19 + TypeScript
Styling:   Tailwind CSS v4 + Framer Motion + Lucide Icons
Auth:      Google OAuth2 (passport-google-oauth20)
CDN:       Cloudinary (صور الفنادق)
```

### نظام الألوان
```css
--background: #0A1628    /* Navy الداكن (محدث من #0B1325) */
--primary:    #00E5FF    /* Cyan الكهربائي */
--accent:     #A6CE39    /* Lime النيون */
--gold:       #C9A84C    /* الذهبي */

/* تأثيرات بصرية */
Glassmorphism:  backdrop-blur-20px إلى 30px
Neon Glow:      على المسارات التفاعلية
Dark Mode:      #0A1628 (اللون الأساسي)
```

---

## 3. مصفوفة المزودين الكاملة (10 مزودين)

| # | المزود | نوع الخدمة | بروتوكول/API | الحالة | الأولوية |
|---|--------|-----------|-------------|--------|---------|
| 1 | **Booking.com** | فنادق + إقامة | Demand API v3.2 | 🟡 Sandbox Active | 1 — أساسي |
| 2 | **WebBeds/DOTW** | فنادق جملة | APITUDE REST/JSON | 🟡 Active (DOTW) | 2 — جملة |
| 3 | **Travelport** | طيران + فنادق | TripServices v11 | 🟡 Sandbox Ready | 3 — طيران |
| 4 | **Hotels.nl** | فنادق | POST JSON | 🟢 Ready (Live) | 4 — سريع |
| 5 | **Expedia Affiliate** | شامل | RapidAPI via CJ | 🟢 Active | 5 — أفلييت |
| 6 | **Hotels.com** | فنادق أفلييت | Deeplinks via CJ | 🟢 Active | 5 — أفلييت |
| 7 | **RateHawk** | فنادق | ETG API V3 | 🟢 Active | 3 — مقارنة |
| 8 | **TBO Holidays** | فنادق | XML/JSON | 🟢 Active | 3 — مقارنة |
| 9 | **SerpAPI** | Google Hotels | Scraping API | ⚠️ Prototyping | مؤقت فقط |
| 10 | **WebHotelier** | فنادق فاخرة | Direct Integration | 🟢 Ready | فاخرة |

### HBX/Hotelbeds (مزود منفصل)
| **HBX/Hotelbeds** | فنادق مباشر | REST/JSON | 🟡 Sandbox | 1 — أساسي |

---

## 4. التفاصيل التقنية لكل مزود

### 4.1 Booking.com — Demand API v3.2 ⭐ أهم مزود

**Endpoint:**
```
https://demand-api.booking.com/v1.2/accommodations/search
```

**تحذير تقني حاسم — String IDs:**
```javascript
// ❌ خطأ شائع يسبب فشل الاستعلام
room_id: 12345  // Integer — يفشل!

// ✅ الصحيح
room_id: "12345"  // String — مطلوب في v3.2
```

**هيكل الطلب المطلوب:**
```json
{
  "booker": {
    "country": "AE",  // بلد المسافر — يؤثر على الضرائب
    "platform": "web"
  },
  "guests": [
    {
      "type": "adult"
    },
    {
      "type": "child",
      "age": 3   // عمر الطفل بدقة
    },
    {
      "type": "child", 
      "age": 8
    }
  ],
  "accommodation": {
    "products": {
      "room": "STRING_ROOM_ID"  // دائماً String
    }
  }
}
```

**بيانات الأسعار:**
```javascript
// استخدم price.total و price.display
// وحّد العملة عبر currency_booker
const finalPrice = response.price.total;
const currency = response.currency_booker;
```

**الحالة:** Token موجود ⚠️ — ينتظر موافقة production

---

### 4.2 WebBeds/DOTW — APITUDE (Wholesaler)

**معلومة حرجة:** الحساب مسجل تحت **DOTW (Destinations of the World)** وليس WebBeds مباشرة. عند التواصل مع الدعم الفني، استخدم:
- الشخص المسؤول: **Ahmed Tulpa**
- البوابة: `dotwconnect.com`

**قاعدة Look-to-Book (حاسمة):**
```
⚠️ الالتزام الصارم بمعيار Look-to-Book Ratio
✅ يجب استخدام PostgreSQL لـ Static Content Caching
✅ الصور + الأوصاف: يُخزن محلياً ولا يُجلب مباشرة
✅ الأسعار + التوافر فقط: يُستعلم في الوقت الفعلي
❌ الاستعلام الزائد = حظر الحساب
```

**هيكل الطلب:**
```javascript
const request = {
  CompanyCode: process.env.WEBBED_COMPANY_CODE,  // 2298535
  Username: process.env.WEBBED_USERNAME,
  Password: process.env.WEBBED_PASSWORD,
  HotelSearchRequest: {
    SearchCriteria: {
      Destination: { CityCode: cityCode },
      StayPeriod: {
        CheckInDate: checkIn,
        CheckOutDate: checkOut
      },
      RoomRequirements: [{ NumberOfAdults: guests }],
      Currency: 'AED'
    },
    SearchPreferences: {
      HotelPreference: 'Premium',
      AvailabilityOnly: true,
      MaxProperties: 100
    }
  }
};
```

---

### 4.3 Travelport — TripServices v11 (طيران + فنادق)

**Authentication:**
```bash
# الحصول على Token
POST https://auth.pp.travelport.net/oauth/token

# Parameters
grant_type=client_credentials
client_id=2C9uuTkO7EC96maT3ewQLANt6tag6knC
client_secret=[من .env]
```

**دعم الطيران:**
```
NDC (New Distribution Capability):
  ✅ American Airlines (AA)
  ✅ United Airlines (UA)  
  ✅ Qantas (QF)
  ✅ Singapore Airlines (SQ)

GDS (تغطية كاملة — 44 ناقلة):
  ✅ British Airways (BA)
  ✅ Lufthansa (LH)
  ✅ Delta (DL)
  ✅ وغيرها...
```

**White-Label Integration:** استخدام JSON Response لبناء واجهة حجز طيران مدمجة.

---

### 4.4 Hotels.nl — مزود سريع (200 req/day)

**قيود مهمة:**
```
Rate Limits:  5 طلبات/دقيقة | 200 طلب/يوم/IP
المخرجات:    أرخص سعر فقط لـ 15 فندق كحد أقصى
معرف الحجز: hotelsnl_hash (ضروري لإتمام الحجز)
```

**مسار العمل (3 خطوات):**
```
1. Search → نتائج أولية
2. Details → تفاصيل فندق محدد
3. Book → حجز عبر Finalization URL (خارجي)
```

**كود التكامل:**
```javascript
const response = await fetch('https://hotelsnl.com/api/v1/hotels', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.HOTELSNL_API_KEY}` },
  body: JSON.stringify({
    city: location,
    check_in: checkIn,
    check_out: checkOut,
    guests: guests,
    limit: 15
  })
});
```

---

### 4.5 Expedia Affiliate — via CJ Network

**معلومات الحساب:**
```
CID أمريكا:   1874913
CID بريطانيا: 5288967
Publisher ID: 101750690
النوع:        Affiliate (أفلييت — بدون API مباشر)
```

---

### 4.6 Hotels.com — Deeplinks

```
Website ID:  101750690
النوع:       Affiliate via CJ
الاستخدام:  روابط عميقة (Deeplinks) + عمولة
```

---

### 4.7 RateHawk

```
API:     ETG API V3
الحساب: Agency Account
الحالة: Active
```

---

### 4.8 TBO Holidays

```
API:     XML/JSON
الحساب: Agency Account  
الحالة: Active
```

---

### 4.9 SerpAPI — مؤقت للتطوير فقط

```
⚠️ مرحلة Prototyping فقط — يجب إيقافه قبل الإطلاق
الحد:   250 بحث/شهر (للتطوير)
الغرض: اختبار UI وبنية الكود ببيانات حقيقية
```

**⚠️ تحذير أمني:** مفتاح SerpAPI يجب أن يكون في `.env` فقط. لا تشاركه في أي وثيقة.

**متى تُوقف SerpAPI:**
```
❌ قبل أي نشر production
❌ عند تفعيل Booking.com أو WebBeds
❌ في مرحلة الـ Certification
```

---

### 4.10 WebHotelier — الفنادق الفاخرة

```
النوع:  Direct Integration (خاص بالفنادق الفاخرة)
الحالة: Ready
```

---

## 5. بنية Price Aggregation (المعادلة الهندسية)

```
SearchQuery (location, checkIn, checkout, guests)
          ↓ [Normalize & Validate]
[Location Resolution Service]
  • Input: "دبي" أو "Dubai"
  • Query: cities_map table في PostgreSQL
  • Output: { booking_id, hotelbeds_id, travelport_id, webbed_code, ... }
          ↓
[Parallel API Calls] — Promise.allSettled()
  ├─ Booking.com (Primary)
  ├─ HBX/Hotelbeds (Primary)
  ├─ WebBeds/DOTW (Wholesale)
  ├─ Hotels.nl (Fast, 15 results)
  ├─ RateHawk (Comparison)
  └─ TBO Holidays (Comparison)
          ↓
[Price Merger Engine]
  • Group by GIATA ID (deduplication)
  • Select cheapest per hotel
  • Apply markup rules
          ↓
[Redis Cache] — TTL: 30 دقيقة
  • Key: md5(location + checkIn + checkout + guests)
          ↓
[UI] — نتائج مرتبة بالسعر + شارات المزود
```

---

## 6. بروتوكولات الأمان والحماية

### 6.1 City Mapping Dictionary
```sql
-- ترجمة مدخلات المستخدم إلى IDs رقمية
-- مثال: دبي = -2140479 في نظام Booking.com

CREATE TABLE city_mappings (
  name_ar VARCHAR UNIQUE,
  name_en VARCHAR UNIQUE,
  booking_id VARCHAR,        -- مثال: -2140479
  hotelbeds_id VARCHAR,
  travelport_id VARCHAR,
  webbed_code VARCHAR,       -- مثال: DXB
  lat DECIMAL(10,8),
  lng DECIMAL(11,8)
);

INSERT INTO city_mappings VALUES 
  ('دبي', 'Dubai', '-2140479', '2520', 'DXB', 'DXB', 25.2048, 55.2708),
  ('الرياض', 'Riyadh', '...', '...', 'RUH', 'RUH', 24.7136, 46.6753),
  ('مكة', 'Makkah', '...', '...', 'MCC', 'MCC', 21.3891, 39.8579);
```

### 6.2 Middleware Proxying
```
⛔ ممنوع: استدعاء APIs من Client-side (المتصفح)
✅ مطلوب: جميع الطلبات عبر Server-side API Routes فقط
✅ مطلوب: جميع API Keys في .env فقط — لا في الكود
```

### 6.3 Rate Limiting & Error Handling
```typescript
// معالجة 429 (Rate Limit Exceeded)
if (error.status === 429) {
  const retryAfter = error.headers['retry-after'];
  await sleep(retryAfter * 1000);
  return retryWithBackoff(request);
}

// Fallback عند فشل مزود
if (booking.failed) tryHotelbeds();
if (hotelbeds.failed) tryHotelsNL();
```

### 6.4 Net-to-Gross Calculation
```typescript
// محول عملات موحد في الخلفية
const EXCHANGE_RATES = { AED: 1, SAR: 0.96, USD: 3.67, GBP: 4.60 };

// Markup rules
const MARKUP = {
  booking:   { base: 1.15, luxury: 1.10, standard: 1.20 },
  webbed:    { base: 1.12 },
  hotels_nl: { base: 1.25 },
  ratehawk:  { base: 1.18 },
};
```

---

## 7. متغيرات البيئة المطلوبة (.env)

```bash
# ───── قاعدة البيانات ─────
DATABASE_URL=postgresql://user:password@localhost:5432/weekendgo
REDIS_URL=redis://localhost:6379

# ───── المزودون ─────
HOTELBEDS_API_KEY=[من Hotelbeds Dashboard]
HOTELBEDS_API_SECRET=[من Hotelbeds Dashboard]

WEBBED_COMPANY_CODE=2298535
WEBBED_USERNAME=Weekend.Go
WEBBED_PASSWORD=[محفوظ بشكل آمن]

HOTELSNL_API_KEY=[من Hotels.nl]

RATEHAWK_API_KEY=[من RateHawk Agency Account]
TBO_API_KEY=[من TBO Holidays]

BOOKING_ACCESS_TOKEN=[ينتظر موافقة production]

TRAVELPORT_PCC=7K99
TRAVELPORT_CLIENT_ID=2C9uuTkO7EC96maT3ewQLANt6tag6knC
TRAVELPORT_CLIENT_SECRET=[من .env الخاص]
TRAVELPORT_ACCESS_GROUP=8E0C825F-75F5-4924-BE5D-F04A913FAEC5

EXPEDIA_CID_US=1874913
EXPEDIA_CID_UK=5288967
HOTELS_COM_PUBLISHER=101750690

SERPAPI_KEY=[لا تشاركه خارج .env — مؤقت للتطوير فقط]

# ───── Auth ─────
GOOGLE_CLIENT_ID=[موجود]
GOOGLE_CLIENT_SECRET=[موجود]
OAUTH_CALLBACK_URL=http://localhost:3000/auth/google/callback

# ───── CDN ─────
CLOUDINARY_CLOUD_NAME=[من Cloudinary]
CLOUDINARY_API_KEY=[من Cloudinary]
CLOUDINARY_API_SECRET=[من Cloudinary]

# ───── عام ─────
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
LOG_LEVEL=debug
```

---

## 8. Schema قاعدة البيانات (PostgreSQL)

```sql
-- Layer 1: Static Content
CREATE TABLE cities (
  id UUID PRIMARY KEY,
  name_ar VARCHAR NOT NULL,
  name_en VARCHAR NOT NULL,
  country_code VARCHAR(2),
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  booking_id VARCHAR, hotelbeds_id VARCHAR,
  travelport_id VARCHAR, webbed_code VARCHAR
);

CREATE TABLE hotels (
  id UUID PRIMARY KEY,
  giata_id VARCHAR UNIQUE,
  name_ar VARCHAR, name_en VARCHAR,
  city_id UUID REFERENCES cities(id),
  stars INT, address_ar TEXT, address_en TEXT,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  amenities JSONB, description_ar TEXT, description_en TEXT,
  provider_ids JSONB,  -- { "hotelbeds": "XXX", "booking": "YYY" }
  last_updated TIMESTAMP
);

CREATE TABLE hotel_images (
  id UUID PRIMARY KEY,
  hotel_id UUID REFERENCES hotels(id),
  cloudinary_url VARCHAR NOT NULL,
  original_source VARCHAR,  -- 'hotelbeds' | 'tbo' | 'unsplash'
  width INT, height INT,
  priority INT
);

-- Layer 2: Live Pricing (TTL: 30 min)
CREATE TABLE price_cache (
  id UUID PRIMARY KEY,
  hotel_id UUID REFERENCES hotels(id),
  provider VARCHAR,
  check_in DATE, check_out DATE,
  guests INT, room_type VARCHAR,
  price DECIMAL(10,2), currency VARCHAR(3),
  availability BOOLEAN,
  cached_at TIMESTAMP, expires_at TIMESTAMP,
  UNIQUE(hotel_id, provider, check_in, check_out, guests)
);

-- Layer 3: User Data
CREATE TABLE users (
  id UUID PRIMARY KEY,
  google_id VARCHAR UNIQUE,
  name_ar VARCHAR, name_en VARCHAR,
  email VARCHAR UNIQUE,
  avatar_url VARCHAR, phone VARCHAR,
  country_code VARCHAR(2), language VARCHAR(2),
  created_at TIMESTAMP, updated_at TIMESTAMP
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

## 9. خارطة طريق المطورين (4 مراحل)

### المرحلة 1 — تفعيل Booking.com Sandbox
```
□ اختبار نظام الاستعلام بالـ String IDs (v3.2)
□ التحقق من هيكل booker + guests
□ معالجة price.total و currency_booker
```

### المرحلة 2 — WebBeds/DOTW
```
□ إرسال طلب تفعيل API Key (كود DOTW: 2298535)
□ تقديم وثائق البيئة التقنية Next.js
□ تنفيذ Static Content Caching
□ تتبع Look-to-Book Ratio
```

### المرحلة 3 — Middleware الموحد
```
□ دمج RateHawk + TBO Holidays في واجهة موحدة
□ Glassmorphism UI لعرض النتائج
□ Price Aggregation منطق كامل
```

### المرحلة 4 — واجهة البحث المتكاملة
```
□ دعم مدخلات أعمار الأطفال (لـ Booking.com v3.2)
□ City Mapping Dictionary
□ Autocomplete من PostgreSQL
```

---

## 10. ما تم إنجازه ✅ / ما لم يُنجز بعد ❌

### تم إنجازه:
- [x] واجهة الصفحة الرئيسية الكاملة
- [x] نظام البحث (SearchBox) مع autocomplete
- [x] صفحة نتائج البحث (UI جاهز)
- [x] Google OAuth
- [x] صفحة الملف الشخصي
- [x] نظام i18n (عربي/إنجليزي)
- [x] Light/Dark mode
- [x] Admin UI (Dashboard + Contracts + Hotels)
- [x] Navbar responsive
- [x] Design System متكامل

### لم يُنجز بعد:
- [ ] `/api/locations/search` — تحويل اسم المدينة إلى IDs **(الأهم)**
- [ ] ربط HBX/Hotelbeds فعلياً
- [ ] ربط Booking.com production
- [ ] ربط WebBeds/DOTW
- [ ] Price Aggregation System
- [ ] PostgreSQL (الانتقال من SQLite)
- [ ] Redis Caching
- [ ] Admin CRUD operations
- [ ] صفحة Hotel Detail (`/hotel/[id]`)
- [ ] Booking Flow (3 خطوات)
- [ ] Confirmation Page + Email
- [ ] نظام الدفع
- [ ] صفحات: Flights, Packages, Resorts
- [ ] City Mapping Dictionary كامل
- [ ] Cloudinary Integration
- [ ] Rate Limiting + Error Handling محترف
- [ ] SSL/HTTPS للـ production
- [ ] Look-to-Book tracking لـ WebBeds

---

## 11. جدول Certification (HBX/Hotelbeds)

| المتطلب | الحالة |
|---------|--------|
| Server-side API calls | ✅ |
| API Key في .env | ✅ |
| Availability Search | ✅ UI جاهز |
| Hotel Detail Page | ❌ مطلوب |
| Booking Flow (3 steps) | ❌ مطلوب |
| Confirmation Page | ❌ مطلوب |
| Error Handling | ❌ مطلوب |
| Caching Rules | ❌ مطلوب |
| SSL/HTTPS | ⚠️ قبل الإطلاق |
| Look-to-Book tracking | ❌ مطلوب |

---

## 12. Timeline حتى ATM

```
الآن (Jun 04):       تحليل + تخطيط ✅
أسبوع 1 (Jun 10):   PostgreSQL + HBX Sandbox + /api/locations
أسبوع 2 (Jun 17):   Aggregation + Redis + Hotels.nl
أسبوع 3 (Jun 24):   Hotel Detail + Booking Flow
أسبوع 4 (Jul 01):   Confirmation + Error Handling
Jul-Aug (Buffer):    QA + تحسينات + موافقات المزودين
ATM (Sep 14-17):     الإطلاق 🎯

أيام متبقية: 102 يوم
```

---

## 13. ملاحظات لوجستية مهمة

```
⚠️  طباعة Badge ATM ورقياً قبل الموعد بأسبوعين
⚠️  رقم Badge: 631477481
⚠️  لن يُقبل الدخول عبر الهاتف الذكي
⚠️  المكان: معرض ATM دبي — 14 إلى 17 سبتمبر 2026
```

---

## 14. ملاحظات للذكاء الاصطناعي والمطورين

1. **المشروع Next.js 16** — App Router فقط (لا Pages Router)
2. **جميع API calls** من Server-side Route Handlers في `/app/api/`
3. **نظام الألوان** يعتمد على CSS Variables فقط
4. **الـ i18n** يعمل بـ Context API بدون مكتبة خارجية
5. **Admin Layout** منفصل بدون Navbar/Footer العادي
6. **SerpAPI** في backend (Express) وليس في Next.js routes
7. **WebBeds = DOTW** — نفس المزود باسمين مختلفين
8. **Booking.com v3.2**: Room ID يجب أن يكون String دائماً
9. **Hotels.nl**: يعيد 15 فندق كحد أقصى فقط
10. **أهم فجوة:** `/api/locations/search` غير موجود = لا يوجد بحث فعلي

---

*النسخة 3.0 — يونيو 04، 2026*  
*يشمل: التقرير التقني التنفيذي + v1 + v2 + تحديثات جديدة*
