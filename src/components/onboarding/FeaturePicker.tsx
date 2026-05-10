"use client";
// ============================================================
// FICHIER : src/components/onboarding/FeaturePicker.tsx  — v2
// Groupes : BASE / SECTORIELLE / PERSONNALISATION
// ============================================================

import { useState, useMemo } from "react";
import { FeatureCard } from "./FeatureCard";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";
import type { PublicFeature } from "@/repositories/public-features.repository";

const LABELS = {
  fr: {
    title:       "Vos fonctionnalités",
    subtitle:    "Pré-sélectionnées selon votre secteur. Ajoutez ou retirez selon vos besoins.",
    base:        "Base",
    sectorielle: "Sectorielle",
    custom:      "Personnalisation",
    customHint:  "Fonctionnalités d'autres secteurs — ajoutez-en si elles vous sont utiles.",
    note:        "Certaines fonctionnalités nécessitent un abonnement spécifique.",
    confirm:     "Confirmer",
    confirming:  "Enregistrement…",
    selected:    (n: number) => `${n} sélectionnée${n > 1 ? "s" : ""}`,
  },
  en: {
    title:       "Your features",
    subtitle:    "Pre-selected for your sector. Add or remove based on your needs.",
    base:        "Base",
    sectorielle: "Sector",
    custom:      "Customization",
    customHint:  "Features from other sectors — add any that are useful to you.",
    note:        "Some features require a specific subscription.",
    confirm:     "Confirm",
    confirming:  "Saving…",
    selected:    (n: number) => `${n} selected`,
  },
} as const;

interface FeaturePickerProps {
  features:    PublicFeature[];
  allFeatures: PublicFeature[];
  locale:      Locale;
  accentColor: string;
  onConfirm:   (slugs: string[]) => Promise<void>;
}

export function FeaturePicker({ features, allFeatures, locale, accentColor, onConfirm }: FeaturePickerProps) {
  const t = LABELS[locale];

  const sectorSlugs = useMemo(() => new Set(features.map(f => f.slug)), [features]);
  const customFeatures = useMemo(
    () => allFeatures.filter(f => !sectorSlugs.has(f.slug)),
    [allFeatures, sectorSlugs],
  );

  const initialSelected = useMemo(
    () => new Set(features.filter(f => f.is_mandatory || f.recommended).map(f => f.slug)),
    [features],
  );

  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [saving,   setSaving]   = useState(false);

  const toggle = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm([...selected]); }
    finally { setSaving(false); }
  };

  const baseFeatures = features.filter(f => f.categorie === "base");
  const sectFeatures = features.filter(f => f.categorie !== "base");

  const Group = ({ title, hint, items }: { title: string; hint?: string; items: PublicFeature[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</p>
          {hint && <p className="text-xs text-[var(--text-muted)] mt-0.5 italic">{hint}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(feature => (
            <FeatureCard key={feature.slug} feature={feature} selected={selected.has(feature.slug)}
              locale={locale} accentColor={accentColor} onClick={() => toggle(feature.slug)} disabled={saving} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <Group title={t.base}        items={baseFeatures} />
      <Group title={t.sectorielle} items={sectFeatures} />
      <Group title={t.custom}      items={customFeatures} hint={t.customHint} />

      <p className="text-xs text-[var(--text-muted)] italic">{t.note}</p>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span className="text-sm text-[var(--text-muted)]">{t.selected(selected.size)}</span>
        <button type="button" onClick={handleConfirm} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: accentColor }}>
          {saving && <LoadingSpinner size={14} className="text-white" />}
          {saving ? t.confirming : t.confirm}
        </button>
      </div>
    </div>
  );
}