// src/components/modules/ModuleTabAvailable.tsx
// Tab "Disponibles" — modules inclus dans le plan mais pas encore activés.
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { featuresRepository } from "@/repositories/features.repository";
import type { ActiveFeature } from "@/repositories/features.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { useSector } from "@/hooks/useSector";
import { useToast } from "@/components/ui/Toast";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  features: ActiveFeature[];
  locale: Locale;
  onChanged: () => void;
}

export function ModuleTabAvailable({ features, locale, onChanged }: Props) {
  const { theme } = useSector();
  const toast = useToast();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  if (features.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          {locale === "fr"
            ? "Tous les modules de votre plan sont déjà activés."
            : "All modules of your plan are already activated."}
        </p>
      </div>
    );
  }

  const handleActivate = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      await featuresRepository.toggle(slug, true);
      toast.success(locale === "fr" ? "Module activé !" : "Module activated!");
      onChanged();
    } catch {
      toast.error(locale === "fr" ? "Erreur d'activation." : "Activation error.");
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {features.map((f) => {
        const lbl = getFeatureLabel(f.slug, locale);
        const isLoading = loadingSlug === f.slug;

        return (
          <div key={f.slug} className="card p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{lbl.nav}</p>
              {f.description && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                  {f.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleActivate(f.slug)}
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus className="w-3.5 h-3.5" />
              {isLoading
                ? (locale === "fr" ? "Activation..." : "Activating...")
                : (locale === "fr" ? "Activer" : "Activate")}
            </button>
          </div>
        );
      })}
    </div>
  );
}