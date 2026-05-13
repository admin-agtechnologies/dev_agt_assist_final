// src/components/welcome/WelcomeScreen3.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { Gift, CreditCard, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  onboardingRepository, walletsRepository,
  billingRepository, featuresRepository,
} from "@/repositories";
import { api } from "@/lib/api-client";
import type { Plan } from "@/types/api/billing.types";
import type { Wallet } from "@/types/api/commande.types";
import type { SectorFeature } from "@/repositories/features.repository";
import { formatCurrency } from "@/lib/utils";
import { getFeatureLabel } from "@/lib/sector-labels";

interface Props {
  selectedSlugs: string[];
  locale: string;
  onBack:    () => void;
  onSuccess: () => void;
}

const T = {
  fr: {
    title: "Activez vos modules", subtitle: "Choisissez un plan pour accéder à votre sélection.",
    wallet: "Mon portefeuille", claimBonus: "Réclamer mon bonus (10 000 XAF)",
    claimed: "Bonus réclamé ✓", claiming: "Réclamation…",
    choosePlan: "Choisir un plan",
    extras: "Modules additionnels",
    extrasHint: "Non inclus dans votre plan — activables séparément.",
    pay: "Payer avec mon portefeuille", paying: "Paiement…",
    recharge: "Recharger mon portefeuille →", adjust: "← Réajuster mes modules",
    insufficient: "Solde insuffisant pour ce total.",
    planLine: "Plan", extrasLine: "Modules additionnels", totalLine: "Total",
    balanceAfter: "Solde après :",
  },
  en: {
    title: "Activate your modules", subtitle: "Choose a plan to access your selection.",
    wallet: "My wallet", claimBonus: "Claim welcome bonus (10,000 XAF)",
    claimed: "Bonus claimed ✓", claiming: "Claiming…",
    choosePlan: "Choose a plan",
    extras: "Additional modules",
    extrasHint: "Not included in your plan — can be activated separately.",
    pay: "Pay with my wallet", paying: "Paying…",
    recharge: "Recharge my wallet →", adjust: "← Adjust my modules",
    insufficient: "Insufficient balance for this total.",
    planLine: "Plan", extrasLine: "Additional modules", totalLine: "Total",
    balanceAfter: "Balance after:",
  },
};

