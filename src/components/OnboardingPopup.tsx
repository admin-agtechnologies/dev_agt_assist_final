// src/components/OnboardingPopup.tsx
"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Z_MODAL } from "@/lib/constants";
import type { OnboardingPayload } from "@/types/onboarding";

interface OnboardingPopupProps {
  popupKey: string;
  payload: OnboardingPayload;
  onClose: () => void;
  onCtaClick: (href?: string, action?: string) => void;
}

export function OnboardingPopup({
  popupKey,
  payload,
  onClose,
  onCtaClick,
}: OnboardingPopupProps) {
  // Certains popups ne doivent pas se fermer
  // UPGRADE_PLAN est bloquant : l'utilisateur doit cliquer sur le CTA
  const isBlocking = popupKey === "UPGRADE_PLAN";

  // Fermer avec Escape — désactivé pour les popups bloquants
  useEffect(() => {
    if (isBlocking) return; // Pas d'Escape pour UPGRADE_PLAN

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isBlocking]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_MODAL }}
    >
      {/* Overlay — non cliquable si popup bloquant */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isBlocking ? undefined : onClose}
      />

      {/* Carte popup */}
      <div className="relative bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[var(--border)]">
        {/* Bouton fermer — masqué si popup bloquant */}
        {!isBlocking && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Contenu */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--text)] pr-8">
            {payload.title}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {payload.message}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2">
          {payload.cta_primary && (
            <>
              <button
                onClick={() =>
                  onCtaClick(
                    payload.cta_primary?.href,
                    payload.cta_primary?.action,
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#075E54] text-white font-semibold text-sm hover:bg-[#064e46] transition-colors"
              >
                {payload.cta_primary.label}
              </button>
              {payload.cta_primary.note && (
                <p className="text-xs text-center text-[var(--text-muted)]">
                  {payload.cta_primary.note}
                </p>
              )}
            </>
          )}
          {payload.cta_secondary && (
            <>
              <button
                onClick={() =>
                  onCtaClick(
                    payload.cta_secondary?.href,
                    payload.cta_secondary?.action,
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-medium text-sm hover:bg-[var(--bg)] transition-colors"
              >
                {payload.cta_secondary.label}
              </button>
              {payload.cta_secondary.note && (
                <p className="text-xs text-center text-[var(--text-muted)]">
                  {payload.cta_secondary.note}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
