// src/components/modules/ModuleCartCheckout.tsx
// S30 (gabriel) :
//   - Modularisé : LineItems + Summary extraits
//   - Détection abonnement actif (subscriptionsRepository.getMine)
//   - Plan lecture seule si abonnement actif, planPrix=0, upgrade_plan=false
//   - Modules upgrade_required bloqués + bouton Retirer
//   - Validation bloquée si module non disponible
// S31 (stephane) :
//   - PlanGatingBadge : message explicite par module bloqué
"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Wallet, Loader2, ShoppingCart, Zap, BadgeCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { featuresRepository } from "@/repositories/features.repository";
import { walletsRepository, subscriptionsRepository } from "@/repositories";
import { useToast } from "@/components/ui/Toast";
import { TopUpModal } from "@/app/(dashboard)/billing/components/TopUpModal";
import { ModuleCartLineItems } from "./ModuleCartLineItems";
import { ModuleCartSummary } from "./ModuleCartSummary";
import { PlanGatingBadge } from "@/components/billing/PlanGatingBadge";
import type { CartItem } from "@/hooks/useModuleMarket";
import type { MarketModule } from "@/repositories/features.repository";
import type { Wallet as WalletType, Plan, Subscription } from "@/types/api";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  allModules: MarketModule[];
  cartTotal: number;
  plans: Plan[];
  onSuccess: () => void;
  onRemoveFromCart: (slug: string) => void;
  onUpdateQuantite: (slug: string, quantite: number) => void;
  locale: Locale;
  primaryColor: string;
}

