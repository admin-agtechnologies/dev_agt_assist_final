// src/app/pme/billing/components/PlanList.tsx
"use client";
import { Check, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Plan, Subscription, Wallet } from "@/types/api";

interface PlanListProps {
  plans: Plan[];
  sub: Subscription | null;
  wallet: Wallet | null;
  onSelectPlan: (planId: string) => void;
}

export function PlanList({ plans, sub, wallet, onSelectPlan }: PlanListProps) {
  const { dictionary: d } = useLanguage();

  const currentPlanPrix: number = sub?.plan?.prix ?? 0;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">
        Plans disponibles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = sub?.plan?.id === plan.id;
          const isDowngrade = Number(plan.prix) < Number(currentPlanPrix);
          const isUpgrade = Number(plan.prix) > Number(currentPlanPrix);
          const canAfford = wallet ? Number(wallet.solde) >= Number(plan.prix) : false;
          const isDisabled = isCurrent || isDowngrade;

          return (
            <div
              key={plan.id}
              className={cn(
                "card p-6 flex flex-col gap-4 transition-all",
                isCurrent
                  ? "ring-2 ring-[#25D366]"
                  : isDowngrade
                  ? "opacity-50"
                  : "hover:shadow-md",
              )}
            >
              {isCurrent && <Badge variant="green">Plan actuel</Badge>}
              {isUpgrade && !isCurrent && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#075E54] uppercase tracking-wide">
                  <TrendingUp className="w-3 h-3" /> Upgrade
                </div>
              )}

              <div>
                <p className="text-xl font-black text-[var(--text)]">{plan.nom}</p>
                <p className="text-3xl font-black text-[#075E54]">
                  {formatCurrency(plan.prix)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">/ {plan.billing_cycle === "annuel" ? "an" : "mois"}</p>
              </div>

              <ul className="space-y-1.5 flex-1 text-xs text-[var(--text-muted)]">
                {plan.features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-3 h-3 text-[#25D366] flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              {/* Bouton */}
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/10 text-[#25D366] cursor-default border border-[#25D366]/30"
                >
                  Plan actuel
                </button>
              ) : isDowngrade ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]"
                  title="Vous ne pouvez pas rétrograder votre plan"
                >
                  Plan inférieur
                </button>
              ) : (
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={!canAfford}
                  className={cn(
                    "btn-primary w-full justify-center",
                    !canAfford && "opacity-50 cursor-not-allowed",
                  )}
                  title={!canAfford ? "Solde insuffisant — rechargez votre portefeuille" : undefined}
                >
                  {canAfford ? "Passer à ce plan" : "Solde insuffisant"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}