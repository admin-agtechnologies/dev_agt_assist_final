// ============================================================
// FICHIER : src/app/_components/landing/SectorsSection.tsx
// Sélecteur de secteur interactif.
// Liste cliquable à gauche — panneau de détail à droite.
// Chaque secteur = point d'entrée direct vers son onboarding.
// ============================================================
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Building2, Heart, GraduationCap, ShoppingCart,
  Hotel, Landmark, Utensils, Plane, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SECTORS }     from "./LandingData";
import { SECTOR_URLS } from "@/lib/constants";

const SECTOR_ICONS: Record<string, React.ElementType> = {
  pme: Briefcase, banking: Building2, clinique: Heart,
  ecole: GraduationCap, ecommerce: ShoppingCart, hotel: Hotel,
  public: Landmark, restaurant: Utensils, voyage: Plane, personnalise: Sparkles,
};

function getSectorHref(id: string) {
  return SECTOR_URLS[id] ?? "/onboarding";
}

export function SectorsSection() {
  const { locale }          = useLanguage();
  const [activeId, setActive] = useState(SECTORS[0].id);
  const active              = SECTORS.find(s => s.id === activeId) ?? SECTORS[0];
  const Icon                = SECTOR_ICONS[activeId];

  return (
    <section id="secteurs" className="relative overflow-hidden py-24 px-4">

      {/* Fond dégradé dynamique selon secteur actif */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{ background: `linear-gradient(160deg, ${active.primary}18 0%, transparent 50%)` }}
      />
      {/* Orbe de couleur secteur */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 transition-all duration-700 pointer-events-none"
        style={{ background: active.primary }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* En-tête */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-5 uppercase tracking-widest transition-all duration-500"
            style={{ backgroundColor: `${active.primary}15`, borderColor: `${active.primary}30`, color: active.primary }}
          >
            <Sparkles className="w-3 h-3" />
            {locale === "fr" ? "Solutions par secteur" : "Industry solutions"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] mb-4 leading-tight">
            {locale === "fr"
              ? <>Choisissez <span style={{ color: active.primary }}>votre secteur</span></>
              : <>Choose <span style={{ color: active.primary }}>your industry</span></>}
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            {locale === "fr"
              ? "Cliquez sur votre secteur — découvrez votre solution et démarrez directement."
              : "Click your industry — discover your solution and get started directly."}
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Liste secteurs (2/5) ─────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            {SECTORS.map((s) => {
              const SIcon    = SECTOR_ICONS[s.id];
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-300 group"
                  style={{
                    background:   isActive ? `${s.primary}18`    : "transparent",
                    border:       `1px solid ${isActive ? s.primary + "40" : "var(--border)"}`,
                    transform:    isActive ? "translateX(4px)"   : "none",
                  }}
                >
                  {/* Icône */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isActive ? s.primary : `${s.primary}15`,
                    }}
                  >
                    {SIcon && <SIcon className="w-5 h-5" style={{ color: isActive ? "#fff" : s.primary }} />}
                  </div>

                  {/* Texte */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm leading-none mb-0.5 transition-colors duration-300"
                      style={{ color: isActive ? s.primary : "var(--text)" }}
                    >
                      {locale === "fr" ? s.nameFr : s.nameEn}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {locale === "fr" ? s.tagFr : s.tagEn}
                    </p>
                  </div>

                  {/* Flèche active */}
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0 transition-all duration-300"
                    style={{
                      color:   isActive ? s.primary : "transparent",
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Panneau détail (3/5) ─────────────────────────────────── */}
          <div
            key={activeId}
            className="lg:col-span-3 rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]"
            style={{ animation: "fadeSlideIn 0.35s ease forwards", boxShadow: `0 24px 64px ${active.primary}18` }}
          >
            {/* Image hero secteur */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={active.image}
                alt={locale === "fr" ? active.nameFr : active.nameEn}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(160deg, ${active.primary}CC 0%, ${active.primary}44 50%, transparent 100%)` }}
              />
              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-black/25 backdrop-blur-sm">
                  {locale === "fr" ? active.tagFr : active.tagEn}
                </span>
              </div>
              {/* Icône + nom */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-2xl font-black text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {locale === "fr" ? active.nameFr : active.nameEn}
                </h3>
              </div>
            </div>

            {/* Corps */}
            <div className="p-6">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                {locale === "fr" ? active.descFr : active.descEn}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {(locale === "fr" ? active.featuresFr : active.featuresEn).map((f) => (
                  <div key={f} className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: active.primary }} />
                    <span className="text-xs font-semibold text-[var(--text)]">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={getSectorHref(active.id)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${active.primary}, ${active.accent}CC)`,
                  boxShadow:  `0 8px 24px ${active.primary}40`,
                }}
              >
                {locale === "fr"
                  ? `Démarrer pour ${active.nameFr}`
                  : `Get started for ${active.nameEn}`}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// END OF FILE: src/app/_components/landing/SectorsSection.tsx