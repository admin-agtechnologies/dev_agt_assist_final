// src/components/modules/ModuleCard.tsx
// Carte module de la marketplace. Gère 3 états :
//   active         → quota, épingler, désactiver, lien résultats
//   available      → activation gratuite (prix_unitaire = 0 / inclus plan)
//   upgrade_required → ajout au panier (prix_unitaire > 0)
// S27 fix : icônes dynamiques depuis m.icone (nom Lucide fourni par backend),
//           noms depuis m.nom_fr / m.nom_en (vrais noms côté backend).
"use client";
import { useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import {
  CheckCircle2, Lock, Pin, PinOff,
  ShoppingCart, BarChart2, Infinity, Minus, Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { featuresRepository, type MarketModule } from "@/repositories/features.repository";
import { FEATURE_TO_ROUTE } from "@/components/layout/Sidebar.config";
import { useToast } from "@/components/ui/Toast";
import type { Locale } from "@/contexts/LanguageContext";

// ── Résolution dynamique d'icône Lucide depuis un nom string ─────────────────

type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

function DynamicIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon =
    (LucideIcons as unknown as Record<string, IconComp | undefined>)[name] ?? Zap;
  return <Icon className={className} style={style} />;
}

// ── Sous-composant : barre de quota ──────────────────────────────────────────

function QuotaBar({
  used,
  quota,
  unlimited,
  locale,
}: {
  used: number;
  quota: number | null;
  unlimited: boolean;
  locale: Locale;
}) {
  if (unlimited) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
        <Infinity className="w-3.5 h-3.5" />
        <span>{locale === "fr" ? "Illimité" : "Unlimited"}</span>
      </div>
    );
  }
  if (!quota) return null;
  const ratio = Math.min(used / quota, 1);
  const color =
    ratio >= 1 ? "#dc2626" : ratio >= 0.85 ? "#ea580c" : ratio >= 0.6 ? "#ca8a04" : "#16a34a";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[var(--text-muted)]">
          {used} / {quota} {locale === "fr" ? "utilisés" : "used"}
        </span>
        <span style={{ color }} className="font-bold">
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  module: MarketModule;
  locale: Locale;
  primaryColor: string;
  isInCart: boolean;
  onAddToCart: (m: MarketModule) => void;
  onRemoveFromCart: (slug: string) => void;
  onChanged: () => void;
}

// ── Composant principal ───────────────────────────────────────────────────────

export function ModuleCard({
  module: m,
  locale,
  primaryColor,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
  onChanged,
}: Props) {
  const toast        = useToast();
  const [busy, setBusy] = useState(false);
  const hubRoute     = FEATURE_TO_ROUTE[m.slug] ?? null;

  // Nom depuis le backend — vrais noms fournis par l'API
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

  const handlePin = () =>
    withBusy(async () => {
      await featuresRepository.pin(m.slug);
      onChanged();
    });

  // ── Badge statut ─────────────────────────────────────────────────────────

  const badge = {
    active:           { text: locale === "fr" ? "Actif" : "Active",         cls: "bg-green-100 text-green-700" },
    available:        { text: locale === "fr" ? "Disponible" : "Available", cls: "bg-blue-100 text-blue-700" },
    upgrade_required: { text: locale === "fr" ? "Upgrade" : "Upgrade",      cls: "bg-orange-100 text-orange-700" },
  }[m.status];

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
        ...(isInCart ? { outlineColor: primaryColor } : {}),
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}18` }}
          >
            <DynamicIcon
              name={m.icone}
              className="w-[18px] h-[18px]"
              style={{ color: primaryColor }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] truncate">{displayName}</p>
            <p className="text-[10px] text-[var(--text-muted)] capitalize">{m.categorie}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", badge.cls)}>
          {badge.text}
        </span>
      </div>

      {/* ── Description (si présente) ── */}
      {m.description && (
        <p className="text-[12px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {m.description}
        </p>
      )}

      {/* ── Quota (si actif) ── */}
      {m.is_active && (
        <QuotaBar used={m.used} quota={m.quota} unlimited={m.is_unlimited} locale={locale} />
      )}

      {/* ── Prix / inclusion (si pas actif) ── */}
      {!m.is_active && (
        <div>
          {m.included_in_plan ? (
            <p className="text-[12px] font-semibold text-green-600">
              ✓ {locale === "fr" ? "Inclus dans votre plan" : "Included in your plan"}
            </p>
          ) : m.prix_unitaire > 0 ? (
            <p className="text-sm font-bold text-[var(--text)]">
              {formatCurrency(m.prix_unitaire)}
              {m.quota_unitaire > 0 && (
                <span className="text-[11px] font-normal text-[var(--text-muted)]">
                  {" "}/ {m.quota_unitaire} {locale === "fr" ? "unités" : "units"}
                </span>
              )}
            </p>
          ) : null}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)]">
        {m.is_active ? (
          <>
            {hubRoute && (
              <Link
                href={hubRoute}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                {locale === "fr" ? "Résultats" : "Results"}
              </Link>
            )}
            <button
              onClick={handlePin}
              disabled={busy}
              title={m.is_pinned
                ? (locale === "fr" ? "Désépingler" : "Unpin")
                : (locale === "fr" ? "Épingler dans la sidebar" : "Pin to sidebar")}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
            >
              {m.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
            {!m.is_mandatory && (
              <button
                onClick={handleDeactivate}
                disabled={busy || !m.can_deactivate}
                title={
                  !m.can_deactivate
                    ? (locale === "fr" ? "Quota actif — désactivation impossible" : "Active quota — cannot deactivate")
                    : (locale === "fr" ? "Désactiver" : "Deactivate")
                }
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : m.status === "available" ? (
          <button
            onClick={handleActivate}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {busy ? "…" : (locale === "fr" ? "Activer gratuitement" : "Activate for free")}
          </button>
        ) : (
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