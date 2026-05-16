// src/components/modules/ModuleCartLineItems.tsx
"use client";
import { BadgeCheck, Lock, Minus, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Locale } from "@/contexts/LanguageContext";

export interface LineItem {
  slug: string;
  nom_fr: string;
  quantite: number;
  covered: boolean;
  blocked: boolean;
  prixLigne: number;
  quotaTotal: number;
  minPlanNom: string | null;
}

interface Props {
  lineItems: LineItem[];
  hasBlocked: boolean;
  purchasing: boolean;
  locale: Locale;
  onUpdateQuantite: (slug: string, quantite: number) => void;
  onRemoveFromCart: (slug: string) => void;
}

export function ModuleCartLineItems({
  lineItems,
  hasBlocked,
  purchasing,
  locale,
  onUpdateQuantite,
  onRemoveFromCart,
}: Props) {
  if (lineItems.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
        {locale === "fr" ? "Modules sélectionnés" : "Selected modules"}
      </p>

      <div className="space-y-2">
        {lineItems.map((li) => (
          <div
            key={li.slug}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border",
              li.blocked
                ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                : "bg-[var(--bg)] border-[var(--border)]",
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text)] truncate">{li.nom_fr}</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {li.blocked ? (
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <Lock className="w-3 h-3" />
                    {li.minPlanNom
                      ? (locale === "fr"
                          ? `Disponible à partir du plan ${li.minPlanNom}`
                          : `Available from ${li.minPlanNom} plan`)
                      : (locale === "fr" ? "Plan supérieur requis" : "Higher plan required")}
                  </span>
                ) : li.covered ? (
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

            {li.blocked ? (
              <button
                onClick={() => onRemoveFromCart(li.slug)}
                disabled={purchasing}
                className="flex-shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                {locale === "fr" ? "Retirer" : "Remove"}
              </button>
            ) : !li.covered ? (
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
            ) : null}
          </div>
        ))}
      </div>

      {hasBlocked && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {locale === "fr"
              ? "Retirez les modules non disponibles ou upgradez votre plan pour continuer."
              : "Remove unavailable modules or upgrade your plan to continue."}
          </span>
        </div>
      )}
    </div>
  );
}