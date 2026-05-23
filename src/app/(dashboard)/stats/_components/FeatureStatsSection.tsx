"use client";
// src/app/(dashboard)/stats/_components/FeatureStatsSection.tsx
// Composant partagé N1 (/bots tab Stats) + N2 (page /statistiques).
// Reçoit un slug + des données brutes → lit STATS_FEATURE_CONFIG[slug]
// → rend les KPIs + le graphe définis dans la config.
// JAMAIS de if/switch sur le slug dans ce composant.
// S56 création — S57 fix cast d.stats.

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLanguage }         from "@/contexts/LanguageContext";
import { useSector }           from "@/hooks/useSector";
import { FEATURES_MASTER_MAP } from "@/config/features-master-config";
import {
  getFeatureStatsConfig,
  type FeatureStatsConfig,
} from "../_config/stats-feature-config";
import type { FeatureStatData } from "@/types/api/stats.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeatureStatsSectionProps {
  slug:    string;
  data:    FeatureStatData;
  hidden?: boolean;
}

// ── Helpers formatage ─────────────────────────────────────────────────────────

function fmt(value: unknown, format: "number" | "percent" | "currency"): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (isNaN(n)) return String(value);
  if (format === "percent")  return `${n.toFixed(1)} %`;
  if (format === "currency") return `${n.toLocaleString("fr-FR")} XAF`;
  return n.toLocaleString("fr-FR");
}

// ── Tooltip recharts ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { color: string; name: string; value: number }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[var(--border)] shadow-xl p-3 min-w-[130px]"
      style={{ background: "var(--bg-card)" }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
        {label}
      </p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-[11px] text-[var(--text-muted)]">{e.name}</span>
          </div>
          <span className="text-xs font-black text-[var(--text)]">{e.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Rendu graphe ──────────────────────────────────────────────────────────────

function FeatureChart({
  config, data, color,
}: {
  config: FeatureStatsConfig["chart"];
  data:   FeatureStatData;
  color:  string;
}) {
  const axisStyle = { fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" };
  const raw = (data as Record<string, unknown>)[config?.dataKey ?? ""];

  if (!config || !raw) return null;

  // Area — séries temporelles
  if (config.type === "area" && Array.isArray(raw)) {
    const series = raw as { date?: string; count?: number; [k: string]: unknown }[];
    return (
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={series} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey={config.valueKey ?? "count"}
            stroke={color}
            fill={`${color}22`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Bar — top questions / par statut liste
  if (config.type === "bar" && Array.isArray(raw)) {
    const bars = raw as { [k: string]: unknown }[];
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={bars} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" tick={axisStyle} />
          <YAxis type="category"
            dataKey={config.dataKey === "top_questions" ? "question_faq__question_fr" : "name"}
            tick={{ ...axisStyle, width: 80 }}
            width={80}
            tickFormatter={(v: string) => v.length > 13 ? v.slice(0, 13) + "…" : v}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey={config.valueKey ?? "value"} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Donut — par_statut objet
  if (config.type === "donut" && raw && typeof raw === "object" && !Array.isArray(raw)) {
    const entries = Object.entries(raw as Record<string, number>)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
    if (!entries.length) return null;
    const RAMP = [color, "var(--status-amber-text)", "var(--status-danger-text)", "var(--text-muted)"];
    return (
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie data={entries} cx="50%" cy="50%" innerRadius={30} outerRadius={50}
            dataKey="value" nameKey="name">
            {entries.map((_, i) => (
              <Cell key={i} fill={RAMP[i % RAMP.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

// ── Composant principal ───────────────────────────────────────────────────────

export function FeatureStatsSection({ slug, data, hidden }: FeatureStatsSectionProps) {
  const { locale, dictionary: d } = useLanguage();
  const { theme }                 = useSector();
  const meta                      = useMemo(() => FEATURES_MASTER_MAP.get(slug), [slug]);
  const config                    = useMemo(() => getFeatureStatsConfig(slug), [slug]);

  if (hidden || !config || !meta) return null;

  const Icon  = meta.icon;
  const label = locale === "fr" ? meta.label.fr : meta.label.en;
  // S57 fix — accès direct d.stats puis cast pour lookup dynamique sur les clés KPI
  const t     = d.stats as unknown as Record<string, string>;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 space-y-4">
      {/* ── Header feature ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${config.color}18`, color: config.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm font-bold text-[var(--text)]">{label}</p>
      </div>

      {/* ── KPIs ── */}
      <div className={`grid gap-3 ${config.kpis.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {config.kpis.map((kpi) => {
          const raw = (data as Record<string, unknown>)[kpi.key];
          return (
            <div key={kpi.key}
              className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1 truncate">
                {t[kpi.labelKey] ?? kpi.labelKey}
              </p>
              <p className="text-xl font-black" style={{ color: kpi.color }}>
                {fmt(raw, kpi.format)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Graphe ── */}
      {config.chart && (
        <FeatureChart config={config.chart} data={data} color={config.color} />
      )}
    </div>
  );
}