'use client';

import { useState, useEffect } from 'react';
import { Save, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoverSection } from '@/components/TourDesigner/CoverSection';
import { DayBuilder } from '@/components/TourDesigner/DayBuilder';
import { PriceSection } from '@/components/TourDesigner/PriceSection';
import { BRAND_COLORS, COMPANY_INFO } from '@/lib/constants/company';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface TourDay {
  id: string;
  dayNumber: number;
  titleAr: string;
  titleEn: string;
  description: string;
  image: string | null;
}

interface Tour {
  id: string;
  countryAr: string;
  countryEn: string;
  coverImage: string | null;
  price: number;
  currency: string;
  days: TourDay[];
  createdAt: string;
}

export default function TourDesignerPage() {
  const router = useRouter();
  const [tour, setTour] = useState<Tour>({
    id: uuidv4(),
    countryAr: '',
    countryEn: '',
    coverImage: null,
    price: 0,
    currency: 'SAR',
    days: [],
    createdAt: new Date().toISOString(),
  });

  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // حفظ في localStorage
  const saveTour = async () => {
    setIsSaving(true);
    try {
      const tours = JSON.parse(localStorage.getItem('weekendgo_tours') || '[]');
      const existingIndex = tours.findIndex((t: Tour) => t.id === tour.id);
      
      if (existingIndex >= 0) {
        tours[existingIndex] = tour;
      } else {
        tours.push(tour);
      }
      
      localStorage.setItem('weekendgo_tours', JSON.stringify(tours));
      toast.success('تم حفظ الرحلة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // تصدير PDF
  const exportToPDF = async () => {
    if (!tour.countryAr || !tour.coverImage || tour.days.length === 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/tours/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tour),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tour.countryAr}-${tour.id}.pdf`;
        a.click();
        toast.success('تم تصدير الملف بنجاح');
      } else {
        toast.error('فشل التصدير');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  // إضافة يوم جديد
  const addDay = () => {
    const newDay: TourDay = {
      id: uuidv4(),
      dayNumber: tour.days.length + 1,
      titleAr: '',
      titleEn: '',
      description: '',
      image: null,
    };
    setTour({ ...tour, days: [...tour.days, newDay] });
    setExpandedDayId(newDay.id);
  };

  // حذف يوم
  const deleteDay = (dayId: string) => {
    const updatedDays = tour.days
      .filter((d) => d.id !== dayId)
      .map((d, index) => ({ ...d, dayNumber: index + 1 }));
    setTour({ ...tour, days: updatedDays });
  };

  // تحديث يوم
  const updateDay = (dayId: string, updates: Partial<TourDay>) => {
    setTour({
      ...tour,
      days: tour.days.map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.darkBg }}>
      {/* الرأس */}
      <div className="border-b-2" style={{ borderColor: BRAND_COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-700 rounded transition"
              >
                <ArrowLeft className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
              </button>
              <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                🎒 محرر الرحلات السياحية
              </h1>
            </div>
            <p className="text-sm text-gray-400">{COMPANY_INFO.name}</p>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* قسم الغلاف */}
          <CoverSection
            countryAr={tour.countryAr}
            countryEn={tour.countryEn}
            coverImage={tour.coverImage}
            onCountryArChange={(value) => setTour({ ...tour, countryAr: value })}
            onCountryEnChange={(value) => setTour({ ...tour, countryEn: value })}
            onCoverImageChange={(file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setTour({ ...tour, coverImage: reader.result as string });
              };
              reader.readAsDataURL(file);
            }}
          />

          {/* قسم الأيام */}
          <DayBuilder
            days={tour.days}
            expandedDayId={expandedDayId}
            onAddDay={addDay}
            onDeleteDay={deleteDay}
            onToggleDay={setExpandedDayId}
            onUpdateDay={updateDay}
          />

          {/* قسم السعر */}
          <PriceSection
            price={tour.price}
            currency={tour.currency}
            onPriceChange={(value) => setTour({ ...tour, price: value })}
            onCurrencyChange={(value) => setTour({ ...tour, currency: value })}
          />

          {/* أزرار الإجراءات */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={saveTour}
              disabled={isSaving}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:opacity-80 text-white"
              style={{ backgroundColor: BRAND_COLORS.accent }}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ الرحلة'}
            </button>

            <button
              onClick={exportToPDF}
              disabled={isExporting || !tour.countryAr || tour.days.length === 0}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:opacity-80 text-white"
              style={{ backgroundColor: BRAND_COLORS.gold }}
            >
              <Download className="w-5 h-5" />
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </button>
          </div>

          {/* رسالة تحقق */}
          <div className="p-4 rounded-lg bg-gray-800/50">
            <p className="text-sm text-gray-400">
              ✓ البيانات المطلوبة: اسم البلد + صورة الغلاف + {tour.days.length > 0 ? `✓ (${tour.days.length} أيام)` : '✗ (لا توجد أيام بعد)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
