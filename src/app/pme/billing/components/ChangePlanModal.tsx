"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, ChevronRight, AlertCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { billingRepository } from "@/repositories";
import type { Subscription, Wallet as WalletType, Plan } from "@/types/api";
import { Spinner } from "@/components/ui";

interface ChangePlanModalProps {
  plan: Plan;
  currentSub: Subscription;
  wallet: WalletType;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePlanModal({
  plan,
  currentSub,
  wallet,
  tenantId,
  onClose,
  onSuccess,
}: ChangePlanModalProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const canAfford = wallet.solde >= plan.prix;
  const balanceAfter = wallet.solde - plan.prix;

  const handleConfirm = async () => {
    if (!canAfford) {
      toast.error(t.changePlanInsufficient);
      return;
    }
    setSaving(true);
    try {
      // Appel vers le vrai backend Django (cf. confirm_upgrade dans ton ViewSet)
      await billingRepository.confirmUpgrade(plan.id);
      toast.success(t.changePlanSuccess);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || t.changePlanError);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={!saving ? onClose : undefined}
      />
      <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] animate-zoom-in">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {t.changePlanTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[var(--bg)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">
                {t.changePlanCurrent}
              </p>
              <p className="text-lg font-black text-[var(--text)]">
                {currentSub.plan?.nom ?? "—"}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {formatCurrency(currentSub.plan?.prix ?? 0)}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            <div className="flex-1 bg-[#25D366]/10 border-2 border-[#25D366] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#25D366] mb-1">{t.changePlanNew}</p>
              <p className="text-lg font-black text-[var(--text)]">
                {plan.nom}
              </p>
              <p className="text-sm font-bold text-[#075E54]">
                {formatCurrency(plan.prix)}
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg)] rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">
                {t.changePlanBalance}
              </span>
              <span className="font-semibold text-[var(--text)]">
                {formatCurrency(wallet.solde)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">
                {t.changePlanCost}
              </span>
              <span className="font-semibold text-red-500">
                −{formatCurrency(plan.prix)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--border)] pt-2 mt-1">
              <span className="font-bold text-[var(--text)]">
                {t.changePlanAfter}
              </span>
              <span
                className={cn(
                  "font-black",
                  canAfford ? "text-[#075E54]" : "text-red-500",
                )}
              >
                {formatCurrency(balanceAfter)}
              </span>
            </div>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-amber-700">
                {t.changePlanInsufficient}
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !canAfford}
            className={cn("btn-primary", !canAfford && "opacity-50")}
          >
            {saving && <Spinner className="border-white/30 border-t-white" />}
            <CreditCard className="w-4 h-4" /> {t.changePlanConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
