"use client";
// C7 — Ajout bouton PDF par ligne de transaction
// Tout le reste est identique à la version précédente

import { ArrowDownLeft, ArrowUpRight, FileDown } from "lucide-react";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateInvoicePDF } from "@/lib/pdf/invoice-generator";
import type { Transaction } from "@/types/api";

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { dictionary: d } = useLanguage();
  const { user }          = useAuth();
  const t                 = d.billing;

  const entrepriseName = user?.entreprise?.name ?? "Mon entreprise";

  return (
    <div>
      <h2 className="text-sm font-bold text-[var(--text)] mb-4">
        {t.historyTitle}
      </h2>
      <div className="card divide-y divide-[var(--border)]">
        {transactions.length === 0 ? (
          <EmptyState message={t.historyEmpty} />
        ) : (
          transactions.map((tr) => (
            <div key={tr.id} className="flex items-center gap-4 px-5 py-4">

              {/* Icône crédit / débit */}
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  tr.type === "credit" ? "bg-green-100" : "bg-red-100",
                )}
              >
                {tr.type === "credit" ? (
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                )}
              </div>

              {/* Label + date */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {tr.label}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatDateTime(tr.created_at)}
                </p>
              </div>

              {/* Montant */}
              <p
                className={cn(
                  "text-base font-black shrink-0",
                  tr.type === "credit" ? "text-green-600" : "text-red-500",
                )}
              >
                {tr.type === "credit" ? "+" : "-"}
                {formatCurrency(tr.montant)}
              </p>

              {/* Bouton facture PDF — C7 */}
              <button
                type="button"
                title="Télécharger la facture PDF"
                onClick={() => generateInvoicePDF(tr, entrepriseName)}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                           text-[var(--text-muted)] hover:text-[var(--text)]
                           hover:bg-[var(--bg-muted)] transition-colors"
              >
                <FileDown className="w-4 h-4" />
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}