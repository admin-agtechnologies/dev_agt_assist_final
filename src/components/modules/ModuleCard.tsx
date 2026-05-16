// src/components/modules/ModuleCard.tsx
// S30 (Gabriel) — Modularisation :
//   - ModuleCardHeader   : icône + nom + étoile favoris (désactivée si actif) + badge
//   - ModuleCardActions  : boutons selon statut + Désactiver grisé si obligatoire
//   - ModuleCardQuotaBar : barre de progression du quota
//   - Confirmation Désactiver via ConfirmDialog (composant partagé)
"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { featuresRepository } from "@/repositories/features.repository";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModuleCardHeader }   from "./ModuleCardHeader";
import { ModuleCardActions }  from "./ModuleCardActions";
import { ModuleCardQuotaBar } from "./ModuleCardQuotaBar";
import type { MarketModule } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  m:                MarketModule;
  isInCart:         boolean;
  onAddToCart:      (m: MarketModule) => void;
  onRemoveFromCart: (slug: string) => void;
  onChanged:        () => void;
  locale:           Locale;
  primaryColor:     string;
}

export function ModuleCard({
  m,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
  onChanged,
  locale,
  primaryColor,
}: Props) {
  const toast = useToast();
  const [busy, setBusy]                       = useState(false);
  const [isDesired, setIsDesired]             = useState(m.is_desired);
  const [confirmOpen, setConfirmOpen]         = useState(false);

  const displayName = locale === "fr" ? m.nom_fr : m.nom_en;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  const handleActivate = () =>
    withBusy(async () => {
      await featuresRepository.toggle(m.slug, true);
      toast.success(locale === "fr" ? "Module activé !" : "Module activated!");
      onChanged();
    });

  const handleDeactivate = () => setConfirmOpen(true);

  const handleConfirmDeactivate = () =>
    withBusy(async () => {
      try {
        await featuresRepository.toggle(m.slug, false);
        toast.success(
          locale === "fr"
            ? "Module désactivé. Quota conservé."
            : "Module deactivated. Quota preserved.",
        );
        setConfirmOpen(false);
        onChanged();
      } catch {
        toast.error(locale === "fr" ? "Erreur lors de la désactivation." : "Deactivation error.");
      }
    });

  const handleToggleDesired = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await featuresRepository.toggleDesired(m.slug);
      setIsDesired(res.is_desired);
      if (res.is_desired) {
        toast.success(locale === "fr" ? "Ajouté à vos favoris." : "Added to favorites.");
      }
      onChanged();
    } catch {
      toast.error(locale === "fr" ? "Erreur favoris." : "Favorites error.");
    }
  };

  // ── Quota display ─────────────────────────────────────────────────────────

  const quotaDisplay = m.is_active
    ? m.is_unlimited
      ? `∞ · ${m.used ?? 0} ${locale === "fr" ? "consommées" : "used"}`
      : m.quota != null
        ? `${m.used ?? 0} / ${m.quota}`
        : null
    : m.quota_unitaire > 0
      ? `${m.quota_unitaire} ${locale === "fr" ? "unités" : "units"} / achat`
      : null;

  const hasLimitedQuota = m.is_active && !m.is_unlimited && m.quota != null && m.quota > 0;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={cn(
          "card flex flex-col gap-3 p-4 transition-all duration-200 hover:shadow-md",
          m.status === "active" && "border-l-[3px]",
          isInCart && "outline outline-2 outline-offset-1",
        )}
        style={{
          ...(m.status === "active" ? { borderLeftColor: primaryColor } : {}),
          ...(isInCart              ? { outlineColor: `${primaryColor}60` } : {}),
        }}
      >
        <ModuleCardHeader
          m={m}
          displayName={displayName}
          isDesired={isDesired}
          primaryColor={primaryColor}
          locale={locale}
          onToggleDesired={handleToggleDesired}
        />

        {/* Quota textuel + barre de progression */}
        {quotaDisplay && (
          <div className="-mt-1 px-12">
            <p className="text-[11px] text-[var(--text-muted)]">{quotaDisplay}</p>
            {hasLimitedQuota && (
              <ModuleCardQuotaBar used={m.used ?? 0} quota={m.quota!} />
            )}
          </div>
        )}

        {/* Description */}
        {m.description && (
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {m.description}
          </p>
        )}

        {/* Prix (uniquement modules non actifs) */}
        {m.status !== "active" && (
          <p className="text-xs text-[var(--text-muted)]">
            {m.prix_unitaire === 0
              ? <span className="text-green-600 font-semibold">
                  {locale === "fr" ? "Inclus dans votre plan" : "Included in plan"}
                </span>
              : <>{formatCurrency(m.prix_unitaire)} <span className="text-[var(--text-muted)]">/ unité</span></>}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)] mt-auto">
          <ModuleCardActions
            m={m}
            isInCart={isInCart}
            busy={busy}
            primaryColor={primaryColor}
            locale={locale}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        isLoading={busy}
        onConfirm={handleConfirmDeactivate}
        onClose={() => setConfirmOpen(false)}
        variant="warning"
        title={locale === "fr" ? "Désactiver le module ?" : "Deactivate module?"}
        message={locale === "fr"
          ? `Le module « ${displayName} » sera désactivé. Votre quota actuel est conservé et restauré dès que vous le réactiverez.`
          : `The "${displayName}" module will be deactivated. Your current quota is preserved and restored when reactivated.`}
        confirmLabel={locale === "fr" ? "Désactiver" : "Deactivate"}
        cancelLabel={locale === "fr"  ? "Annuler"    : "Cancel"}
      />
    </>
  );
}