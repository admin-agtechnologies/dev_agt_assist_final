// src/app/(dashboard)/results/_components/InscriptionResultCard.tsx
"use client";

import { GraduationCap, User } from "lucide-react";
import { formatDateTime }      from "@/lib/utils";
import type { InscriptionResult } from "@/types/api/results.types";

const STATUT_STYLE: Record<string, string> = {
  soumise:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_etude:      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  acceptee:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  refusee:       "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  liste_attente: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};
const STATUT_LABEL: Record<string, string> = {
  soumise: "Soumise", en_etude: "En étude", acceptee: "Acceptée",
  refusee: "Refusée", liste_attente: "Liste d'attente",
};

interface Props { item: InscriptionResult }

export function InscriptionResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom || item.contact}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {item.filiere} · {item.niveau} · {item.annee_scolaire}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
          ${STATUT_STYLE[item.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
          {STATUT_LABEL[item.statut] ?? item.statut}
        </span>
      </div>
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}