"use client";
// ============================================================
// FICHIER : src/components/onboarding/SectorPicker.tsx
// Améliorations : logos réels, descriptions, layout card, couleur sectorielle
// ============================================================

import { Check } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/contexts/LanguageContext";
import type { SecteurActivite } from "@/types/api";
import { getLogoAssets } from "@/lib/logo-config";

// ── Couleur primaire par secteur ──────────────────────────────────────────────
export const SECTOR_COLORS: Record<string, string> = {
  restaurant: "#F97316",
  hotel:      "#0EA5E9",
  ecommerce:  "#8B5CF6",
  transport:  "#14B8A6",
  banking:    "#2563EB",
  clinical:   "#10B981",
  pme:        "#075E54",
  school:     "#6366F1",
  public:     "#64748B",
  custom:     "#7C3AED",
};

// ── Description courte par secteur ───────────────────────────────────────────
const SECTOR_DESC: Record<string, { fr: string; en: string }> = {
  restaurant: { fr: "Réservations, commandes & menu digital",  en: "Bookings, orders & digital menu" },
  hotel:      { fr: "Chambres, conciergerie & réservations",   en: "Rooms, concierge & bookings" },
  ecommerce:  { fr: "Boutique en ligne & suivi commandes",     en: "Online store & order tracking" },
  transport:  { fr: "Billets, trajets & réservations voyage",  en: "Tickets, routes & travel booking" },
  banking:    { fr: "Services bancaires & microfinance",       en: "Banking & microfinance services" },
  clinical:   { fr: "RDV médicaux & orientation patients",     en: "Medical appointments & guidance" },
  pme:        { fr: "Support client & conversion prospects",   en: "Customer support & lead conversion" },
  school:     { fr: "Inscriptions, cours & communication",     en: "Enrollment, courses & comms" },
  public:     { fr: "Orientation citoyens & prise de RDV",     en: "Citizen guidance & appointments" },
  custom:     { fr: "Choisissez vos propres fonctionnalités",  en: "Choose your own features" },
};

const LABELS = {
  fr: { title: "Votre secteur d'activité", subtitle: "Le secteur détermine les fonctionnalités disponibles pour votre assistant.", confirm: "Choisir ce secteur" },
  en: { title: "Your industry",            subtitle: "The sector determines the features available for your assistant.",           confirm: "Choose this sector" },
} as const;

interface SectorPickerProps {
  secteurs:  SecteurActivite[];
  selected:  string;
  locale:    Locale;
  onSelect:  (slug: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function SectorPicker({ secteurs, selected, locale, onSelect, onConfirm, disabled }: SectorPickerProps) {
  const t = LABELS[locale];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {secteurs.map((s) => {
          const isSelected  = s.slug === selected;
          const label       = locale === "fr" ? s.label_fr : s.label_en;
          const desc        = SECTOR_DESC[s.slug]?.[locale] ?? "";
          const color       = SECTOR_COLORS[s.slug] ?? "#075E54";
          const logoLight = getLogoAssets(s.slug).light;

          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => onSelect(s.slug)}
              disabled={disabled}
              style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : undefined}
              className={[
                "relative p-3 rounded-xl border-2 text-left transition-all group",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                isSelected
                  ? "shadow-sm"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border-hover,#d1d5db)]",
                disabled && "opacity-50 cursor-not-allowed",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              {/* Checkmark */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Check size={10} strokeWidth={3} className="text-white" />
                </div>
              )}

              {/* Logo ou fallback */}
              <div className="mb-2 h-8 flex items-center">
                {logoLight ? (
                  <Image src={logoLight} alt={label} width={56} height={28} className="object-contain h-7 w-auto" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base font-bold" style={{ backgroundColor: color }}>
                    {label[0]}
                  </div>
                )}
              </div>

              {/* Label */}
              <p className="text-xs font-semibold text-[var(--text)] leading-tight">{label}</p>

              {/* Description */}
              {desc && (
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-2">{desc}</p>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!selected || disabled}
        className="self-end px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: selected ? (SECTOR_COLORS[selected] ?? "#075E54") : "#075E54" }}
      >
        {t.confirm}
      </button>
    </div>
  );
}