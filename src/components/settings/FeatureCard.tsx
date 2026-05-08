// src/components/settings/FeatureCard.tsx
"use client";
import { useState } from "react";
import { featuresRepository } from "@/repositories/features.repository";
import type { ActiveFeature } from "@/repositories/features.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { useSector } from "@/hooks/useSector";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  feature: ActiveFeature;
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

export function FeatureCard({ feature, locale, labels, onToggled }: Props) {
  const { theme } = useSector();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const featureLabel = getFeatureLabel(feature.slug, locale);

  const handleToggle = async () => {
    if (feature.is_mandatory) return;
    setLoading(true);
    setError(null);
    try {
      await featuresRepository.toggle(feature.slug, !feature.is_active);
      onToggled();
    } catch {
      setError(labels.errorToggle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
          style={{ backgroundColor: feature.is_active ? theme.primary : "var(--border)" }}
        >
          {featureLabel.nav.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {featureLabel.nav}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {featureLabel.pageTitle}
          </p>
          {error && (
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {feature.is_mandatory ? (
          <span
            className="badge text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] cursor-default"
            title={labels.mandatoryTooltip}
          >
            {labels.mandatory}
          </span>
        ) : (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              feature.is_active
                ? "bg-[var(--color-primary)]"
                : "bg-[var(--border)]"
            }`}
            aria-label={
              feature.is_active ? labels.toggleDeactivate : labels.toggleActivate
            }
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                feature.is_active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}
        <span
          className={`text-xs font-medium ${
            feature.is_active ? "text-green-600" : "text-[var(--text-muted)]"
          }`}
        >
          {feature.is_active ? labels.active : labels.inactive}
        </span>
      </div>
    </div>
  );
}