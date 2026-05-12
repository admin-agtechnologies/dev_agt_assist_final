// src/components/OnboardingBanner.tsx
// Bannière sticky non-bloquante pour les règles de convergence (SHOW_BANNER).
// Affichée en haut du contenu dashboard, persistante tant que la condition
// backend reste vraie (le useOnboarding la refresh à chaque navigation).
"use client";
import { X, Sparkles } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import type { OnboardingPayload } from "@/types/onboarding";

interface OnboardingBannerProps {
  popupKey: string;
  payload: OnboardingPayload;
  onClose: () => void;
  onCtaClick: (href?: string, action?: string) => void;
}

export function OnboardingBanner({
  popupKey: _popupKey,
  payload,
  onClose,
  onCtaClick,
}: OnboardingBannerProps) {
  const { theme } = useSector();

  return (
    <div
      className="w-full px-4 py-3 border-b border-[var(--border)] flex items-start sm:items-center gap-3 flex-wrap sm:flex-nowrap"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}12, ${theme.accent}12)`,
      }}
    >
      {/* Icône */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white"
        style={{ backgroundColor: theme.primary }}
      >
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] leading-tight">
          {payload.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-snug mt-0.5">
          {payload.message}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {payload.cta_primary && (
          <button
            onClick={() =>
              onCtaClick(
                payload.cta_primary?.href,
                payload.cta_primary?.action,
              )
            }
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{ backgroundColor: theme.primary }}
          >
            {payload.cta_primary.label}
          </button>
        )}
        {payload.cta_secondary && (
          <button
            onClick={() =>
              onCtaClick(
                payload.cta_secondary?.href,
                payload.cta_secondary?.action,
              )
            }
            className="hidden sm:inline-flex px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-xs font-medium hover:bg-[var(--bg-card)] transition-colors"
          >
            {payload.cta_secondary.label}
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}