export function WelcomeScreen3({ selectedSlugs, locale, onBack, onSuccess }: Props) {
  const { user, refreshUser } = useAuth();
  const t = T[locale as keyof typeof T] ?? T.fr;
  const loc = (locale === "en" ? "en" : "fr") as "fr" | "en";

  const [plans,         setPlans]         = useState<Plan[]>([]);
  const [wallet,        setWallet]        = useState<Wallet | null>(null);
  const [selectedPlan,  setSelectedPlan]  = useState<Plan | null>(null);
  const [sectorMap,     setSectorMap]     = useState<Record<string, SectorFeature>>({});
  const [activeSet,     setActiveSet]     = useState<Set<string>>(new Set());
  const [checkedExtras, setCheckedExtras] = useState<Set<string>>(new Set());
  const [loading,       setLoading]       = useState(true);
  const [claiming,      setClaiming]      = useState(false);
  const [paying,        setPaying]        = useState(false);
  const [hasClaimed,    setHasClaimed]    = useState(
    user?.onboarding?.has_claimed_bonus ?? false,
  );

  const sectorSlug = user?.entreprise?.secteur?.slug ?? "custom";

  useEffect(() => {
    Promise.all([
      api.get<unknown>("/api/v1/billing/plans/?is_active=true"),
      walletsRepository.getMine(),
      featuresRepository.getActive(),
      featuresRepository.getSectorFeatures(sectorSlug),
    ]).then(([rawPlans, w, { features: active }, sectorFeats]) => {
      const list: Plan[] = Array.isArray(rawPlans)
        ? (rawPlans as Plan[])
        : ((rawPlans as { results?: Plan[] }).results ?? []);
      const payable = list.filter(p => p.prix > 0);
      setPlans(payable);
      setSelectedPlan(payable[0] ?? null);
      setWallet(w);

      const aSet = new Set(active.map(f => f.slug));
      setActiveSet(aSet);

      const map: Record<string, SectorFeature> = {};
      sectorFeats.forEach(f => { map[f.slug] = f; });
      setSectorMap(map);

      // Extras = selectedSlugs absents du plan actif — tous cochés par défaut
      const initExtras = selectedSlugs.filter(s => !aSet.has(s));
      setCheckedExtras(new Set(initExtras));
    }).finally(() => setLoading(false));
  }, [sectorSlug]); // eslint-disable-line

  // Extras résolubles (présents dans le secteur)
  const extras: SectorFeature[] = selectedSlugs
    .filter(s => !activeSet.has(s) && sectorMap[s])
    .map(s => sectorMap[s]);

  const extrasTotal  = extras
  .filter(f => checkedExtras.has(f.slug))
  .reduce((sum, f) => sum + Number(f.prix_unitaire ?? 0), 0);
  const planPrice    = Number(selectedPlan?.prix ?? 0);
  const total        = planPrice + extrasTotal;
  const balance      = Number(wallet?.solde ?? 0);
  const balanceAfter = balance - total;
  const canAfford    = balance >= total;

  const toggleExtra = useCallback((slug: string) => {
    setCheckedExtras(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onboardingRepository.claimBonus();
      setHasClaimed(true);
      setWallet(await walletsRepository.getMine());
      await refreshUser();
    } catch { /* silencieux */ } finally { setClaiming(false); }
  };

  const handlePay = async () => {
    if (!selectedPlan || !canAfford || paying) return;
    setPaying(true);
    try {
      const extra_slugs   = extras.filter(f => checkedExtras.has(f.slug)).map(f => f.slug);
      const desired_slugs = extras.filter(f => !checkedExtras.has(f.slug)).map(f => f.slug);
      await billingRepository.confirmUpgrade(selectedPlan.id, { extra_slugs, desired_slugs });
      await refreshUser();
      onSuccess();
    } catch { /* TODO: toast erreur */ } finally { setPaying(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      {/* Wallet + bonus */}
      <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-[var(--text-muted)]">{t.wallet}</p>
          <p className="text-lg font-black text-[var(--text)]">{formatCurrency(balance)}</p>
        </div>
        {!hasClaimed ? (
          <button onClick={handleClaim} disabled={claiming}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
                       bg-amber-500 hover:opacity-90 disabled:opacity-50 transition-all">
            <Gift className="w-4 h-4" />
            {claiming ? t.claiming : t.claimBonus}
          </button>
        ) : (
          <span className="text-sm font-semibold text-green-600">{t.claimed}</span>
        )}
      </div>

      {/* Plan selection */}
      {plans.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[var(--text)] mb-2">{t.choosePlan}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map(p => (
              <button key={p.id} onClick={() => setSelectedPlan(p)}
                className={[
                  "card p-4 text-left border-2 transition-all",
                  selectedPlan?.id === p.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--color-primary)]/40",
                ].join(" ")}>
                <p className="font-bold text-[var(--text)]">{p.nom}</p>
                <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">
                  {formatCurrency(p.prix)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[var(--text)] mb-1">{t.extras}</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">{t.extrasHint}</p>
          <div className="space-y-2">
            {extras.map(f => {
              const checked = checkedExtras.has(f.slug);
              const label   = getFeatureLabel(f.slug, loc).nav;
              return (
                <button key={f.slug} onClick={() => toggleExtra(f.slug)}
                  className={[
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                    checked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--color-primary)]/40",
                  ].join(" ")}>
                  <div className="flex items-center gap-3">
                    <div className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      checked
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--border)]",
                    ].join(" ")}>
                      {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-primary)] shrink-0 ml-3">
                    {formatCurrency(f.prix_unitaire ?? 0)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Résumé */}
      {selectedPlan && (
        <div className="card p-4 space-y-2 text-sm">
          <div className="flex justify-between text-[var(--text-muted)]">
            <span>{t.planLine}</span><span>{formatCurrency(planPrice)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>{t.extrasLine}</span><span>{formatCurrency(extrasTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[var(--text)] border-t border-[var(--border)] pt-2">
            <span>{t.totalLine}</span><span>{formatCurrency(total)}</span>
          </div>
          <div className={[
            "flex justify-between",
            balanceAfter >= 0 ? "text-green-600" : "text-red-500",
          ].join(" ")}>
            <span>{t.balanceAfter}</span><span>{formatCurrency(balanceAfter)}</span>
          </div>
        </div>
      )}

      {/* Alerte solde insuffisant */}
      {selectedPlan && !canAfford && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t.insufficient}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {t.adjust}
        </button>
        {canAfford && selectedPlan ? (
          <button onClick={handlePay} disabled={paying}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
                       text-white bg-[var(--color-primary)] hover:opacity-90
                       disabled:opacity-50 transition-all">
            {paying
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t.paying}</>
              : <><CreditCard className="w-4 h-4" />{t.pay}</>}
          </button>
        ) : (
          <a href="/billing"
            className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition">
            {t.recharge}
          </a>
        )}
      </div>
    </div>
  );
}