"use client";
// ============================================================
// FICHIER : src/components/onboarding/SectorPicker.tsx
// Migration : SECTOR_COLORS supprimé → couleurs lues depuis SECTOR_THEMES
// Layout    : 2 colonnes mobile / 3 desktop, cartes p-5 (lisibilité)
// ============================================================

import { Check } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/contexts/LanguageContext";
import type { SecteurActivite } from "@/types/api";
import { getLogoAssets } from "@/lib/logo-config";
import { SECTOR_THEMES } from "@/lib/sector-theme";
import { isValidSector } from "@/lib/sector-config";

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
  fr: {
    title:    "Votre secteur d'activité",
    subtitle: "Le secteur détermine les fonctionnalités disponibles pour votre assistant.",
    confirm:  "Choisir ce secteur",
  },
  en: {
    title:    "Your industry",
    subtitle: "The sector determines the features available for your assistant.",
    confirm:  "Choose this sector",
  },
} as const;

const FALLBACK_ACCENT = "#075E54";

/** Résout l'accent d'un secteur depuis SECTOR_THEMES (source unique). */
function getAccent(slug: string): string {
  return isValidSector(slug) ? SECTOR_THEMES[slug].accent : FALLBACK_ACCENT;
}

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
  const confirmAccent = selected ? getAccent(selected) : FALLBACK_ACCENT;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      {/* Grille : 2 cols mobile / 3 cols desktop, cartes p-5 (lisibilité) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {secteurs.map((s) => {
          const isSelected = s.slug === selected;
          const label      = locale === "fr" ? s.label_fr : s.label_en;
          const desc       = SECTOR_DESC[s.slug]?.[locale] ?? "";
          const color      = getAccent(s.slug);
          const logoLight  = getLogoAssets(s.slug).light;

          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => onSelect(s.slug)}
              disabled={disabled}
              style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : undefined}
              className={[
                "relative p-5 rounded-2xl border-2 text-left transition-all group",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                isSelected
                  ? "shadow-md"
                  : "border-[var(--border)] hover:border-[var(--text-muted)] hover:shadow-sm",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {/* Badge "sélectionné" */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Logo sectoriel + label */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-[var(--border)]">
                  <Image
                    src={logoLight}
                    alt={label}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-[var(--text)] leading-tight">
                  {label}
                </h3>
              </div>

              {/* Description complète (pas de line-clamp, pas de truncate) */}
              {desc && (
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {desc}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Bouton confirmer */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={!selected || disabled}
        className="self-end px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: confirmAccent }}
      >
        {t.confirm}
      </button>
    </div>
  );
}

// END OF FILE: src/components/onboarding/SectorPicker.tsx