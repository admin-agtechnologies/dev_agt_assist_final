// src/components/ui/Modal.tsx
// Modal générique avec createPortal — base pour tous les modaux AGT
// Tailles : sm | md | lg | xl | full
// Zéro texte en dur — titre et contenu fournis par le parent

"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  /** Contrôle l'affichage */
  isOpen: boolean;
  /** Callback fermeture — Echap + clic backdrop */
  onClose: () => void;
  /** Titre de la modale — vient du dictionnaire appelant */
  title?: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Contenu principal */
  children: React.ReactNode;
  /** Footer (boutons d'action) */
  footer?: React.ReactNode;
  /** Taille */
  size?: ModalSize;
  /** Empêche la fermeture en cliquant sur le backdrop */
  disableBackdropClose?: boolean;
  /** Masque le bouton X */
  hideCloseButton?: boolean;
  /** Classes additionnelles sur le panel */
  className?: string;
}

// ─── Config tailles ───────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-4xl",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  disableBackdropClose = false,
  hideCloseButton = false,
  className = "",
}: ModalProps): React.ReactElement | null {
  // Fermeture clavier Echap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    // Bloquer le scroll body
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!disableBackdropClose) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop cliquable */}
      <div
        className="absolute inset-0"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={[
          "relative w-full bg-[var(--card,#ffffff)] rounded-2xl shadow-2xl",
          "flex flex-col max-h-[90vh] animate-zoom-in",
          SIZE_CLASSES[size],
          className,
        ].join(" ")}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[var(--border,#e2e8f0)] flex-shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-bold text-[var(--text,#0f172a)] leading-snug"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-[var(--text-muted,#64748b)]">
                  {subtitle}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 pt-4 border-t border-[var(--border,#e2e8f0)] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;