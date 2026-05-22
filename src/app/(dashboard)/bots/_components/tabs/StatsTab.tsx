"use client";
// src/app/(dashboard)/bots/_components/tabs/StatsTab.tsx
// Orchestration : state filtres, calcul totaux, layout.
// Charts → _ui/StatsCharts.tsx · Calculs → utils/statsData.ts

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Conversation } from "@/types/api";
import { METRIC_DEFS, type MetricId, type VisibleMetrics } from "../bots.types";
import { buildWeekData } from "./utils/statsData";
import { StatsCharts } from "./_ui/StatsCharts";

interface StatsTabProps {
  conversations: Conversation[];
  d: ReturnType<typeof useLanguage>["dictionary"];
}

export function StatsTab({ conversations }: StatsTabProps) {
  const [periodFilter, setPeriodFilter]     = useState<number>(7);
  const [timeOffset, setTimeOffset]         = useState<number>(0);
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    messages: true, calls: true, appointments: true, emails: true, handoffs: true,
  });

  const toggleMetric = (id: MetricId) =>
    setVisibleMetrics(prev => ({ ...prev, [id]: !prev[id] }));

  const weekData = useMemo(
    () => buildWeekData(conversations, periodFilter, timeOffset),
    [conversations, periodFilter, timeOffset],
  );

  const totals = useMemo(() => ({
    messages:     conversations.reduce((acc, c) => acc + c.nb_messages, 0),
    calls:        conversations.filter(c => c.bot_type === "vocal").length,
    appointments: conversations.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
    emails:       conversations.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
    handoffs:     conversations.filter(c => c.human_handoff).length,
  }), [conversations]);

  const isEmpty = weekData.every(d => d.messages === 0 && d.calls === 0);

  return (
    <div className="space-y-4">

      {/* ── Filtres période ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[7, 14, 30].map(n => (
          <button
            key={n}
            onClick={() => { setPeriodFilter(n); setTimeOffset(0); }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              periodFilter === n
                ? "bg-[var(--text)] text-[var(--bg)]"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]",
            )}
          >
            {n}j
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setTimeOffset(o => o + 1)}
            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-90 text-[var(--text-muted)]" />
          </button>
          <button
            disabled={timeOffset === 0}
            onClick={() => setTimeOffset(o => o - 1)}
            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card)] transition-colors disabled:opacity-30"
          >
            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* ── Filtres métriques ── */}
      <div className="flex gap-1.5 flex-wrap">
        {METRIC_DEFS.map(m => (
          <button
            key={m.id}
            onClick={() => toggleMetric(m.id as MetricId)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all",
              visibleMetrics[m.id as MetricId]
                ? "border-transparent text-white"
                : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-card)]",
            )}
            style={visibleMetrics[m.id as MetricId] ? { backgroundColor: m.color } : {}}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: visibleMetrics[m.id as MetricId] ? "white" : m.color }}
            />
            {m.label}
            <Badge variant="slate" className="ml-0.5 text-[9px]">
              {totals[m.id as MetricId]}
            </Badge>
          </button>
        ))}
      </div>

      {/* ── Charts ── */}
      <StatsCharts
        weekData={weekData}
        visibleMetrics={visibleMetrics}
        totals={totals}
        isEmpty={isEmpty}
      />
    </div>
  );
}