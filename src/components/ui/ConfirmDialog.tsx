// src/components/ui/ConfirmDialog.tsx
// Dialog de confirmation générique — remplace ConfirmDeleteModal
// Variantes : danger (suppression) | warning | info
// Zéro texte en dur — tous les labels fournis par le parent via dictionnaire

"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmDialogVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  /** Contrôle l'affichage */
  isOpen: boolean;
  /** En cours de traitement (désactive les boutons) */
  isLoading?: boolean;
  /** Callback confirmation */
  onConfirm: () => void;
  /** Callback annulation / fermeture */
  onClose: () => void;
  /** Titre — vient du dictionnaire appelant */
  title: string;
  /** Message de description */
  message?: string;
  /** Label bouton confirmation — vient du dictionnaire */
  confirmLabel: string;
  /** Label bouton annulation — vient du dictionnaire */
  cancelLabel: string;
  /** Variante visuelle */
  variant?: ConfirmDialogVariant;
}

// ─── Config par variante ──────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ConfirmDialogVariant,
  {
    iconBg: string;
    iconColor: string;
    Icon: React.ElementType;
    confirmBtn: string;
  }
> = {
  danger: {
    iconBg:     "bg-red-50",
    iconColor:  "text-red-500",
    Icon:       AlertTriangle,
    confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    iconBg:     "bg-amber-50",
    iconColor:  "text-amber-500",
    Icon:       AlertCircle,
    confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  info: {
    iconBg:     "bg-blue-50",
    iconColor:  "text-blue-500",
    Icon:       Info,
    confirmBtn: "bg-[var(--color-primary,#075E54)] hover:opacity-90 text-white",
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
}: ConfirmDialogProps): React.ReactElement | null {
  const cfg = VARIANT_CONFIG[variant];

  // Fermeture clavier Echap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={message ? "confirm-message" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-[var(--card,#ffffff)] rounded-2xl shadow-2xl p-8 text-center animate-zoom-in">
        {/* Icône */}
        <div
          className={[
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4",
            cfg.iconBg,
            cfg.iconColor,
          ].join(" ")}
        >
          <cfg.Icon className="w-7 h-7" aria-hidden="true" />
        </div>

        {/* Titre */}
        <h3
          id="confirm-title"
          className="text-lg font-bold text-[var(--text,#0f172a)] mb-2"
        >
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p
            id="confirm-message"
            className="text-sm text-[var(--text-muted,#64748b)] mb-6"
          >
            {message}
          </p>
        )}

        {/* Boutons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border,#e2e8f0)] text-sm font-semibold text-[var(--text-muted,#64748b)] hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors",
              "flex items-center justify-center gap-2 disabled:opacity-70",
              cfg.confirmBtn,
            ].join(" ")}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;