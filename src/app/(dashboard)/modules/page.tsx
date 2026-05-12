// src/app/(dashboard)/modules/page.tsx
// Page "Mes modules" — 3 tabs : Actifs / Disponibles / Upgrade.
"use client";
import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useSector } from "@/hooks/useSector";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import { ModuleTabActive } from "@/components/modules/ModuleTabActive";
import { ModuleTabAvailable } from "@/components/modules/ModuleTabAvailable";
import { ModuleTabUpgrade } from "@/components/modules/ModuleTabUpgrade";
import { cn } from "@/lib/utils";

type Tab = "active" | "available" | "upgrade";

export default function ModulesPage() {
  const { locale } = useLanguage();
  const { theme } = useSector();
  const { features, isLoading, refetch } = useActiveFeatures();
  const [tab, setTab] = useState<Tab>("active");

  const handleChanged = useCallback(() => {
    refetch();
  }, [refetch]);

  const labels = {
    title:     locale === "fr" ? "Mes modules" : "My modules",
    subtitle:  locale === "fr"
      ? "Activez, épinglez ou découvrez de nouveaux modules pour votre assistant."
      : "Activate, pin or discover new modules for your assistant.",
    active:    locale === "fr" ? "Actifs" : "Active",
    available: locale === "fr" ? "Disponibles" : "Available",
    upgrade:   locale === "fr" ? "Upgrade" : "Upgrade",
  };

  const activeFeatures    = features.filter((f) => f.is_active);
  const availableFeatures = features.filter((f) => !f.is_active && f.included_in_plan !== false);
  const upgradeFeatures   = features.filter((f) => f.included_in_plan === false);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "active",    label: labels.active,    count: activeFeatures.length },
    { id: "available", label: labels.available, count: availableFeatures.length },
    { id: "upgrade",   label: labels.upgrade,   count: upgradeFeatures.length },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <PageHeader title={labels.title} subtitle={labels.subtitle} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {tabs.map((t) => {
          const isActiveTab = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2",
                isActiveTab
                  ? "border-current text-[var(--text)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
              style={isActiveTab ? { color: theme.primary, borderColor: theme.primary } : undefined}
            >
              {t.label}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)]">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenu tab */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : tab === "active" ? (
        <ModuleTabActive features={activeFeatures} locale={locale} onChanged={handleChanged} />
      ) : tab === "available" ? (
        <ModuleTabAvailable features={availableFeatures} locale={locale} onChanged={handleChanged} />
      ) : (
        <ModuleTabUpgrade features={upgradeFeatures} locale={locale} />
      )}
    </div>
  );
}