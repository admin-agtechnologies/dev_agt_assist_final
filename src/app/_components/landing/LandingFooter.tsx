// src/app/_components/landing/LandingFooter.tsx
"use client";
import Link from "next/link";
import { Sun, Moon, MapPin, Mail, Globe, ArrowRight, HelpCircle, BookOpen, Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";

export function LandingFooter() {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;

  const productLinks = [
    { label: t.footerFeatures, href: "#features" },
    { label: t.footerPlans,    href: "#plans" },
    { label: t.footerDemo,     href: "#demo" },
    { label: t.footerSignup,   href: ROUTES.onboarding },
  ];

  const resourceLinks = [
    { label: t.footerHelp,     href: ROUTES.help,     icon: HelpCircle },
    { label: t.footerTutorial, href: ROUTES.tutorial,  icon: BookOpen },
    { label: t.footerLogin,    href: ROUTES.login,     icon: Bot },
  ];

  return (
    <footer className="bg-[#022c22] text-white">
      <div className="h-1 bg-gradient-to-r from-[#25D366] via-[#075E54] to-[#6C3CE1]" />
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] flex items-center justify-center text-white font-black text-base shadow-lg">A</div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-lg text-white tracking-tight">AGT Platform</span>
                <span className="text-[11px] text-white/50 font-medium">by AG Technologies</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">{t.footerTagline}</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm text-white/50">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#25D366]" />
                <a href="https://www.google.com/maps/place/BGFI+Bank+-+Agence+Rubis/@3.868969,11.5191484,17z" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">
                  Montée Anne rouge, Immeuble Kadji,<br />Yaoundé, Cameroun
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/50">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#25D366]" />
                <a href="mailto:secretariatagtechnologies@gmail.com" className="hover:text-[#25D366] transition-colors truncate">
                  secretariatagtechnologies@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Produit */}
          <div className="md:col-span-2 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">{t.footerProduct}</p>
            <ul className="space-y-3">
              {productLinks.map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/60 hover:text-[#25D366] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">{t.footerResources}</p>
            <ul className="space-y-3">
              {resourceLinks.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link href={item.href} className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#25D366] transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-white/30 group-hover:text-[#25D366] transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Groupe AGT */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">{t.footerGroup}</p>
            <ul className="space-y-3">
              <li>
                <a href="https://www.ag-technologies.tech/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#25D366] transition-colors group">
                  <Globe className="w-3.5 h-3.5 text-white/30 group-hover:text-[#25D366] transition-colors" />
                  AG Technologies
                </a>
              </li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs">
              <span>🇨🇲</span><span>Conçu au Cameroun</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} AG Technologies. {t.footerRights}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/50 hover:text-white transition-all font-bold">
              {locale === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>
            <button onClick={toggle} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}