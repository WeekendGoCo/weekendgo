import { NextRequest, NextResponse } from 'next/server';
import { COMPANY_INFO, BRAND_COLORS } from '@/lib/constants/company';

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

export async function POST(req: NextRequest) {
  try {
    const tour: Tour = await req.json();

    // التحقق من البيانات المطلوبة
    if (!tour.countryAr || !tour.coverImage || tour.days.length === 0) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      );
    }

    // توليد HTML
    const html = generatePDFHTML(tour);

    // إرجاع HTML كـ blob
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="tour-${tour.id}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF Export Error:', error);
    return NextResponse.json(
      { error: 'فشل التصدير' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(tour: Tour): string {
  const currencySymbol = tour.currency === 'SAR' ? '﷼' : '$';
  const currencyName = tour.currency === 'SAR' ? 'الريال السعودي' : 'الدولار الأمريكي';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tour.countryAr}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: A4;
          margin: 0;
        }

        html, body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: ${BRAND_COLORS.darkBg};
          color: white;
        }

        .page {
          width: 100%;
          min-height: 297mm;
          padding: 20mm;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: ${BRAND_COLORS.darkBg};
        }

        .cover-page {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          text-align: center;
          min-height: 297mm;
          background-size: cover;
          background-position: center;
          background-image: url('${tour.coverImage}');
        }

        .cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(11, 19, 37, 0.95) 100%);
        }

        .cover-content {
          position: relative;
          z-index: 10;
          padding-bottom: 60px;
          text-align: center;
        }

        .company-name {
          font-size: 18px;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 30px;
          font-weight: bold;
        }

        .trip-title {
          font-size: 48px;
          font-weight: bold;
          color: ${BRAND_COLORS.gold};
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .trip-title-en {
          font-size: 40px;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 40px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .contact-info {
          font-size: 14px;
          color: white;
          margin-top: 40px;
          line-height: 1.8;
        }

        .days-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          page-break-inside: avoid;
        }

        .day-card {
          border: 2px solid ${BRAND_COLORS.primary};
          border-radius: 8px;
          overflow: hidden;
          background-color: rgba(0, 229, 255, 0.05);
          display: flex;
          flex-direction: column;
          page-break-inside: avoid;
        }

        .day-image {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          border-bottom: 2px solid ${BRAND_COLORS.primary};
        }

        .day-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .day-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }

        .day-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${BRAND_COLORS.primary};
          color: ${BRAND_COLORS.darkBg};
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }

        .day-titles {
          flex: 1;
        }

        .day-title {
          font-size: 14px;
          font-weight: bold;
          color: white;
        }

        .day-title-en {
          font-size: 11px;
          color: ${BRAND_COLORS.primary};
          margin-top: 2px;
        }

        .day-description {
          font-size: 11px;
          color: #aaaaaa;
          line-height: 1.5;
        }

        .footer-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 297mm;
          text-align: center;
          gap: 40px;
          padding: 40mm 20mm;
        }

        .price-section {
          margin: 40px 0;
        }

        .price-emoji {
          font-size: 32px;
          margin-bottom: 20px;
        }

        .price-title {
          font-size: 24px;
          font-weight: bold;
          color: ${BRAND_COLORS.gold};
          margin-bottom: 30px;
        }

        .price-badge {
          border: 3px solid ${BRAND_COLORS.gold};
          border-radius: 16px;
          padding: 40px;
          background: linear-gradient(135deg, rgba(166, 206, 57, 0.1) 0%, rgba(201, 168, 76, 0.1) 100%);
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .price-amount {
          font-size: 64px;
          font-weight: bold;
          color: ${BRAND_COLORS.gold};
          margin: 20px 0;
        }

        .price-label {
          font-size: 16px;
          color: white;
          margin-bottom: 10px;
        }

        .contact-section {
          background-color: rgba(0, 229, 255, 0.1);
          border: 2px solid ${BRAND_COLORS.primary};
          border-radius: 12px;
          padding: 30px;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .contact-title {
          font-size: 18px;
          font-weight: bold;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 20px;
        }

        .contact-item {
          margin: 12px 0;
          font-size: 14px;
          color: white;
          line-height: 1.6;
        }

        .contact-label {
          color: ${BRAND_COLORS.primary};
          font-weight: bold;
          margin-left: 10px;
        }

        .footer-company {
          font-size: 12px;
          color: #666666;
          margin-top: 30px;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: none;
          }
          .page {
            page-break-after: always;
            box-shadow: none;
            padding: 0;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- صفحة الغلاف -->
      <div class="page cover-page" style="background-image: url('${tour.coverImage}');">
        <div class="cover-overlay"></div>
        <div class="cover-content">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="trip-title">رحلة إلى</div>
          <div class="trip-title">${tour.countryAr}</div>
          <div class="trip-title-en">${tour.countryEn}</div>
          <div class="contact-info">
            📞 ${COMPANY_INFO.phone}<br/>
            💬 WhatsApp
          </div>
        </div>
      </div>

      <!-- صفحات الأيام -->
      ${generateDayPages(tour)}

      <!-- صفحة السعر والتواصل -->
      <div class="page footer-page">
        <div class="price-section">
          <div class="price-emoji">💎</div>
          <div class="price-title">السعر الإجمالي</div>
        </div>

        <div class="price-badge">
          <div class="price-label">🎒 رحلة شاملة</div>
          <div class="price-amount">${currencySymbol} ${tour.price.toLocaleString('ar-SA')}</div>
          <div class="price-label">لكل شخص</div>
        </div>

        <div class="contact-section">
          <div class="contact-title">📞 تواصل معنا الآن</div>
          <div class="contact-item">
            <span class="contact-label">💬 WhatsApp:</span>
            <span>${COMPANY_INFO.phone}</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">📧 البريد:</span>
            <span>${COMPANY_INFO.email}</span>
          </div>
          <div class="footer-company">
            🌐 ${COMPANY_INFO.name} - ${COMPANY_INFO.tagline}<br/>
            ${new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDayPages(tour: Tour): string {
  let pagesHTML = '';

  // تقسيم الأيام إلى صفحات (يومين في الصفحة)
  for (let i = 0; i < tour.days.length; i += 2) {
    const day1 = tour.days[i];
    const day2 = tour.days[i + 1];

    pagesHTML += `
      <div class="page">
        <div class="days-grid">
          ${generateDayCard(day1)}
          ${day2 ? generateDayCard(day2) : ''}
        </div>
      </div>
    `;
  }

  return pagesHTML;
}

function generateDayCard(day: TourDay): string {
  return `
    <div class="day-card">
      ${day.image ? `<img src="${day.image}" alt="${day.titleAr}" class="day-image" />` : ''}
      <div class="day-content">
        <div class="day-header">
          <div class="day-number">${day.dayNumber}</div>
          <div class="day-titles">
            <div class="day-title">${day.titleAr}</div>
            <div class="day-title-en">${day.titleEn}</div>
          </div>
        </div>
        <div class="day-description">${day.description}</div>
      </div>
    </div>
  `;
}
