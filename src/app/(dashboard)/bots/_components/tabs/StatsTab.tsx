// src/app/(dashboard)/bots/_components/tabs/StatsTab.tsx
"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Mail, TrendingUp, BarChart2 } from "lucide-react";
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

    const dayConvs = conversations.filter((c) =>
      c.created_at?.startsWith(dateStr),
    );

    result.push({
      day: dayLabel,
      messages:     dayConvs.reduce((acc, c) => acc + c.nb_messages, 0),
      calls:        dayConvs.filter((c) => c.bot_type === "vocal").length,
      appointments: dayConvs.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
      emails:       dayConvs.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
      handoffs:     dayConvs.filter((c) => c.human_handoff).length,
    });
  }

  return result;
}

// ── Tooltip personnalisé (dark-mode safe) ─────────────────────────────────────
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
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
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

export function StatsTab({ conversations }: StatsTabProps) {
  const [periodFilter, setPeriodFilter]     = useState<number>(7);
  const [timeOffset, setTimeOffset]         = useState<number>(0);
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    messages: true, calls: true, appointments: true, emails: true, handoffs: true,
  });

  const toggleMetric = (id: MetricId) =>
    setVisibleMetrics((prev) => ({ ...prev, [id]: !prev[id] }));

  const weekData = useMemo(
    () => buildWeekData(conversations, periodFilter, timeOffset),
    [conversations, periodFilter, timeOffset],
  );

  const totals = useMemo(() => ({
    messages:     conversations.reduce((acc, c) => acc + c.nb_messages, 0),
    calls:        conversations.filter((c) => c.bot_type === "vocal").length,
    appointments: conversations.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
    emails:       conversations.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
    handoffs:     conversations.filter((c) => c.human_handoff).length,
  }), [conversations]);

  const donutData = METRIC_DEFS
    .filter((m) => visibleMetrics[m.id as MetricId])
    .map((m) => ({
      name:  m.label,
      value: totals[m.id as MetricId] || 0,
      color: m.color,
    }))
    .filter((d) => d.value > 0);

  const isEmpty = weekData.every((d) => d.messages === 0 && d.calls === 0);

  const axisStyle = {
    fontSize: 10,
    fill: "var(--text-muted)",
    fontFamily: "inherit",
  };

  return (
    <div className="space-y-5">

      {/* ── Contrôles ─────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl border border-[var(--border)]"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Métriques toggleables */}
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Afficher / Masquer les métriques
          </p>
          <div className="flex flex-wrap gap-2">
            {METRIC_DEFS.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMetric(m.id as MetricId)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-2",
                  visibleMetrics[m.id as MetricId]
                    ? "border-transparent shadow-sm"
                    : "opacity-40 grayscale border-dashed border-[var(--border)]",
                )}
                style={
                  visibleMetrics[m.id as MetricId]
                    ? { background: "var(--bg)", color: "var(--text)" }
                    : {}
                }
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span style={visibleMetrics[m.id as MetricId] ? { color: "var(--text)" } : {}}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation période */}
        <div className="flex items-center gap-2 lg:border-l border-[var(--border)] lg:pl-4">
          <div
            className="flex rounded-xl p-1 border border-[var(--border)]"
            style={{ background: "var(--bg)" }}
          >
            {[7, 30, 90].map((n) => (
              <button
                key={n}
                onClick={() => { setPeriodFilter(n); setTimeOffset(0); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200",
                  periodFilter === n
                    ? "text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={periodFilter === n ? { background: "#075E54" } : {}}
              >
                {n}J
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setTimeOffset((prev) => prev + 1)}
              className="p-2 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors"
              style={{ background: "var(--bg-card)" }}
            >
              <ChevronDown className="w-4 h-4 rotate-90 text-[var(--text)]" />
            </button>
            <button
              onClick={() => setTimeOffset((prev) => prev - 1)}
              disabled={timeOffset === 0}
              className="p-2 rounded-xl border border-[var(--border)] hover:border-[var(--text-muted)] disabled:opacity-30 transition-colors"
              style={{ background: "var(--bg-card)" }}
            >
              <ChevronDown className="w-4 h-4 -rotate-90 text-[var(--text)]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── AreaChart ─────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#075E54]" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text)]">
              Courbes d&apos;évolution
            </h3>
          </div>
          <Badge variant="slate">Vue Cumulative</Badge>
        </div>
        <div className="h-[250px]">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée sur cette période.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  {METRIC_DEFS.map((m) => (
                    <linearGradient key={m.id} id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={m.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                {METRIC_DEFS.map((m) =>
                  visibleMetrics[m.id as MetricId] && (
                    <Area
                      key={m.id}
                      type="monotone"
                      dataKey={m.id}
                      stroke={m.color}
                      fill={`url(#grad-${m.id})`}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ),
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BarChart ──────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#6C3CE1]/10 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-[#6C3CE1]" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text)]">
              Comparaison par volume
            </h3>
          </div>
          <Badge variant="slate">Vue en bandes</Badge>
        </div>
        <div className="h-[250px]">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg)] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée sur cette période.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.4 }} />
                {METRIC_DEFS.map((m) =>
                  visibleMetrics[m.id as MetricId] && (
                    <Bar
                      key={m.id}
                      dataKey={m.id}
                      fill={m.color}
                      radius={[4, 4, 0, 0]}
                      barSize={8}
                    />
                  ),
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Donut + compteur emails ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Donut */}
        <div className="card p-6 col-span-1 md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
            Répartition globale des actions
          </p>
          {donutData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg)] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)] italic">Aucune donnée disponible.</p>
            </div>
          ) : (
            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5 flex-1 min-w-[120px]">
                {METRIC_DEFS.map((m) =>
                  visibleMetrics[m.id as MetricId] && (
                    <div key={m.id} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-xs text-[var(--text-muted)] flex-1">{m.label}</span>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-lg"
                        style={{
                          background: `${m.color}18`,
                          color: m.color,
                        }}
                      >
                        {totals[m.id as MetricId]}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compteur emails */}
        <div
          className="card p-6 flex flex-col items-center justify-center text-center overflow-hidden relative"
          style={{ background: "var(--bg-card)" }}
        >
          {/* Glow déco */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-500 rounded-full blur-[40px] opacity-10 pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 shadow-lg relative z-10">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-1 relative z-10">
            Emails envoyés
          </p>
          <p
            className="text-5xl font-black relative z-10"
            style={{ color: "var(--text)" }}
          >
            {totals.emails}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold italic relative z-10">
            Total cumulé
          </p>
        </div>
      </div>
    </div>
  );
}