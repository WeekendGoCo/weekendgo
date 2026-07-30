'use client';

import { Plus } from 'lucide-react';
import { DayCard } from './DayCard';
import { BRAND_COLORS, TOUR_CONFIG } from '@/lib/constants/company';

interface TourDay {
  id: string;
  dayNumber: number;
  titleAr: string;
  titleEn: string;
  description: string;
  image: string | null;
}

interface DayBuilderProps {
  days: TourDay[];
  expandedDayId: string | null;
  onAddDay: () => void;
  onDeleteDay: (id: string) => void;
  onToggleDay: (id: string) => void;
  onUpdateDay: (id: string, updates: Partial<TourDay>) => void;
  maxDays?: number;
}

export function DayBuilder({
  days,
  expandedDayId,
  onAddDay,
  onDeleteDay,
  onToggleDay,
  onUpdateDay,
  maxDays = TOUR_CONFIG.MAX_DAYS,
}: DayBuilderProps) {
  const canAddMore = days.length < maxDays;

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div>
        <h3 className="text-lg font-bold mb-2" style={{ color: BRAND_COLORS.primary }}>
          📅 إضافة أيام الرحلة
        </h3>
        <p className="text-sm text-gray-400">
          {days.length} / {maxDays} أيام
        </p>
      </div>

      {/* قائمة الأيام */}
      <div className="space-y-3">
        {days.length === 0 ? (
          <div
            className="p-8 rounded-lg border-2 border-dashed text-center"
            style={{ borderColor: BRAND_COLORS.primary, backgroundColor: `${BRAND_COLORS.primary}10` }}
          >
            <p className="text-gray-400">لم تضف أي أيام بعد. انقر على الزر أدناه لإضافة اليوم الأول</p>
          </div>
        ) : (
          days.map((day) => (
            <DayCard
              key={day.id}
              dayNumber={day.dayNumber}
              titleAr={day.titleAr}
              titleEn={day.titleEn}
              description={day.description}
              image={day.image}
              isExpanded={expandedDayId === day.id}
              onToggle={() => onToggleDay(day.id)}
              onDelete={() => onDeleteDay(day.id)}
              onImageChange={(file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  onUpdateDay(day.id, { image: reader.result as string });
                };
                reader.readAsDataURL(file);
              }}
              onTitleArChange={(value) => onUpdateDay(day.id, { titleAr: value })}
              onTitleEnChange={(value) => onUpdateDay(day.id, { titleEn: value })}
              onDescriptionChange={(value) => onUpdateDay(day.id, { description: value })}
            />
          ))
        )}
      </div>

      {/* زر إضافة يوم جديد */}
      {canAddMore && (
        <button
          onClick={onAddDay}
          className="w-full py-3 rounded-lg border-2 border-dashed font-semibold flex items-center justify-center gap-2 transition hover:opacity-80"
          style={{
            borderColor: BRAND_COLORS.accent,
            backgroundColor: `${BRAND_COLORS.accent}10`,
            color: BRAND_COLORS.accent,
          }}
        >
          <Plus className="w-5 h-5" />
          إضافة يوم جديد ({days.length + 1}/{maxDays})
        </button>
      )}

      {!canAddMore && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.error}15` }}>
          <p className="text-sm text-red-400">
            ✓ لقد وصلت إلى الحد الأقصى من الأيام ({maxDays})
          </p>
        </div>
      )}
    </div>
  );
}
