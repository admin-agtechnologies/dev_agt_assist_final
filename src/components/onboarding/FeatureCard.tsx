"use client";
// ============================================================
// FICHIER : src/components/onboarding/FeatureCard.tsx
// Corrections : icône Lucide réelle + description + badge recommandé
// ============================================================

import { Check, Star } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";
import type { PublicFeature } from "@/repositories/public-features.repository";
import { getFeatureIcon } from "@/lib/feature-icon-map";
import { FEATURE_DESCRIPTIONS } from "@/lib/feature-descriptions";

interface FeatureCardProps {
  feature:     PublicFeature;
  selected:    boolean;
  locale:      Locale;
  accentColor: string;
  onClick:     () => void;
  disabled?:   boolean;
}

export function FeatureCard({
  feature, selected, locale, accentColor, onClick, disabled,
}: FeatureCardProps) {
  const label = locale === "fr" ? feature.nom_fr : feature.nom_en;
  const desc  = FEATURE_DESCRIPTIONS[feature.slug]?.[locale] ?? "";
  const Icon  = getFeatureIcon(feature.icone);
  const isLocked = feature.is_mandatory;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLocked}
      style={selected ? { borderColor: accentColor, backgroundColor: `${accentColor}0d` } : undefined}
      className={[
        "relative w-full text-left p-4 rounded-xl border-2 transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        !selected && "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border-hover,#d1d5db)]",
        (disabled || isLocked) && "opacity-60 cursor-not-allowed",
      ].join(" ")}
      aria-pressed={selected}
    >
      {/* Badge recommandé */}
      {feature.recommended && !isLocked && (
        <span
          className="absolute -top-2.5 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          <Star size={8} fill="currentColor" />
          {locale === "fr" ? "Recommandé" : "Recommended"}
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Icône Lucide */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: selected ? `${accentColor}20` : "var(--bg-200,#f3f4f6)" }}
        >
          <Icon
            size={18}
            style={{ color: selected ? accentColor : "var(--text-muted,#9ca3af)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] leading-tight">{label}</p>
          {desc && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{desc}</p>
          )}
          {isLocked && (
            <span
              className="inline-block mt-1 text-[10px] font-medium"
              style={{ color: accentColor }}
            >
              {locale === "fr" ? "Inclus automatiquement" : "Automatically included"}
            </span>
          )}
        </div>

        {/* Checkmark */}
        {selected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: accentColor }}
          >
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>
    </button>
  );
}