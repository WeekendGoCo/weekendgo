"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  MapPin, Star, Wifi, Coffee, 
  WavesLadder as Pool, Search as SearchIcon, 
  Loader2, Calendar,
  ArrowUpDown, SlidersHorizontal, ChevronRight,
  ShieldCheck, Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageContext";

function SearchResults() {
  const { t, isRtl } = useTranslation();
  const searchParams = useSearchParams();
  const queryDest = searchParams.get("dest") || "";
  const queryDestId = searchParams.get("destId") || "";
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/hotels/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          destination: queryDest,
          destId: queryDestId,
          guests: 2 
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setHotels(result.data);
      } else {
        setError("Unable to retrieve luxury stays at the moment.");
      }
    } catch (err) {
      setError("A connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryDest) {
      fetchHotels();
    }
  }, [queryDest]);

  return (
    <div className="flex-1 pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Search Context Header */}
        <div className={`mb-12 flex flex-col md:flex-row justify-between items-end gap-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl md:text-5xl h-font mb-4">
              {isRtl ? "نتائج البحث لـ " : "Search results for "}
              <span className="text-primary">"{queryDest}"</span>
            </h1>
            <p className="text-dark/50 dark:text-white/50 font-medium">
              {loading ? (isRtl ? "جاري البحث عن أفضل الأسعار..." : "Finding the best rates for you...") : 
                (isRtl ? `تم العثور على ${hotels.length} خيار متاح` : `Found ${hotels.length} available options`)}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 bg-white dark:bg-slate px-6 py-3 rounded-2xl border border-dark/5 dark:border-white/5 shadow-premium text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
                <ArrowUpDown size={16} />
                {isRtl ? "ترتيب حسب" : "Sort by"}
             </button>
             <button className="lg:hidden flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 text-xs font-bold uppercase tracking-widest">
                <SlidersHorizontal size={16} />
                {isRtl ? "تصفية" : "Filter"}
             </button>
          </div>
        </div>

        <div className={`flex flex-col lg:flex-row gap-12 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white dark:bg-slate rounded-[2.5rem] p-8 shadow-premium border border-dark/5 dark:border-white/5">
                <h3 className={`text-xs font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-dark/5 dark:border-white/5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <SlidersHorizontal size={16} className="text-primary" />
                  {isRtl ? "تصفية النتائج" : "Refine Search"}
                </h3>

                <div className="space-y-10">
                  {/* Price Range */}
                  <div>
                    <div className={`flex justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">{isRtl ? "نطاق السعر" : "Price Range"}</h4>
                      <span className="text-[10px] font-bold text-dark/40 dark:text-white/40">$2,000+</span>
                    </div>
                    <input type="range" className="w-full accent-primary h-1 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer" />
                  </div>

                  {/* Ratings */}
                  <div className="pt-8 border-t border-dark/5 dark:border-white/5">
                    <h4 className={`text-[10px] font-bold uppercase tracking-widest text-primary mb-6 ${isRtl ? 'text-right' : ''}`}>
                      {isRtl ? "تصنيف الفندق" : "Star Rating"}
                    </h4>
                    <div className="space-y-4">
                      {[5, 4, 3].map(star => (
                        <label key={star} className={`flex items-center gap-4 cursor-pointer group ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="w-5 h-5 rounded-lg border-2 border-dark/10 dark:border-white/10 group-hover:border-primary transition-all flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="flex items-center gap-1.5 text-sm font-bold text-dark/60 dark:text-white/60 group-hover:text-primary transition-colors">
                            {star} <Star size={14} className="fill-accent text-accent" />
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="pt-8 border-t border-dark/5 dark:border-white/5">
                    <h4 className={`text-[10px] font-bold uppercase tracking-widest text-primary mb-6 ${isRtl ? 'text-right' : ''}`}>
                      {isRtl ? "المرافق" : "Amenities"}
                    </h4>
                    <div className="space-y-4">
                      {(isRtl ? ['مسبح إنفينيتي', 'سبا فاخر', 'إطلالة بحرية', 'نقل مطار'] : ['Infinite Pool', 'Luxury Spa', 'Ocean View', 'Airport Transfer']).map(amenity => (
                        <label key={amenity} className={`flex items-center gap-4 cursor-pointer group ${isRtl ? 'flex-row-reverse' : ''}`}>
                           <div className="w-5 h-5 rounded-lg border-2 border-dark/10 dark:border-white/10 group-hover:border-primary transition-all" />
                          <span className="text-sm font-bold text-dark/60 dark:text-white/60 group-hover:text-primary transition-colors">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">{isRtl ? "عرض خاص" : "Special Offer"}</h4>
                  <p className="text-white/70 text-sm mb-6">{isRtl ? "وفر حتى ٣٠٪ على حجوزات الصيف" : "Save up to 30% on summer bookings"}</p>
                  <button className="bg-white text-primary px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                    {isRtl ? "اكتشف" : "Discover"}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-40"
                >
                  <div className="relative mb-12">
                    <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1.5} />
                    <div className="absolute inset-0 blur-2xl bg-primary/20" />
                  </div>
                  <p className="text-dark/40 dark:text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold animate-pulse">
                    {isRtl ? "جاري البحث في قاعدة البيانات العالمية..." : "Searching global inventory..."}
                  </p>
                </motion.div>
              ) : hotels.length > 0 ? (
                <div className="space-y-10">
                  {hotels.map((hotel, idx) => (
                    <HotelResultCard key={hotel.id || idx} hotel={hotel} index={idx} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-40 bg-white dark:bg-slate rounded-[3rem] border border-dark/5 dark:border-white/5 border-dashed"
                >
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <MapPin size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isRtl ? "عذراً، لا توجد نتائج" : "No results found"}</h3>
                  <p className="text-dark/40 dark:text-white/40 font-medium">{isRtl ? "حاول تغيير معايير البحث أو الوجهة" : "Try adjusting your filters or destination"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function HotelResultCard({ hotel, index }: { hotel: any, index: number }) {
  const { isRtl } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate rounded-[2.5rem] overflow-hidden shadow-premium border border-dark/5 dark:border-white/5 group"
    >
      <div className={`flex flex-col lg:flex-row ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
        {/* Image */}
        <div className="relative w-full lg:w-[400px] h-72 lg:h-auto overflow-hidden">
          <Image 
            src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"} 
            alt={hotel.name} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          {hotel.isExclusive && (
            <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} bg-accent text-dark text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2`}>
              <Zap size={12} fill="currentColor" />
              Weekend Go Exclusive
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`p-8 lg:p-10 flex-1 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
          <div>
            <div className={`flex flex-col md:flex-row justify-between items-start gap-4 mb-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">{hotel.name}</h3>
                <div className={`flex items-center gap-2 text-dark/40 dark:text-white/40 text-xs font-bold uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <MapPin size={14} className="text-primary" />
                  {hotel.location || "Luxury District"}
                </div>
              </div>
              <div className={`flex flex-col items-end ${isRtl ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl text-primary font-bold">
                  <span>{hotel.rating || "4.8"}</span>
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-dark/20 dark:text-white/20 mt-2">
                  {hotel.reviews || "120"} {isRtl ? "تقييم حقيقي" : "Real Reviews"}
                </p>
              </div>
            </div>

            <div className={`flex flex-wrap gap-3 mb-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <AmenityTag icon={<Pool size={14} />} text={isRtl ? "مسبح" : "Pool"} />
              <AmenityTag icon={<Wifi size={14} />} text={isRtl ? "واي فاي" : "Wifi"} />
              <AmenityTag icon={<Coffee size={14} />} text={isRtl ? "إفطار" : "Breakfast"} />
              <AmenityTag icon={<ShieldCheck size={14} />} text={isRtl ? "آمن" : "Secure"} />
            </div>
          </div>

          <div className={`pt-8 border-t border-dark/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-end gap-6 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{isRtl ? "السعر يبدأ من" : "Starting from"}</p>
              <p className="text-4xl font-bold text-dark dark:text-white tracking-tighter">
                ${hotel.price} <span className="text-sm font-normal text-dark/30 dark:text-white/30 uppercase tracking-widest">{isRtl ? "/ ليلة" : "/ night"}</span>
              </p>
            </div>
            <button className="bg-dark dark:bg-white text-white dark:text-dark px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-3 group/btn">
              {isRtl ? "احجز الآن" : "Book Now"}
              <ChevronRight size={18} className={`transition-transform group-hover/btn:translate-x-1 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AmenityTag({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-dark/40 dark:text-white/40 border border-dark/5 dark:border-white/5 transition-colors hover:border-primary/30">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} strokeWidth={1} />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
