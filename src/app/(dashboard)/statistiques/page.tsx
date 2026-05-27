"use client";
// src/app/(dashboard)/statistiques/page.tsx
// N2 — Hub stats cross-bots : agrégation par feature active entreprise.
// Filtres : bot (tous / 1) + période 7 niveaux alignés avec N1.
// Réutilise StatsHistoriqueChart + StatsRecentEntries + FeatureStatsSection.
// S56 création — S57 fix — S63 refonte complète.

import { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { Spinner }              from "@/components/ui";
import { cn }                   from "@/lib/utils";
import { useLanguage }          from "@/contexts/LanguageContext";
import { useSector }            from "@/hooks/useSector";
import { dashboardStatsRepository } from "@/repositories/stats.repository";
import { botsRepository }           from "@/repositories/bots.repository";
import { FEATURES_MASTER_MAP }      from "@/config/features-master-config";
import { FeatureStatsSection }      from "@/app/(dashboard)/stats/_components/FeatureStatsSection";
import { StatsHistoriqueChart }     from "@/app/(dashboard)/bots/_components/tabs/stats/StatsHistoriqueChart";
import { StatsRecentEntries }       from "@/app/(dashboard)/bots/_components/tabs/stats/StatsRecentEntries";
import type {
  DashboardStatsResponse,
  FeatureStatData,
  StatPeriodParams,
} from "@/types/api/stats.types";
import type { Bot } from "@/types/api";

// ── Types & config période ────────────────────────────────────────────────────

type PeriodKey = "1d" | "7d" | "30d" | "90d" | "180d" | "365d" | "custom";

const PERIODS: { key: PeriodKey; fr: string; en: string; days?: number }[] = [
  { key: "1d",     fr: "Aujourd'hui",   en: "Today",     days: 1   },
  { key: "7d",     fr: "7 jours",       en: "7 days",    days: 7   },
  { key: "30d",    fr: "30 jours",      en: "30 days",   days: 30  },
  { key: "90d",    fr: "3 mois",        en: "3 months",  days: 90  },
  { key: "180d",   fr: "6 mois",        en: "6 months",  days: 180 },
  { key: "365d",   fr: "1 an",          en: "1 year",    days: 365 },
  { key: "custom", fr: "Personnalisée", en: "Custom"               },
];

function toPeriodParams(key: PeriodKey, from: string, to: string): StatPeriodParams {
  if (key === "custom") return { date_from: from, date_to: to };
  if (key === "7d" || key === "30d" || key === "90d") return { period: key };
  const days  = PERIODS.find((p) => p.key === key)?.days ?? 30;
  const toDay = new Date();
  const frDay = new Date();
  frDay.setDate(frDay.getDate() - days);
  return {
    date_from: frDay.toISOString().split("T")[0],
    date_to:   toDay.toISOString().split("T")[0],
  };
}

// ── Sous-composant carte feature ──────────────────────────────────────────────

interface FeatureCardProps {
  slug:    string;
  data:    FeatureStatData;
  locale:  string;
  primary: string;
  botId:   string | null;
}

function FeatureCard({ slug, data, locale, primary, botId }: FeatureCardProps) {
  const meta = FEATURES_MASTER_MAP.get(slug);
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug}
        </span>
      </div>
      <div className="p-4 space-y-4">
        <FeatureStatsSection slug={slug} data={data} hidden={false} />
        <StatsHistoriqueChart slug={slug} data={data} locale={locale} primaryColor={primary} />
        {/* Affiché uniquement si un bot est sélectionné — masqué en mode "tous les bots" */}
        <StatsRecentEntries slug={slug} botId={botId} locale={locale} primaryColor={primary} />
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function StatistiquesPage() {
  const { locale, dictionary: d } = useLanguage();
  const { theme }                 = useSector();
  const primary                   = theme?.primary ?? "var(--color-primary)";
  const t                         = d.stats;

  // Filtres
  const [period,    setPeriod]    = useState<PeriodKey>("30d");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [botId,     setBotId]     = useState<string | null>(null);

  // Données
  const [loading,   setLoading]   = useState(true);
  const [stats,     setStats]     = useState<DashboardStatsResponse | null>(null);
  const [bots,      setBots]      = useState<Bot[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Chargement liste bots (type Bot directement, pas BotPair)
  useEffect(() => {
    botsRepository.getList()
      .then((res) => setBots(res.results ?? []))
      .catch(() => {});
  }, []);

  // Chargement stats
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...toPeriodParams(period, dateFrom, dateTo),
        ...(botId ? { bot_id: botId } : {}),
      };
      const res = await dashboardStatsRepository.getStats(params);
      setStats(res);
      const slugs = Object.keys(res.features ?? {});
      if (slugs.length > 0 && (!activeTab || !slugs.includes(activeTab))) {
        setActiveTab(slugs[0]);
      }
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [period, dateFrom, dateTo, botId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadStats(); }, [loadStats]);

  const featureSlugs = Object.keys(stats?.features ?? {});

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">{t.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]
            bg-[var(--bg-card)] text-sm text-[var(--text-muted)] hover:text-[var(--text)]
            transition-all disabled:opacity-40"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          {t.refresh}
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Sélecteur bot — only whatsapp bots */}
        <select
          value={botId ?? ""}
          onChange={(e) => setBotId(e.target.value || null)}
          className="pl-3 pr-8 py-2 rounded-xl border border-[var(--border)]
            bg-[var(--bg-card)] text-sm text-[var(--text)] cursor-pointer
            hover:border-[var(--text-muted)] transition-colors focus:outline-none"
        >
          <option value="">{t.allBots}</option>
          {bots
            .filter((b) => b.bot_type === "whatsapp")
            .map((b) => (
              <option key={b.id} value={b.id}>{b.nom ?? b.id}</option>
            ))}
        </select>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Pills période */}
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                period === p.key
                  ? "text-white"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]",
              )}
              style={period === p.key ? { background: primary } : {}}
            >
              {locale === "fr" ? p.fr : p.en}
            </button>
          ))}
        </div>

        {/* Date picker custom */}
        {period === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                text-xs text-[var(--text)] focus:outline-none focus:border-[var(--text-muted)]"
            />
            <span className="text-xs text-[var(--text-muted)]">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                text-xs text-[var(--text)] focus:outline-none focus:border-[var(--text-muted)]"
            />
          </div>
        )}
      </div>

      {/* Tabs features */}
      {!loading && featureSlugs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {featureSlugs.map((slug) => {
            const meta   = FEATURES_MASTER_MAP.get(slug);
            const label  = meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug;
            const Icon   = meta?.icon;
            const active = activeTab === slug;
            return (
              <button
                key={slug}
                onClick={() => setActiveTab(slug)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                  active
                    ? "text-white shadow-sm"
                    : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]",
                )}
                style={active ? { background: primary } : {}}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="border-[var(--border)] border-t-[var(--color-primary)]" />
        </div>
      ) : !stats || featureSlugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <p className="text-sm font-bold text-[var(--text)]">{t.noStats}</p>
          <p className="text-xs text-[var(--text-muted)]">{t.noStatsHint}</p>
        </div>
      ) : activeTab && stats.features[activeTab] ? (
        <FeatureCard
          slug={activeTab}
          data={stats.features[activeTab]}
          locale={locale}
          primary={primary}
          botId={botId}
        />
      ) : null}

    </div>
  );
}