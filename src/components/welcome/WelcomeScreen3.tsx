// src/components/welcome/WelcomeScreen3.tsx
"use client";
import { useState, useEffect } from "react";
import { Gift, CreditCard, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingRepository, walletsRepository, billingActionsRepository } from "@/repositories";
import { api } from "@/lib/api-client";
import type { Plan } from "@/types/api/billing.types";
import type { Wallet } from "@/types/api/commande.types";
import { formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui";

interface Props {
  selectedSlugs: string[];
  locale: string;
  onBack: () => void;
  onSuccess: () => void;
}

const T = {
  fr: {
    title: "Activez vos modules", subtitle: "Pour accéder à votre sélection, choisissez un plan.",
    wallet: "Mon portefeuille", claimBonus: "Réclamer mon bonus de bienvenue (10 000 XAF)",
    claimed: "Bonus réclamé ✓", claiming: "Réclamation…",
    choosePlan: "Choisir un plan", pay: "Payer avec mon portefeuille", paying: "Paiement…",
    recharge: "Recharger mon portefeuille →", adjust: "← Réajuster mes modules",
    insufficient: "Solde insuffisant. Rechargez ou choisissez un autre plan.",
    balanceAfter: "Solde après paiement :",
  },
};

export function WelcomeScreen3({ selectedSlugs, locale, onBack, onSuccess }: Props) {
  const { user, refreshUser } = useAuth();
  const t = T[locale as keyof typeof T] ?? T.fr;

  const [plans,        setPlans]        = useState<Plan[]>([]);
  const [wallet,       setWallet]       = useState<Wallet | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [claiming,     setClaiming]     = useState(false);
  const [paying,       setPaying]       = useState(false);
  const [hasClaimed,   setHasClaimed]   = useState(user?.onboarding?.has_claimed_bonus ?? false);

  useEffect(() => {
    Promise.all([
      api.get<unknown>("/api/v1/billing/plans/?is_active=true"),
      walletsRepository.getMine(),
    ]).then(([raw, w]) => {
      const list: Plan[] = Array.isArray(raw)
        ? raw as Plan[]
        : ((raw as { results?: Plan[] }).results ?? []);
      const payable = list.filter(p => p.prix > 0);
      setPlans(payable);
      setSelectedPlan(payable[0] ?? null);
      setWallet(w);
    }).finally(() => setLoading(false));
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onboardingRepository.claimBonus();
      setHasClaimed(true);
      const w = await walletsRepository.getMine();
      setWallet(w);
      await refreshUser();
    } catch { /* silencieux */ } finally { setClaiming(false); }
  };

  const handlePay = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    try {
      await billingActionsRepository.confirmUpgrade(selectedPlan.id);
      await refreshUser();
      onSuccess();
    } catch { /* TODO: toast erreur */ } finally { setPaying(false); }
  };

  const balance   = wallet?.solde ?? 0;
  const planPrice = selectedPlan?.prix ?? 0;
  const canAfford = balance >= planPrice;

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t.subtitle}</p>
      </div>

      {/* Wallet */}
      <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />{t.wallet}
          </span>
          <span className="text-lg font-bold text-[var(--color-primary)]">{formatCurrency(balance)}</span>
        </div>
        {!hasClaimed ? (
          <button onClick={handleClaim} disabled={claiming}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition disabled:opacity-60">
            {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            {claiming ? t.claiming : t.claimBonus}
          </button>
        ) : (
          <p className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />{t.claimed}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t.choosePlan}</p>
        <div className="grid grid-cols-2 gap-3">
          {plans.map(p => (
            <button key={p.id} onClick={() => setSelectedPlan(p)}
              className={["rounded-xl border-2 p-4 text-left transition-all",
                selectedPlan?.id === p.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--color-primary)]/40",
              ].join(" ")}>
              <p className="font-bold text-[var(--text)]">{p.nom}</p>
              <p className="text-xl font-extrabold text-[var(--color-primary)]">{formatCurrency(p.prix)}</p>
              <p className="text-xs text-[var(--text-muted)]">{p.billing_cycle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback solde */}
      {selectedPlan && (
        <div className={["rounded-lg p-3 flex items-center gap-2 text-sm",
          canAfford ? "bg-green-50 text-green-700 dark:bg-green-900/20"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20",
        ].join(" ")}>
          {canAfford
            ? <><CheckCircle2 className="w-4 h-4 shrink-0" />{t.balanceAfter} {formatCurrency(balance - planPrice)}</>
            : <><AlertCircle className="w-4 h-4 shrink-0" />{t.insufficient}</>}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {canAfford ? (
          <button onClick={handlePay} disabled={paying || !selectedPlan}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {paying && <Loader2 className="w-4 h-4 animate-spin" />}
            {paying ? t.paying : t.pay}
          </button>
        ) : (
          <a href="/billing"
            className="w-full py-3 rounded-xl text-sm font-bold text-center border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition">
            {t.recharge}
          </a>
        )}
        <button onClick={onBack} className="text-sm text-center text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {t.adjust}
        </button>
      </div>
    </div>
  );
}