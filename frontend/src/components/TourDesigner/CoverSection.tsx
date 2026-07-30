'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2 } from 'lucide-react';
import { BRAND_COLORS, TOUR_CONFIG } from '@/lib/constants/company';

interface CoverSectionProps {
  countryAr: string;
  countryEn: string;
  coverImage: string | null;
  onCountryArChange: (value: string) => void;
  onCountryEnChange: (value: string) => void;
  onCoverImageChange: (file: File) => void;
}

export function CoverSection({
  countryAr,
  countryEn,
  coverImage,
  onCountryArChange,
  onCountryEnChange,
  onCoverImageChange,
}: CoverSectionProps) {
  const [preview, setPreview] = useState<string | null>(coverImage || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الملف
    if (file.size > TOUR_CONFIG.MAX_FILE_SIZE) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5MB');
      return;
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('يجب تحديد ملف صورة');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onCoverImageChange(file);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkBg}20` }}>
      {/* معاينة الغلاف */}
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.primary }}>
          معاينة الغلاف
        </h3>
        {preview ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2" style={{ borderColor: BRAND_COLORS.primary }}>
            <Image
              src={preview}
              alt="غلاف الرحلة"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 flex items-end justify-center pb-8">
              <div className="text-center">
                <p className="text-white text-2xl font-bold">رحلة إلى</p>
                <p className="text-white text-3xl font-bold" style={{ color: BRAND_COLORS.gold }}>
                  {countryAr || 'اسم البلد'}
                </p>
                <p className="text-gray-200 text-sm mt-2">{countryEn || 'Country Name'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: BRAND_COLORS.primary, backgroundColor: `${BRAND_COLORS.primary}10` }}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2" style={{ color: BRAND_COLORS.primary }} />
              <p className="text-gray-400">اضغط لرفع صورة الغلاف</p>
            </div>
          </div>
        )}
      </div>

      {/* تحرير المعلومات */}
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>
          تحرير المعلومات
        </h3>

        {/* رفع الصورة */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            📸 صورة الغلاف
          </label>
          <label className="flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition" style={{ borderColor: BRAND_COLORS.accent, backgroundColor: `${BRAND_COLORS.accent}10` }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isLoading}
              className="hidden"
            />
            <div className="text-center">
              {isLoading ? (
                <p className="text-gray-400">جاري التحميل...</p>
              ) : (
                <>
                  <Upload className="w-5 h-5 mx-auto mb-1" style={{ color: BRAND_COLORS.accent }} />
                  <p className="text-sm" style={{ color: BRAND_COLORS.accent }}>
                    انقر لاختيار صورة (1200 × 675)
                  </p>
                </>
              )}
            </div>
          </label>
        </div>

        {/* اسم البلد بالعربية */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            اسم البلد (عربي)
          </label>
          <input
            type="text"
            value={countryAr}
            onChange={(e) => onCountryArChange(e.target.value)}
            placeholder="مثل: إندونيسيا"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
            style={{ borderColor: BRAND_COLORS.primary, '--tw-border-opacity': '0.5' } as any}
          />
        </div>

        {/* اسم البلد بالإنجليزية */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Country Name (English)
          </label>
          <input
            type="text"
            value={countryEn}
            onChange={(e) => onCountryEnChange(e.target.value)}
            placeholder="e.g: Indonesia"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
            style={{ borderColor: BRAND_COLORS.primary, '--tw-border-opacity': '0.5' } as any}
          />
        </div>

        {/* معلومات الأبعاد */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.accent}15` }}>
          <p className="text-xs text-gray-400">
            ℹ️ الأبعاد المثالية: 1200 × 675 بكسل
          </p>
        </div>
      </div>
    </div>
  );
}
