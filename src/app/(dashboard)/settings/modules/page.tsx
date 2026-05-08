// src/app/(dashboard)/settings/modules/page.tsx
"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { FeatureGrid } from "@/components/settings/FeatureGrid";

export default function SettingsModulesPage() {
  const { dictionary: d, locale } = useLanguage();
  const { features, isLoading, refetch } = useActiveFeatures();
  const s = d.settings.modules;

  const base        = features.filter((f) => f.categorie === "base");
  const sectorielle = features.filter(
    (f) => f.categorie === "sectorielle" || !f.categorie
  );

  const cardLabels = {
    active:             s.active,
    inactive:           s.inactive,
    mandatory:          s.mandatory,
    toggleActivate:     s.toggleActivate,
    toggleDeactivate:   s.toggleDeactivate,
    mandatoryTooltip:   s.mandatoryTooltip,
    errorToggle:        s.errorToggle,
    successActivated:   s.successActivated,
    successDeactivated: s.successDeactivated,
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {s.pageTitle}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {s.pageSubtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-[var(--border)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <FeatureGrid
            features={base}
            title={s.sectionBase}
            locale={locale}
            labels={cardLabels}
            onToggled={refetch}
          />
          <FeatureGrid
            features={sectorielle}
            title={s.sectionSectorielle}
            locale={locale}
            labels={cardLabels}
            onToggled={refetch}
          />
        </div>
      )}
    </div>
  );
}