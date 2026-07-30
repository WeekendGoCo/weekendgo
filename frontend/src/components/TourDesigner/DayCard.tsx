'use client';

import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { BRAND_COLORS } from '@/lib/constants/company';

interface DayCardProps {
  dayNumber: number;
  titleAr: string;
  titleEn: string;
  description: string;
  image: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onImageChange: (file: File) => void;
  onTitleArChange: (value: string) => void;
  onTitleEnChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function DayCard({
  dayNumber,
  titleAr,
  titleEn,
  description,
  image,
  isExpanded,
  onToggle,
  onDelete,
  onImageChange,
  onTitleArChange,
  onTitleEnChange,
  onDescriptionChange,
}: DayCardProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="border-2 rounded-lg overflow-hidden transition" style={{ borderColor: BRAND_COLORS.primary, backgroundColor: `${BRAND_COLORS.darkBg}40` }}>
      {/* رأس البطاقة */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition"
        onClick={onToggle}
        style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            {dayNumber}
          </div>
          <div>
            <p className="font-semibold text-white">{titleAr || 'اليوم الجديد'}</p>
            <p className="text-xs text-gray-400">{titleEn || 'New Day'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-500/20 rounded transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
          )}
        </div>
      </div>

      {/* محتوى البطاقة (يظهر عند التوسيع) */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t-2" style={{ borderColor: BRAND_COLORS.primary, borderOpacity: 0.2 }}>
          {/* الصورة */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">
              📸 صورة اليوم
            </label>
            {image ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 mb-3" style={{ borderColor: BRAND_COLORS.accent }}>
                <Image
                  src={image}
                  alt={`اليوم ${dayNumber}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center mb-3"
                style={{ borderColor: BRAND_COLORS.accent, backgroundColor: `${BRAND_COLORS.accent}10` }}
              >
                <p className="text-gray-400 text-sm">اضغط لرفع صورة</p>
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition" style={{ borderColor: BRAND_COLORS.accent, backgroundColor: `${BRAND_COLORS.accent}10` }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-sm" style={{ color: BRAND_COLORS.accent }}>
                اختر صورة جديدة
              </span>
            </label>
          </div>

          {/* العنوان بالعربية */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              عنوان اليوم (عربي)
            </label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => onTitleArChange(e.target.value)}
              placeholder="مثل: استكشاف جاكرتا"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
              style={{ borderColor: BRAND_COLORS.primary, '--tw-border-opacity': '0.3' } as any}
            />
          </div>

          {/* العنوان بالإنجليزية */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Day Title (English)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => onTitleEnChange(e.target.value)}
              placeholder="e.g: Exploring Jakarta"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition"
              style={{ borderColor: BRAND_COLORS.primary, '--tw-border-opacity': '0.3' } as any}
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              الوصف (العربية والإنجليزية)
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="صف أنشطة ومعالم اليوم..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 focus:outline-none transition resize-none"
              style={{ borderColor: BRAND_COLORS.primary, '--tw-border-opacity': '0.3' } as any}
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.length} / 500 أحرف
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
