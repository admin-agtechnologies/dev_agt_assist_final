// src/app/(dashboard)/results/_components/TransfertHumainResultCard.tsx
"use client";

import { ArrowLeftRight, User } from "lucide-react";
import { useLanguage }           from "@/contexts/LanguageContext";
import { formatDateTime }        from "@/lib/utils";
import type { TransfertHumainResult } from "@/types/api/results.types";

const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  en_attente:     { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  pris_en_charge: { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
  resolu:         { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
};

interface Props { item: TransfertHumainResult }

export function TransfertHumainResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const vars  = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label = t.transfertStatuses[item.statut as keyof typeof t.transfertStatuses] ?? item.statut;

  return (
    <div className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
      hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
      transition-all duration-200 cursor-default">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icône amber — exception autorisée (couleur métier transfert humain) */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-transform duration-200 group-hover:scale-110"
            style={{
              background: "var(--status-amber-bg)",
              color:      "var(--status-amber-text)",
            }}
          >
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {item.contact_telephone}
            </p>
          </div>
        </div>

        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{ background: vars.bg, color: vars.text }}
        >
          {label}
        </span>
      </div>

      {/* ── Motif ── */}
      {item.motif && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {item.motif}
        </p>
      )}

      {/* ── Footer ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]
        flex flex-wrap items-center justify-between gap-2">
        {item.assigne_a_nom && (
          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <User className="w-3 h-3" />
            {t.assignedTo} {item.assigne_a_nom}
          </span>
        )}
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {formatDateTime(item.created_at)}
        </span>
      </div>
    </div>
  );
}