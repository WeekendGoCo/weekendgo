"use client";

import { Plane, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer style={{ background: "linear-gradient(180deg, var(--navy-mid) 0%, var(--dark) 100%)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image src="/logo/logo.png" alt="ويكند جو" fill className="object-contain" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  ويكند <span style={{ color: "var(--accent)" }}>جو</span>
                </span>
                <p className="text-white/30 text-[9px] tracking-widest uppercase">للسفر والسياحة</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              منصتك الموثوقة لحجوزات الفنادق والرحلات السياحية في مكة المكرمة والمدينة المنورة وأكثر من 150 دولة حول العالم.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {["فنادق مكة", "فنادق المدينة", "باقات سياحية", "رحلات طيران", "عروض حصرية"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/40 text-sm hover:text-white transition-colors font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">الدعم</h4>
            <ul className="space-y-3">
              {["سياسة الخصوصية", "الشروط والأحكام", "الأسئلة الشائعة", "تواصل معنا", "مركز المساعدة"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/40 text-sm hover:text-white transition-colors font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              {[
                { Icon: Phone, text: "+966 XX XXX XXXX" },
                { Icon: Mail, text: "info@weekendgo.com" },
                { Icon: MapPin, text: "المملكة العربية السعودية" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/40">
                  <Icon size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-white/40 text-xs mb-3">اشترك للحصول على العروض</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs text-white bg-white/5 border border-white/10 focus:outline-none focus:border-primary/40 placeholder-white/20"
                />
                <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B1325]"
                  style={{ background: "var(--accent)" }}>
                  <Plane size={14} className="rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
            © 2026 ويكند جو. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            <span>خوادمنا تعمل بكفاءة 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
