// src/components/OnboardingPopup.tsx
// Modal d'onboarding (action SHOW_POPUP).
// Comportement S7 — Vague 1 :
//   - Délai 2 secondes avant ouverture (laisser respirer le user à l'arrivée)
//   - Croix de fermeture TOUJOURS visible, même pour UPGRADE_PLAN
//   - Escape ferme TOUJOURS le popup
//   - Backdrop cliquable TOUJOURS pour fermer
//
// Rationale (UX) : le popup ne doit pas être perçu comme une prison.
// Le user peut toujours le fermer ; il reviendra de toute façon au prochain
// changement de page si la condition backend reste vraie.
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Z_MODAL } from "@/lib/constants";
import type { OnboardingPayload } from "@/types/onboarding";

const OPEN_DELAY_MS = 2000;

interface OnboardingPopupProps {
  popupKey: string;
  payload: OnboardingPayload;
  onClose: () => void;
  onCtaClick: (href?: string, action?: string) => void;
}

export function OnboardingPopup({
  popupKey: _popupKey,
  payload,
  onClose,
  onCtaClick,
}: OnboardingPopupProps) {
  const [visible, setVisible] = useState(false);

  // Délai d'apparition — laisser le user atterrir avant de l'interpeller
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Escape ferme — toujours
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: Z_MODAL }}
    >
      {/* Overlay — cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Carte popup */}
      <div className="relative bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[var(--border)]">
        {/* Bouton fermer — toujours visible */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

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
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-primary,#075E54)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
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