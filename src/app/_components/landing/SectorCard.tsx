// ============================================================
// FICHIER : src/app/_components/landing/SectorCard.tsx
// Carte individuelle d'un secteur.
// Icône résolue dynamiquement via SECTOR_ICON_MAP.
// ============================================================
"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Sector, SECTOR_ICON_MAP, getSectorUrl } from "./LandingData";

interface Props {
  sector: Sector;
}

export function SectorCard({ sector }: Props) {
  const { locale } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const Icon = SECTOR_ICON_MAP[sector.id];

  return (
    <Link
      href={getSectorUrl(sector.id)}
      className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        boxShadow: hovered
          ? `0 28px 64px ${sector.primary}42, 0 8px 24px rgba(0,0,0,0.22)`
          : "0 4px 20px rgba(0,0,0,0.16)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={sector.image}
          alt={locale === "fr" ? sector.nameFr : sector.nameEn}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${sector.gradient} opacity-75 group-hover:opacity-62 transition-opacity duration-300`}
        />

        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/30 backdrop-blur-sm text-white">
            {locale === "fr" ? sector.tagFr : sector.tagEn}
          </span>
        </div>

        {/* Icône secteur */}
        {Icon && (
          <div
            className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Titre sur l'image */}
        <div
          className="absolute bottom-0 inset-x-0 px-5 pb-4 pt-8"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)" }}
        >
          <h3 className="font-black text-xl text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
            {locale === "fr" ? sector.nameFr : sector.nameEn}
          </h3>
        </div>
      </div>

      {/* Corps */}
      <div className="p-5 bg-[var(--bg-card)]">
        <p className="text-sm leading-relaxed mb-4 text-[var(--text-muted)]">
          {locale === "fr" ? sector.descFr : sector.descEn}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {(locale === "fr" ? sector.featuresFr : sector.featuresEn).map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sector.accent }} />
              {f}
            </div>
          ))}
        </div>

        {/* Footer carte */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <span className="text-xs font-bold tracking-wide" style={{ color: sector.primary }}>
            {locale === "fr" ? "Découvrir la solution" : "Discover the solution"}
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
            style={{ backgroundColor: `${sector.primary}18` }}
          >
            <ArrowRight className="w-3.5 h-3.5" style={{ color: sector.primary }} />
          </div>
        </div>
      </div>
    </Link>
  );
}