// ============================================================
// FICHIER : src/app/_components/sector/public/PublicLandingContent.tsx
// Orchestrateur landing sectorielle public.
// Couleurs : primary #2D3561, accent #DC2626, bgFooter #1a1f3c
// ============================================================
"use client";
import Link from "next/link";
import { Building2, TrendingUp, Clock, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";
import { getLogoAssets } from "@/lib/logo-config";
import { LandingNavbar }        from "../../landing/LandingNavbar";
import { LandingFooter }        from "../../landing/LandingFooter";
import { TestimonialsCarousel } from "../../landing/TestimonialsCarousel";
import { PublicHero }           from "./PublicHero";
import { PublicFeatures }       from "./PublicFeatures";

const PRIMARY   = "#2D3561";
const ACCENT    = "#DC2626";
const BG_FOOTER = "#1a1f3c";
const logo      = getLogoAssets("public");

const STATS = [
  { value: "+60%", labelKey: "stat1Label" as const, icon: TrendingUp },
  { value: "24/7", labelKey: "stat2Label" as const, icon: Clock },
  { value: "−70%", labelKey: "stat3Label" as const, icon: Users },
  { value: "5 min",labelKey: "stat4Label" as const, icon: Building2 },
];

export default function PublicLandingContent() {
  const { dictionary: d } = useLanguage();
  const { theme } = useTheme();
  const t = d.public_;
  const navLogo = theme === "dark" ? logo.darkSvg : logo.lightSvg;

  const statsCardBg: React.CSSProperties = { backgroundColor: `${PRIMARY}12` };
  const testimonialTagStyle: React.CSSProperties = { backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` };
  const ctaGradient: React.CSSProperties = { background: `linear-gradient(135deg, ${PRIMARY}18 0%, ${ACCENT}28 100%)`, borderRadius: "1.5rem" };
  const ctaOverlay: React.CSSProperties = { backgroundImage: `radial-gradient(circle at 20% 50%, ${PRIMARY} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${ACCENT} 0%, transparent 50%)` };
  const ctaBtnStyle: React.CSSProperties = { backgroundColor: ACCENT, color: "#fff", boxShadow: `0 8px 24px ${ACCENT}40` };
  const statIconStyle: React.CSSProperties = { color: ACCENT };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <LandingNavbar primaryColor={PRIMARY} logoSvg={navLogo} backHref="/" />
      <PublicHero />

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const { icon: Icon } = stat;
            return (
              <div key={stat.labelKey} className="card p-6 text-center flex flex-col items-center gap-3" style={statsCardBg}>
                <Icon size={24} style={statIconStyle} />
                <p className="text-3xl font-black text-[var(--text)]">{stat.value}</p>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">{t[stat.labelKey]}</p>
              </div>
            );
          })}
        </div>
      </section>

      <PublicFeatures />

      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest" style={testimonialTagStyle}>{t.testimonialsTitle}</div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">{t.testimonialsTitle}</h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">{t.testimonialsSubtitle}</p>
        </div>
        <TestimonialsCarousel accentColor={ACCENT} />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="card p-12 text-center relative overflow-hidden border-0" style={ctaGradient}>
          <div className="absolute inset-0 opacity-15" style={ctaOverlay} />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-4">{t.ctaTitle}</h2>
            <p className="text-white/60 text-sm mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link href={`${ROUTES.onboarding}?sector=public`} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-base transition-all hover:scale-105 shadow-lg" style={ctaBtnStyle}>{t.ctaBtn}</Link>
              <Link href={ROUTES.login} className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-2">{t.ctaLogin}</Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter primaryColor={PRIMARY} accentColor={ACCENT} logoDark={logo.darkSvg} bgColor={BG_FOOTER} />
    </div>
  );
}