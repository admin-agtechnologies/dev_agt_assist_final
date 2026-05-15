"use client";
// ============================================================
// FICHIER : src/components/welcome/WelcomeScreen3.tsx
// S26 — Refonte complète :
//   · Bonus animé pleine largeur en tête
//   · Tous les modules sélectionnés affichés (inclus gratuit + extras)
//   · Cartes plans avec bullets features
//   · TopUpModal inline (plus de redirection /billing)
//   · Facture claire avec solde après paiement
// ============================================================
import { useState, useEffect, useCallback } from "react";
import {
  Gift, CreditCard, AlertCircle, CheckCircle2,
  Loader2, Lock, Sparkles,
} from "lucide-react";
import { useAuth }              from "@/contexts/AuthContext";
import {
  onboardingRepository, walletsRepository,
  billingRepository,    featuresRepository,
} from "@/repositories";
import { api }                  from "@/lib/api-client";
import type { Plan }            from "@/types/api/billing.types";
import type { Wallet }          from "@/types/api/commande.types";
import type { SectorFeature }   from "@/repositories/features.repository";
import { formatCurrency }       from "@/lib/utils";
import { getFeatureLabel }      from "@/lib/sector-labels";
import { TopUpModal }           from "@/app/(dashboard)/billing/components/TopUpModal";

// ── Libellés unités quota par slug ────────────────────────────────────────────
const QUOTA_UNIT: Record<string, string> = {
  chatbot_whatsapp:            "messages",
  agent_vocal:                 "min vocaux",
  emails_rappel:               "emails",
  prise_rdv:                   "RDV",
  reservation_table:           "RDV",
  reservation_chambre:         "RDV",
  reservation_billet:          "billets",
  commande_paiement:           "commandes",
  paiement_en_ligne:           "transactions",
  inscription_admission:       "dossiers",
  communication_etablissement: "envois",
  prospection_active:          "contacts",
  multi_agences:               "agence(s)",
};

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  fr: {
    bonusLabel:   "🎁 10 000 FCFA offerts — Réclamez votre bonus de bienvenue !",
    bonusBtn:     "Réclamer",
    bonusClaimed: "Bonus réclamé ✓",
    wallet:       "Mon portefeuille",
    modulesTitle: "Vos modules sélectionnés",
    free:         "Gratuit",
    addons:       "Modules additionnels",
    addonsHint:   "Non inclus dans votre plan — achetés une seule fois, actifs immédiatement.",
    choosePlan:   "Choisir un plan",
    planHint:     "Le plan définit vos quotas mensuels. Les modules additionnels sont facturés séparément.",
    recommended:  "Recommandé",
    perMonth:     "/ mois",
    install:      "Frais installation",
    summary:      "Récapitulatif",
    planLine:     "Plan",
    extrasLine:   "Modules additionnels",
    total:        "Total",
    balanceAfter: "Solde après paiement",
    insufficient: "Solde insuffisant — rechargez pour continuer.",
    pay:          "Payer avec mon portefeuille",
    paying:       "Paiement en cours…",
    recharge:     "Recharger mon compte",
    adjust:       "← Réajuster mes modules",
  },
  en: {
    bonusLabel:   "🎁 10,000 FCFA gift — Claim your welcome bonus now!",
    bonusBtn:     "Claim",
    bonusClaimed: "Bonus claimed ✓",
    wallet:       "My wallet",
    modulesTitle: "Your selected modules",
    free:         "Free",
    addons:       "Additional modules",
    addonsHint:   "Not included in your plan — purchased once, immediately active.",
    choosePlan:   "Choose a plan",
    planHint:     "The plan sets your monthly quotas. Add-on modules are billed separately.",
    recommended:  "Recommended",
    perMonth:     "/ month",
    install:      "Setup fee",
    summary:      "Summary",
    planLine:     "Plan",
    extrasLine:   "Add-on modules",
    total:        "Total",
    balanceAfter: "Balance after payment",
    insufficient: "Insufficient balance — recharge to continue.",
    pay:          "Pay with my wallet",
    paying:       "Processing…",
    recharge:     "Recharge wallet",
    adjust:       "← Adjust modules",
  },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  selectedSlugs: string[];
  locale:        string;
  onBack:        () => void;
  onSuccess:     () => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────
