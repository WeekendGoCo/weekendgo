# 🎯 خطة العمل الفورية (Immediate Action Plan)
## مشروع Weekend Go - الأسبوع الأول من يونيو 2026

---

## 📍 الوضع الراهن

```
التقرير التقني:      ✅ موجود (تقرير تنفيذي جيد)
توثيق SerpAPI:       ❌ ناقص تماماً
Booking Flow:         ❌ مفقود تماماً
Admin Dashboard:      ⚠️ UI فقط، بدون logic
Caching Strategy:     🟡 مبهم في التفاصيل
Reviews System:       ❌ مفقود
Error Handling:       🟡 ناقص
```

---

## 📋 Task List للأسبوع الأول

### Day 1 (الاثنين)

#### الصباح:
```
Task 1.1: SerpAPI Documentation Completion
├─ مدة: 2 ساعات
├─ المخرج:
│  ├─ API request/response examples (4 examples)
│  ├─ Integration with other providers
│  ├─ Migration timeline
│  └─ Error handling strategy
└─ Owner: AI/Developer

Task 1.2: Create SerpAPI Node.js Service
├─ ملف: /lib/providers/serpapi.ts
├─ الوظائف:
│  ├─ export async function searchSerpAPI()
│  ├─ export function transformSerpAPIResponse()
│  ├─ export async function validateSerpAPIParams()
│  └─ export function calculateSerpAPIPrice()
├─ مدة: 2 ساعات
└─ Owner: Developer
```

#### الظهيرة:
```
Task 1.3: Setup SerpAPI in .env.local
├─ الخطوات:
│  ├─ تسجيل حساب SerpAPI
│  ├─ احصل على API key
│  ├─ أضفه لـ .env.local
│  └─ اختبر الاتصال
├─ مدة: 30 دقيقة
└─ Owner: Developer

Task 1.4: Test SerpAPI Integration
├─ الاختبارات:
│  ├─ Dubai search (basic)
│  ├─ Search with dates
│  ├─ Search with children
│  ├─ Invalid location
│  └─ No results scenario
├─ مدة: 1 ساعة
└─ Owner: Developer
```

---

### Day 2 (الثلاثاء)

#### الصباح:
```
Task 2.1: Create PostgreSQL Schema
├─ الملف: /migrations/001_initial_schema.sql
├─ الجداول:
│  ├─ cities (city_id, name_ar, name_en, coords)
│  ├─ hotels (hotel_id, name_ar, name_en, giata_id)
│  ├─ hotel_images (image_id, hotel_id, url, source)
│  ├─ price_cache (cache_id, hotel_id, provider, price, ttl)
│  ├─ users (user_id, email, google_id)
│  ├─ user_searches (search_id, user_id, query, timestamp)
│  └─ favorites (favorite_id, user_id, hotel_id)
├─ مدة: 3 ساعات
└─ Owner: Developer

Task 2.2: Write Database Migration Script
├─ الملف: /scripts/migrate-to-postgres.ts
├─ الوظائف:
│  ├─ Backup SQLite data
│  ├─ Create PG database
│  ├─ Import data
│  └─ Verify integrity
├─ مدة: 2 ساعة
└─ Owner: DevOps/Developer
```

#### الظهيرة:
```
Task 2.3: Create Booking Flow Specification
├─ الملف: /docs/BOOKING_FLOW.md
├─ المحتوى:
│  ├─ Step 1 UI mockup (room selection)
│  ├─ Step 2 UI mockup (guest data)
│  ├─ Step 3 UI mockup (payment form)
│  ├─ Confirmation page mockup
│  ├─ Database schema for bookings
│  └─ API endpoints definition
├─ مدة: 2.5 ساعة
└─ Owner: Product/Developer
```

---

### Day 3 (الأربعاء)

#### الصباح:
```
Task 3.1: Implement Hotel Detail Page
├─ الملف: /app/hotels/[id]/page.tsx
├─ الميزات:
│  ├─ Hotel images gallery (Cloudinary)
│  ├─ Hotel info (name, address, phone)
│  ├─ Star rating و guest reviews
│  ├─ Room types available
│  ├─ Price for selected dates
│  ├─ Provider badges (showing which sites)
│  ├─ Amenities list
│  └─ "Book Now" button
├─ مدة: 4 ساعات
└─ Owner: Frontend Developer
```

#### الظهيرة:
```
Task 3.2: Create Caching Strategy Document
├─ الملف: /docs/CACHING_STRATEGY.md
├─ المحتوى:
│  ├─ Data types و TTLs:
│  │  ├─ Hotel metadata: 7 days
│  │  ├─ Images: 30 days
│  │  ├─ Prices: 30 minutes
│  │  ├─ City mappings: 30 days
│  │  └─ User favorites: real-time
│  ├─ Redis configuration
│  ├─ Invalidation strategies
│  ├─ Fallback logic
│  └─ Monitoring metrics
├─ مدة: 1.5 ساعة
└─ Owner: Architect/Developer
```

---

### Day 4 (الخميس)

#### الصباح:
```
Task 4.1: Error Handling Framework
├─ الملف: /lib/error-handler.ts
├─ الأنواع:
│  ├─ Provider unavailable (503)
│  ├─ No results found (404)
│  ├─ Invalid input (400)
│  ├─ Rate limit exceeded (429)
│  ├─ Timeout (408)
│  └─ Server error (500)
├─ المخرجات:
│  ├─ User-friendly messages (AR/EN)
│  ├─ Fallback strategies
│  ├─ Logging/monitoring
│  └─ Status codes
├─ مدة: 2.5 ساعة
└─ Owner: Developer
```

