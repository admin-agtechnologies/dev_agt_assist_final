"use client";
// src/app/(dashboard)/bots/_components/tabs/StatsTab.tsx
// Tab Stats — Niveau 1 — Refonte S62.
// Filtres : Aujourd'hui / 7j / 30j / 3m / 6m / 1an / Personnalisée
// Par feature : KPIs + AreaChart historique + BarChart semaines + 3 entrées + lien résultats
// S56 création — S57 fix — S62 refonte

import { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Spinner }              from "@/components/ui";
import { cn }                   from "@/lib/utils";
import { useLanguage }          from "@/contexts/LanguageContext";
import { useSector }            from "@/hooks/useSector";
import { botStatsRepository }   from "@/repositories/stats.repository";
import { FEATURES_MASTER_MAP }  from "@/config/features-master-config";
import { FeatureStatsSection }  from "@/app/(dashboard)/stats/_components/FeatureStatsSection";
import { StatsHistoriqueChart } from "./stats/StatsHistoriqueChart";
import { StatsRecentEntries }   from "./stats/StatsRecentEntries";
import type { BotStatsResponse, FeatureStatData, StatPeriodParams } from "@/types/api/stats.types";

// ── Types & config période ─────────────────────────────────────────────────────

interface StatsTabProps {
  botId: string;
  d:     ReturnType<typeof useLanguage>["dictionary"];
}

type PeriodKey = "1d" | "7d" | "30d" | "90d" | "180d" | "365d" | "custom";

const PERIODS: { key: PeriodKey; fr: string; en: string; days?: number }[] = [
  { key: "1d",    fr: "Aujourd'hui",  en: "Today",    days: 1   },
  { key: "7d",    fr: "7 jours",      en: "7 days",   days: 7   },
  { key: "30d",   fr: "30 jours",     en: "30 days",  days: 30  },
  { key: "90d",   fr: "3 mois",       en: "3 months", days: 90  },
  { key: "180d",  fr: "6 mois",       en: "6 months", days: 180 },
  { key: "365d",  fr: "1 an",         en: "1 year",   days: 365 },
  { key: "custom",fr: "Personnalisée",en: "Custom"              },
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

// ── Sous-composant : carte d'une feature ──────────────────────────────────────

interface FeatureCardProps {
  slug:     string;
  data:     FeatureStatData;
  botId:    string;
  locale:   string;
  primary:  string;
  hidden:   boolean;
  onToggle: () => void;
}

function FeatureCard({ slug, data, botId, locale, primary, hidden, onToggle }: FeatureCardProps) {
  const meta = FEATURES_MASTER_MAP.get(slug);
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug}
        </span>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          title={hidden
            ? (locale === "fr" ? "Afficher" : "Show")
            : (locale === "fr" ? "Masquer" : "Hide")}
        >
          {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
      {/* Corps */}
      {!hidden && (
        <div className="p-4 space-y-4">
          <FeatureStatsSection slug={slug} data={data} hidden={false} />
          <StatsHistoriqueChart slug={slug} data={data} locale={locale} primaryColor={primary} />
          <StatsRecentEntries   slug={slug} botId={botId} locale={locale} primaryColor={primary} />
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function StatsTab({ botId, d }: StatsTabProps) {
  const { locale } = useLanguage();
  const { theme }  = useSector();
  const primary    = theme?.primary ?? "var(--primary)";

  // Silence TS — d est passé par BotPairDetailPanel mais non utilisé ici directement
  void d;

  const [period,      setPeriod]      = useState<PeriodKey>("30d");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [stats,       setStats]       = useState<BotStatsResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [hiddenSlugs, setHiddenSlugs] = useState<Set<string>>(new Set());

  const fetchStats = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      setStats(await botStatsRepository.getStats(botId, toPeriodParams(period, dateFrom, dateTo)));
    } finally {
      setLoading(false);
    }
  }, [botId, period, dateFrom, dateTo]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const toggleHide = (slug: string) =>
    setHiddenSlugs((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const featureSlugs = stats
    ? Object.keys(stats.features).sort((a, b) => {
        const keys = Array.from(FEATURES_MASTER_MAP.keys());
        const ia   = keys.indexOf(a);
        const ib   = keys.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
    : [];

  return (
    <div className="space-y-4">

      {/* ── Filtres période ── */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap",
              period === p.key
                ? "text-white border-transparent"
                : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]",
            )}
            style={period === p.key ? { background: primary } : {}}
          >
            {p.key === "custom" && <Calendar className="w-3.5 h-3.5" />}
            {locale === "fr" ? p.fr : p.en}
          </button>
        ))}
        <button
          onClick={fetchStats}
          disabled={loading}
          className="ml-auto p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40 transition-all"
          title={locale === "fr" ? "Actualiser" : "Refresh"}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {/* ── Date picker personnalisée ── */}
      {period === "custom" && (
        <div className="flex flex-wrap gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
          {(["from", "to"] as const).map((dir) => (
            <div key={dir} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {dir === "from"
                  ? (locale === "fr" ? "Du" : "From")
                  : (locale === "fr" ? "Au" : "To")}
              </label>
              <input
                type="date"
                value={dir === "from" ? dateFrom : dateTo}
                onChange={(e) =>
                  dir === "from" ? setDateFrom(e.target.value) : setDateTo(e.target.value)
                }
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs text-[var(--text)] focus:outline-none"
              />
            </div>
          ))}
          <button
            onClick={fetchStats}
            disabled={!dateFrom || !dateTo}
            className="self-end px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-all"
            style={{ background: primary }}
          >
            {locale === "fr" ? "Appliquer" : "Apply"}
          </button>
        </div>
      )}

      {/* ── Contenu ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : featureSlugs.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
          <p className="text-sm font-bold">
            {locale === "fr"
              ? "Aucune activité sur cette période."
              : "No activity for this period."}
          </p>
          <p className="text-xs mt-1 opacity-60">
            {locale === "fr"
              ? "Les statistiques apparaîtront dès que le bot aura traité des conversations."
              : "Stats will appear once the bot processes conversations."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {featureSlugs.map((slug) => (
            <FeatureCard
              key={slug}
              slug={slug}
              data={stats!.features[slug]}
              botId={botId}
              locale={locale}
              primary={primary}
              hidden={hiddenSlugs.has(slug)}
              onToggle={() => toggleHide(slug)}
            />
          ))}
        </div>
      )}

    </div>
  );
}