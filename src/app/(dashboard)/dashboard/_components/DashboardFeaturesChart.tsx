"use client";
// src/app/(dashboard)/dashboard/_components/DashboardFeaturesChart.tsx
// AreaChart multi-features — une ligne par feature active, filtre 7j/30j/90j.
// Branché sur GET /api/v1/dashboard/stats/.
// Clic → redirect /statistiques.
// S63 — création.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSector }                from "@/hooks/useSector";
import { useLanguage }              from "@/contexts/LanguageContext";
import { dashboardStatsRepository } from "@/repositories/stats.repository";
import { FEATURES_MASTER_MAP }      from "@/config/features-master-config";
import { cn }                       from "@/lib/utils";
import type { FeatureStatData, HistoriquePoint } from "@/types/api/stats.types";

// ── Palette couleurs par index feature ───────────────────────────────────────
const PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

type PeriodKey = "7d" | "30d" | "90d";

const PERIODS: { key: PeriodKey; fr: string; en: string }[] = [
  { key: "7d",  fr: "7 jours",  en: "7 days"  },
  { key: "30d", fr: "30 jours", en: "30 days" },
  { key: "90d", fr: "3 mois",   en: "3 months"},
];

// ── Helper : extraire historique d'une feature ────────────────────────────────
function extractHistorique(data: FeatureStatData): HistoriquePoint[] {
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.historique)) return d.historique as HistoriquePoint[];
  return [];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  featuresActives: string[];
}

// ── Composant ─────────────────────────────────────────────────────────────────
export function DashboardFeaturesChart({ featuresActives }: Props) {
  const router     = useRouter();
  const { theme }  = useSector();
  const { locale } = useLanguage();
  const primary    = theme?.primary ?? "#6366f1";

  const [period,  setPeriod]  = useState<PeriodKey>("30d");
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState<Record<string, number>[]>([]);
  const [labels,  setLabels]  = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardStatsRepository.getStats({ period });
      const features = res.features ?? {};

      // Collecter toutes les dates uniques
      const dateSet = new Set<string>();
      Object.values(features).forEach((fd) => {
        extractHistorique(fd).forEach((pt) => dateSet.add(pt.date));
      });
      const dates = Array.from(dateSet).sort();

      // Construire les séries
      const activeFeatures = featuresActives
        .filter((slug) => features[slug] && extractHistorique(features[slug]).length > 0)
        .slice(0, 6); // max 6 lignes

      setLabels(activeFeatures);

      const rows = dates.map((date) => {
        const row: Record<string, unknown> = { date: date.slice(5) }; // MM-DD
        activeFeatures.forEach((slug) => {
          const hist = extractHistorique(features[slug]);
          const pt   = hist.find((p) => p.date === date);
          row[slug]  = pt?.valeur ?? 0;
        });
        return row as Record<string, number>;
      });

      setData(rows);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period, featuresActives]);

  useEffect(() => { load(); }, [load]);

  const axisStyle = { fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" };

  const getLabel = (slug: string) => {
    const meta = FEATURES_MASTER_MAP.get(slug);
    return meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug;
  };

  if (!loading && data.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {locale === "fr" ? "Activité par feature" : "Activity by feature"}
        </p>
        <div className="flex items-center gap-2">
          {/* Pills période */}
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                  period === p.key
                    ? "text-white"
                    : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]",
                )}
                style={period === p.key ? { background: primary } : {}}
              >
                {locale === "fr" ? p.fr : p.en}
              </button>
            ))}
          </div>
          {/* Lien statistiques */}
          <button
            onClick={() => router.push("/statistiques")}
            className="flex items-center gap-1 text-[10px] font-bold hover:opacity-75 transition-opacity"
            style={{ color: primary }}
          >
            {locale === "fr" ? "Détail" : "Details"}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              {labels.map((slug, i) => (
                <linearGradient key={slug} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 11,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              formatter={(value) => getLabel(value)}
            />
            {labels.map((slug, i) => (
              <Area
                key={slug}
                type="monotone"
                dataKey={slug}
                name={slug}
                stroke={PALETTE[i % PALETTE.length]}
                fill={`url(#grad-${i})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}