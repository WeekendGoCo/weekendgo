'use client';

import { BRAND_COLORS, CURRENCIES } from '@/lib/constants/company';

interface PriceSectionProps {
  price: number;
  currency: string;
  onPriceChange: (value: number) => void;
  onCurrencyChange: (value: string) => void;
}

export function PriceSection({
  price,
  currency,
  onPriceChange,
  onCurrencyChange,
}: PriceSectionProps) {
  const currencyData = CURRENCIES.find((c) => c.code === currency);

  // تحويل تقريبي للدولار (يمكن تحديثه بسعر صرف حقيقي)
  const usdPrice = currency === 'SAR' ? Math.round(price / 3.75) : price;

  return (
    <div className="p-6 rounded-lg border-2" style={{ borderColor: BRAND_COLORS.gold, backgroundColor: `${BRAND_COLORS.gold}10` }}>
      <h3 className="text-lg font-bold mb-6 text-center" style={{ color: BRAND_COLORS.primary }}>
        💎 السعر الإجمالي 💎
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* إدخال السعر */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            السعر الكلي
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
            style={{ borderColor: BRAND_COLORS.gold }}
          />
        </div>

        {/* اختيار العملة */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            العملة
          </label>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
            style={{ borderColor: BRAND_COLORS.gold }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* معاينة السعر */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">معاينة السعر كما سيظهر للعميل:</p>
          <div className="space-y-2">
            <div>
              <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.gold }}>
                {currencyData?.symbol} {price.toLocaleString('ar-SA')}
              </p>
              <p className="text-sm text-gray-400 mt-1">الريال السعودي</p>
            </div>
            {currency !== 'USD' && (
              <div className="text-sm">
                <p className="text-gray-400">أو</p>
                <p className="text-2xl font-bold text-primary mt-2" style={{ color: BRAND_COLORS.primary }}>
                  ${usdPrice.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-400 mt-1">الدولار الأمريكي</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-4 p-3 rounded-lg bg-gray-800/50">
        <p className="text-xs text-gray-400">
          ℹ️ السعر هو السعر الإجمالي للرحلة بالكامل. سيظهر هذا السعر بشكل بارز في صفحة الغلاف والملف النهائي.
        </p>
      </div>
    </div>
  );
}
