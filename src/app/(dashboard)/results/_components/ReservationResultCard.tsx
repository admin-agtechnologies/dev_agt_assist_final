// src/app/(dashboard)/results/_components/ReservationResultCard.tsx
"use client";

import { Calendar, Clock, User } from "lucide-react";
import { useLanguage }            from "@/contexts/LanguageContext";
import { formatDateTime }         from "@/lib/utils";
import type { Reservation }       from "@/types/api/reservation.types";

const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  confirmee:               { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
  en_attente:              { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  en_attente_confirmation: { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
  terminee:                { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" },
  annulee:                 { bg: "var(--status-danger-bg)",  text: "var(--status-danger-text)"  },
};

interface Props { item: Reservation }

export function ReservationResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const statuses = d.reservations.detail.statuses;

  const vars  = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label = statuses[item.statut as keyof typeof statuses] ?? item.statut;

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
            <User className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {item.contact_phone}
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

      {/* ── Dates ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]
        grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
          <span className="truncate">{formatDateTime(item.date_debut)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
          <span className="truncate">{formatDateTime(item.date_fin)}</span>
        </div>
      </div>

      {/* ── Notes ── */}
      {item.notes && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-1 italic">
          {item.notes}
        </p>
      )}
    </div>
  );
}