// src/components/welcome/WelcomeScreen2.tsx
// Écran 2 : Affiche les modules actifs du tenant avec leurs quotas.
"use client";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { getFeatureLabel } from "@/lib/sector-labels";
import type { ActiveFeature } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  features: ActiveFeature[];
  locale: Locale;
  onBack: () => void;
  onContinue: () => void;
  onFeaturesChanged: () => void;
}

export function WelcomeScreen2({ features, locale, onBack, onContinue }: Props) {
  const { theme } = useSector();

  return (
    <div className="card p-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[var(--text)]">
          {locale === "fr" ? "Vos modules actifs" : "Your active modules"}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {locale === "fr"
            ? "Voici les fonctionnalités prêtes à l'emploi sur votre compte."
            : "Here are the features ready to use on your account."}
        </p>
      </div>

      {/* Grille modules */}
      {features.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)]">
            {locale === "fr" ? "Aucun module activé." : "No modules activated."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {features.map((f) => {
            const lbl = getFeatureLabel(f.slug, locale);
            const isUnlimited = f.is_unlimited || f.quota == null;
            const used = f.used ?? 0;
            const quota = f.quota ?? 0;
            const quotaReached = !isUnlimited && quota > 0 && used >= quota;

            return (
              <div
                key={f.slug}
                className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg)] space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--text)] truncate">
                    {lbl.nav}
                  </p>
                  {f.is_mandatory && (
                    <span
                      className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {locale === "fr" ? "Inclus" : "Included"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isUnlimited
                    ? (locale === "fr" ? "✨ Illimité" : "✨ Unlimited")
                    : quotaReached
                      ? <span className="text-red-600 font-bold inline-flex items-center gap-1"><Lock className="w-3 h-3" />{locale === "fr" ? "Quota atteint" : "Quota reached"}</span>
                      : `${used}/${quota} ${locale === "fr" ? "utilisés" : "used"}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "fr" ? "Retour" : "Back"}
        </button>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
          style={{ backgroundColor: theme.primary }}
        >
          {locale === "fr" ? "C'est parti" : "Let's go"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}