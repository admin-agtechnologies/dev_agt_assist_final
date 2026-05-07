"use client";
import { Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency, cn } from "@/lib/utils";
import type { Plan } from "@/types/api";

interface Props {
  plans: Plan[];
  selectedPlan: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export function StepPlan({ plans, selectedPlan, onSelect, onNext }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;

  return (
    <div className="animate-fade-in">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t.planTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{t.planSubtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {plans.map(pl => (
            <button key={pl.id} type="button" onClick={() => onSelect(pl.id)}
              className={cn(
                "text-left p-5 rounded-2xl border-2 transition-all",
                selectedPlan === pl.id
                  ? "border-[#25D366] bg-[#25D366]/5"
                  : "border-[var(--border)] hover:border-[var(--text-muted)]"
              )}>
              {pl.highlight && (
                <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block mb-1">
                  ★ {d.common.recommended}
                </span>
              )}
              <p className="font-black text-[var(--text)]">{pl.nom}</p>
              <p className="text-2xl font-black text-[#075E54] mt-1">
                {formatCurrency(pl.prix)}
                <span className="text-xs font-normal text-[var(--text-muted)]">
                  / {pl.billing_cycle === "annuel" ? "an" : "mois"}
                </span>
              </p>
              <ul className="mt-3 space-y-1">
                {pl.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Check className="w-3 h-3 text-[#25D366] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <button onClick={onNext} className="btn-primary w-full justify-center">
          {d.common.continue} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}