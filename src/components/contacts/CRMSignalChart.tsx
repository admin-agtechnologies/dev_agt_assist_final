// src/components/contacts/CRMSignalChart.tsx
"use client";

import React from "react";
import { Calendar, MessageSquare } from "lucide-react";

interface CRMSignalChartProps {
  rdvCount: number;
  conversationCount: number;
  /** Labels — viennent du dictionnaire appelant */
  labels: {
    rdvCount: string;
    conversationCount: string;
  };
}

interface SignalBarProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  max: number;
}

function SignalBar({ icon, label, value, color, max }: SignalBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-bold text-gray-800">{value}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

export function CRMSignalChart({
  rdvCount,
  conversationCount,
  labels,
}: CRMSignalChartProps) {
  const max = Math.max(rdvCount, conversationCount, 1);

  return (
    <div className="space-y-3">
      <SignalBar
        icon={<Calendar size={14} style={{ color: "var(--color-primary)" }} />}
        label={labels.rdvCount}
        value={rdvCount}
        color="var(--color-primary)"
        max={max}
      />
      <SignalBar
        icon={<MessageSquare size={14} style={{ color: "var(--color-accent)" }} />}
        label={labels.conversationCount}
        value={conversationCount}
        color="var(--color-accent)"
        max={max}
      />
    </div>
  );
}