// ============================================================
// FICHIER : src/app/_components/sector/banking/BankingHero.tsx
// Carousel hero 4 slides — landing sectorielle banking.
// Couleurs : primary #1B4332, accent #1B7B47
// Images : Unsplash banking/finance sélectionnées pour qualité
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Landmark, CalendarDays, CreditCard, Building2,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#1B4332";
const ACCENT  = "#1B7B47";

interface BankingSlide {
  image:      string;
  overlayA:   string;
  overlayB:   string;
  badgeFr:    string;
  badgeEn:    string;
  BadgeIcon:  React.ElementType;
  line1Fr:    string;
  line1En:    string;
  line2Fr:    string;
  line2En:    string;
  ctaFr:      string;
  ctaEn:      string;
  featuresFr: string[];
  featuresEn: string[];
}

const SLIDES: BankingSlide[] = [
  {
    // Conseiller bancaire professionnel en bureau moderne
    image:    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&q=80",
    overlayA: "#071A0EF0", overlayB: "#1B4332D0",
    badgeFr: "Banque & Microfinance", badgeEn: "Banking & Microfinance",
    BadgeIcon: Landmark,
    line1Fr: "Votre banque digitale,",        line1En: "Your digital bank,",
    line2Fr: "RDV conseiller & services IA.", line2En: "AI advisor appointments & services.",
    ctaFr: "Créer mon assistant bancaire",    ctaEn: "Create my banking assistant",
    featuresFr: ["RDV conseiller 24/7", "Catalogue produits", "Multi-agences", "FAQ bancaire"],
    featuresEn: ["Advisor booking 24/7", "Products catalogue", "Multi-branch", "Banking FAQ"],
  },
  {
    // Réunion conseiller-client dans une agence lumineuse
    image:    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80",
    overlayA: "#071A0EF0", overlayB: "#1B4332D0",
    badgeFr: "Prise de RDV conseiller", badgeEn: "Advisor appointment booking",
    BadgeIcon: CalendarDays,
    line1Fr: "Prenez RDV avec un conseiller", line1En: "Book an advisor appointment",
    line2Fr: "en 30 secondes sur WhatsApp.",  line2En: "in 30 seconds on WhatsApp.",
    ctaFr: "Activer les RDV conseillers",     ctaEn: "Enable advisor bookings",
    featuresFr: ["Choix de l'agence", "Choix du conseiller", "Confirmation instantanée", "Rappels automatiques"],
    featuresEn: ["Branch selection", "Advisor selection", "Instant confirmation", "Auto reminders"],
  },
  {
    // Cartes bancaires modernes sur fond sombre
    image:    "https://images.unsplash.com/photo-1616514197671-15d99ce7a6f8?w=1400&q=80",
    overlayA: "#0D2818F0", overlayB: "#1B4332D0",
    badgeFr: "Catalogue produits financiers", badgeEn: "Financial products catalogue",
    BadgeIcon: CreditCard,
    line1Fr: "Vos produits bancaires,",     line1En: "Your banking products,",
    line2Fr: "consultables à toute heure.", line2En: "available around the clock.",
    ctaFr: "Activer le catalogue",          ctaEn: "Enable the catalogue",
    featuresFr: ["Crédits & taux", "Comptes & conditions", "Documents requis", "Simulation en ligne"],
    featuresEn: ["Loans & rates", "Accounts & terms", "Required documents", "Online simulation"],
  },
  {
    // Vue aérienne quartier d'affaires moderne
    image:    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80",
    overlayA: "#071A0EF0", overlayB: "#1B7B47D0",
    badgeFr: "Multi-agences", badgeEn: "Multi-branch",
    BadgeIcon: Building2,
    line1Fr: "Toutes vos agences,",      line1En: "All your branches,",
    line2Fr: "une seule plateforme IA.", line2En: "one AI platform.",
    ctaFr: "Gérer mes agences",          ctaEn: "Manage my branches",
    featuresFr: ["Stats par agence", "Conseillers isolés", "RDV par agence", "Dashboard global"],
    featuresEn: ["Per-branch stats", "Isolated advisors", "Per-branch bookings", "Global dashboard"],
  },
];

export function BankingHero() {
  const { locale } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const total = SLIDES.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  const s    = SLIDES[current];
  const isFr = locale === "fr";

  const sectionStyle: React.CSSProperties = { minHeight: "92vh" };

  const bgStyle: React.CSSProperties = { backgroundImage: `url(${s.image})` };

  const overlayStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${s.overlayA} 0%, ${s.overlayB} 100%)`,
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: `${ACCENT}20`,
    borderColor: `${ACCENT}50`,
    color: ACCENT,
  };

  const accentSpanStyle: React.CSSProperties = { color: ACCENT };

  const checkStyle: React.CSSProperties = { color: ACCENT };

  const ctaBtnStyle: React.CSSProperties = {
    backgroundColor: ACCENT,
    color: "#fff",
    boxShadow: `0 8px 24px ${ACCENT}40`,
  };

  const chevronStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.15)",
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={sectionStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={bgStyle}
      />

      {/* Overlay dégradé banking */}
      <div className="absolute inset-0" style={overlayStyle} />

      {/* Contenu principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-20 flex flex-col justify-center min-h-[92vh]">
        <div className="max-w-2xl">

          {/* Badge secteur */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border"
            style={badgeStyle}
          >
            <s.BadgeIcon className="w-3.5 h-3.5" />
            {isFr ? s.badgeFr : s.badgeEn}
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            {isFr ? s.line1Fr : s.line1En}
            <br />
            <span style={accentSpanStyle}>
              {isFr ? s.line2Fr : s.line2En}
            </span>
          </h1>

          {/* Features checkées */}
          <ul className="flex flex-wrap gap-3 mb-8">
            {(isFr ? s.featuresFr : s.featuresEn).map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-sm text-white/80">
                <Check className="w-4 h-4 flex-shrink-0" style={checkStyle} />
                {f}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={ROUTES.onboarding}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
              style={ctaBtnStyle}
            >
              {isFr ? s.ctaFr : s.ctaEn}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={ROUTES.login}
              className="text-sm text-white/60 hover:text-white transition-colors self-center underline underline-offset-2"
            >
              {isFr ? "J'ai déjà un compte" : "I already have an account"}
            </a>
          </div>

        </div>
      </div>

      {/* Chevron gauche */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={chevronStyle}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Chevron droit */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={chevronStyle}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots indicateurs */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => {
          const dotStyle: React.CSSProperties = {
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? ACCENT : "rgba(255,255,255,0.32)",
            boxShadow: i === current ? `0 0 10px ${ACCENT}80` : "none",
            transition: "all 0.3s",
          };
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={dotStyle}
            />
          );
        })}
      </div>

      {/* Compteur slides */}
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

    </section>
  );
}