"use client";

import { motion } from "framer-motion";
import { Star, ArrowLeft, ShieldCheck, Globe2, Clock, MapPin, Plane, Users, Award, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const destinations = [
  {
    nameAr: "مكة المكرمة",
    nameEn: "Makkah",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800",
    priceFrom: "499",
    rating: 4.9,
    nights: "2-7",
    tag: "🕌 الحرم",
  },
  {
    nameAr: "المدينة المنورة",
    nameEn: "Madinah",
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&q=80&w=800",
    priceFrom: "399",
    rating: 4.9,
    nights: "2-5",
    tag: "🌟 النبوي",
  },
  {
    nameAr: "دبي",
    nameEn: "Dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    priceFrom: "699",
    rating: 4.8,
    nights: "3-10",
    tag: "🏙️ فاخر",
  },
  {
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=800",
    priceFrom: "549",
    rating: 4.7,
    nights: "4-8",
    tag: "🕌 تاريخي",
  },
  {
    nameAr: "المالديف",
    nameEn: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800",
    priceFrom: "1200",
    rating: 4.9,
    nights: "5-14",
    tag: "🏝️ حصري",
  },
  {
    nameAr: "أوروبا",
    nameEn: "Europe",
    image: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&q=80&w=800",
    priceFrom: "899",
    rating: 4.7,
    nights: "7-14",
    tag: "✈️ جولة",
  },
];

const features = [
  {
    icon: ShieldCheck,
    titleAr: "أمان تام",
    titleEn: "100% Secure",
    descAr: "نضمن لك أعلى مستويات الأمان في جميع معاملاتك المالية",
    descEn: "Highest security standards for all your financial transactions",
    color: "var(--primary)",
    glow: "rgba(0,229,255,0.15)",
  },
  {
    icon: Globe2,
    titleAr: "+150 دولة",
    titleEn: "150+ Countries",
    descAr: "شبكة واسعة تضم آلاف الفنادق الفاخرة في أنحاء العالم",
    descEn: "Vast network of thousands of luxury hotels worldwide",
    color: "var(--accent)",
    glow: "rgba(166,206,57,0.15)",
  },
  {
    icon: Clock,
    titleAr: "دعم 24/7",
    titleEn: "24/7 Support",
    descAr: "فريق متخصص جاهز لمساعدتك على مدار الساعة",
    descEn: "Dedicated team ready to assist you around the clock",
    color: "#C9A84C",
    glow: "rgba(201,168,76,0.15)",
  },
  {
    icon: Award,
    titleAr: "أفضل سعر",
    titleEn: "Best Price",
    descAr: "نضمن لك الحصول على أفضل الأسعار وإلا نرد الفرق",
    descEn: "We guarantee the best prices or we refund the difference",
    color: "#FF6B6B",
    glow: "rgba(255,107,107,0.15)",
  },
];

const stats = [
  { num: "+50,000", labelAr: "فندق حول العالم", labelEn: "Hotels Worldwide", icon: "🏨" },
  { num: "+150", labelAr: "دولة تغطيها شبكتنا", labelEn: "Countries Covered", icon: "🌍" },
  { num: "4.9★", labelAr: "تقييم العملاء", labelEn: "Customer Rating", icon: "⭐" },
  { num: "+10K", labelAr: "عميل سعيد", labelEn: "Happy Customers", icon: "😊" },
];

const packages = [
  {
    titleAr: "باقة مكة المكرمة الذهبية",
    titleEn: "Makkah Golden Package",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200",
    nights: "5",
    price: "2,800",
    tag: "الأكثر طلباً",
    includes: ["فندق 5 نجوم", "إفطار + عشاء", "نقل مطار", "جولة سياحية"],
  },
  {
    titleAr: "باقة المدينتين المقدستين",
    titleEn: "Two Holy Cities Package",
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&q=80&w=1200",
    nights: "8",
    price: "4,500",
    tag: "حصري",
    includes: ["فنادق 5 نجوم", "وجبات كاملة", "نقل داخلي", "مرشد سياحي"],
  },
];

export default function Home() {
  const { isRtl, t } = useTranslation();

  return (
    <div className="min-h-screen">

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{
            background: "linear-gradient(180deg, rgba(11,19,37,0.8) 0%, rgba(11,19,37,0.3) 50%, rgba(11,19,37,0.95) 100%)"
          }} />
          <Image
            src="/hero.png"
            alt="مكة المكرمة والمدينة المنورة"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Neon accent lines */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-0 right-0 h-px opacity-20"
            style={{ background: "linear-gradient(90deg, transparent, var(--primary), transparent)" }} />
          <div className="absolute bottom-1/3 left-0 right-0 h-px opacity-10"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-6 text-center pt-24 pb-12 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 border"
              style={{
                background: "rgba(0,229,255,0.08)",
                borderColor: "rgba(0,229,255,0.2)",
                color: "var(--primary)",
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              {t.home.heroBadge}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-white leading-tight mb-6"
          >
            {t.home.heroTitle1}
            <br />
            <span className="lux-gradient">{t.home.heroTitle2}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-white/60 mb-12 font-medium"
          >
            {t.home.heroSub}
          </motion.p>

          {/* Search Box */}
          <SearchBox />

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-10 flex-wrap"
          >
            {[
              { icon: "🔒", text: t.home.trustSecure },
              { icon: "💰", text: t.home.trustPrice },
              { icon: "🎧", text: t.home.trustSupport },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-white/50">
                <span>{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== DESTINATIONS ===== */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: "var(--primary)" }}>
              DESTINATIONS
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.home.trendingTitle}</h2>
            <p className="text-white/50 max-w-md font-medium">{t.home.trendingSub}</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group transition-colors"
            style={{ color: "var(--primary)" }}>
            {t.home.viewAll}
            <ArrowLeft className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group rounded-3xl overflow-hidden cursor-pointer shadow-premium relative"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={isRtl ? dest.nameAr : dest.nameEn}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(11,19,37,0.95) 0%, rgba(11,19,37,0.2) 60%, transparent 100%)" }} />

                {/* Tag */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                  style={{ background: "rgba(11,19,37,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
                  {dest.tag}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {isRtl ? dest.nameAr : dest.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-white/50">
                      <Star className="w-3.5 h-3.5 fill-current" style={{ color: "var(--gold)" }} />
                      <span>{dest.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{dest.nights} ليالي</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">يبدأ من</p>
                    <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>${dest.priceFrom}</p>
                  </div>
                </div>

                {/* Hover Button */}
                <div className="mt-3 overflow-hidden h-0 group-hover:h-10 transition-all duration-300">
                  <button
                    onClick={() => window.location.href = `/search/?dest=${encodeURIComponent(isRtl ? dest.nameAr : dest.nameEn)}`}
                    className="w-full py-2 rounded-xl text-sm font-black text-[#0B1325] transition-all"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                  >
                    احجز الآن
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--navy-mid) 0%, var(--dark) 100%)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.2), transparent)" }} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: "var(--primary)" }}>
              WHY US
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.home.featuresTitle}</h2>
            <div className="w-16 h-1 mx-auto rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group p-8 rounded-3xl transition-all duration-300 hover:scale-105"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 40px ${feature.glow}`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-300"
                  style={{ background: `${feature.glow.replace('0.15', '0.1')}` }}>
                  <feature.icon className="w-9 h-9" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{isRtl ? feature.titleAr : feature.titleEn}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{isRtl ? feature.descAr : feature.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(166,206,57,0.15), transparent)" }} />
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black mb-1"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {stat.num}
                </div>
                <div className="text-white/40 text-sm font-medium">{isRtl ? stat.labelAr : stat.labelEn}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PACKAGES ===== */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: "var(--accent)" }}>PACKAGES</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.home.packagesTitle}</h2>
          <p className="text-white/50 max-w-2xl mx-auto">{t.home.packagesSub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-premium"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="relative h-96 overflow-hidden">
                <Image src={pkg.image} alt={isRtl ? pkg.titleAr : pkg.titleEn} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,19,37,0.95) 0%, rgba(11,19,37,0.3) 60%, transparent 100%)" }} />
              </div>
              <div className={`absolute inset-0 p-10 flex flex-col justify-center ${isRtl ? 'text-right' : 'text-left'}`}>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black mb-4 w-fit"
                  style={{ background: "rgba(166,206,57,0.2)", color: "var(--accent)", border: "1px solid rgba(166,206,57,0.3)" }}>
                  {pkg.tag}
                </span>
                <h3 className="text-3xl font-black text-white mb-4">{isRtl ? pkg.titleAr : pkg.titleEn}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {pkg.includes.map((inc, j) => (
                    <span key={j} className="px-2 py-1 rounded-lg text-xs text-white/60"
                      style={{ background: "rgba(255,255,255,0.08)" }}>✓ {inc}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs">لكل شخص</p>
                    <p className="text-3xl font-black" style={{ color: "var(--accent)" }}>${pkg.price}</p>
                  </div>
                  <button className="px-8 py-3 rounded-2xl font-black text-sm text-[#0B1325] transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                    احجز الآن
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 mb-10">
        <div className="max-w-4xl mx-auto text-center p-16 rounded-[3rem] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(11,31,99,0.6) 0%, rgba(0,229,255,0.05) 100%)",
            border: "1px solid rgba(0,229,255,0.15)"
          }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--primary)" }} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--accent)" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t.home.ctaTitle}</h2>
            <p className="text-white/50 text-lg mb-10">{t.home.ctaSub}</p>
            <a
              href="/#search"
              className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-lg text-[#0B1325] transition-all hover:scale-105 shadow-2xl"
              style={{ background: "linear-gradient(135deg, var(--accent), #7ab22e)" }}
            >
              <Plane className="w-5 h-5 rotate-45" />
              {t.home.ctaBtn}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
