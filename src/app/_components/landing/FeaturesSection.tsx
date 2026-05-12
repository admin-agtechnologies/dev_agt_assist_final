// ============================================================
// FICHIER : src/app/_components/landing/FeaturesSection.tsx
// Section fonctionnalités avec filtres par secteur.
// 10 secteurs × 4 features + 4 features communes.
// Auto-rotation 4s, pause au hover. Découpé avec FeatureCard.
// ============================================================
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Briefcase, Building2, Heart, GraduationCap, ShoppingCart,
  Hotel, Landmark, Utensils, Plane, Sparkles, Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SECTORS }     from "./LandingData";
import { FeatureCard } from "./FeatureCard";

const SECTOR_ICONS: Record<string, React.ElementType> = {
  pme: Briefcase, bancaire: Building2, clinique: Heart,
  ecole: GraduationCap, ecommerce: ShoppingCart, hotel: Hotel,
  public: Landmark, restaurant: Utensils, voyage: Plane, personnalise: Sparkles,
};

const COMMON_FR = ["Assistant WhatsApp 24/7", "Agent vocal IA", "Tableau de bord", "Paiement Mobile Money"];
const COMMON_EN = ["WhatsApp assistant 24/7", "AI voice agent",  "Dashboard",       "Mobile Money payment"];

export function FeaturesSection() {
  const { locale }                  = useLanguage();
  const [activeIdx, setActiveIdx]   = useState(0);
  const [animKey,   setAnimKey]     = useState(0);
  const [paused,    setPaused]      = useState(false);
  const tabsRef                     = useRef<HTMLDivElement>(null);

  const sector   = SECTORS[activeIdx];
  const Icon     = SECTOR_ICONS[sector.id];
  const features = locale === "fr" ? sector.featuresFr : sector.featuresEn;
  const common   = locale === "fr" ? COMMON_FR : COMMON_EN;

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx);
    setAnimKey(k => k + 1);
    const btn = tabsRef.current?.children[idx] as HTMLElement;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActiveIdx(i => { const next = (i + 1) % SECTORS.length; setAnimKey(k => k + 1); return next; });
    }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      id="features"
      className="py-24 px-4 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto">

        {/* En-tête */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-5 uppercase tracking-widest transition-all duration-500"
            style={{ backgroundColor: `${sector.primary}15`, borderColor: `${sector.primary}30`, color: sector.primary }}
          >
            <Zap className="w-3 h-3" />
            {locale === "fr" ? "Fonctionnalités" : "Features"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] mb-4 leading-tight">
            {locale === "fr" ? "Tout ce dont votre secteur a besoin" : "Everything your sector needs"}
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm sm:text-base">
            {locale === "fr"
              ? "Sélectionnez votre secteur et découvrez les fonctionnalités taillées pour vous."
              : "Select your sector and discover features built specifically for you."}
          </p>
        </div>

        {/* Onglets secteurs */}
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto pb-3 mb-10"
          style={{ scrollbarWidth: "none" }}
        >
          {SECTORS.map((s, i) => {
            const SIcon    = SECTOR_ICONS[s.id];
            const isActive = i === activeIdx;
            return (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 border"
                style={{
                  backgroundColor: isActive ? s.primary   : "transparent",
                  borderColor:     isActive ? s.primary   : "var(--border)",
                  color:           isActive ? "#fff"      : "var(--text-muted)",
                  boxShadow:       isActive ? `0 4px 14px ${s.primary}40` : "none",
                  transform:       isActive ? "translateY(-2px)" : "none",
                }}
              >
                {SIcon && <SIcon className="w-3.5 h-3.5" />}
                {locale === "fr" ? s.nameFr : s.nameEn}
              </button>
            );
          })}
        </div>

        {/* Contenu animé */}
        <div
          key={animKey}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          style={{ animation: "fadeSlideIn 0.4s ease forwards" }}
        >
          {/* Carte secteur */}
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${sector.primary}DD, ${sector.accent}44)`, border: `1px solid ${sector.primary}30` }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: sector.accent }} />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${sector.primary}30`, border: `1px solid ${sector.primary}40` }}>
                {Icon && <Icon className="w-7 h-7" style={{ color: sector.accent }} />}
              </div>
              <div className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: `${sector.accent}25`, color: sector.accent }}>
                {locale === "fr" ? sector.tagFr : sector.tagEn}
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{locale === "fr" ? sector.nameFr : sector.nameEn}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{locale === "fr" ? sector.descFr : sector.descEn}</p>
              {!paused && (
                <div className="mt-6 h-0.5 rounded-full overflow-hidden bg-white/20">
                  <div className="h-full rounded-full bg-white/60" style={{ animation: "progressBar 4s linear forwards" }} />
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              {locale === "fr" ? "Fonctionnalités spécifiques" : "Sector-specific features"}
            </p>
            {features.map(f => <FeatureCard key={f} label={f} accentColor={sector.primary} variant="sector" />)}
            <div className="pt-2 pb-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {locale === "fr" ? "Inclus dans tous les secteurs" : "Included in all sectors"}
              </p>
            </div>
            {common.map(f => <FeatureCard key={f} label={f} accentColor="#25D366" variant="common" />)}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
        div[style*="scrollbarWidth"] ::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

// END OF FILE: src/app/_components/landing/FeaturesSection.tsx