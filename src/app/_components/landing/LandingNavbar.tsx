// src/app/_components/landing/LandingNavbar.tsx
"use client";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";

export function LandingNavbar() {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white font-black text-sm">A</div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[var(--text)] text-sm">AGT Platform</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium hidden sm:block">by AG Technologies</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
          <a href="#features"     className="hover:text-[var(--text)] transition-colors">{t.navFeatures}</a>
          <a href="#demo"         className="hover:text-[var(--text)] transition-colors">{t.navDemo}</a>
          <a href="#plans"        className="hover:text-[var(--text)] transition-colors">{t.navPlans}</a>
          <a href="#testimonials" className="hover:text-[var(--text)] transition-colors">{t.navTestimonials}</a>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors text-xs font-bold"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href={ROUTES.login} className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
            {t.loginCta}
          </Link>
          <Link href={ROUTES.onboarding} className="btn-primary text-sm px-3 sm:px-4 whitespace-nowrap">
            <span className="hidden sm:inline">{t.heroCta}</span>
            <span className="sm:hidden">Démarrer</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}