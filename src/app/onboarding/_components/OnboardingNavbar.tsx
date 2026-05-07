"use client";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";

export function OnboardingNavbar() {
  const { locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#075E54] flex items-center justify-center text-white font-black text-xs">
            A
          </div>
          <span className="font-black text-sm text-[var(--text)]">AGT Platform</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}