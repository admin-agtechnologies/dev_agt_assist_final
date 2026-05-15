// src/components/modules/ModuleCartPanel.tsx
// Panneau panier : slide-in latéral (desktop) / bottom sheet (mobile).
// Affiche les items, le total et le CTA de validation.
"use client";
import { X, ShoppingCart, Trash2, ArrowRight, PackageOpen } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/hooks/useModuleMarket";
import type { Locale } from "@/contexts/LanguageContext";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onRemoveItem: (slug: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  locale: Locale;
  primaryColor: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ModuleCartPanel({
  open,
  onClose,
  cart,
  cartTotal,
  onRemoveItem,
  onClearCart,
  onCheckout,
  locale,
  primaryColor,
}: Props) {
  const isEmpty = cart.length === 0;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          // Mobile : bottom sheet
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl",
          // Desktop : sidebar droite
          "md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full md:rounded-none md:rounded-l-2xl",
          // Fond + ombre
          "bg-[var(--bg-card)] shadow-2xl",
          // Transition
          "transition-transform duration-300 ease-out",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" style={{ color: primaryColor }} />
            <h2 className="text-sm font-bold text-[var(--text)]">
              {locale === "fr" ? "Ma sélection" : "My selection"}
            </h2>
            {!isEmpty && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {cart.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <button
                onClick={onClearCart}
                className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                {locale === "fr" ? "Vider" : "Clear"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Contenu ── */}
        <div className="flex flex-col h-[calc(100%-60px)] md:h-[calc(100%-61px)]">

          {isEmpty ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 py-12">
              <PackageOpen className="w-10 h-10 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)] text-center">
                {locale === "fr"
                  ? "Aucun module dans votre sélection.\nAjoutez des modules à activer."
                  : "No module in your selection.\nAdd modules to activate."}
              </p>
            </div>
          ) : (
            <>
              {/* Liste des items */}
              <ul className="flex-1 overflow-y-auto divide-y divide-[var(--border)] px-5">
                {cart.map((item) => (
                  <li key={item.slug} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">
                        {item.nom_fr}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {item.prix_unitaire > 0
                          ? formatCurrency(item.prix_unitaire)
                          : (locale === "fr" ? "Gratuit" : "Free")}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.slug)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label={locale === "fr" ? "Retirer" : "Remove"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* ── Footer total + CTA ── */}
              <div className="px-5 py-4 border-t border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">
                    {locale === "fr" ? "Total estimé" : "Estimated total"}
                  </span>
                  <span className="text-base font-black text-[var(--text)]">
                    {cartTotal > 0 ? formatCurrency(cartTotal) : (locale === "fr" ? "Gratuit" : "Free")}
                  </span>
                </div>

                <button
                  onClick={() => { onClose(); onCheckout(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor }}
                >
                  {locale === "fr" ? "Valider ma sélection" : "Confirm selection"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}