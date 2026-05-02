// src/app/pme/billing/components/PlanList.tsx
"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Check, TrendingUp, Eye, X,
  MessageCircle, Phone, Bot, CalendarDays, Mail, Building2, Wrench,
} from "lucide-react";
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

// ── Ligne de quota dans le modal ──────────────────────────────────────────────
function QuotaLine({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
}) {
  const isUnlimited = value === null || value === undefined || value === -1;
  const isAbsent = value === 0;
  const display = isUnlimited ? "∞ Illimité" : isAbsent ? "Non inclus" : value!.toLocaleString();

  return (
    <div className={cn(
      "flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0",
      isAbsent && "opacity-40"
    )}>
      <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
        <span className="text-[var(--text-muted)]">{icon}</span>
        <span>{label}</span>
      </div>
      <span className={cn(
        "text-sm font-bold",
        isUnlimited ? "text-[#075E54]" : isAbsent ? "text-[var(--text-muted)]" : "text-[var(--text)]"
      )}>
        {display}
      </span>
    </div>
  );
}

// ── Modal détails plan ────────────────────────────────────────────────────────
function PlanDetailModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-0.5">
              Détails du plan
            </p>
            <h2 className="text-xl font-black text-[var(--text)]">{plan.nom}</h2>
            <p className="text-2xl font-black text-[#075E54] mt-1">
              {formatCurrency(plan.prix)}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                / {plan.billing_cycle === "annuel" ? "an" : "mois"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quotas */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Quotas mensuels
            </p>
            <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4">
              <QuotaLine icon={<MessageCircle className="w-4 h-4" />} label="Messages" value={plan.limite_messages} />
              <QuotaLine icon={<Phone className="w-4 h-4" />} label="Appels vocaux" value={plan.limite_appels} />
              <QuotaLine icon={<Bot className="w-4 h-4" />} label="Bots" value={plan.limite_bots} />
              <QuotaLine icon={<CalendarDays className="w-4 h-4" />} label="Rendez-vous" value={plan.limite_rdv} />
              <QuotaLine icon={<Mail className="w-4 h-4" />} label="Emails" value={plan.limite_emails} />
              <QuotaLine icon={<Building2 className="w-4 h-4" />} label="Agences" value={plan.limite_agences} />
              <QuotaLine icon={<Wrench className="w-4 h-4" />} label="Services" value={plan.limite_services} />
            </div>
          </div>

          {/* Fonctionnalités */}
          {plan.features.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                Fonctionnalités incluses
              </p>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-[#25D366] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── PlanList ──────────────────────────────────────────────────────────────────
export function PlanList({ plans, sub, wallet, onSelectPlan }: PlanListProps) {
  const { dictionary: d } = useLanguage();
  const [detailPlan, setDetailPlan] = useState<Plan | null>(null);

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

          return (
            <div
              key={plan.id}
              className={cn(
                "card p-6 flex flex-col gap-4 transition-all",
                isCurrent ? "ring-2 ring-[#25D366]" : isDowngrade ? "opacity-50" : "hover:shadow-md",
              )}
            >
              {/* Badge + oeil */}
              <div className="flex items-center justify-between">
                <div>
                  {isCurrent && <Badge variant="green">Plan actuel</Badge>}
                  {isUpgrade && !isCurrent && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#075E54] uppercase tracking-wide">
                      <TrendingUp className="w-3 h-3" /> Upgrade
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDetailPlan(plan)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  title="Voir les détails"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Prix */}
              <div>
                <p className="text-xl font-black text-[var(--text)]">{plan.nom}</p>
                <p className="text-3xl font-black text-[#075E54]">
                  {formatCurrency(plan.prix)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  / {plan.billing_cycle === "annuel" ? "an" : "mois"}
                </p>
              </div>

              {/* Features (3 max) */}
              <ul className="space-y-1.5 flex-1 text-xs text-[var(--text-muted)]">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-3 h-3 text-[#25D366] flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li>
                    <button
                      onClick={() => setDetailPlan(plan)}
                      className="text-[#075E54] font-semibold hover:underline"
                    >
                      + {plan.features.length - 3} autres fonctionnalités
                    </button>
                  </li>
                )}
              </ul>

              {/* Bouton action */}
              {isCurrent ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/10 text-[#25D366] cursor-default border border-[#25D366]/30">
                  Plan actuel
                </button>
              ) : isDowngrade ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]" title="Vous ne pouvez pas rétrograder votre plan">
                  Plan inférieur
                </button>
              ) : (
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={!canAfford}
                  className={cn("btn-primary w-full justify-center", !canAfford && "opacity-50 cursor-not-allowed")}
                  title={!canAfford ? "Solde insuffisant — rechargez votre portefeuille" : undefined}
                >
                  {canAfford ? "Passer à ce plan" : "Solde insuffisant"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal détails */}
      {detailPlan && (
        <PlanDetailModal plan={detailPlan} onClose={() => setDetailPlan(null)} />
      )}
    </div>
  );
}