"use client";
// src/app/(dashboard)/dashboard/_components/DashboardHeroKPIs.tsx
// 4 KPI cards globaux du dashboard — branché sur /api/v1/dashboard/entreprise/.
// Remplace les anciens KpiCards.tsx (messages/appels hardcodés PME).
// S56 création — S57 fix cast d → d.dashboard.pme (accès direct).

import { MessageSquare, Zap, Users, TrendingUp } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import type { EntrepriseStats } from "@/types/api/stats.types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface DashboardHeroKPIsProps {
  stats: EntrepriseStats | null;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function DashboardHeroKPIs({ stats }: DashboardHeroKPIsProps) {
  const { theme }              = useSector();
  const { locale }             = useLanguage();
  // S57 fix — accès direct, pas de cast Record<string, Record<string, string>>
  const primary = theme?.primary ?? "var(--color-primary)";
  const accent  = theme?.accent  ?? "var(--color-accent)";

  const cards = [
    {
      label: locale === "fr" ? "Conversations (7j)" : "Conversations (7d)",
      value: stats?.conversations_semaine ?? 0,
      icon:  MessageSquare,
      color: primary,
    },
    {
      label: locale === "fr" ? "Actions déclenchées" : "Actions triggered",
      value: stats?.actions_declenchees_semaine ?? 0,
      icon:  Zap,
      color: accent,
    },
    {
      label: locale === "fr" ? "Nouveaux contacts" : "New contacts",
      value: stats?.nouveaux_contacts_semaine ?? 0,
      icon:  Users,
      color: "var(--status-success-text)",
    },
    {
      label: locale === "fr" ? "Taux résolution" : "Resolution rate",
      value: `${stats?.taux_resolution ?? 0} %`,
      icon:  TrendingUp,
      color: "var(--status-info-text)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest
                text-[var(--text-muted)] leading-tight">
                {card.label}
              </p>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color}18`, color: card.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[var(--text)]">
              {card.value}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {locale === "fr" ? "7 derniers jours" : "Last 7 days"}
            </p>
          </div>
        );
      })}
    </div>
  );
}