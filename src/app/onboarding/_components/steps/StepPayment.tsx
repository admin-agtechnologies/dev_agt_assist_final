"use client";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { WELCOME_BONUS_XAF } from "@/lib/constants";
import type { Plan } from "@/types/api";

interface Props {
  plan: Plan | null;
  isPending: boolean;
  onPay: () => void;
  onBack: () => void;
}

export function StepPayment({ plan, isPending, onPay, onBack }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;
  const walletBalance = WELCOME_BONUS_XAF;
  const canPay = plan ? walletBalance >= plan.prix : false;

  return (
    <div className="animate-fade-in">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t.paymentTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{t.paymentSubtitle}</p>

        <div className="bg-[var(--bg)] rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">{t.selectedPlan}</span>
            <span className="font-bold text-[var(--text)]">{plan?.nom ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">{t.walletBalance}</span>
            <span className="font-bold text-[#25D366]">{formatCurrency(walletBalance)}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-3 flex justify-between">
            <span className="font-bold text-[var(--text)]">{t.toPay}</span>
            <span className="font-black text-xl text-[var(--text)]">{formatCurrency(plan?.prix ?? 0)}</span>
          </div>
        </div>

        {!canPay && (
          <p className="text-sm text-red-500 mb-4 text-center">{t.paymentInsufficient}</p>
        )}

        <div className="space-y-3">
          <button onClick={onPay} disabled={!canPay || isPending}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending
              ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
              : t.paymentWalletBtn}
          </button>
          {!canPay && (
            <button className="w-full py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
              {t.paymentRechargeBtn}
            </button>
          )}
        </div>

        <button onClick={onBack}
          className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text)] mt-4 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="w-3 h-3" /> {d.common.prev}
        </button>
      </div>
    </div>
  );
}