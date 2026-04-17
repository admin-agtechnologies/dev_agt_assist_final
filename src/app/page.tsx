// src/app/page.tsx
"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { PLANS_CONFIG, ROUTES, WELCOME_BONUS_XAF } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Check, MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe, Sun, Moon, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe];

export default function LandingPage() {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;
  const tp = d.plans;

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc },
    { title: t.feature2Title, desc: t.feature2Desc },
    { title: t.feature3Title, desc: t.feature3Desc },
    { title: t.feature4Title, desc: t.feature4Desc },
    { title: t.feature5Title, desc: t.feature5Desc },
    { title: t.feature6Title, desc: t.feature6Desc },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white font-black text-sm">A</div>
            <span className="font-black text-[var(--text)]">AGT Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors text-xs font-bold">
              {locale === "fr" ? "EN" : "FR"}
            </button>
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href={ROUTES.login}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
              {t.loginCta}
            </Link>
            <Link href={ROUTES.onboarding}
              className="btn-primary text-sm">
              {t.heroCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Badge bienvenue */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#075E54] text-sm font-semibold mb-8">
          <Zap className="w-4 h-4" />
          {t.welcomeBadge.replace("{amount}", formatCurrency(WELCOME_BONUS_XAF))}
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-[var(--text)] leading-tight mb-4">
          {t.heroTitle}<br />
          <span className="text-[#25D366]">{t.heroTitleAccent}</span>
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={ROUTES.onboarding} className="btn-primary text-base px-8 py-3">
            {t.heroCta}
          </Link>
          <Link href={ROUTES.login} className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            {t.loginCta} → {t.loginLink}
          </Link>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4">{t.heroCtaSub}</p>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.featuresTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={i} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Plans ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.plansTitle}</h2>
          <p className="text-[var(--text-muted)]">{t.plansSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS_CONFIG.map(plan => (
            <div key={plan.slug} className={cn(
              "card p-6 flex flex-col gap-4 transition-all",
              plan.highlight ? "ring-2 ring-[#25D366] relative" : "hover:shadow-md"
            )}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />{d.common.recommended}
                </div>
              )}
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{plan.name}</p>
                <p className="text-3xl font-black text-[var(--text)]">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-[var(--text-muted)]">{d.common.perMonth}</span>
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features_keys.map(key => {
                  const parts = key.split(".") as ["plans", "features", keyof typeof d.plans.features];
                  const label = d.plans.features[parts[2]];
                  return (
                    <li key={key} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                      <Check className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0 mt-0.5" />
                      {label}
                    </li>
                  );
                })}
              </ul>
              <Link href={ROUTES.onboarding}
                className={cn(
                  "w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  plan.highlight
                    ? "bg-[#075E54] text-white hover:bg-[#128C7E]"
                    : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                )}>
               {d.plans.choosePlan}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="card p-12 text-center bg-gradient-to-br from-[#075E54]/5 to-[#25D366]/5">
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">{t.ctaTitle}</h2>
          <Link href={ROUTES.onboarding} className="btn-primary text-base px-8 py-3 inline-flex">
            {t.ctaBtn}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--text-muted)]">
        <p className="font-bold text-[var(--text)] mb-1">AGT Platform</p>
        <p>© {new Date().getFullYear()} {t.footerRights}</p>
      </footer>
    </div>
  );
}
