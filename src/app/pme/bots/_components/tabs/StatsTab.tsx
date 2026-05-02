// src/app/pme/bots/_components/tabs/StatsTab.tsx
"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Conversation } from "@/types/api";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { METRIC_DEFS, type MetricId, type VisibleMetrics } from "../bots.types";

interface StatsTabProps {
  conversations: Conversation[];
  d: ReturnType<typeof useLanguage>["dictionary"];
}

// ── Génère les données par jour depuis les conversations réelles ──────────────
function buildWeekData(conversations: Conversation[], days: number, offsetDays: number) {
  const JOURS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i - offsetDays * days);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = JOURS_FR[d.getDay()];

    const dayConvs = conversations.filter(c =>
      c.created_at?.startsWith(dateStr)
    );

    result.push({
      day: dayLabel,
      messages:     dayConvs.reduce((acc, c) => acc + c.nb_messages, 0),
      calls:        dayConvs.filter(c => c.bot_type === "vocal").length,
      appointments: dayConvs.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
      emails:       dayConvs.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
      handoffs:     dayConvs.filter(c => c.human_handoff).length,
    });
  }

  return result;
}

export function StatsTab({ conversations }: StatsTabProps) {
  const [periodFilter, setPeriodFilter]     = useState<number>(7);
  const [timeOffset, setTimeOffset]         = useState<number>(0);
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    messages: true, calls: true, appointments: true, emails: true, handoffs: true,
  });

  const toggleMetric = (id: MetricId) =>
    setVisibleMetrics(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Données réelles calculées depuis les conversations ────────────────────
  const weekData = useMemo(
    () => buildWeekData(conversations, periodFilter, timeOffset),
    [conversations, periodFilter, timeOffset]
  );

  // ── Totaux pour le donut et le compteur emails ────────────────────────────
  const totals = useMemo(() => ({
    messages:     conversations.reduce((acc, c) => acc + c.nb_messages, 0),
    calls:        conversations.filter(c => c.bot_type === "vocal").length,
    appointments: conversations.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
    emails:       conversations.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
    handoffs:     conversations.filter(c => c.human_handoff).length,
  }), [conversations]);

  // ── Données donut ─────────────────────────────────────────────────────────
  const donutData = METRIC_DEFS
    .filter(m => visibleMetrics[m.id as MetricId])
    .map(m => ({
      name:  m.label,
      value: totals[m.id as MetricId] || 0,
      color: m.color,
    }))
    .filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Contrôles ── */}
      <div className="flex flex-col lg:flex-row gap-4 bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Afficher / Masquer les métriques
          </p>
          <div className="flex flex-wrap gap-2">
            {METRIC_DEFS.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMetric(m.id as MetricId)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                  visibleMetrics[m.id as MetricId]
                    ? "bg-white border-transparent shadow-sm shadow-black/5"
                    : "opacity-40 grayscale border-dashed border-[var(--border)]",
                )}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
          <div className="flex bg-[var(--bg-card)] rounded-xl p-1 border border-[var(--border)]">
            {[7, 30, 90].map(n => (
              <button key={n} onClick={() => { setPeriodFilter(n); setTimeOffset(0); }}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                  periodFilter === n ? "bg-[#075E54] text-white" : "text-[var(--text-muted)]",
                )}>
                {n}J
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setTimeOffset(prev => prev + 1)}
              className="p-2 bg-white rounded-xl border border-[var(--border)]">
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <button onClick={() => setTimeOffset(prev => prev - 1)}
              disabled={timeOffset === 0}
              className="p-2 bg-white rounded-xl border border-[var(--border)] disabled:opacity-30">
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* ── AreaChart ── */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-tight">Courbes d&apos;évolution</h3>
          <Badge variant="slate">Vue Cumulative</Badge>
        </div>
        <div className="h-[250px]">
          {weekData.every(d => d.messages === 0 && d.calls === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée sur cette période.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                {METRIC_DEFS.map(m => visibleMetrics[m.id as MetricId] && (
                  <Area key={m.id} type="monotone" dataKey={m.id}
                    stroke={m.color} fill={m.color} fillOpacity={0.1} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BarChart ── */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-tight">Comparaison par volume</h3>
          <Badge variant="slate">Vue en bandes</Badge>
        </div>
        <div className="h-[250px]">
          {weekData.every(d => d.messages === 0 && d.calls === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée sur cette période.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                {METRIC_DEFS.map(m => visibleMetrics[m.id as MetricId] && (
                  <Bar key={m.id} dataKey={m.id} fill={m.color} radius={[4, 4, 0, 0]} barSize={8} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Donut + Email ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 col-span-1 md:col-span-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Répartition globale des actions
          </h3>
          {donutData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée disponible.</p>
            </div>
          ) : (
            <div className="flex items-center justify-around">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none" }}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {METRIC_DEFS.map(m => visibleMetrics[m.id as MetricId] && (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-xs font-bold text-[var(--text)]">{m.label}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">
                      {totals[m.id as MetricId]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compteur emails réel */}
        <div className="card p-6 flex flex-col items-center justify-center text-center bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-800">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-sky-200">
            <Globe className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Emails envoyés</p>
          <p className="text-5xl font-black text-sky-900 dark:text-sky-100">{totals.emails}</p>
          <p className="text-[10px] text-sky-600/70 mt-2 font-bold italic">Total cumulé</p>
        </div>
      </div>
    </div>
  );
}