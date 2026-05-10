// ============================================================
// FICHIER : src/app/_components/landing/LandingFooter.tsx
// Footer partagé hub + landings sectorielles.
// Props : primaryColor, accentColor, logoDark, bgColor
// 10 secteurs affichés dans Solutions.
// ============================================================
"use client";
import Link from "next/link";
import { Sun, Moon, MapPin, Mail, ArrowRight, HelpCircle, BookOpen, Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";
import { getLogoAssets } from "@/lib/logo-config";
import { SECTORS, getSectorUrl } from "./LandingData";

const DEFAULT_PRIMARY = "#25D366";
const DEFAULT_ACCENT  = "#6C3CE1";
const DEFAULT_BG      = "#022c22";
const centralLogo = getLogoAssets("central");

interface LandingFooterProps {
  primaryColor?: string;
  accentColor?:  string;
  logoDark?:     string;
  bgColor?:      string;
}

export function LandingFooter({
  primaryColor = DEFAULT_PRIMARY,
  accentColor  = DEFAULT_ACCENT,
  logoDark     = centralLogo.dark,
  bgColor      = DEFAULT_BG,
}: LandingFooterProps) {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;

  const resourceLinks = [
    { label: t.footerHelp,     href: ROUTES.help,     icon: HelpCircle },
    { label: t.footerTutorial, href: ROUTES.tutorial,  icon: BookOpen },
    { label: t.footerLogin,    href: ROUTES.login,     icon: Bot },
  ];

  return (
    <footer className="text-white" style={{ backgroundColor: bgColor }}>
      {/* Barre top gradient dynamique */}
      <div
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, #075E54 50%, ${accentColor} 100%)` }}
      />

      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDark} alt="AGT-BOT" className="h-10 w-auto object-contain" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {t.footerTagline}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm text-white/50">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span>Montée Anne rouge, Immeuble Kadji,<br />Yaoundé, Cameroun</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/50">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                <a
                  href="mailto:secretariatagtechnologies@gmail.com"
                  className="transition-colors hover:opacity-80"
                >
                  secretariatagtechnologies@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Produit */}
          <div className="md:col-span-2 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">{t.footerProduct}</p>
            <ul className="space-y-3">
              {[
                { label: t.footerFeatures, href: "#features" },
                { label: t.footerDemo,     href: "#demo" },
                { label: t.footerSignup,   href: ROUTES.onboarding },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/60 flex items-center gap-1.5 group transition-all hover:text-white"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: primaryColor }} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions — 10 secteurs */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">Solutions</p>
            <ul className="space-y-2">
              {SECTORS.map((s) => (
                <li key={s.id}>
                  <Link
                    href={getSectorUrl(s.id)}
                    className="flex items-center gap-2 text-sm text-white/60 transition-all hover:text-white"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.accent }} />
                    {locale === "fr" ? s.nameFr : s.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">{t.footerResources}</p>
            <ul className="space-y-3">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 text-sm text-white/60 transition-all hover:text-white group"
                  >
                    <item.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs">
              <span>🇨🇲</span>
              <span>{locale === "fr" ? "Conçu au Cameroun" : "Made in Cameroon"}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} AG Technologies. {t.footerRights}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/50 hover:text-white transition-all font-bold"
            >
              {locale === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}