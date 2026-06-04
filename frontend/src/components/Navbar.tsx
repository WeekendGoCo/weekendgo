"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, User, Sun, Moon, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { useState, useEffect } from "react";

export function Navbar() {
  const { language, setLanguage, isRtl, t } = useTranslation();
  const { scrollY } = useScroll();
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);

  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(11,19,37,0)", "rgba(11,19,37,0.95)"]
  );
  const navBorderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  useEffect(() => {
    // Check auth
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.loggedIn) setUser(data.user);
      })
      .catch(() => {});
    
    // Theme
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const navLinks = [
    { label: t.navbar.hotels, href: "/#hotels" },
    { label: t.navbar.flights, href: "/#flights" },
    { label: t.navbar.resorts, href: "/#resorts" },
    { label: t.navbar.packages, href: "/#packages" },
  ];

  return (
    <>
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed w-full z-50 px-6 backdrop-blur-xl transition-all duration-300"
      >
        <motion.div
          style={{ opacity: navBorderOpacity }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <div className="max-w-7xl mx-auto flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
              <Image src="/logo/logo.png" alt="ويكند جو" fill className="object-contain drop-shadow-lg" />
            </div>
            <div>
              <div className="text-white font-black text-xl leading-none tracking-tight">
                ويكند <span style={{ color: "var(--accent)" }}>جو</span>
              </div>
              <div className="text-white/40 text-[9px] tracking-[0.25em] uppercase">للسفر والسياحة</div>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors duration-200 hover:text-primary"
                style={{ '--tw-text-opacity': '1' } as React.CSSProperties}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/10"
              aria-label="تبديل الوضع"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              <Globe size={13} />
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Auth Button */}
            {user ? (
              <Link
                href="/profile/"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-white/10 hover:bg-primary/20 text-white transition-all border border-white/10 hover:border-primary/30"
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={22} height={22} className="rounded-full" />
                ) : (
                  <User size={14} />
                )}
                {t.navbar.myAccount}
              </Link>
            ) : (
              <a
                href="/auth/google"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-lg"
                style={{ background: "var(--accent)", color: "#0B1325" }}
              >
                <User size={14} />
                {t.navbar.signIn}
              </a>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 glass border-b border-white/10 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-white text-base font-bold tracking-wide py-2 border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
