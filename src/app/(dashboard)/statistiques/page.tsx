"use client";
// src/app/(dashboard)/statistiques/page.tsx
// N2 — Hub stats cross-bots : même pattern que /results.
// Tabs par feature active entreprise + filtre bot + filtres période.
// S56 création — S57 fix : onSelect→onChange, locale prop, FeatureSlug cast.

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage }              from "@/contexts/LanguageContext";
import { useActiveFeatures }        from "@/hooks/useFeatures";
import { useSector }                from "@/hooks/useSector";
import { botsRepository }           from "@/repositories/bots.repository";
import { dashboardStatsRepository } from "@/repositories/stats.repository";
import { PageHeader }               from "@/components/ui/PageHeader";
import { Spinner }                  from "@/components/ui";
import { BotFilterDropdown }        from "@/app/(dashboard)/results/_components/BotFilterDropdown";
import { FeatureStatsSection }      from "./_components/FeatureStatsSection";
import { FEATURES_MASTER_MAP, FEATURES_ORDER } from "@/config/features-master-config";
import { cn }                       from "@/lib/utils";
import type { Bot }                 from "@/types/api";
import type { FeatureSlug }         from "@/config/features-master-config";
import type { DashboardStatsResponse, StatPeriodParams } from "@/types/api/stats.types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d";

const PERIODS: { key: Period; fr: string; en: string }[] = [
  { key: "7d",  fr: "7 jours",  en: "7 days"  },
  { key: "30d", fr: "30 jours", en: "30 days" },
  { key: "90d", fr: "90 jours", en: "90 days" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StatistiquesPage() {
  const { locale, dictionary: d } = useLanguage();
  const { features }              = useActiveFeatures();
  const { theme }                 = useSector();

  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [bots,        setBots]        = useState<Bot[]>([]);
  const [period,      setPeriod]      = useState<Period>("30d");
  const [activeSlug,  setActiveSlug]  = useState<string>("chatbot_whatsapp");
  const [stats,       setStats]       = useState<DashboardStatsResponse | null>(null);
  const [loading,     setLoading]     = useState(true);

  // Charger bots
  useEffect(() => {
    botsRepository.getList().then((res) => {
      const list = Array.isArray(res) ? res : (res as { results: Bot[] }).results ?? [];
      setBots(list.filter((b: Bot) => b.bot_type === "whatsapp"));
    });
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params: StatPeriodParams = { period };
      const res = await dashboardStatsRepository.getStats(params, selectedBot, activeSlug);
      setStats(res);
    } finally {
      setLoading(false);
    }
  }, [period, selectedBot, activeSlug]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Tabs = features actives entreprise dans l'ordre du master
  const tabs = useMemo(() => {
    const activeSlugs = new Set(features.filter((f) => f.is_active).map((f) => f.slug));
    activeSlugs.add("chatbot_whatsapp"); // toujours présent
    return FEATURES_ORDER.filter((slug) => {
      const meta = FEATURES_MASTER_MAP.get(slug);
      return meta && activeSlugs.has(slug);
    });
  }, [features]);

  // S57 fix — cast activeSlug as FeatureSlug pour éviter l'erreur TS2345
  useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeSlug as FeatureSlug)) {
      setActiveSlug(tabs[0]);
    }
  }, [tabs, activeSlug]);

  const currentData = stats?.features[activeSlug];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={d.stats.title}
        subtitle={d.stats.subtitle}
      />

      {/* ── Filtres ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* S57 fix — onChange (pas onSelect) + locale */}
        <BotFilterDropdown
          bots={bots}
          selectedBotId={selectedBot}
          onChange={setSelectedBot}
          locale={locale}
        />
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                period === p.key
                  ? "text-white border-transparent"
                  : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]",
              )}
              style={period === p.key ? { background: theme?.primary } : {}}
            >
              {locale === "fr" ? p.fr : p.en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs features ── */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((slug) => {
          const meta   = FEATURES_MASTER_MAP.get(slug);
          const Icon   = meta?.icon;
          const label  = meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug;
          const active = slug === activeSlug;
          return (
            <button
              key={slug}
              onClick={() => setActiveSlug(slug)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all",
                active
                  ? "text-white border-transparent"
                  : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]",
              )}
              style={active ? { background: theme?.primary } : {}}
            >
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !currentData ? (
        <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
          <p className="text-sm font-bold">
            {locale === "fr"
              ? "Aucune donnée pour cette feature sur la période."
              : "No data for this feature on this period."}
          </p>
          <p className="text-xs mt-1 opacity-60">
            {d.stats.noStatsHint}
          </p>
        </div>
      ) : (
        <FeatureStatsSection slug={activeSlug} data={currentData} />
      )}
    </div>
  );
}