#### الظهيرة:
```
Task 4.2: Reviews System Foundation
├─ الملف: /lib/reviews/reviews-service.ts
├─ الوظائف:
│  ├─ Fetch reviews from external sources
│  ├─ Store reviews in DB
│  ├─ Display reviews (with avatars)
│  ├─ Filter by rating
│  ├─ Sort by date/helpful
│  ├─ Admin reply functionality (stub)
│  └─ Prevent fake reviews
├─ مدة: 2 ساعة
└─ Owner: Developer
```

---

### Day 5 (الجمعة)

#### الصباح:
```
Task 5.1: WhatsApp Generator Foundation
├─ الملف: /lib/social/whatsapp-generator.ts
├─ الوظائف:
│  ├─ Generate image from hotel data
│  ├─ Add price overlay
│  ├─ RTL text handling
│  ├─ Upload to Cloudinary
│  ├─ Return shareable link
│  └─ Track shares
├─ مدة: 2.5 ساعة
└─ Owner: Developer

Task 5.2: Admin Dashboard - Roles & Permissions
├─ الملف: /lib/admin/roles.ts
├─ الأدوار:
│  ├─ Super Admin (كل شيء)
│  ├─ Content Manager (hotels + images)
│  ├─ Finance Manager (contracts + pricing)
│  ├─ Support (users + bookings, view only)
│  └─ Analytics (reports only)
├─ مدة: 1.5 ساعة
└─ Owner: Developer
```

#### الظهيرة:
```
Task 5.3: Integration Testing
├─ الاختبارات:
│  ├─ E2E: Search → Detail → Booking flow
│  ├─ Multi-provider aggregation
│  ├─ Cache hit/miss scenarios
│  ├─ Error handling paths
│  ├─ RTL/LTR handling
│  └─ Performance benchmarks
├─ مدة: 2 ساعة
└─ Owner: QA/Developer

Task 5.4: Documentation Wrap-up
├─ الملفات:
│  ├─ README updates
│  ├─ API documentation
│  ├─ Development guide
│  └─ Deployment checklist
├─ مدة: 1 ساعة
└─ Owner: Tech Writer/Developer
```

---

## 📊 المخرجات المتوقعة بنهاية الأسبوع

### ملفات التوثيق الجديدة:
```
✅ /docs/SerpAPI_INTEGRATION.md
✅ /docs/BOOKING_FLOW.md
✅ /docs/CACHING_STRATEGY.md
✅ /docs/ERROR_HANDLING.md
✅ /docs/REVIEWS_SYSTEM.md
✅ /docs/WHATSAPP_GENERATOR.md
✅ /docs/ADMIN_DASHBOARD_SPEC.md
```

### ملفات الكود الجديدة:
```
✅ /lib/providers/serpapi.ts
✅ /lib/cache/redis-manager.ts
✅ /lib/error-handler.ts
✅ /lib/reviews/reviews-service.ts
✅ /lib/social/whatsapp-generator.ts
✅ /lib/admin/roles-permissions.ts
✅ /app/hotels/[id]/page.tsx
✅ /migrations/001_initial_schema.sql
✅ /scripts/migrate-to-postgres.ts
```

### اختبارات:
```
✅ SerpAPI integration tests
✅ Multi-provider aggregation tests
✅ Caching layer tests
✅ Error handling tests
✅ E2E booking flow tests
```

### قاعدة البيانات:
```
✅ PostgreSQL schema created
✅ Migration script ready
✅ Sample data loaded
✅ Indexes created for performance
```

---

## 🚨 المخاطر والحلول

### مخاطر الأسبوع:

| الخطر | الاحتمالية | الحل |
|------|-----------|------|
| SerpAPI quota ينتهي سريعاً | عالية | Cache aggressively, limit requests |
| PG migration يفشل | متوسطة | Test on staging first, backup SQLite |
| Performance regression | متوسطة | Load testing, query optimization |
| Scope creep (إضافة ميزات) | عالية | Strict task list, no distractions |

---

## ⏰ Timeline الكامل

```
Monday  (Day 1): SerpAPI + .env setup ✅
Tuesday (Day 2): PostgreSQL + Booking spec ✅
Wednesday (Day 3): Hotel Detail page + Caching 🔄
Thursday (Day 4): Error handling + Reviews 🔄
Friday (Day 5): WhatsApp + Admin + Testing ✅
```

**الموعد الأخير:** الجمعة الساعة 6 PM (EOD)

---

## ✅ Definition of Done

```
For each task:
□ Code written و committed
□ Tests passing (unit + integration)
□ Documentation complete
□ Code review approved
□ No console errors
□ No TypeScript errors
□ Accessibility tested (AR/EN)
□ Performance benchmarked
```

---

## 📞 Contact & Escalation

```
Technical Blocker?  → Mention @developer in Slack
Missing credentials? → Contact provider support
Time overrun?       → Escalate to @manager
```

---

## 📈 Success Metrics

بنهاية الأسبوع:
- ✅ SerpAPI fully documented + working
- ✅ PostgreSQL migration completed
- ✅ Booking flow spec finalized
- ✅ Hotel detail page live
- ✅ Error handling robust
- ✅ 80%+ test coverage
- ✅ RTL/LTR verified

**Overall Status: On Track for ATM Sept 14-17** 🎯

---

*خطة العمل - يونيو 2026*
*آخر تحديث: اليوم*
