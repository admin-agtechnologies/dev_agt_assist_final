// src/app/(dashboard)/results/_components/CommandeResultCard.tsx
"use client";

import { ShoppingBag, User, CheckCircle2, Circle } from "lucide-react";
import { formatDateTime }                          from "@/lib/utils";
import type { CommandeResult }                     from "@/types/api/results.types";

const STATUT_STYLE: Record<string, string> = {
  confirmee:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  livree:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  en_attente:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_preparation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  prete:          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  annulee:        "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const STATUT_LABEL: Record<string, string> = {
  confirmee: "Confirmée", livree: "Livrée", en_attente: "En attente",
  en_preparation: "En préparation", prete: "Prête", annulee: "Annulée",
};

interface Props { item: CommandeResult }

export function CommandeResultCard({ item }: Props) {
  const montant = new Intl.NumberFormat("fr-FR").format(Number(item.montant_total));

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-[var(--accent)]" />
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

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--text)]">
          {montant} <span className="text-xs font-normal text-[var(--text-muted)]">{item.devise}</span>
        </p>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          {item.est_paye
            ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Payé</>
            : <><Circle className="w-3.5 h-3.5" /> Non payé</>}
        </div>
      </div>

      <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
        {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}