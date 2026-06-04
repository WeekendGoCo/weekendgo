"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  navbar: {
    hotels: string;
    flights: string;
    resorts: string;
    packages: string;
    signIn: string;
    myAccount: string;
  };
  search: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    searchPlaceholder: string;
    datesPlaceholder: string;
    guestsLabel: string;
    searchButton: string;
  };
  home: {
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSub: string;
    trustSecure: string;
    trustPrice: string;
    trustSupport: string;
    trendingTitle: string;
    trendingSub: string;
    viewAll: string;
    featuresTitle: string;
    featuresSub: string;
    packagesTitle: string;
    packagesSub: string;
    statsTitle: string;
    ctaTitle: string;
    ctaSub: string;
    ctaBtn: string;
  };
}

const translations: Record<Language, Translations> = {
  ar: {
    navbar: {
      hotels: "فنادق",
      flights: "رحلات",
      resorts: "منتجعات",
      packages: "باقات",
      signIn: "تسجيل الدخول",
      myAccount: "حسابي",
    },
    search: {
      destination: "الوجهة",
      checkIn: "الوصول",
      checkOut: "المغادرة",
      guests: "الضيوف",
      searchPlaceholder: "مكة المكرمة، دبي، المدينة المنورة...",
      datesPlaceholder: "اختر التواريخ",
      guestsLabel: "2 بالغ",
      searchButton: "بحث",
    },
    home: {
      heroBadge: "وجهاتنا تغطي أكثر من 150 دولة حول العالم",
      heroTitle1: "وجهتك القادمة",
      heroTitle2: "تبدأ من هنا",
      heroSub: "سافر. اكتشف. اعش التجربة.",
      trustSecure: "حجز آمن 100%",
      trustPrice: "ضمان أفضل سعر",
      trustSupport: "دعم 24/7",
      trendingTitle: "وجهات رائجة",
      trendingSub: "اكتشف أجمل الوجهات السياحية المختارة بعناية",
      viewAll: "عرض الكل",
      featuresTitle: "لماذا ويكند جو؟",
      featuresSub: "نقدم لكم تجربة سفر لا مثيل لها",
      packagesTitle: "باقات حصرية",
      packagesSub: "برامج سياحية مصممة لأرقى المسافرين",
      statsTitle: "أرقام تتحدث عن نفسها",
      ctaTitle: "ابدأ رحلتك الآن",
      ctaSub: "انضم إلى آلاف المسافرين الذين وثقوا بنا",
      ctaBtn: "احجز رحلتك",
    },
  },
  en: {
    navbar: {
      hotels: "Hotels",
      flights: "Flights",
      resorts: "Resorts",
      packages: "Packages",
      signIn: "Sign In",
      myAccount: "My Account",
    },
    search: {
      destination: "Destination",
      checkIn: "Check In",
      checkOut: "Check Out",
      guests: "Guests",
      searchPlaceholder: "Makkah, Dubai, Madinah...",
      datesPlaceholder: "Select dates",
      guestsLabel: "2 Adults",
      searchButton: "Search",
    },
    home: {
      heroBadge: "Our destinations cover 150+ countries worldwide",
      heroTitle1: "Your Next Journey",
      heroTitle2: "Starts Here",
      heroSub: "Travel. Discover. Experience.",
      trustSecure: "100% Secure Booking",
      trustPrice: "Best Price Guarantee",
      trustSupport: "24/7 Support",
      trendingTitle: "Trending Destinations",
      trendingSub: "Discover our hand-picked selection of top destinations",
      viewAll: "View All",
      featuresTitle: "Why Weekend Go?",
      featuresSub: "We deliver an unmatched travel experience",
      packagesTitle: "Exclusive Packages",
      packagesSub: "Tour packages designed for elite travelers",
      statsTitle: "Numbers Speak For Themselves",
      ctaTitle: "Start Your Journey Now",
      ctaSub: "Join thousands of travelers who trust us",
      ctaBtn: "Book Your Trip",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const isRtl = language === 'ar';

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
