"use client";
// src/components/onboarding/FeaturePicker.tsx

import { useState } from "react";
import { FeatureCard } from "./FeatureCard";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";
import type { Feature } from "@/types/api/feature.types";

const LABELS = {
  fr: {
    title: "Choisissez vos fonctionnalités",
    subtitle: "Les fonctionnalités incluses sont activées automatiquement.",
    confirm: "Confirmer la sélection",
    confirming: "Enregistrement…",
    selected: (n: number) => `${n} sélectionnée${n > 1 ? "s" : ""}`,
  },
  en: {
    title: "Choose your features",
    subtitle: "Included features are activated automatically.",
    confirm: "Confirm selection",
    confirming: "Saving…",
    selected: (n: number) => `${n} selected`,
  },
} as const;

interface FeaturePickerProps {
  features: Feature[];
  locale: Locale;
  onConfirm: (slugs: string[]) => Promise<void>;
}

export function FeaturePicker({ features, locale, onConfirm }: FeaturePickerProps) {
  const t = LABELS[locale];

  const mandatory = features.filter((f) => f.is_mandatory).map((f) => f.slug);
  const [selected, setSelected] = useState<Set<string>>(new Set(mandatory));
  const [saving, setSaving] = useState(false);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm([...selected]);
    } finally {
      setSaving(false);
    }
  };

  const optionalSelected = [...selected].filter((s) => !mandatory.includes(s)).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.slug}
            feature={feature}
            selected={selected.has(feature.slug)}
            locale={locale}
            onClick={() => toggle(feature.slug)}
            disabled={saving}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-[var(--text-muted)]">
          {t.selected(optionalSelected + mandatory.length)}
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <LoadingSpinner size={14} className="text-white" />}
          {saving ? t.confirming : t.confirm}
        </button>
      </div>
    </div>
  );
}