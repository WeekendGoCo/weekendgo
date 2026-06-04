# SerpAPI Integration Guide - مشروع Weekend Go
## شامل و عملي مع أمثلة الكود

**الإصدار:** 1.0  
**آخر تحديث:** يونيو 2026  
**الحالة:** Prototyping Phase

---

## 📋 Table of Contents
1. [مقدمة و حالة الاستخدام](#مقدمة)
2. [آلية عمل SerpAPI](#آلية-العمل)
3. [API Documentation](#api-documentation)
4. [Implementation Examples](#کود-الأمثلة)
5. [Integration Strategy](#استراتيجية-التكامل)
6. [Migration Path](#خطة-الانتقال)
7. [Troubleshooting](#حل-المشاكل)

---

## 🎯 مقدمة

### ما هي SerpAPI؟

**SerpAPI** هي خدمة تجميع بيانات (Data Scraping as a Service) توفر واجهة برمجية لاستخلاص نتائج محركات البحث بصيغة JSON منظمة.

**المميزات:**
- ✅ معالجة Captchas تلقائياً
- ✅ دعم أكثر من 30 محرك بحث
- ✅ تحديث النتائج بشكل منتظم
- ✅ خادم وكيل (Proxy) عالمي
- ✅ API بسيط وسهل التكامل

### الحالة الحالية في Weekend Go

```
المرحلة:      Prototyping / Development
الاستخدام:   مصدر بيانات مؤقت
الهدف:       سرعة التطوير الأولي
التوقف:      قبل الإطلاق الفعلي (Pre-Production)
البديل:      HBX/Hotelbeds API (الحقيقي)
```

**الميزة الحقيقية:** يعمل **بدون تسجيل رسمي** مع المزودين — يمكننا اختبار الـ UI و البنية الأساسية فوراً.

---

## 🔍 آلية عمل SerpAPI

### المعادلة:

```
Google Search Request
       ↓
SerpAPI Servers (Global)
       ↓
Parse HTML + Extract Data
       ↓
JSON Response
       ↓
Your App (Weekend Go)
```

### Limitations الحالية:

```
✅ المتاح:
  • Google Hotels search results
  • Hotel listings (name, price, rating)
  • Image URLs من Google
  • Booking links redirect
  • Location details

❌ غير متاح:
  • Real-time availability
  • Actual booking integration
  • Multiple room types
  • Guest requirement details
  • Meal plans و amenities
  • Cancellation policies
```

**الخلاصة:** SerpAPI توفر **نتائج البحث الأولي** فقط، لكن ليست حلاً متكاملاً للحجز.

---

## 📡 API Documentation

### Endpoint الأساسي

```
GET https://api.serpapi.com/search
```

### Request Parameters

```typescript
interface SerpAPIRequest {
  // Required
  q: string;                    // Search query (ex: "hotels in dubai")
  api_key: string;              // Your API key
  
  // Recommended
  engine: 'google_hotels';       // Engine type
  gl: string;                    // Country code (AE, SA, US)
  hl: string;                    // Language (ar, en)
  
  // Optional
  num?: number;                  // Number of results (default: 10)
  start?: number;                // Pagination offset
  
  // Hotel-specific
  check_in?: string;             // YYYY-MM-DD
  check_out?: string;            // YYYY-MM-DD
  adults?: number;               // Number of adults
  children?: number;             // Number of children
  child_age?: string;            // Comma-separated ages (ex: "3,8")
}
```

### Response Structure

```json
{
  "search_parameters": {
    "q": "hotels in dubai 2024-06-15 2024-06-18",
    "engine": "google_hotels"
  },
  "hotels": [
    {
      "position": 1,
      "title": "Emirates Palace",
      "address": "West Bay, Abu Dhabi",
      "stars": 5,
      "rating": 4.7,
      "reviews": "15K reviews",
      "price": "AED 1,500",
      "type": "5-star resort",
      "image": "https://...",
      "link": "https://www.google.com/...",
      "availability": "Available"
    },
    // ... more hotels
  ],
  "searched_location": {
    "name": "Dubai",
    "type": "City",
    "latitude": 25.2048,
    "longitude": 55.2708
  }
}
```

### Error Responses

```json
// Too many requests (Quota exceeded)
{
  "error": "Your account doesn't have enough credits"
}

// Invalid parameters
{
  "error": "Invalid `q` parameter"
}

// Invalid API key
{
  "error": "Invalid API key"
}
```

### Rate Limits

```
Free Plan:      100 searches/month
Starter Plan:   $10/month → 10,000 searches
Professional:   $100/month → 100,000 searches
Enterprise:     Custom

Current Weekend Go: Evaluation Token (محدود)
```

---

## 💻 کود الأمثلة

### مثال 1: البحث البسيط

```typescript
// /app/api/hotels/serpapi/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://api.serpapi.com/search';

export async function POST(req: NextRequest) {
  try {
    const { location, checkIn, checkOut, adults, children } = await req.json();
    
    // بناء query string
    let q = `hotels in ${location}`;
    if (checkIn) q += ` ${checkIn}`;
    if (checkOut) q += ` ${checkOut}`;
    
    const params = new URLSearchParams({
      api_key: SERPAPI_KEY!,
      engine: 'google_hotels',
      q: q,
      gl: 'ae',  // Gulf region
      hl: 'ar',  // Arabic
      num: '20'  // Get more results
    });
    
    // Add optional parameters
    if (adults) params.append('adults', adults.toString());
    if (children) params.append('children', children.toString());
    if (children && children > 0) {
      // Example: kids ages 3, 8
      params.append('child_age', '3,8');
    }
    
    // Call SerpAPI
    const response = await fetch(`${SERPAPI_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'WeekendGo/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform response
    const hotels = (data.hotels || []).map((hotel: any) => ({
      id: `serpapi_${hotel.position}`,
      name: hotel.title,
      address: hotel.address,
      stars: hotel.stars || 0,
      rating: parseFloat(hotel.rating) || 0,
      reviews_count: parseInt(hotel.reviews?.split(' ')[0]) || 0,
      price: parseFloat(hotel.price?.replace(/[^\d.-]/g, '') || '0'),
      currency: 'AED',
      image: hotel.image,
      provider: 'serpapi',
      link: hotel.link
    }));
    
    return NextResponse.json({
      success: true,
      count: hotels.length,
      data: hotels,
      meta: {
        searched_location: data.searched_location,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('SerpAPI error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

---

### مثال 2: Aggregation مع Providers آخرين

```typescript
// /lib/providers/aggregator.ts
import { searchBooking } from './booking';
import { searchWebBeds } from './webbed';
import { searchSerpAPI } from './serpapi';

interface AggregatedResult {
  id: string;
  name: string;
  price: number;
  providers: Array<{
    name: string;
    price: number;
    link: string;
  }>;
  bestPrice: number;
  cheapestProvider: string;
}

export async function aggregateSearch(params: SearchParams) {
  const results = await Promise.allSettled([
    searchBooking(params).catch(err => {
      console.warn('Booking.com failed:', err);
      return null;
    }),
    searchWebBeds(params).catch(err => {
      console.warn('WebBeds failed:', err);
      return null;
    }),
    searchSerpAPI(params).catch(err => {
      console.warn('SerpAPI failed:', err);
      return null;
    })
  ]);
  
  // Extract successful results
  const bookingResults = results[0].status === 'fulfilled' ? results[0].value : null;
  const webbedsResults = results[1].status === 'fulfilled' ? results[1].value : null;
  const serpapiResults = results[2].status === 'fulfilled' ? results[2].value : null;
  
  // Merge by hotel name (simple approach)
  const mergedMap = new Map<string, AggregatedResult>();
  
  // Add from each provider
  if (bookingResults) {
    for (const hotel of bookingResults) {
      const key = normalizeHotelName(hotel.name);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          id: hotel.id,
          name: hotel.name,
          price: hotel.price,
          providers: [],
          bestPrice: hotel.price,
          cheapestProvider: 'booking'
        });
      }
      const existing = mergedMap.get(key)!;
      existing.providers.push({
        name: 'Booking.com',
        price: hotel.price,
        link: hotel.link
      });
      if (hotel.price < existing.bestPrice) {
        existing.bestPrice = hotel.price;
        existing.cheapestProvider = 'booking';
      }
    }
  }
  
  if (webbedsResults) {
    for (const hotel of webbedsResults) {
      const key = normalizeHotelName(hotel.name);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          id: hotel.id,
          name: hotel.name,
          price: hotel.price,
          providers: [],
          bestPrice: hotel.price,
          cheapestProvider: 'webbed'
        });
      }
      const existing = mergedMap.get(key)!;
      existing.providers.push({
        name: 'WebBeds',
        price: hotel.price,
        link: hotel.link
      });
      if (hotel.price < existing.bestPrice) {
        existing.bestPrice = hotel.price;
        existing.cheapestProvider = 'webbed';
      }
    }
  }
  
  // SerpAPI as reference/comparison (lower priority)
  if (serpapiResults) {
    for (const hotel of serpapiResults) {
      const key = normalizeHotelName(hotel.name);
      if (!mergedMap.has(key)) {
        // Only add if not from primary providers
        mergedMap.set(key, {
          id: hotel.id,
          name: hotel.name,
          price: hotel.price,
          providers: [],
          bestPrice: hotel.price,
          cheapestProvider: 'serpapi'
        });
      }
    }
  }
  
  return Array.from(mergedMap.values())
    .sort((a, b) => a.bestPrice - b.bestPrice);
}

function normalizeHotelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```

---

### مثال 3: Caching مع Redis

```typescript
// /lib/cache/serpapi-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCachedSerpAPI(
  location: string,
  checkIn: string,
  checkOut: string
): Promise<any | null> {
  const key = `serpapi:${location}:${checkIn}:${checkOut}`;
  
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn('Cache read failed:', err);
    return null;
  }
}

export async function setCachedSerpAPI(
  location: string,
  checkIn: string,
  checkOut: string,
  data: any,
  ttl: number = 3600  // 1 hour
): Promise<void> {
  const key = `serpapi:${location}:${checkIn}:${checkOut}`;
  
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

export async function invalidateSerpAPICache(location: string): Promise<void> {
  // Delete all keys matching this location
  const pattern = `serpapi:${location}:*`;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('Cache invalidation failed:', err);
  }
}
```

---

### مثال 4: تحويل السعر والعملة

```typescript
// /lib/pricing/currency-converter.ts
const EXCHANGE_RATES = {
  'AED': 1,
  'SAR': 0.96,
  'USD': 3.67,
  'GBP': 4.60,
  'EUR': 4.00
};

export function convertPrice(
  price: number,
  fromCurrency: string,
  toCurrency: string = 'AED'
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
  const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
  
  return (price / fromRate) * toRate;
}

export function applyMarkup(
  basePrice: number,
  provider: string,
  hotelStars: number
): number {
  // Different markup for different providers
  const markups: Record<string, number> = {
    'serpapi': 1.20,      // 20% markup (less reliable)
    'booking': 1.15,      // 15% markup
    'webbed': 1.12,       // 12% markup (wholesale)
  };
  
  const markup = markups[provider] || 1.15;
  
  // Higher markup for budget hotels
  if (hotelStars && hotelStars < 3) {
    return basePrice * markup * 1.05;  // +5% extra
  }
  
  return basePrice * markup;
}

export function formatPrice(
  price: number,
  currency: string = 'AED'
): string {
  const formatter = new Intl.NumberFormat('ar-AE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(price);
}
```

---

## 🔌 استراتيجية التكامل

### المسار الكامل:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Search Request                       │
│        location: "Dubai", checkIn: "2024-06-15"              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Check Redis Cache        │
        │ (TTL: 60 minutes)          │
        └───┬────────────────────────┘
            │
     Hit? ──┼─── Yes ──→ Return cached data ──────┐
            │                                        │
            No                                       │
            │                                        │
            ▼                                        │
   ┌─────────────────────────────────────┐          │
   │  Parallel API Calls (Promise.all)  │          │
   ├─────────────────────────────────────┤          │
   │ 1. Booking.com (Primary)            │          │
   │ 2. WebBeds (Wholesale)              │          │
   │ 3. SerpAPI (Backup/Comparison)      │          │
   │ 4. Hotels.nl (Fast lane)            │          │
   └──────────┬──────────────────────────┘          │
              │                                      │
              ▼                                      │
    ┌────────────────────┐                          │
    │  Merge Results     │                          │
    │  - Dedup by name   │                          │
    │  - Select cheapest │                          │
    │  - Add provider    │                          │
    │    badges          │                          │
    └────────┬───────────┘                          │
             │                                      │
             ▼                                      │
    ┌──────────────────────┐                        │
    │  Apply Markup Rules  │                        │
    │  - Per provider      │                        │
    │  - Per hotel tier    │                        │
    │  - Final price AED   │                        │
    └────────┬─────────────┘                        │
             │                                      │
             ▼                                      │
    ┌──────────────────────┐                        │
    │  Cache Results       │                        │
    │  (Redis, 1 hour)     │                        │
    └────────┬─────────────┘                        │
             │                                      │
             └──────────────────────────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ Return to Client │
           │ (Sorted by price)│
           └──────────────────┘
```

---

### قواعد الأولوية:

```typescript
const PROVIDER_PRIORITY = {
  'booking':  1,      // First choice (most reliable)
  'webbed':   2,      // Second (wholesale)
  'hotels_nl': 3,     // Third (fast)
  'serpapi':  4       // Last (backup only)
};

export function selectBestProvider(options: Provider[]): Provider {
  return options.sort((a, b) => 
    (PROVIDER_PRIORITY[a.name] || 999) - 
    (PROVIDER_PRIORITY[b.name] || 999)
  )[0];
}
```

---

## 🚀 خطة الانتقال (Migration Path)

### المرحلة 1: الآن (Prototyping)

```
│
├─ SerpAPI: 100% (Evaluation token)
├─ Booking: 0% (Sandbox testing)
├─ WebBeds: 0% (Awaiting approval)
└─ Hotels.nl: 0% (Ready but not enabled)
```

### المرحلة 2: أسبوع 2-3

```
│
├─ SerpAPI: 70% (Backup only)
├─ Booking: 25% (Limited live)
├─ WebBeds: 5% (Testing)
└─ Hotels.nl: 10% (Enabled)
```

### المرحلة 3: أسبوع 4 (Pre-Launch)

```
│
├─ SerpAPI: 0% (DISABLED)
├─ Booking: 50% (Primary)
├─ WebBeds: 35% (Wholesale)
└─ Hotels.nl: 15% (Fast backup)
```

### المرحلة 4: Production (Post-ATM)

```
│
├─ SerpAPI: 0% (Removed completely)
├─ Booking: 45%
├─ WebBeds: 40%
├─ Hotels.nl: 10%
└─ RateHawk/TBO: 5%
```

---

### Code للـ Dynamic Provider Selection:

```typescript
// /lib/providers/selector.ts
export function selectProviders(env: 'development' | 'staging' | 'production'): string[] {
  const config = {
    development: ['serpapi', 'booking', 'hotels_nl'],
    staging: ['booking', 'webbed', 'hotels_nl'],
    production: ['booking', 'webbed', 'hotels_nl', 'ratehawk']
  };
  
  return config[env];
}

// Usage in route handler
const activeProviders = selectProviders(process.env.NODE_ENV as any);
const responses = await Promise.allSettled([
  activeProviders.includes('serpapi') ? searchSerpAPI(params) : null,
  activeProviders.includes('booking') ? searchBooking(params) : null,
  activeProviders.includes('webbed') ? searchWebBeds(params) : null,
  activeProviders.includes('hotels_nl') ? searchHotelsNL(params) : null
].filter(Boolean));
```

---

## 🐛 حل المشاكل (Troubleshooting)

### مشكلة 1: الأسعار غير صحيحة

```
السبب محتمل:
- السعر يشمل ضرائب أو رسوم إضافية
- تحويل العملة غير صحيح
- محرك البحث يعرض سعر غرفة واحدة، لكنك تريد عدة غرف

الحل:
- افحص price.display vs price.net
- تحقق من العملة الأصلية
- أضف واضحة في التفاصيل

```typescript
const debugPrice = {
  rawPrice: hotel.price,
  currency: hotel.currency,
  perNight: hotel.price_per_night,
  total: hotel.price_total,
  taxesIncluded: hotel.price_includes_taxes
};
console.log('Debug:', debugPrice);
```

---

### مشكلة 2: نتائج فارغة

```
السبب محتمل:
- اسم المدينة غير صحيح أو غير معروف
- التواريخ في الماضي
- لا توجد فنادق متاحة في هذه الفترة

الحل:
- تحقق من اسم المدينة (جرب "Dubai" بدلاً من "دبي")
- أضف validation للتواريخ
- أظهر رسالة واضحة للمستخدم
```

---

### مشكلة 3: Response بطيء جداً

```
السبب محتمل:
- SerpAPI يمعالج Captcha
- الإنترنت بطيء
- طلب كثير من النتائج

الحل:
- أضف timeout: 15 ثانية
- اعتمد على cache أولاً
- قلل عدد النتائج المطلوبة
```

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

---

### مشكلة 4: Quota exceeded

```
الرسالة:
"Your account doesn't have enough credits"

الحل:
1. تحقق من الخطة الحالية
2. انتظر تجديد الـ quota (monthly)
3. اعتمد على providers آخرين

```typescript
if (error.message.includes('quota')) {
  // Fall back to Booking.com
  return searchBooking(params);
}
```

---

## 📊 Monitoring و Logging

```typescript
// /lib/monitoring/serpapi-monitor.ts
export async function monitorSerpAPI() {
  const metrics = {
    requests_total: 0,
    requests_success: 0,
    requests_failed: 0,
    avg_response_time: 0,
    quota_usage: 0,
    errors: []
  };
  
  // Log to monitoring service
  // Example: Sentry, DataDog, New Relic
}

// Metrics for dashboard
export function getSerpAPIMetrics() {
  return {
    status: 'operational',
    uptime: '99.5%',
    avg_speed: '2.3 seconds',
    quota_remaining: '180/250'
  };
}
```

---

## ✅ Checklist للتطبيق

```
Infrastructure:
□ SerpAPI account created
□ API key added to .env
□ Redis configured locally

Development:
□ Basic search endpoint working
□ Response transformation tested
□ Error handling implemented
□ Caching layer working

Testing:
□ Test with various locations
□ Test with past dates (should fail)
□ Test with children ages
□ Test price formatting

Monitoring:
□ Logging enabled
□ Error tracking setup
□ Performance monitoring

Migration:
□ Provider selector logic ready
□ Booking.com integration ready
□ Exit plan documented
```

---

## 📞 مراجع

- SerpAPI Docs: https://serpapi.com/docs
- Google Hotels Engine: https://serpapi.com/docs/engines/google_hotels
- API Status: https://status.serpapi.com/
- Support: support@serpapi.com

---

*مستند التطوير الكامل لـ SerpAPI في Weekend Go*
*الإصدار 1.0 - يونيو 2026*
