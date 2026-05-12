// src/components/modules/ModuleTabActive.tsx
// Tab "Actifs" — liste des modules actifs du tenant.
// Chaque carte : icône + nom + quota + boutons épingler/désépingler + désactiver.
"use client";
import { useState } from "react";
import { Pin, PinOff, Lock } from "lucide-react";
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

export function ModuleTabActive({ features, locale, onChanged }: Props) {
  const { theme } = useSector();
  const toast = useToast();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  if (features.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          {locale === "fr" ? "Aucun module actif." : "No active module."}
        </p>
      </div>
    );
  }

  const handlePin = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      await featuresRepository.pin(slug);
      onChanged();
    } catch {
      toast.error(locale === "fr" ? "Erreur épinglage." : "Pin error.");
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleDeactivate = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      await featuresRepository.toggle(slug, false);
      onChanged();
    } catch {
      toast.error(locale === "fr" ? "Erreur désactivation." : "Deactivation error.");
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {features.map((f) => {
        const lbl = getFeatureLabel(f.slug, locale);
        const isUnlimited = f.is_unlimited || f.quota == null;
        const used = f.used ?? 0;
        const quota = f.quota ?? 0;
        const quotaReached = !isUnlimited && quota > 0 && used >= quota;
        const isLoading = loadingSlug === f.slug;

        return (
          <div key={f.slug} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text)] truncate">{lbl.nav}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {isUnlimited
                    ? (locale === "fr" ? "Illimité" : "Unlimited")
                    : quotaReached
                      ? <span className="text-red-600 font-bold flex items-center gap-1"><Lock className="w-3 h-3" />{locale === "fr" ? "Quota atteint" : "Quota reached"}</span>
                      : `${used}/${quota}`}
                </p>
              </div>
              {f.is_mandatory && (
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)]">
                  {locale === "fr" ? "Obligatoire" : "Required"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => handlePin(f.slug)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
              >
                {f.is_pinned ? (
                  <>
                    <PinOff className="w-3.5 h-3.5" />
                    {locale === "fr" ? "Désépingler" : "Unpin"}
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    {locale === "fr" ? "Épingler" : "Pin"}
                  </>
                )}
              </button>

              {!f.is_mandatory && (
                <button
                  onClick={() => handleDeactivate(f.slug)}
                  disabled={isLoading}
                  className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  {locale === "fr" ? "Désactiver" : "Deactivate"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}