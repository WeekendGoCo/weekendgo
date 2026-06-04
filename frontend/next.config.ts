import type { NextConfig } from "next";

/**
 * ⚠️ ملاحظة معمارية مهمة:
 *
 * المشروع يعمل بنمطين:
 *   - output: 'export'  → يُصدر static HTML إلى ../public/app (الوضع الحالي)
 *   - output: 'standalone' → يُشغّل Next.js كـ server مستقل (للمستقبل)
 *
 * الوضع الحالي: static export
 *   - كل API calls تتم عبر Express (server.js)
 *   - الـ Route Handlers في /app/api/ لا تعمل في هذا الوضع
 *   - الـ Frontend يتصل بـ http://localhost:3000/api/* مباشرة
 *
 * للتحول لـ standalone server لاحقاً:
 *   1. احذف output: 'export'
 *   2. غيّر distDir لـ '.next'
 *   3. احذف assetPrefix و trailingSlash
 *   4. شغّل Next.js على port مختلف وعدّل server.js ليعمل كـ reverse proxy
 */
const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../public/app',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  assetPrefix: '/app',

  // في static export، env vars تُضمَّن في وقت البناء (build time)
  // القيم الديناميكية تأتي من window.fetch إلى Express
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  },
};

export default nextConfig;
