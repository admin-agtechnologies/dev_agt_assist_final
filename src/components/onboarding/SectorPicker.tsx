"use client";
// src/components/onboarding/SectorPicker.tsx

import { Check } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";
import type { SecteurActivite } from "@/types/api";

const SECTOR_ICONS: Record<string, string> = {
  pme:        "🏢",
  banking:    "🏦",
  clinical:   "🏥",
  school:     "🎓",
  ecommerce:  "🛒",
  hotel:      "🏨",
  public:     "🏛️",
  restaurant: "🍽️",
  transport:  "🚌",
  custom:     "⚙️",
};

const LABELS = {
  fr: {
    title: "Votre secteur d'activité",
    subtitle: "Le secteur détermine les fonctionnalités disponibles.",
    confirm: "Choisir ce secteur",
  },
  en: {
    title: "Your industry",
    subtitle: "The sector determines the available features.",
    confirm: "Choose this sector",
  },
} as const;

interface SectorPickerProps {
  secteurs: SecteurActivite[];
  selected: string;
  locale: Locale;
  onSelect: (slug: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function SectorPicker({
  secteurs,
  selected,
  locale,
  onSelect,
  onConfirm,
  disabled,
}: SectorPickerProps) {
  const t = LABELS[locale];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {secteurs.map((s) => {
          const isSelected = s.slug === selected;
          const label = locale === "fr" ? s.label_fr : s.label_en;
          const icon = SECTOR_ICONS[s.slug] ?? "🔧";

          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => onSelect(s.slug)}
              disabled={disabled}
              className={[
                "relative p-4 rounded-xl border-2 text-center transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/40",
                disabled && "opacity-50 cursor-not-allowed",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <Check size={10} strokeWidth={3} className="text-white" />
                </div>
              )}
              <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
              <p className="text-xs font-medium text-[var(--text)] leading-tight">{label}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!selected || disabled}
        className="self-end px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {t.confirm}
      </button>
    </div>
  );
}