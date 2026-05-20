// src/app/(dashboard)/results/_components/ReservationResultCard.tsx
"use client";

import { Calendar, User, Clock } from "lucide-react";
import { formatDateTime }        from "@/lib/utils";
import type { Reservation }      from "@/types/api/reservation.types";

const STATUT_STYLE: Record<string, string> = {
  confirmee:              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  en_attente:             "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_attente_confirmation:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  terminee:               "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  annulee:                "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const STATUT_LABEL: Record<string, string> = {
  confirmee:               "Confirmée",
  en_attente:              "En attente",
  en_attente_confirmation: "À confirmer",
  terminee:                "Terminée",
  annulee:                 "Annulée",
};

interface Props { item: Reservation }

export function ReservationResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <User className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{item.contact_phone}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
          ${STATUT_STYLE[item.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
          {STATUT_LABEL[item.statut] ?? item.statut}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{formatDateTime(item.date_debut)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{item.ressource_nom}</span>
        </div>
      </div>

      {item.notes && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-1 italic">
          {item.notes}
        </p>
      )}
    </div>
  );
}