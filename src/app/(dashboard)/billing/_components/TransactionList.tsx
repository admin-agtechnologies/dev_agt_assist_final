// src/app/(dashboard)/billing/_components/TransactionList.tsx
// Migration de src/app/pme/billing/components/TransactionList.tsx
// Adaptation : useLanguage hook + import direct fr/en
"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { useLanguage } from "@/hooks/useLanguage";
import { fr } from "@/dictionaries/fr";
import { en } from "@/dictionaries/en";
import type { Transaction } from "@/types/api";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const { lang } = useLanguage();
  const d = lang === "fr" ? fr : en;
  const t = d.billing;

  return (
    <div>
      <h2 className="text-sm font-bold text-[var(--text)] mb-4">{t.historyTitle}</h2>
      <div className="card divide-y divide-[var(--border)]">
        {transactions.length === 0 ? (
          <EmptyState message={t.historyEmpty} />
        ) : (
          transactions.map((tr) => (
            <div key={tr.id} className="flex items-center gap-4 px-5 py-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tr.type === "credit" ? "bg-green-100" : "bg-red-100")}>
                {tr.type === "credit"
                  ? <ArrowDownLeft className="w-4 h-4" />
                  : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{tr.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatDateTime(tr.created_at)}</p>
              </div>
              <p className={cn("text-base font-black", tr.type === "credit" ? "text-green-600" : "text-red-500")}>
                {tr.type === "credit" ? "+" : "-"}{formatCurrency(tr.montant)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}