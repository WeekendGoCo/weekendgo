// ويكند جو - بيانات الشركة الأساسية

export const COMPANY_INFO = {
  name: 'ويكند جو',
  nameEn: 'WeekendGo',
  tagline: 'للسفر والسياحة',
  taglineEn: 'Travel & Tourism',
  phone: '+966 55 330 4883',
  email: 'info@weekendgo.com.sa',
  whatsapp: 'https://wa.me/966553304883',
  logoUrl: '/logos/weekendgo.png',
};

export const BRAND_COLORS = {
  darkBg: '#0B1325',
  primary: '#00E5FF', // فيروزي
  accent: '#A6CE39', // أخضر نيوني
  gold: '#C9A84C', // ذهبي
  white: '#FFFFFF',
  darkNavy: '#0B1F63',
  error: '#FF4757',
};

export const TOUR_CONFIG = {
  MAX_DAYS: 30,
  MIN_DAYS: 1,
  COVER_IMAGE_WIDTH: 1200,
  COVER_IMAGE_HEIGHT: 675,
  DAY_IMAGE_WIDTH: 800,
  DAY_IMAGE_HEIGHT: 600,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

export const CURRENCIES = [
  { code: 'SAR', symbol: '﷼', name: 'الريال السعودي' },
  { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
  { code: 'AED', symbol: 'د.إ', name: 'الدرهم الإماراتي' },
  { code: 'EGP', symbol: '£', name: 'الجنيه المصري' },
];
