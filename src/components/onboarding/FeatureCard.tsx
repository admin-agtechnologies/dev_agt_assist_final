"use client";
// src/components/onboarding/FeatureCard.tsx

import { Check } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";
import type { Feature } from "@/types/api/feature.types";

interface FeatureCardProps {
  feature: Feature;
  selected: boolean;
  locale: Locale;
  onClick: () => void;
  disabled?: boolean;
}

export function FeatureCard({ feature, selected, locale, onClick, disabled }: FeatureCardProps) {
  const label = locale === "fr" ? feature.nom_fr : feature.nom_en;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || feature.is_mandatory}
      className={[
        "relative w-full text-left p-4 rounded-xl border-2 transition-all",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/40",
        (disabled || feature.is_mandatory) && "opacity-60 cursor-not-allowed",
      ].join(" ")}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {feature.icone}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
          {feature.is_mandatory && (
            <span className="inline-block mt-1 text-xs text-[var(--primary)] font-medium">
              {locale === "fr" ? "Inclus" : "Included"}
            </span>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>
    </button>
  );
}