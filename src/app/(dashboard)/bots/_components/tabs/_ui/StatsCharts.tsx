"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/StatsCharts.tsx
// Rendu recharts : AreaChart, BarChart, PieChart + CustomTooltip.
// Présentation pure — zéro state, reçoit toutes les données calculées.

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";
import { METRIC_DEFS, type MetricId, type VisibleMetrics } from "../../bots.types";
import type { StatsDataPoint } from "../utils/statsData";

// ── CustomTooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl border border-[var(--border)] shadow-2xl p-3 min-w-[140px]"
      style={{ background: "var(--bg-card)" }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-[11px] text-[var(--text-muted)] capitalize">{entry.name}</span>
            </div>
            <span className="text-xs font-black text-[var(--text)]">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StatsChartsProps {
  weekData: StatsDataPoint[];
  visibleMetrics: VisibleMetrics;
  totals: Record<MetricId, number>;
  isEmpty: boolean;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function StatsCharts({ weekData, visibleMetrics, totals, isEmpty }: StatsChartsProps) {
  const axisStyle = { fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" };

  const donutData = METRIC_DEFS
    .filter(m => visibleMetrics[m.id as MetricId])
    .map(m => ({ name: m.label, value: totals[m.id as MetricId] || 0, color: m.color }))
    .filter(d => d.value > 0);

  if (isEmpty) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
        <BarChart2 className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-bold">Aucune donnée sur cette période</p>
        <p className="text-xs mt-1 opacity-60">Les statistiques apparaîtront dès la première conversation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── AreaChart — Messages & Appels ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            Messages & Appels
          </h4>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradMsg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#25D366" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6C3CE1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {visibleMetrics.messages && (
              <Area type="monotone" dataKey="messages" name="Messages"
                stroke="#25D366" strokeWidth={2} fill="url(#gradMsg)" dot={false} />
            )}
            {visibleMetrics.calls && (
              <Area type="monotone" dataKey="calls" name="Appels"
                stroke="#6C3CE1" strokeWidth={2} fill="url(#gradCall)" dot={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── BarChart — RDV, Emails, Transferts ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-[var(--text-muted)]" />
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            RDV, Emails & Transferts
          </h4>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {visibleMetrics.appointments && (
              <Bar dataKey="appointments" name="RDV"       fill="#F59E0B" radius={[4, 4, 0, 0]} />
            )}
            {visibleMetrics.emails && (
              <Bar dataKey="emails"       name="Emails"    fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            )}
            {visibleMetrics.handoffs && (
              <Bar dataKey="handoffs"     name="Transferts" fill="#EF4444" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── PieChart — répartition totale ── */}
      {donutData.length > 0 && (
        <div className="card p-5">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Répartition totale
          </h4>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                  paddingAngle={3} dataKey="value">
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {donutData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-[var(--text-muted)]">{entry.name}</span>
                  <span className="text-xs font-black text-[var(--text)] ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}