// src/app/(dashboard)/results/_components/TransfertHumainResultCard.tsx
"use client";

import { ArrowLeftRight, User } from "lucide-react";
import { formatDateTime }       from "@/lib/utils";
import type { TransfertHumainResult } from "@/types/api/results.types";

const STATUT_STYLE: Record<string, string> = {
  en_attente:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pris_en_charge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolu:         "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente", pris_en_charge: "Pris en charge", resolu: "Résolu",
};

interface Props { item: TransfertHumainResult }

export function TransfertHumainResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30
            flex items-center justify-center flex-shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{item.contact_telephone}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
          ${STATUT_STYLE[item.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
          {STATUT_LABEL[item.statut] ?? item.statut}
        </span>
      </div>
      {item.motif && (
        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2">{item.motif}</p>
      )}
      {item.assigne_a_nom && (
        <p className="mt-1.5 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
          <User className="w-3 h-3" /> Assigné à {item.assigne_a_nom}
        </p>
      )}
      <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
        {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}