"use client";
// src/app/(dashboard)/bots/_components/tabs/stats/StatsHistoriqueChart.tsx
// AreaChart volume/jour (historique backend S61) + BarChart comparaison 2 semaines.
// S62 — création.

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FeatureStatData, HistoriquePoint } from "@/types/api/stats.types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  slug:         string;
  data:         FeatureStatData;
  locale:       string;
  primaryColor: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractHistorique(data: FeatureStatData): HistoriquePoint[] {
  const d = data as Record<string, unknown>;
  // Clé standard S61
  if (Array.isArray(d.historique)) return d.historique as HistoriquePoint[];
  // Fallback chatbot_whatsapp : series [{date, count}]
  if (Array.isArray(d.series)) {
    return (d.series as { date: string; count: number }[]).map((s) => ({
      date:   s.date,
      valeur: s.count,
    }));
  }
  return [];
}

function fmtDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "fr" ? "fr-FR" : "en-US",
      { day: "2-digit", month: "short" },
    );
  } catch {
    return dateStr;
  }
}

function buildWeekComparison(
  historique: HistoriquePoint[],
  locale: string,
): { label: string; semainePrecedente: number; semaineActuelle: number }[] {
  if (historique.length < 2) return [];
  const today = new Date();
  const DAYS  = locale === "fr"
    ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d0 = new Date(today); d0.setDate(today.getDate() - (6 - i));
    const d1 = new Date(today); d1.setDate(today.getDate() - (6 - i) - 7);
    const s0 = d0.toISOString().split("T")[0];
    const s1 = d1.toISOString().split("T")[0];
    return {
      label:             DAYS[d0.getDay()],
      semaineActuelle:   historique.find((h) => h.date === s0)?.valeur ?? 0,
      semainePrecedente: historique.find((h) => h.date === s1)?.valeur ?? 0,
    };
  });
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { color: string; name: string; value: number }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-[var(--border)] shadow-xl p-2.5 min-w-[120px]"
      style={{ background: "var(--bg-card)" }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
        {label}
      </p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-[10px] text-[var(--text-muted)]">{e.name}</span>
          </div>
          <span className="text-xs font-black text-[var(--text)]">{e.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function StatsHistoriqueChart({ data, locale, primaryColor }: Props) {
  const historique = useMemo(() => extractHistorique(data), [data]);
  const areaData   = useMemo(
    () => historique.map((h) => ({ date: fmtDate(h.date, locale), valeur: h.valeur })),
    [historique, locale],
  );
  const weekComp = useMemo(() => buildWeekComparison(historique, locale), [historique, locale]);
  const axisStyle = { fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" };

  if (historique.length === 0) return null;

  const labelVolume  = locale === "fr" ? "Volume / jour"    : "Volume / day";
  const labelCurrent = locale === "fr" ? "Cette semaine"    : "This week";
  const labelPrev    = locale === "fr" ? "Semaine préc."    : "Prev. week";
  const labelComp    = locale === "fr" ? "Comparaison semaines" : "Week comparison";

  return (
    <div className="space-y-4">

      {/* ── AreaChart volume / jour ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
          {labelVolume}
        </p>
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={areaData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="grad-hist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={primaryColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="valeur"
              name={labelVolume}
              stroke={primaryColor}
              fill="url(#grad-hist)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── BarChart comparaison semaines ── */}
      {weekComp.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
            {labelComp}
          </p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={weekComp} barSize={8} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="semainePrecedente" name={labelPrev}    fill="var(--text-muted)" fillOpacity={0.4} radius={[3,3,0,0]} />
              <Bar dataKey="semaineActuelle"   name={labelCurrent} fill={primaryColor}       radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}