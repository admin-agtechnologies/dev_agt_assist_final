"use client";
// src/app/(dashboard)/bots/_components/tabs/StatsTab.tsx
// Tab Stats — Niveau 1 — Données réelles d'un bot (branché sur /api/v1/agent/bots/{id}/stats/).
// Filtres : 7j / 30j / 90j + date picker. Toggle masquage par module.
// S56 création — S57 fix cast d → d.bots (accès direct).

import { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, Eye, EyeOff, BarChart2 } from "lucide-react";
import { Spinner }             from "@/components/ui";
import { cn }                  from "@/lib/utils";
import { useLanguage }         from "@/contexts/LanguageContext";
import { useSector }           from "@/hooks/useSector";
import { botStatsRepository }  from "@/repositories/stats.repository";
import { FEATURES_MASTER_MAP } from "@/config/features-master-config";
import { FeatureStatsSection } from "@/app/(dashboard)/stats/_components/FeatureStatsSection";
import type { BotStatsResponse, StatPeriodParams } from "@/types/api/stats.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatsTabProps {
  botId: string;
  d:     ReturnType<typeof useLanguage>["dictionary"];
}

type Period = "7d" | "30d" | "90d";

const PERIODS: { key: Period; labelFr: string; labelEn: string }[] = [
  { key: "7d",  labelFr: "7 jours",  labelEn: "7 days"  },
  { key: "30d", labelFr: "30 jours", labelEn: "30 days" },
  { key: "90d", labelFr: "90 jours", labelEn: "90 days" },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export function StatsTab({ botId, d }: StatsTabProps) {
  const { locale }     = useLanguage();
  const { theme }      = useSector();
  // S57 fix — accès direct, pas de cast Record<string, Record<string, string>>
  const t              = d.bots;

  const [period,      setPeriod]      = useState<Period>("30d");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [showPicker,  setShowPicker]  = useState(false);
  const [stats,       setStats]       = useState<BotStatsResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [hiddenSlugs, setHiddenSlugs] = useState<Set<string>>(new Set());

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const params: StatPeriodParams = showPicker && dateFrom && dateTo
        ? { date_from: dateFrom, date_to: dateTo }
        : { period };
      const res = await botStatsRepository.getStats(botId, params);
      setStats(res);
    } finally {
      setLoading(false);
    }
  }, [botId, period, dateFrom, dateTo, showPicker]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Toggle masquage module ─────────────────────────────────────────────────

  const toggleHide = (slug: string) => {
    setHiddenSlugs((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  // ── Slugs à afficher (dans l'ordre du master) ──────────────────────────────

  const featureSlugs = stats
    ? Object.keys(stats.features).sort((a, b) => {
        const keys = Array.from(FEATURES_MASTER_MAP.keys());
        const ia   = keys.indexOf(a);
        const ib   = keys.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
    : [];

  const isEmpty = !loading && featureSlugs.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Barre filtres ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPeriod(p.key); setShowPicker(false); }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
              !showPicker && period === p.key
                ? "text-white border-transparent"
                : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]",
            )}
            style={!showPicker && period === p.key ? { background: theme?.primary } : {}}
          >
            {locale === "fr" ? p.labelFr : p.labelEn}
          </button>
        ))}

        <button
          onClick={() => setShowPicker((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
            showPicker ? "text-white border-transparent" : "text-[var(--text-muted)] border-[var(--border)]",
          )}
          style={showPicker ? { background: theme?.primary } : {}}
        >
          <Calendar className="w-3.5 h-3.5" />
          {locale === "fr" ? "Personnalisé" : "Custom"}
        </button>

        <button onClick={fetchStats} className="ml-auto p-1.5 rounded-xl hover:bg-[var(--bg-card)] text-[var(--text-muted)]">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Date picker */}
      {showPicker && (
        <div className="flex gap-2 items-center flex-wrap px-1">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="input-base text-xs px-2 py-1.5 rounded-xl" />
          <span className="text-xs text-[var(--text-muted)]">→</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="input-base text-xs px-2 py-1.5 rounded-xl" />
          <button
            onClick={fetchStats}
            disabled={!dateFrom || !dateTo}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-all"
            style={{ background: theme?.primary }}
          >
            OK
          </button>
        </div>
      )}

      {/* ── Contenu ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center py-12 text-[var(--text-muted)]">
          <BarChart2 className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-bold">
            {locale === "fr" ? "Aucune statistique sur cette période" : "No stats for this period"}
          </p>
          <p className="text-xs mt-1 opacity-60">
            {locale === "fr"
              ? "Les stats apparaîtront dès que le bot aura traité des conversations."
              : "Stats will appear once the bot processes conversations."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {featureSlugs.map((slug) => {
            const isHidden = hiddenSlugs.has(slug);
            const meta     = FEATURES_MASTER_MAP.get(slug);
            return (
              <div key={slug}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug}
                  </span>
                  <button
                    onClick={() => toggleHide(slug)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    title={isHidden
                      ? (locale === "fr" ? "Afficher" : "Show")
                      : (locale === "fr" ? "Masquer" : "Hide")}
                  >
                    {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <FeatureStatsSection
                  slug={slug}
                  data={stats!.features[slug]}
                  hidden={isHidden}
                />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}