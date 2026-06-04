"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, Loader2, Plane, Package, Umbrella } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'hotels' | 'flights' | 'packages' | 'resorts';

interface Suggestion {
  name: string;
  type: string;
  country: string;
}

export function SearchBox() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('hotels');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); } finally { setIsLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    if (!query) return;
    const params = new URLSearchParams({ dest: query, type: activeTab, guests: String(guests) });
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    window.location.href = `/search/?${params}`;
  };

  const tabs = [
    { id: 'hotels' as TabType, label: '🏨 فنادق', icon: null },
    { id: 'flights' as TabType, label: '✈ رحلات', icon: Plane },
    { id: 'packages' as TabType, label: '📦 باقات', icon: Package },
    { id: 'resorts' as TabType, label: '🏖️ منتجعات', icon: Umbrella },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-5xl mx-auto z-30 relative"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-[#0B1325] shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="glass rounded-[2rem] p-3 shadow-premium flex flex-col lg:flex-row gap-2">
        {/* Destination */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] hover:bg-white/5 transition-colors cursor-text">
            <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">
                {t.search.destination}
              </p>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder={t.search.searchPlaceholder}
                className="bg-transparent border-none outline-none w-full text-white placeholder-white/30 font-bold text-sm"
              />
            </div>
            {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute top-full right-0 left-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-2xl"
                style={{ border: '1px solid rgba(0,229,255,0.15)' }}
              >
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(item.name); setShowSuggestions(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-right"
                  >
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(0,229,255,0.1)' }}>
                      <MapPin size={15} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.type} · {item.country}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-white/10 my-3" />

        {/* Check In */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-[1.5rem] hover:bg-white/5 transition-colors cursor-pointer">
          <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">{t.search.checkIn}</p>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm font-bold cursor-pointer w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/10 my-3" />

        {/* Check Out */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-[1.5rem] hover:bg-white/5 transition-colors cursor-pointer">
          <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">{t.search.checkOut}</p>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm font-bold cursor-pointer w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/10 my-3" />

        {/* Guests */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] hover:bg-white/5 transition-colors">
          <Users className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">{t.search.guests}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20">-</button>
              <span className="text-white font-bold text-sm min-w-[20px] text-center">{guests}</span>
              <button onClick={() => setGuests(g => Math.min(10, g + 1))} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20">+</button>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-8 py-4 rounded-[1.5rem] font-black text-[#0B1325] uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 group"
          style={{ background: 'linear-gradient(135deg, var(--accent), #7ab22e)' }}
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {t.search.searchButton}
        </button>
      </div>
    </motion.div>
  );
}