export function WelcomeScreen3({ selectedSlugs, locale, onBack, onSuccess }: Props) {
  const { user, refreshUser } = useAuth();
  const t          = T[locale as keyof typeof T] ?? T.fr;
  const loc        = (locale === "en" ? "en" : "fr") as "fr" | "en";
  const sectorSlug = user?.entreprise?.secteur?.slug ?? "custom";

  const [plans,         setPlans]         = useState<Plan[]>([]);
  const [wallet,        setWallet]        = useState<Wallet | null>(null);
  const [selectedPlan,  setSelectedPlan]  = useState<Plan | null>(null);
  const [sectorMap,     setSectorMap]     = useState<Record<string, SectorFeature>>({});
  const [activeSet,     setActiveSet]     = useState<Set<string>>(new Set());
  const [checkedExtras, setCheckedExtras] = useState<Set<string>>(new Set());
  const [loading,       setLoading]       = useState(true);
  const [claiming,      setClaiming]      = useState(false);
  const [paying,        setPaying]        = useState(false);
  const [showTopUp,     setShowTopUp]     = useState(false);
  const [hasClaimed,    setHasClaimed]    = useState(
    user?.onboarding?.has_claimed_bonus ?? false,
  );

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

      // Extras = sélectionnés mais pas encore actifs — tous cochés par défaut
      setCheckedExtras(new Set(selectedSlugs.filter(s => !aSet.has(s))));
    }).finally(() => setLoading(false));
  }, [sectorSlug]); // eslint-disable-line

  // ── Dérivations ───────────────────────────────────────────────────────────
  const inclus: string[]       = selectedSlugs.filter(s => activeSet.has(s));
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
  const canAfford    = selectedPlan != null && balance >= total;

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  const handleTopUpSuccess = async () => {
    setWallet(await walletsRepository.getMine());
    setShowTopUp(false);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );

  return (
    <>
      {/* Animation keyframe bonus */}
      <style>{`
        @keyframes bonus-glow {
          0%,100% { background: linear-gradient(135deg,#f59e0b,#f97316); box-shadow: 0 4px 20px #f59e0b55; }
          50%      { background: linear-gradient(135deg,#f97316,#ef4444); box-shadow: 0 4px 28px #ef444455; }
        }
        .bonus-anim { animation: bonus-glow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col gap-5">

        {/* ── Bonus bienvenue ─────────────────────────────────────────────── */}
        {!hasClaimed ? (
          <div className="bonus-anim rounded-2xl p-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Gift className="w-9 h-9 text-white shrink-0" />
              <p className="text-sm font-black text-white leading-snug">{t.bonusLabel}</p>
            </div>
            <button onClick={handleClaim} disabled={claiming}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-white font-black text-sm
                         text-amber-600 hover:bg-amber-50 disabled:opacity-60
                         transition-all shadow-md">
              {claiming
                ? <Loader2 className="w-4 h-4 animate-spin inline" />
                : t.bonusBtn}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                          bg-green-50 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm font-semibold text-green-700">{t.bonusClaimed}</span>
          </div>
        )}

        {/* ── Portefeuille ────────────────────────────────────────────────── */}
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)]">{t.wallet}</p>
            <p className="text-2xl font-black text-[var(--text)]">{formatCurrency(balance)}</p>
          </div>
          <Sparkles className="w-5 h-5 text-[var(--color-primary)] opacity-30" />
        </div>

        {/* ── Modules sélectionnés ────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-[var(--text)] mb-3">{t.modulesTitle}</p>

          {/* Inclus gratuitement */}
          {inclus.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {inclus.map(slug => {
                const label = sectorMap[slug]?.nom_fr ?? getFeatureLabel(slug, loc).nav;
                return (
                  <div key={slug}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl
                               bg-green-50/60 border border-green-100">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700
                                     bg-green-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {t.free}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modules additionnels (hors plan) */}
          {extras.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest
                            text-[var(--text-muted)] mb-1 mt-2">
                {t.addons}
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-3">{t.addonsHint}</p>
              <div className="space-y-2">
                {extras.map(f => {
                  const checked = checkedExtras.has(f.slug);
                  const label   = f.nom_fr ?? getFeatureLabel(f.slug, loc).nav;
                  const unit    = QUOTA_UNIT[f.slug];
                  const quota   = f.quota_unitaire;
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
                        <div className="text-left">
                          <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
                          {quota != null && quota > 0 && unit && (
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {quota.toLocaleString("fr-FR")} {unit}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[var(--color-primary)] shrink-0 ml-3">
                        {formatCurrency(f.prix_unitaire ?? 0)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Choix du plan ───────────────────────────────────────────────── */}
        {plans.length > 0 && (
          <div>
            <p className="text-sm font-bold text-[var(--text)] mb-1">{t.choosePlan}</p>
            <p className="text-xs text-[var(--text-muted)] mb-3">{t.planHint}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map(p => {
                const isSelected = selectedPlan?.id === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlan(p)}
                    className={[
                      "card p-4 text-left border-2 transition-all",
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--border)] hover:border-[var(--color-primary)]/40",
                    ].join(" ")}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-black text-[var(--text)]">{p.nom}</p>
                      {p.highlight && (
                        <span className="text-[10px] font-bold text-white
                                         bg-[var(--color-primary)] px-2 py-0.5 rounded-full shrink-0">
                          {t.recommended}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-black text-[var(--color-primary)]">
                      {formatCurrency(p.prix)}
                      <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
                        {t.perMonth}
                      </span>
                    </p>
                    {Array.isArray(p.features) && p.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {(p.features as string[]).map((feat, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                    {Number(p.frais_installation) > 0 && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-2 pt-2
                                    border-t border-[var(--border)]">
                        {t.install} : {formatCurrency(Number(p.frais_installation))}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Récapitulatif ───────────────────────────────────────────────── */}
        {selectedPlan && (
          <div className="card p-4 space-y-2 text-sm">
            <p className="font-bold text-[var(--text)] mb-2">{t.summary}</p>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>{t.planLine} · {selectedPlan.nom}</span>
              <span className="font-semibold">{formatCurrency(planPrice)}</span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>{t.extrasLine}</span>
                <span className="font-semibold">{formatCurrency(extrasTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-[var(--text)]
                            border-t border-[var(--border)] pt-2 text-base">
              <span>{t.total}</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className={[
              "flex justify-between font-semibold",
              balanceAfter >= 0 ? "text-green-600" : "text-red-500",
            ].join(" ")}>
              <span>{t.balanceAfter}</span>
              <span>{formatCurrency(balanceAfter)}</span>
            </div>
          </div>
        )}

        {/* ── Alerte solde insuffisant ────────────────────────────────────── */}
        {selectedPlan && !canAfford && (
          <div className="flex items-start gap-2 text-sm text-amber-700
                          bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t.insufficient}</span>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <button onClick={onBack}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition">
            {t.adjust}
          </button>
          {canAfford ? (
            <button onClick={handlePay} disabled={paying}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
                         text-white bg-[var(--color-primary)] hover:opacity-90
                         disabled:opacity-50 transition-all">
              {paying
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t.paying}</>
                : <><CreditCard className="w-4 h-4" />{t.pay}</>}
            </button>
          ) : (
            <button onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
                         text-white bg-amber-500 hover:bg-amber-600 transition-all">
              <Gift className="w-4 h-4" />
              {t.recharge}
            </button>
          )}
        </div>

      </div>

      {/* ── TopUpModal inline ───────────────────────────────────────────────── */}
      {showTopUp && wallet && (
        <TopUpModal
          wallet={wallet}
          onClose={() => setShowTopUp(false)}
          onSuccess={handleTopUpSuccess}
        />
      )}
    </>
  );
}