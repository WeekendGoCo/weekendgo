"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { User, Calendar, Heart, Settings, LogOut, Plane } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser(data.user);
        } else {
          window.location.href = "/auth/google";
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const tabs = [
    { id: "bookings", label: "حجوزاتي", icon: Calendar },
    { id: "favorites", label: "المفضلة", icon: Heart },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  const avatarSrc = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=00E5FF&color=0B1325&bold=true&size=200`;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6"
          style={{ border: "1px solid rgba(0,229,255,0.15)" }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4" style={{ ringColor: "var(--primary)" }}>
              <Image src={avatarSrc} alt={user?.name || "User"} width={96} height={96} className="object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-navy flex items-center justify-center"
              style={{ background: "var(--accent)" }}>
              <span className="text-xs text-[#0B1325]">✓</span>
            </div>
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-2xl font-black text-white mb-1">{user?.name}</h1>
            <p className="text-white/50 mb-4">{user?.email}</p>
            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              {[{ label: "الحجوزات", val: "0" }, { label: "النقاط", val: "0" }, { label: "التقييمات", val: "0" }].map(item => (
                <div key={item.label} className="text-center px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="font-black text-lg text-white">{item.val}</div>
                  <div className="text-xs text-white/40">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="glass rounded-3xl p-4 h-fit" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 text-right transition-all font-bold text-sm"
                style={activeTab === tab.id
                  ? { background: "rgba(0,229,255,0.1)", color: "var(--primary)", border: "1px solid rgba(0,229,255,0.2)" }
                  : { color: "rgba(255,255,255,0.5)" }}
              >
                <tab.icon size={17} />
                {tab.label}
              </button>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <form action="/auth/logout" method="POST">
                <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut size={17} />
                  تسجيل الخروج
                </button>
              </form>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 glass rounded-3xl p-8" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {activeTab === "bookings" && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(0,229,255,0.08)" }}>
                  <Plane className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">لا توجد حجوزات بعد</h3>
                <p className="text-white/40 mb-8">ابدأ بتخطيط رحلتك القادمة الآن</p>
                <a href="/" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm text-[#0B1325]"
                  style={{ background: "linear-gradient(135deg, var(--accent), #7ab22e)" }}>
                  تصفح العروض
                </a>
              </div>
            )}
            {activeTab === "favorites" && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(166,206,57,0.08)" }}>
                  <Heart className="w-8 h-8" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">لا توجد عناصر مفضلة</h3>
                <p className="text-white/40">أضف فنادق ووجهات إلى مفضلتك للرجوع إليها لاحقاً</p>
              </div>
            )}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-xl font-black text-white mb-6">إعدادات الحساب</h2>
                <div className="space-y-4">
                  {[{ label: "الاسم الكامل", value: user?.name }, { label: "البريد الإلكتروني", value: user?.email }].map(field => (
                    <div key={field.label}>
                      <label className="text-xs text-white/40 font-black uppercase tracking-widest block mb-2">{field.label}</label>
                      <div className="px-4 py-3 rounded-xl text-white/70 text-sm"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                  <p className="text-white/30 text-xs mt-4">تسجيل الدخول عبر Google — لا يمكن تغيير البيانات يدوياً</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
