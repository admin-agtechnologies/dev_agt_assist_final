// src/components/modules/ModuleTabUpgrade.tsx
// Tab "Upgrade" — modules hors plan, CTA vers billing.
"use client";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { ActiveFeature } from "@/repositories/features.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { useSector } from "@/hooks/useSector";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  features: ActiveFeature[];
  locale: Locale;
}

export function ModuleTabUpgrade({ features, locale }: Props) {
  const router = useRouter();
  const { theme } = useSector();

  if (features.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          {locale === "fr"
            ? "Tous les modules sont disponibles dans votre plan actuel."
            : "All modules are available in your current plan."}
        </p>
      </div>
    );
  }

  const handleUpgrade = (slug: string) => {
    router.push(`/billing?reason=module_upgrade&feature=${slug}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {features.map((f) => {
        const lbl = getFeatureLabel(f.slug, locale);

        return (
          <div key={f.slug} className="card p-4 space-y-3 relative overflow-hidden">
            <div
              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-white"
              style={{ backgroundColor: theme.accent }}
            >
              {locale === "fr" ? "Plan supérieur" : "Higher plan"}
            </div>

            <div className="pr-20">
              <p className="text-sm font-bold text-[var(--text)]">{lbl.nav}</p>
              {f.description && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                  {f.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleUpgrade(f.slug)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-100 text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "fr" ? "Voir les abonnements" : "View subscriptions"}
            </button>
          </div>
        );
      })}
    </div>
  );
}