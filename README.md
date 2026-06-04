# ويكند جو — تشغيل المشروع

## المتطلبات
- Node.js 18+ (تحميل من https://nodejs.org)

## التشغيل (3 خطوات فقط)

```bash
# 1. فك الضغط عن المجلد ثم افتح Terminal داخله
cd weekendgo

# 2. تثبيت المكتبات (مرة واحدة فقط)
npm install

# 3. تشغيل السيرفر
npm start
```

ثم افتح المتصفح على: **http://localhost:3000**

---

## لماذا Node.js؟

المشكلة الأصلية كانت **CORS** — المتصفح يرفض طلبات fetch() إلى serpapi.com لأسباب أمنية.

الحل: السيرفر (server.js) يستقبل الطلبات من المتصفح على `/api/serpapi`
ويُعيد إرسالها إلى SerpAPI من جهة الـ server — لا قيود CORS هناك.

```
المتصفح → localhost:3000/api/serpapi → serpapi.com → localhost → المتصفح
```

## الملفات

```
weekendgo/
├── server.js        ← Express server + SerpAPI proxy
├── package.json     ← المكتبات
└── public/
    └── index.html   ← الموقع الكامل
```
