// src/components/modules/ModuleCartCheckout.tsx
// Modal de validation du panier modules — même flow que WelcomeScreen3 :
//   1. Affiche le solde wallet
//   2. Si insuffisant → ouvre TopUpModal pour recharger
//   3. Si suffisant  → "Payer et activer" → toggle chaque module
// TODO backend : POST /api/v1/features/purchase/ pour débit wallet réel
"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, Wallet, Loader2,
  AlertCircle, ShoppingCart, Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { featuresRepository } from "@/repositories/features.repository";
import { walletsRepository } from "@/repositories";
import { useToast } from "@/components/ui/Toast";
import { TopUpModal } from "@/app/(dashboard)/billing/components/TopUpModal";
import type { CartItem } from "@/hooks/useModuleMarket";
import type { MarketModule } from "@/repositories/features.repository";
import type { Wallet as WalletType } from "@/types/api";
import type { Locale } from "@/contexts/LanguageContext";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  allModules: MarketModule[];
  cartTotal: number;
  onSuccess: () => void;
  locale: Locale;
  primaryColor: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ModuleCartCheckout({
  open,
  onClose,
  cart,
  allModules,
  cartTotal,
  onSuccess,
  locale,
  primaryColor,
}: Props) {
  const toast = useToast();

  const [wallet, setWallet]           = useState<WalletType | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [activating, setActivating]   = useState(false);
  const [showTopUp, setShowTopUp]     = useState(false);
  const [done, setDone]               = useState(false);

  // ── Segmentation panier ───────────────────────────────────────────────────

  const freeItems = cart.filter((c) => {
    const mod = allModules.find((m) => m.slug === c.slug);
    return mod?.status === "available";
  });
  const paidItems = cart.filter((c) => {
    const mod = allModules.find((m) => m.slug === c.slug);
    return mod?.status === "upgrade_required";
  });
  const paidTotal  = paidItems.reduce((s, c) => s + c.prix_unitaire, 0);
  const canAfford  = wallet ? wallet.solde >= paidTotal : false;
  const balanceAfter = wallet ? wallet.solde - paidTotal : 0;

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

  // ── Activation des modules ────────────────────────────────────────────────

  const handleActivate = async () => {
    setActivating(true);
    let count = 0;
    const allItems = [...freeItems, ...paidItems];

    for (const item of allItems) {
      try {
        await featuresRepository.toggle(item.slug, true);
        count++;
      } catch {
        toast.error(
          locale === "fr"
            ? `Erreur : ${item.nom_fr}`
            : `Error: ${item.nom_fr}`,
        );
      }
    }

    setActivating(false);

    if (count > 0) {
      setDone(true);
      toast.success(
        locale === "fr"
          ? `${count} module(s) activé(s) avec succès !`
          : `${count} module(s) activated successfully!`,
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }
  };

  // ── Rendu TopUpModal (si solde insuffisant) ───────────────────────────────

  if (showTopUp && wallet) {
    return (
      <TopUpModal
        wallet={wallet}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => {
          setShowTopUp(false);
          loadWallet(); // rafraîchir le solde après recharge
        }}
      />
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!activating ? onClose : undefined} />

      <div className="relative z-10 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" style={{ color: primaryColor }} />
            <h2 className="text-base font-bold text-[var(--text)]">
              {done
                ? (locale === "fr" ? "Modules activés !" : "Modules activated!")
                : (locale === "fr" ? "Confirmer l'activation" : "Confirm activation")}
            </h2>
          </div>
          {!activating && (
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ── Succès ── */}
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm text-[var(--text-muted)] text-center">
                {locale === "fr"
                  ? "Vos modules sont maintenant actifs. Rechargez la page si nécessaire."
                  : "Your modules are now active. Reload the page if needed."}
              </p>
            </div>
          ) : (
            <>
              {/* ── Récap modules ── */}
              <div className="space-y-1.5">
                {[...freeItems, ...paidItems].map((item) => (
                  <div key={item.slug} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text)] font-medium">{item.nom_fr}</span>
                    <span className={cn(
                      "font-bold text-xs",
                      item.prix_unitaire === 0 ? "text-green-600" : "text-[var(--text)]",
                    )}>
                      {item.prix_unitaire === 0
                        ? (locale === "fr" ? "Gratuit" : "Free")
                        : formatCurrency(item.prix_unitaire)}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Wallet block (style WelcomeScreen3) ── */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: `${primaryColor}0c`, border: `1px solid ${primaryColor}25` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {locale === "fr" ? "Votre wallet" : "Your wallet"}
                  </span>
                </div>

                {walletLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Chargement…</span>
                  </div>
                ) : wallet ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        {locale === "fr" ? "Solde actuel" : "Current balance"}
                      </span>
                      <span className={cn(
                        "font-black",
                        canAfford || paidTotal === 0 ? "text-green-600" : "text-red-500",
                      )}>
                        {formatCurrency(wallet.solde)}
                      </span>
                    </div>
                    {paidTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">
                          {locale === "fr" ? "Total à payer" : "Total to pay"}
                        </span>
                        <span className="font-bold text-[var(--text)]">
                          {formatCurrency(paidTotal)}
                        </span>
                      </div>
                    )}
                    {canAfford && paidTotal > 0 && (
                      <div className="flex justify-between text-sm pt-1 border-t border-[var(--border)]">
                        <span className="text-[var(--text-muted)]">
                          {locale === "fr" ? "Solde après" : "Balance after"}
                        </span>
                        <span className="font-bold text-[var(--text)]">
                          {formatCurrency(balanceAfter)}
                        </span>
                      </div>
                    )}
                    {!canAfford && paidTotal > 0 && (
                      <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          {locale === "fr"
                            ? `Solde insuffisant — il vous manque ${formatCurrency(paidTotal - wallet.solde)}.`
                            : `Insufficient balance — you need ${formatCurrency(paidTotal - wallet.solde)} more.`}
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

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  disabled={activating}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
                >
                  {locale === "fr" ? "Annuler" : "Cancel"}
                </button>

                {/* Solde insuffisant → Recharger */}
                {!canAfford && paidTotal > 0 && wallet ? (
                  <button
                    onClick={() => setShowTopUp(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Wallet className="w-4 h-4" />
                    {locale === "fr" ? "Recharger le wallet" : "Top up wallet"}
                  </button>
                ) : (
                  /* Solde OK → Activer */
                  <button
                    onClick={handleActivate}
                    disabled={activating || walletLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {activating
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Zap className="w-4 h-4" />}
                    {activating
                      ? (locale === "fr" ? "Activation…" : "Activating…")
                      : paidTotal > 0
                        ? (locale === "fr" ? `Payer ${formatCurrency(paidTotal)} et activer` : `Pay ${formatCurrency(paidTotal)} & activate`)
                        : (locale === "fr" ? "Activer gratuitement" : "Activate for free")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}