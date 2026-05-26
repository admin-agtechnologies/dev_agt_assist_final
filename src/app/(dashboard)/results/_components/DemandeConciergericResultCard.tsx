// src/app/(dashboard)/results/_components/DemandeConciergericResultCard.tsx
"use client";

import { Bell, Clock, User } from "lucide-react";
import { useLanguage }        from "@/contexts/LanguageContext";
import { formatDateTime }     from "@/lib/utils";
import type { DemandeConciergerieResult } from "@/types/api/results.types";

const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  recue:           { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
  prise_en_charge: { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  en_cours:        { bg: "var(--status-purple-bg)",  text: "var(--status-purple-text)"  },
  effectuee:       { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
  annulee:         { bg: "var(--status-danger-bg)",  text: "var(--status-danger-text)"  },
};

interface Props { item: DemandeConciergerieResult }

export function DemandeConciergericResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const vars  = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label = t.conciergStatuses[item.statut as keyof typeof t.conciergStatuses] ?? item.statut;

  return (
    <div className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
      hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
      transition-all duration-200 cursor-default">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-transform duration-200 group-hover:scale-110"
            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
          >
            <Bell className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {item.service_nom}
              {item.chambre && ` · ${t.room} ${item.chambre}`}
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

      {/* ── Notes client ── */}
      {item.notes_client && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-1 italic">
          {item.notes_client}
        </p>
      )}

      {/* ── Footer ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]
        flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-muted)]">
        {item.heure_souhaitee && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(item.heure_souhaitee)}
          </span>
        )}
        {item.pris_en_charge_nom && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {t.assignedTo} {item.pris_en_charge_nom}
          </span>
        )}
        {!item.heure_souhaitee && !item.pris_en_charge_nom && (
          <span>{formatDateTime(item.created_at)}</span>
        )}
      </div>
    </div>
  );
}