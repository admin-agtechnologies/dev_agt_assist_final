// src/app/(dashboard)/results/_components/DemandeConciergericResultCard.tsx
"use client";

import { Bell, User, Clock } from "lucide-react";
import { formatDateTime }    from "@/lib/utils";
import type { DemandeConciergerieResult } from "@/types/api/results.types";

const STATUT_STYLE: Record<string, string> = {
  recue:          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  prise_en_charge:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_cours:       "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  effectuee:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  annulee:        "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const STATUT_LABEL: Record<string, string> = {
  recue: "Reçue", prise_en_charge: "Prise en charge",
  en_cours: "En cours", effectuee: "Effectuée", annulee: "Annulée",
};

interface Props { item: DemandeConciergerieResult }

export function DemandeConciergericResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {item.service_nom}
              {item.chambre && ` · Chambre ${item.chambre}`}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
          ${STATUT_STYLE[item.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
          {STATUT_LABEL[item.statut] ?? item.statut}
        </span>
      </div>

      {item.notes_client && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-1 italic">
          {item.notes_client}
        </p>
      )}

      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        {item.heure_souhaitee && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(item.heure_souhaitee)}
          </span>
        )}
        {item.pris_en_charge_nom && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />{item.pris_en_charge_nom}
          </span>
        )}
        {!item.heure_souhaitee && !item.pris_en_charge_nom && (
          <span>{formatDateTime(item.created_at)}</span>
        )}
      </div>
    </div>
  );
}