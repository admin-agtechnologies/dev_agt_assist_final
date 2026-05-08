// src/components/settings/FeatureGrid.tsx
"use client";
import { FeatureCard } from "./FeatureCard";
import type { ActiveFeature } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  features: ActiveFeature[];
  title: string;
  locale: Locale;
  labels: {
    active: string;
    inactive: string;
    mandatory: string;
    toggleActivate: string;
    toggleDeactivate: string;
    mandatoryTooltip: string;
    errorToggle: string;
    successActivated: string;
    successDeactivated: string;
  };
  onToggled: () => void;
}

export function FeatureGrid({ features, title, locale, labels, onToggled }: Props) {
  if (features.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {features.map((f) => (
          <FeatureCard
            key={f.slug}
            feature={f}
            locale={locale}
            labels={labels}
            onToggled={onToggled}
          />
        ))}
      </div>
    </section>
  );
}