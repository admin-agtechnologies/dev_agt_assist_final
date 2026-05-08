// src/app/(dashboard)/settings/page.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectorBadge } from "@/components/sector/SectorBadge";
import { FeatureGrid } from "@/components/settings/FeatureGrid";
import { Building2, User } from "lucide-react";

export default function SettingsPage() {
  const { dictionary: d, locale } = useLanguage();
  const { theme } = useSector();
  const { user } = useAuth();
  const { features, isLoading, refetch } = useActiveFeatures();

  const entreprise = user?.entreprise;
  const s = d.settings.modules;
  const c = d.common;

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title={c.settings} />

      {/* Infos entreprise */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={15} style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
              {c.profile}
            </h3>
          </div>
          <SectorBadge size="sm" />
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {[
            { label: c.profile,  value: entreprise?.name ?? "—" },
            { label: "Email",    value: user?.email ?? "—" },
            { label: "Slug",     value: entreprise?.slug ?? "—" },
            { label: c.status,   value: entreprise?.is_active ? c.active : c.inactive },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
              <p className="text-sm font-medium text-[var(--text)] truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules — avec toggles */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
            {s.pageTitle}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.pageSubtitle}</p>
        </div>
        <div className="p-5 space-y-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Compte utilisateur */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <User size={15} style={{ color: theme.primary }} />
          <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
            {c.profile}
          </h3>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {[
            { label: d.nav.profile, value: user?.name ?? "—" },
            { label: "Email",       value: user?.email ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
              <p className="text-sm font-medium text-[var(--text)] truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}