// src/components/modules/ModuleCartCheckout.tsx
// S28 (donpk) :
//   - Sélecteur de quantité par module (1× / 2× / 3× / 5×)
//   - Facture dynamique : quantité × quota_unitaire × prix_unitaire
//   - Appel purchase/ au lieu de toggle/ (transaction sécurisée)
//   - Mention "Inclus dans votre plan" pour les modules couverts
//   - Suppression de la logique toggle
"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, Wallet, Loader2,
  AlertCircle, ShoppingCart, Zap, Minus, Plus, BadgeCheck,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { featuresRepository } from "@/repositories/features.repository";
import { walletsRepository } from "@/repositories";
import { useToast } from "@/components/ui/Toast";
import { TopUpModal } from "@/app/(dashboard)/billing/components/TopUpModal";
import type { CartItem } from "@/hooks/useModuleMarket";
import type { MarketModule } from "@/repositories/features.repository";
import type { Wallet as WalletType, Plan } from "@/types/api";
import type { Locale } from "@/contexts/LanguageContext";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  allModules: MarketModule[];
  cartTotal: number;
  plans: Plan[];
  onSuccess: () => void;
  onUpdateQuantite: (slug: string, quantite: number) => void;
  locale: Locale;
  primaryColor: string;
}

// ── Quantités disponibles ─────────────────────────────────────────────────────

const QUANTITES = [1, 2, 3, 5];

// ── Composant ─────────────────────────────────────────────────────────────────

