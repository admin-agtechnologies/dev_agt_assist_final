"use client";
// ============================================================
// FICHIER : src/components/onboarding/FeatureCard.tsx — v3
// S25 — Redesign badges par groupe : mandatory / recommended /
//        complementary / other (cross-secteur)
// ============================================================

import { Check, Lock, Star, Zap } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";
import type { PublicFeature } from "@/repositories/public-features.repository";
import { getFeatureIcon } from "@/lib/feature-icon-map";
import { FEATURE_DESCRIPTIONS } from "@/lib/feature-descriptions";

// Type groupe — partagé avec FeaturePicker
export type FeatureGroup = "mandatory" | "recommended" | "complementary" | "other";

interface FeatureCardProps {
  feature:     PublicFeature;
  selected:    boolean;
  locale:      Locale;
  accentColor: string;
  group:       FeatureGroup;
  onClick:     () => void;
}

const BADGE_LABELS: Record<FeatureGroup, { fr: string; en: string }> = {
  mandatory:     { fr: "Inclus automatiquement", en: "Automatically included" },
  recommended:   { fr: "Recommandé",             en: "Recommended"            },
  complementary: { fr: "Optionnel",               en: "Optional"               },
  other:         { fr: "Quota selon plan",        en: "Plan quota"             },
};

export function FeatureCard({
  feature, selected, locale, accentColor, group, onClick,
}: FeatureCardProps) {
  const isMandatory = group === "mandatory";
  const label = locale === "fr" ? feature.nom_fr : (feature.nom_en || feature.nom_fr);
  const desc  = FEATURE_DESCRIPTIONS[feature.slug]?.[locale] ?? "";
  const Icon  = getFeatureIcon(feature.icone);

  // ── Styles dynamiques ─────────────────────────────────────────────────────
  const cardBase =
    "relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

  let cardClass = cardBase;
  let cardStyle: React.CSSProperties = {};

  if (isMandatory) {
    cardClass += " border-amber-200 bg-amber-50/70 cursor-not-allowed select-none";
  } else if (selected) {
    cardStyle  = { borderColor: accentColor, backgroundColor: `${accentColor}12` };
    cardClass += " shadow-sm cursor-pointer";
  } else {
    cardClass +=
      " border-[var(--border)] bg-[var(--bg)] cursor-pointer " +
      "hover:border-[var(--text-muted)] hover:shadow-sm";
  }

  // ── Couleur icône ─────────────────────────────────────────────────────────
  const iconBg = isMandatory
    ? "#f59e0b20"
    : selected
    ? `${accentColor}22`
    : "var(--bg-200, #f3f4f6)";

  const iconColor = isMandatory
    ? "#d97706"
    : selected
    ? accentColor
    : "var(--text-muted, #9ca3af)";

  return (
    <button
      type="button"
      onClick={isMandatory ? undefined : onClick}
      disabled={isMandatory}
      style={cardStyle}
      className={cardClass}
      aria-pressed={selected}
    >
      {/* Badge flottant — groupe "recommended" uniquement */}
      {group === "recommended" && (
        <span
          className="absolute -top-2.5 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: accentColor }}
        >
          <Star size={8} fill="currentColor" />
          {BADGE_LABELS.recommended[locale]}
        </span>
      )}

      <div className="flex items-start gap-3">

        {/* Icône */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: iconBg }}
        >
          {isMandatory
            ? <Lock size={16} style={{ color: iconColor }} />
            : <Icon size={18} style={{ color: iconColor }} />
          }
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] leading-tight">{label}</p>

          {/* Badge inline — mandatory */}
          {isMandatory && (
            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-amber-600">
              <Lock size={8} />
              {BADGE_LABELS.mandatory[locale]}
            </span>
          )}

          {/* Badge inline — other (cross-secteur) */}
          {group === "other" && (
            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
              <Zap size={8} />
              {BADGE_LABELS.other[locale]}
            </span>
          )}

          {/* Description */}
          {desc && (
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-snug">{desc}</p>
          )}
        </div>

        {/* Checkmark */}
        {selected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: isMandatory ? "#f59e0b" : accentColor }}
          >
            <Check size={11} strokeWidth={3} className="text-white" />
          </div>
        )}

      </div>
    </button>
  );
}