export function ModuleCartCheckout({
  open, onClose, cart, allModules, cartTotal, plans,
  onSuccess, onRemoveFromCart, onUpdateQuantite, locale, primaryColor,
}: Props) {
  const toast = useToast();

  const [wallet, setWallet]         = useState<WalletType | null>(null);
  const [sub, setSub]               = useState<Subscription | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showTopUp, setShowTopUp]   = useState(false);
  const [done, setDone]             = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("");

  const hasActivePlan     = sub !== null && sub.statut === "actif";
  const effectivePlanSlug = hasActivePlan ? sub!.plan.slug : selectedPlanSlug;
  const effectivePlan     = hasActivePlan
    ? sub!.plan
    : plans.find((p) => p.slug === selectedPlanSlug) ?? null;

  useEffect(() => {
    if (!hasActivePlan && plans.length > 0 && !selectedPlanSlug) {
      setSelectedPlanSlug(plans[0].slug);
    }
  }, [plans, selectedPlanSlug, hasActivePlan]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [w, s] = await Promise.all([
        walletsRepository.getMine(),
        subscriptionsRepository.getMine(),
      ]);
      setWallet(w);
      setSub(s);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) { setDone(false); loadData(); }
  }, [open, loadData]);

  // ── Modules bloqués (plan insuffisant) ───────────────────────────────────
  const blockedSlugs = new Set(
    cart
      .map((c) => allModules.find((m) => m.slug === c.slug))
      .filter((m) => m?.status === "upgrade_required")
      .map((m) => m!.slug),
  );
  const hasBlocked = blockedSlugs.size > 0;

  const isPlanCovered = (slug: string): boolean => {
    if (!effectivePlan) return false;
    return (effectivePlan.features ?? []).some((f: string) =>
      f.toLowerCase().includes(slug.replace(/_/g, " ").split("_")[0].toLowerCase()),
    );
  };

  const lineItems = cart.map((c) => {
    const mod        = allModules.find((m) => m.slug === c.slug);
    const covered    = isPlanCovered(c.slug);
    const blocked    = blockedSlugs.has(c.slug);
    const prixLigne  = covered || blocked ? 0 : c.prix_unitaire * c.quantite;
    const quotaTotal = (mod?.quota_unitaire ?? c.quota_unitaire) * c.quantite;
    return {
      ...c,
      covered,
      blocked,
      prixLigne,
      quotaTotal,
      minPlanNom: mod?.min_plan_nom ?? null,
      nom_fr:     mod?.nom_fr ?? c.slug,
    };
  });

  const modulesTotal = lineItems
    .filter((li) => !li.blocked)
    .reduce((s, li) => s + li.prixLigne, 0);
  const planPrix   = hasActivePlan ? 0 : (effectivePlan?.prix ?? 0);
  const grandTotal = planPrix + modulesTotal;
  const canAfford  = wallet ? wallet.solde >= grandTotal : false;

  const handlePurchase = async () => {
    if (!effectivePlanSlug) {
      toast.error(locale === "fr" ? "Veuillez sélectionner un plan." : "Please select a plan.");
      return;
    }
    if (hasBlocked) {
      toast.error(
        locale === "fr"
          ? "Retirez les modules non disponibles avant de continuer."
          : "Remove unavailable modules before continuing.",
      );
      return;
    }
    setPurchasing(true);
    try {
      await featuresRepository.purchase({
        plan_slug:    effectivePlanSlug,
        upgrade_plan: !hasActivePlan,
        modules: cart
          .filter((c) => !blockedSlugs.has(c.slug))
          .map((c) => ({ slug: c.slug, quantite: c.quantite })),
      });
      setDone(true);
      toast.success(
        locale === "fr" ? "Paiement réussi ! Modules activés." : "Payment successful! Modules activated.",
      );
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail;
      toast.error(msg ?? (locale === "fr" ? "Erreur lors du paiement." : "Payment error."));
    } finally {
      setPurchasing(false);
    }
  };

  if (showTopUp && wallet) {
    return (
      <TopUpModal
        wallet={wallet}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => { setShowTopUp(false); loadData(); }}
      />
    );
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!purchasing ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* ── En-tête ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" style={{ color: primaryColor }} />
            <h2 className="text-base font-bold text-[var(--text)]">
              {done
                ? (locale === "fr" ? "Activation réussie !" : "Activation successful!")
                : (locale === "fr" ? "Confirmer l'activation" : "Confirm activation")}
            </h2>
          </div>
          {!purchasing && (
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <p className="text-sm text-[var(--text-muted)] text-center">
                {locale === "fr"
                  ? "Vos modules sont maintenant actifs."
                  : "Your modules are now active."}
              </p>
            </div>
          ) : (
            <>
              {/* ── Plan ───────────────────────────────────────────────── */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {locale === "fr" ? "Plan" : "Plan"}
                </p>
                {hasActivePlan ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">{sub!.plan.nom}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {locale === "fr" ? "Votre plan actuel" : "Your current plan"}
                      </p>
                    </div>
                    <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {plans.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => setSelectedPlanSlug(p.slug)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all",
                          selectedPlanSlug === p.slug
                            ? "border-transparent text-white"
                            : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--text-muted)]",
                        )}
                        style={selectedPlanSlug === p.slug ? { backgroundColor: primaryColor } : {}}
                      >
                        <span className="text-xs font-bold">{p.nom}</span>
                        <span
                          className={cn(
                            "text-[11px]",
                            selectedPlanSlug === p.slug ? "text-white/80" : "text-[var(--text-muted)]",
                          )}
                        >
                          {formatCurrency(p.prix ?? 0)} / mois
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Line items ─────────────────────────────────────────── */}
              <ModuleCartLineItems
                lineItems={lineItems}
                hasBlocked={hasBlocked}
                purchasing={purchasing}
                locale={locale}
                onUpdateQuantite={onUpdateQuantite}
                onRemoveFromCart={onRemoveFromCart}
              />

              {/* ── Badges gating — un par module bloqué ───────────────── */}
              {hasBlocked && (
                <div className="space-y-2">
                  {lineItems
                    .filter((li) => li.blocked && li.minPlanNom)
                    .map((li) => (
                      <PlanGatingBadge
                        key={li.slug}
                        moduleName={li.nom_fr}
                        requiredPlan={li.minPlanNom!}
                        locale={locale}
                      />
                    ))}
                </div>
              )}

              {/* ── Récapitulatif ──────────────────────────────────────── */}
              <ModuleCartSummary
                wallet={wallet}
                isLoading={isLoading}
                planPrix={planPrix}
                modulesTotal={modulesTotal}
                grandTotal={grandTotal}
                effectivePlan={effectivePlan}
                locale={locale}
                primaryColor={primaryColor}
              />
            </>
          )}
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        {!done && (
          <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0">
            <button
              onClick={onClose}
              disabled={purchasing}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
            >
              {locale === "fr" ? "Annuler" : "Cancel"}
            </button>

            {!canAfford && grandTotal > 0 && wallet && !hasBlocked ? (
              <button
                onClick={() => setShowTopUp(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <Wallet className="w-4 h-4" />
                {locale === "fr" ? "Recharger" : "Top up"}
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing || isLoading || !effectivePlanSlug || hasBlocked}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {purchasing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Zap className="w-4 h-4" />}
                {purchasing
                  ? (locale === "fr" ? "Paiement…" : "Processing…")
                  : grandTotal > 0
                    ? (locale === "fr"
                        ? `Payer ${formatCurrency(grandTotal)} et activer`
                        : `Pay ${formatCurrency(grandTotal)} & activate`)
                    : (locale === "fr" ? "Activer gratuitement" : "Activate for free")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}