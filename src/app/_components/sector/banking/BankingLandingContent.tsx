// ============================================================
// FICHIER : src/app/_components/sector/banking/BankingLandingContent.tsx
// Orchestrateur landing sectorielle banking.
// Pattern identique à RestaurantLandingContent.tsx
// Couleurs : primary #1B4332, accent #1B7B47
// ============================================================
"use client";
import Link from "next/link";
import { Users, TrendingUp, Clock, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";
import { getLogoAssets } from "@/lib/logo-config";
import { LandingNavbar }        from "../../landing/LandingNavbar";
import { LandingFooter }        from "../../landing/LandingFooter";
import { TestimonialsCarousel } from "../../landing/TestimonialsCarousel";
import { BankingHero }          from "./BankingHero";
import { BankingFeatures }      from "./BankingFeatures";

const PRIMARY = "#1B4332";
const ACCENT  = "#1B7B47";
const logo    = getLogoAssets("banking");

const STATS = [
  { value: "3x",    labelKey: "stat1Label" as const, icon: TrendingUp },
  { value: "24/7",  labelKey: "stat2Label" as const, icon: Clock },
  { value: "0",     labelKey: "stat3Label" as const, icon: Award },
  { value: "5 min", labelKey: "stat4Label" as const, icon: Users },
];

export default function BankingLandingContent() {
  const { dictionary: d } = useLanguage();
  const t = d.banking;

  const statsCardBg: React.CSSProperties = { backgroundColor: `${PRIMARY}18` };

  const testimonialTagStyle: React.CSSProperties = {
    backgroundColor: `${ACCENT}20`,
    color: PRIMARY,
    border: `1px solid ${ACCENT}40`,
  };

  const ctaGradient: React.CSSProperties = {
    background: `linear-gradient(135deg, #071A0E 0%, ${PRIMARY} 60%, #0D3320 100%)`,
  };

  const ctaOverlay: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle at 20% 50%, ${ACCENT} 0%, transparent 50%), radial-gradient(circle at 80% 50%, #0A5C30 0%, transparent 50%)`,
  };

  const ctaBtnStyle: React.CSSProperties = {
    backgroundColor: ACCENT,
    color: "#fff",
    boxShadow: `0 8px 24px ${ACCENT}40`,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Navbar — SVG transparent banking */}
      <LandingNavbar
        primaryColor={PRIMARY}
        logoSvg={logo.darkSvg}
        backHref="/"
      />

      {/* Hero banking */}
      <BankingHero />

      {/* Stats — même pattern exact que restaurant */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="card p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-2 py-8 px-6 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                    style={statsCardBg}
                  >
                    <Icon className="w-6 h-6" style={{ color: PRIMARY }} />
                  </div>
                  <p className="text-3xl font-black text-[var(--text)]">{stat.value}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                    {t[stat.labelKey]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features actives banking */}
      <BankingFeatures />

      {/* Témoignages — même pattern exact que restaurant */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
            style={testimonialTagStyle}
          >
            {t.testimonialsTitle}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">
            {t.testimonialsTitle}
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            {t.testimonialsSubtitle}
          </p>
        </div>
        <TestimonialsCarousel accentColor={PRIMARY} />
      </section>

      {/* CTA finale — même pattern exact que restaurant */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div
          className="card p-12 text-center relative overflow-hidden border-0"
          style={ctaGradient}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={ctaOverlay}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-4">{t.ctaTitle}</h2>
            <p className="text-white/60 text-sm mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href={ROUTES.onboarding}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-base transition-all hover:scale-105 shadow-lg"
                style={ctaBtnStyle}
              >
                {t.ctaBtn}
              </Link>
              <Link
                href={ROUTES.login}
                className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-2"
              >
                {t.ctaLogin}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — fond sombre banking */}
      <LandingFooter
        primaryColor={PRIMARY}
        accentColor={ACCENT}
        logoDark={logo.dark}
        bgColor="#071A0E"
      />
    </div>
  );
}