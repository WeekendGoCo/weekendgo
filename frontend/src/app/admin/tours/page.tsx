'use client';

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BRAND_COLORS, COMPANY_INFO } from '@/lib/constants/company';
import toast from 'react-hot-toast';

interface Tour {
  id: string;
  countryAr: string;
  countryEn: string;
  coverImage: string | null;
  price: number;
  currency: string;
  days: any[];
  createdAt: string;
}

export default function ToursListPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الرحلات من localStorage
  useEffect(() => {
    const savedTours = JSON.parse(localStorage.getItem('weekendgo_tours') || '[]');
    setTours(savedTours);
    setIsLoading(false);
  }, []);

  const deleteTour = (tourId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
      const updatedTours = tours.filter((t) => t.id !== tourId);
      localStorage.setItem('weekendgo_tours', JSON.stringify(updatedTours));
      setTours(updatedTours);
      toast.success('تم حذف الرحلة بنجاح');
    }
  };

  const exportTour = async (tour: Tour) => {
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
        a.download = `${tour.countryAr}-${tour.id}.html`;
        a.click();
        toast.success('تم تصدير الملف بنجاح');
      }
    } catch (error) {
      toast.error('فشل التصدير');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.darkBg }}>
      {/* الرأس */}
      <div className="border-b-2" style={{ borderColor: BRAND_COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <button className="p-2 hover:bg-gray-700 rounded transition">
                  <ArrowLeft className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
                </button>
              </Link>
              <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                🎒 الرحلات السياحية
              </h1>
            </div>
            <Link href="/admin/tours/designer">
              <button className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-white transition hover:opacity-90" style={{ backgroundColor: BRAND_COLORS.accent }}>
                <Plus className="w-5 h-5" />
                رحلة جديدة
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <p className="text-gray-400 text-center">جاري التحميل...</p>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">لا توجد رحلات بعد</p>
            <Link href="/admin/tours/designer">
              <button className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: BRAND_COLORS.accent }}>
                إنشاء رحلة جديدة
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="p-6 rounded-lg border-2 flex items-center justify-between"
                style={{ borderColor: BRAND_COLORS.primary, backgroundColor: `${BRAND_COLORS.darkBg}40` }}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{tour.countryAr}</h3>
                  <p className="text-sm text-gray-400">{tour.countryEn}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-400">
                    <span>📅 {tour.days.length} أيام</span>
                    <span>💰 {tour.currency} {tour.price.toLocaleString('ar-SA')}</span>
                    <span>📅 {new Date(tour.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => exportTour(tour)}
                    className="p-2 hover:bg-blue-500/20 rounded transition"
                    title="تصدير PDF"
                  >
                    <Eye className="w-5 h-5 text-blue-400" />
                  </button>
                  <Link href={`/admin/tours/designer?id=${tour.id}`}>
                    <button className="p-2 hover:bg-yellow-500/20 rounded transition" title="تعديل">
                      <Pencil className="w-5 h-5 text-yellow-400" />
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteTour(tour.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
