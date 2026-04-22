"use client";
import { Check, AlertCircle, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui";
import type { Plan, Subscription } from "@/types/api";

interface PlanListProps {
  plans: Plan[];
  sub: Subscription | null;
  wallet: any;
  onSelectPlan: (id: string) => void;
}

export function PlanList({ plans, sub, wallet, onSelectPlan }: PlanListProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;

  return (
    <div>
      <h2 className="text-sm font-bold text-[var(--text)] mb-4">
        {t.availablePlans}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = sub?.plan?.slug === plan.slug;
          const canAfford = wallet ? wallet.solde >= plan.prix : false;
          return (
            <div
              key={plan.id}
              className={cn(
                "card p-6 flex flex-col gap-4",
                isCurrent ? "ring-2 ring-[#25D366]" : "hover:shadow-md",
              )}
            >
              {isCurrent && <Badge variant="green">Plan actuel</Badge>}
              <div>
                <p className="text-xl font-black text-[var(--text)]">
                  {plan.nom}
                </p>
                <p className="text-3xl font-black text-[#075E54]">
                  {formatCurrency(plan.prix)}
                </p>
              </div>
              <ul className="space-y-1.5 flex-1 text-xs text-[var(--text-muted)]">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-3 h-3 text-[#25D366]" /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent}
                onClick={() => onSelectPlan(plan.id)}
                className={cn(
                  "btn-primary w-full justify-center",
                  isCurrent && "opacity-50",
                )}
              >
                {isCurrent ? "Plan actuel" : "Changer de plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
