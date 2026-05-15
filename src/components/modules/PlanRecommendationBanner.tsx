// src/components/modules/PlanRecommendationBanner.tsx
// Banner de recommandation de plan, affiché quand le panier contient des modules
// qui coûtent plus cher à la pièce qu'un plan qui les couvre.
// Tient compte des modules désirés + panier (logique enrichie S27).
"use client";
import { Sparkles, X, ArrowRight, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import type { PlanRecommendation } from "@/hooks/useModuleMarket";
import type { Locale } from "@/contexts/LanguageContext";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  recommendation: PlanRecommendation;
  onDismiss: () => void;
  locale: Locale;
  primaryColor: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function PlanRecommendationBanner({
  recommendation,
  onDismiss,
  locale,
  primaryColor,
}: Props) {
  const router = useRouter();
  const { plan, saving, cartTotal, coveredSlugs } = recommendation;

  const savingPct = Math.round((saving / cartTotal) * 100);

  const title = locale === "fr"
    ? `Le plan ${plan.nom} vous correspond mieux`
    : `The ${plan.nom} plan suits you better`;

  const body = locale === "fr"
    ? `Ces ${coveredSlugs.length} module${coveredSlugs.length > 1 ? "s" : ""} vous coûteraient ${formatCurrency(cartTotal)} à la pièce. Avec le plan ${plan.nom} à ${formatCurrency(plan.prix)}/mois, vous économisez ${formatCurrency(saving)}.`
    : `These ${coveredSlugs.length} module${coveredSlugs.length > 1 ? "s" : ""} would cost ${formatCurrency(cartTotal)} individually. With the ${plan.nom} plan at ${formatCurrency(plan.prix)}/mo, you save ${formatCurrency(saving)}.`;

  const cta = locale === "fr"
    ? `Découvrir le plan ${plan.nom}`
    : `Discover the ${plan.nom} plan`;

  return (
    <div
      className={cn(
        "relative rounded-2xl p-4 flex items-start gap-3 overflow-hidden",
        "animate-fade-in",
      )}
      style={{
        background: `linear-gradient(135deg, ${primaryColor}12 0%, ${primaryColor}06 100%)`,
        border: `1px solid ${primaryColor}30`,
      }}
    >
      {/* Décoration de fond */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Icône */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${primaryColor}20` }}
      >
        <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-[var(--text)]">{title}</p>
          {/* Badge économie */}
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <TrendingDown className="w-3 h-3" />
            -{savingPct}%
          </span>
        </div>

        <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">{body}</p>

        <button
          onClick={() =>
            router.push(`/billing?reason=module_upgrade&plan=${plan.slug}`)
          }
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-75"
          style={{ color: primaryColor }}
        >
          {cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        aria-label={locale === "fr" ? "Fermer" : "Dismiss"}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}