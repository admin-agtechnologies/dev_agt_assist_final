// src/components/modules/ModuleCartSummary.tsx
"use client";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Wallet as WalletType, Plan } from "@/types/api";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  wallet: WalletType | null;
  isLoading: boolean;
  planPrix: number;
  modulesTotal: number;
  grandTotal: number;
  effectivePlan: Plan | null;
  locale: Locale;
  primaryColor: string;
}

export function ModuleCartSummary({
  wallet,
  isLoading,
  planPrix,
  modulesTotal,
  grandTotal,
  effectivePlan,
  locale,
  primaryColor,
}: Props) {
  const canAfford   = wallet ? wallet.solde >= grandTotal : false;
  const balanceAfter = wallet ? wallet.solde - grandTotal : 0;

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: `${primaryColor}0c`, border: `1px solid ${primaryColor}25` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Wallet className="w-4 h-4" style={{ color: primaryColor }} />
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          {locale === "fr" ? "Récapitulatif" : "Summary"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {locale === "fr" ? "Chargement…" : "Loading…"}
          </span>
        </div>
      ) : wallet ? (
        <div className="space-y-1.5 text-sm">
          {planPrix > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">
                {locale === "fr" ? "Plan" : "Plan"} {effectivePlan?.nom}
              </span>
              <span className="font-semibold text-[var(--text)]">{formatCurrency(planPrix)}</span>
            </div>
          )}
          {modulesTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">
                {locale === "fr" ? "Modules hors plan" : "Modules not in plan"}
              </span>
              <span className="font-semibold text-[var(--text)]">{formatCurrency(modulesTotal)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 border-t border-[var(--border)]">
            <span className="font-bold text-[var(--text)]">{locale === "fr" ? "Total" : "Total"}</span>
            <span className="font-black text-[var(--text)]">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">
              {locale === "fr" ? "Solde actuel" : "Current balance"}
            </span>
            <span className={cn("font-bold", canAfford ? "text-green-600" : "text-red-500")}>
              {formatCurrency(wallet.solde)}
            </span>
          </div>
          {canAfford && grandTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">
                {locale === "fr" ? "Solde après" : "Balance after"}
              </span>
              <span className="font-bold text-[var(--text)]">{formatCurrency(balanceAfter)}</span>
            </div>
          )}
          {!canAfford && grandTotal > 0 && (
            <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mt-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                {locale === "fr"
                  ? `Solde insuffisant — il vous manque ${formatCurrency(grandTotal - wallet.solde)}.`
                  : `Insufficient balance — you need ${formatCurrency(grandTotal - wallet.solde)} more.`}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">
          {locale === "fr" ? "Wallet non disponible." : "Wallet unavailable."}
        </p>
      )}
    </div>
  );
}