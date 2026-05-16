// src/components/modules/ModuleCard.tsx
// S28 (donpk) :
//   - Suppression du bouton pin/unpin
//   - Ajout badge "Recommandé" pour les modules natifs du secteur (is_native_sector)
//   - Import is_pinned retiré de MarketModule
"use client";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { ShoppingCart, Minus, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { featuresRepository } from "@/repositories/features.repository";
import { useToast } from "@/components/ui/Toast";
import type { MarketModule } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

// ── DynamicIcon ───────────────────────────────────────────────────────────────

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  // Convertit snake_case / kebab-case → PascalCase
  const pascal = name
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  const Icon = icons[pascal] ?? LucideIcons.Zap;
  return <Icon className={className} />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  m: MarketModule;
  isInCart: boolean;
  onAddToCart: (m: MarketModule) => void;
  onRemoveFromCart: (slug: string) => void;
  onChanged: () => void;
  locale: Locale;
  primaryColor: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

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
  const [busy, setBusy] = useState(false);

  const displayName = locale === "fr" ? m.nom_fr : m.nom_en;

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

  const handleDeactivate = () =>
    withBusy(async () => {
      if (!m.can_deactivate) return;
      await featuresRepository.toggle(m.slug, false);
      toast.success(locale === "fr" ? "Module désactivé." : "Module deactivated.");
      onChanged();
    });

  // ── Badges ────────────────────────────────────────────────────────────────

  const statusBadge = {
    active:           { text: locale === "fr" ? "Actif" : "Active",         cls: "bg-green-100 text-green-700" },
    available:        { text: locale === "fr" ? "Disponible" : "Available", cls: "bg-blue-100 text-blue-700" },
    upgrade_required: { text: locale === "fr" ? "Upgrade" : "Upgrade",      cls: "bg-orange-100 text-orange-700" },
  }[m.status];

  // ── Quota display ─────────────────────────────────────────────────────────

  const quotaDisplay = m.is_active
    ? m.is_unlimited
      ? "∞"
      : m.quota != null
        ? `${m.used ?? 0} / ${m.quota}`
        : null
    : m.quota_unitaire > 0
      ? `${m.quota_unitaire} ${locale === "fr" ? "unités" : "units"} / achat`
      : null;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "card flex flex-col gap-3 p-4 transition-all duration-200 hover:shadow-md",
        m.status === "active" && "border-l-[3px]",
        isInCart && "outline outline-2 outline-offset-1",
      )}
      style={{
        ...(m.status === "active" ? { borderLeftColor: primaryColor } : {}),
        ...(isInCart ? { outlineColor: `${primaryColor}60` } : {}),
      }}
    >
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <DynamicIcon
            name={m.icone}
            className="w-4 h-4"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-[var(--text)] truncate">{displayName}</p>
            {/* Badge "Recommandé" pour les modules natifs du secteur */}
            {m.is_native_sector && m.status !== "active" && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                <Star className="w-2.5 h-2.5" />
                {locale === "fr" ? "Recommandé" : "Recommended"}
              </span>
            )}
          </div>
          {quotaDisplay && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{quotaDisplay}</p>
          )}
        </div>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", statusBadge.cls)}>
          {statusBadge.text}
        </span>
      </div>

      {/* Description */}
      {m.description && (
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {m.description}
        </p>
      )}

      {/* Prix */}
      {m.status !== "active" && (
        <p className="text-xs text-[var(--text-muted)]">
          {m.prix_unitaire === 0
            ? <span className="text-green-600 font-semibold">{locale === "fr" ? "Inclus dans votre plan" : "Included in plan"}</span>
            : <>{formatCurrency(m.prix_unitaire)} <span className="text-[var(--text-muted)]">/ unité</span></>}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)] mt-auto">

        {m.status === "active" ? (
          // Module actif → désactiver (si possible)
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {locale === "fr" ? "Actif" : "Active"}
            </span>
            {m.can_deactivate && (
              <button
                onClick={handleDeactivate}
                disabled={busy}
                className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {locale === "fr" ? "Désactiver" : "Deactivate"}
              </button>
            )}
          </div>

        ) : m.status === "available" ? (
          // Module disponible (plan) → activation directe
          <button
            onClick={handleActivate}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {busy
              ? "…"
              : (locale === "fr" ? "Activer gratuitement" : "Activate for free")}
          </button>

        ) : (
          // Module hors plan → panier
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
        )}
      </div>
    </div>
  );
}
