// ============================================================
// FICHIER : src/app/_components/landing/StatsSection.tsx
// Bande de 4 stats clés (500+, 98%, <5min, 24/7).
// ============================================================
"use client";
import { Users, Award, Clock, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STATS = [
  { value: "500+",    labelFr: "Entreprises équipées",    labelEn: "Businesses equipped",     icon: Users },
  { value: "98%",     labelFr: "Satisfaction client",     labelEn: "Client satisfaction",     icon: Award },
  { value: "< 5 min", labelFr: "Temps de configuration", labelEn: "Setup time",              icon: Clock },
  { value: "24/7",    labelFr: "Disponibilité garantie", labelEn: "Guaranteed availability", icon: TrendingUp },
];

export function StatsSection() {
  const { locale } = useLanguage();

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="card p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center gap-2 py-8 px-6 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: "#25D36618" }}
                >
                  <Icon className="w-6 h-6 text-[#075E54]" />
                </div>
                <p className="text-3xl font-black text-[var(--text)]">{stat.value}</p>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                  {locale === "fr" ? stat.labelFr : stat.labelEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}