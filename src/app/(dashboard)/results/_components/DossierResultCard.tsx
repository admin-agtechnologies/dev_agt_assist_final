// src/app/(dashboard)/results/_components/DossierResultCard.tsx
"use client";

import { FolderOpen, User, Hash } from "lucide-react";
import { formatDateTime }         from "@/lib/utils";
import type { DossierResult }     from "@/types/api/results.types";

const STATUT_STYLE: Record<string, string> = {
  ouvert:          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_attente_docs: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  valide:          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejete:          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  clos:            "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};
const STATUT_LABEL: Record<string, string> = {
  ouvert: "Ouvert", en_cours: "En cours", en_attente_docs: "Docs manquants",
  valide: "Validé", rejete: "Rejeté", clos: "Clos",
};

interface Props { item: DossierResult }

export function DossierResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom || item.contact}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {item.numero_dossier} · {item.type_demande.replace(/_/g, " ")}
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