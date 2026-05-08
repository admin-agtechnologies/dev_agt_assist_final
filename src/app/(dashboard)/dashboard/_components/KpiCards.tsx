// src/app/pme/dashboard/_components/KpiCards.tsx
"use client";
import { MessageSquare, Phone, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TenantStats } from "@/types/api";

interface Props {
  stats: TenantStats | null;
  labels: {
    messagesToday: string;
    callsToday: string;
    appointmentsToday: string;
    thisWeek: string;
  };
}

export function KpiCards({ stats, labels }: Props) {
  const cards = [
    {
      label: labels.messagesToday,
      value: stats?.messages_aujourdhui ?? 0,
      week: stats?.messages_semaine ?? 0,
      icon: MessageSquare,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10",
    },
    {
      label: labels.callsToday,
      value: stats?.appels_aujourdhui ?? 0,
      week: null,
      icon: Phone,
      color: "text-[#6C3CE1]",
      bg: "bg-[#6C3CE1]/10",
    },
    {
      label: labels.appointmentsToday,
      value: stats?.rdv_aujourdhui ?? 0,
      week: stats?.rdv_semaine ?? 0,
      icon: CalendarDays,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", card.bg)}>
                <Icon className={cn("w-5 h-5", card.color)} strokeWidth={2} />
              </div>
              <span className={cn("text-3xl font-black", card.color)}>{card.value}</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{card.label}</p>
            {card.week !== null && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {labels.thisWeek} : <span className="font-bold">{card.week}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}