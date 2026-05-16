// src/components/modules/ModuleCardActions.tsx
// S30 (Gabriel) — Extrait de ModuleCard pour modularisation.
// Zone d'actions de la carte selon le statut du module :
//   - active           : "+ Quota" (si quota limité) ET "Désactiver" (si can_deactivate)
//                        + Désactiver grisé si module obligatoire (tooltip explicatif)
//   - available        : "Activer gratuitement"
//   - upgrade_required : "Ajouter au panier" / "Retirer"
"use client";
import { ShoppingCart, Minus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketModule } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  m:                MarketModule;
  isInCart:         boolean;
  busy:             boolean;
  primaryColor:     string;
  locale:           Locale;
  onActivate:       () => void;
  onDeactivate:     () => void;
  onAddToCart:      (m: MarketModule) => void;
  onRemoveFromCart: (slug: string) => void;
}

export function ModuleCardActions({
  m,
  isInCart,
  busy,
  primaryColor,
  locale,
  onActivate,
  onDeactivate,
  onAddToCart,
  onRemoveFromCart,
}: Props) {
  // ── Module actif ──────────────────────────────────────────────────────────
  if (m.status === "active") {
    const hasLimitedQuota = !m.is_unlimited && m.quota != null && m.quota > 0;
    const isMandatory     = !m.can_deactivate;

    return (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {locale === "fr" ? "Actif" : "Active"}
        </span>

        <div className="flex items-center gap-3">
          {hasLimitedQuota && (
            <button
              onClick={() => isInCart ? onRemoveFromCart(m.slug) : onAddToCart(m)}
              className="text-xs font-semibold transition-colors"
              style={{ color: primaryColor }}
            >
              {isInCart
                ? (locale === "fr" ? "Retirer" : "Remove")
                : (locale === "fr" ? "+ Quota" : "+ Quota")}
            </button>
          )}

          <button
            onClick={isMandatory ? undefined : onDeactivate}
            disabled={busy || isMandatory}
            title={isMandatory
              ? (locale === "fr" ? "Module obligatoire — non désactivable" : "Mandatory module — cannot deactivate")
              : (locale === "fr" ? "Désactiver" : "Deactivate")}
            className={cn(
              "text-xs font-medium transition-colors",
              isMandatory
                ? "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                : "text-red-500 hover:text-red-600 disabled:opacity-50",
            )}
          >
            {locale === "fr" ? "Désactiver" : "Deactivate"}
          </button>
        </div>
      </div>
    );
  }

  // ── Module disponible (inclus dans le plan) ───────────────────────────────
  if (m.status === "available") {
    return (
      <button
        onClick={onActivate}
        disabled={busy}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {busy ? "…" : (locale === "fr" ? "Activer gratuitement" : "Activate for free")}
      </button>
    );
  }

  // ── Module upgrade_required ───────────────────────────────────────────────
  return (
    <button
      onClick={() => isInCart ? onRemoveFromCart(m.slug) : onAddToCart(m)}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
        isInCart
          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
          : "text-white hover:opacity-90",
      )}
      style={!isInCart ? { backgroundColor: primaryColor } : {}}
    >
      {isInCart
        ? <><Minus className="w-3.5 h-3.5" />{locale === "fr" ? "Retirer" : "Remove"}</>
        : <><ShoppingCart className="w-3.5 h-3.5" />{locale === "fr" ? "Ajouter" : "Add"}</>}
    </button>
  );
}