export function ModuleCartCheckout({
  open,
  onClose,
  cart,
  allModules,
  cartTotal,
  plans,
  onSuccess,
  onUpdateQuantite,
  locale,
  primaryColor,
}: Props) {
  const toast = useToast();

  const [wallet, setWallet]               = useState<WalletType | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [purchasing, setPurchasing]       = useState(false);
  const [showTopUp, setShowTopUp]         = useState(false);
  const [done, setDone]                   = useState(false);

  // Plan sélectionné — obligatoire pour purchase/
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("");

  // ── Init plan par défaut ──────────────────────────────────────────────────

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanSlug) {
      setSelectedPlanSlug(plans[0].slug);
    }
  }, [plans, selectedPlanSlug]);

  // ── Plan sélectionné ──────────────────────────────────────────────────────

  const selectedPlan = plans.find((p) => p.slug === selectedPlanSlug) ?? null;

  // ── Calcul de la facture ──────────────────────────────────────────────────

  // Features incluses dans le plan sélectionné (heuristique par slug)
  const isPlanCovered = useCallback(
    (slug: string): boolean => {
      if (!selectedPlan) return false;
      return selectedPlan.features.some((f) =>
        f.toLowerCase().includes(slug.replace(/_/g, " ").split("_")[0].toLowerCase()),
      );
    },
    [selectedPlan],
  );

  const lineItems = cart.map((c) => {
    const mod       = allModules.find((m) => m.slug === c.slug);
    const covered   = isPlanCovered(c.slug);
    const prixLigne = covered ? 0 : c.prix_unitaire * c.quantite;
    const quotaTotal = (mod?.quota_unitaire ?? c.quota_unitaire) * c.quantite;
    return { ...c, covered, prixLigne, quotaTotal };
  });

  const modulesTotal   = lineItems.reduce((s, li) => s + li.prixLigne, 0);
  const planPrix       = selectedPlan?.prix ?? 0;
  const grandTotal     = planPrix + modulesTotal;
  const canAfford      = wallet ? wallet.solde >= grandTotal : false;
  const balanceAfter   = wallet ? wallet.solde - grandTotal : 0;

  // ── Chargement wallet ─────────────────────────────────────────────────────

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const w = await walletsRepository.getMine();
      setWallet(w);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) { setDone(false); loadWallet(); }
  }, [open, loadWallet]);

  if (!open) return null;

  // ── Achat ─────────────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    if (!selectedPlanSlug) {
      toast.error(locale === "fr" ? "Veuillez sélectionner un plan." : "Please select a plan.");
      return;
    }
    setPurchasing(true);
    try {
      await featuresRepository.purchase({
        plan_slug: selectedPlanSlug,
        modules: cart.map((c) => ({ slug: c.slug, quantite: c.quantite })),
      });
      setDone(true);
      toast.success(
        locale === "fr"
          ? "Paiement réussi ! Modules activés."
          : "Payment successful! Modules activated.",
      );
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail;
      toast.error(
        msg ?? (locale === "fr" ? "Erreur lors du paiement." : "Payment error."),
      );
    } finally {
      setPurchasing(false);
    }
  };

  // ── TopUp ─────────────────────────────────────────────────────────────────

  if (showTopUp && wallet) {
    return (
      <TopUpModal
        wallet={wallet}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => { setShowTopUp(false); loadWallet(); }}
      />
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!purchasing ? onClose : undefined} />

      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* En-tête */}
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
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Succès */}
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
              {/* Sélection du plan */}
              {plans.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {locale === "fr" ? "Plan (obligatoire)" : "Plan (required)"}
                  </p>
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
                        <span className={cn(
                          "text-[11px]",
                          selectedPlanSlug === p.slug ? "text-white/80" : "text-[var(--text-muted)]",
                        )}>
                          {formatCurrency(p.prix ?? 0)} / mois
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modules avec sélecteur de quantité */}
              {lineItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {locale === "fr" ? "Modules sélectionnés" : "Selected modules"}
                  </p>
                  <div className="space-y-2">
                    {lineItems.map((li) => (
                      <div
                        key={li.slug}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text)] truncate">{li.nom_fr}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            {li.covered ? (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <BadgeCheck className="w-3 h-3" />
                                {locale === "fr" ? "Inclus dans votre plan" : "Included in your plan"}
                              </span>
                            ) : (
                              <>
                                {li.quotaTotal} {locale === "fr" ? "unités" : "units"}
                                {" · "}{formatCurrency(li.prixLigne)}
                              </>
                            )}
                          </p>
                        </div>

                        {/* Sélecteur quantité — masqué si inclus dans le plan */}
                        {!li.covered && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => onUpdateQuantite(li.slug, li.quantite - 1)}
                              disabled={li.quantite <= 1 || purchasing}
                              className="w-6 h-6 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[var(--text)] w-5 text-center">
                              {li.quantite}×
                            </span>
                            <button
                              onClick={() => onUpdateQuantite(li.slug, li.quantite + 1)}
                              disabled={purchasing}
                              className="w-6 h-6 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloc wallet + facture */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: `${primaryColor}0c`, border: `1px solid ${primaryColor}25` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {locale === "fr" ? "Récapitulatif" : "Summary"}
                  </span>
                </div>

                {walletLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {locale === "fr" ? "Chargement…" : "Loading…"}
                    </span>
                  </div>
                ) : wallet ? (
                  <div className="space-y-1.5 text-sm">
                    {planPrix > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">
                          {locale === "fr" ? "Plan" : "Plan"} {selectedPlan?.nom}
                        </span>
                        <span className="font-semibold text-[var(--text)]">
                          {formatCurrency(planPrix)}
                        </span>
                      </div>
                    )}
                    {modulesTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">
                          {locale === "fr" ? "Modules hors plan" : "Modules not in plan"}
                        </span>
                        <span className="font-semibold text-[var(--text)]">
                          {formatCurrency(modulesTotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-[var(--border)]">
                      <span className="font-bold text-[var(--text)]">
                        {locale === "fr" ? "Total" : "Total"}
                      </span>
                      <span className="font-black text-[var(--text)]">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">
                        {locale === "fr" ? "Solde actuel" : "Current balance"}
                      </span>
                      <span className={cn(
                        "font-bold",
                        canAfford ? "text-green-600" : "text-red-500",
                      )}>
                        {formatCurrency(wallet.solde)}
                      </span>
                    </div>
                    {canAfford && grandTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">
                          {locale === "fr" ? "Solde après" : "Balance after"}
                        </span>
                        <span className="font-bold text-[var(--text)]">
                          {formatCurrency(balanceAfter)}
                        </span>
                      </div>
                    )}
                    {!canAfford && grandTotal > 0 && (
                      <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          {locale === "fr"
                            ? `Solde insuffisant — il vous manque ${formatCurrency(grandTotal - wallet.solde)}.`
                            : `Insufficient balance — you need ${formatCurrency(grandTotal - wallet.solde)} more.`}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    {locale === "fr" ? "Wallet non disponible." : "Wallet unavailable."}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!done && (
          <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0">
            <button
              onClick={onClose}
              disabled={purchasing}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
            >
              {locale === "fr" ? "Annuler" : "Cancel"}
            </button>

            {!canAfford && grandTotal > 0 && wallet ? (
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
                disabled={purchasing || walletLoading || !selectedPlanSlug}
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


