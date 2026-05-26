// src/app/(dashboard)/knowledge/_components/agences/AgenceCard.tsx
// S46 — Fix confirmation suppression : modal centrée (remplace absolute inset-0 trop étroit)
"use client";

import { useState } from "react";
import { MapPin, Trash2, AlertTriangle, X } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn }          from "@/lib/utils";
import type { AgenceKnowledge } from "@/types/api/agence.types";

interface Props {
  agence:     AgenceKnowledge;
  isSelected: boolean;
  onClick:    () => void;
  onDelete?:  (id: string) => void;
}

export function AgenceCard({ agence, isSelected, onClick, onDelete }: Props) {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.agences;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onDelete?.(agence.id);
  };

  return (
    <>
      {/* ── Card sélection ── */}
      <div className="relative group">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "w-full text-left px-4 py-3 rounded-xl border transition-all duration-150",
            isSelected
              ? "shadow-sm"
              : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)]",
            !agence.est_siege && onDelete && "pr-9",
          )}
          style={isSelected ? {
            borderColor:     theme.primary,
            backgroundColor: `${theme.primary}12`,
          } : undefined}
        >
          {/* Nom + badge siège */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                style={{ backgroundColor: agence.est_siege ? theme.primary : "var(--border)" }}
              />
              <span className="text-sm font-medium text-[var(--text)] truncate">
                {agence.nom}
              </span>
              {agence.est_siege && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: theme.primary }}
                >
                  {t.badge_siege}
                </span>
              )}
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={agence.est_active ? {
                background: "var(--status-success-bg)",
                color:      "var(--status-success-text)",
              } : {
                background: "var(--status-neutral-bg)",
                color:      "var(--status-neutral-text)",
              }}
            >
              {agence.est_active ? d.common.active : d.common.inactive}
            </span>
          </div>

          {/* Ville */}
          {agence.ville && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--text-muted)]">
              <MapPin className="w-3 h-3" />
              {agence.ville}
            </div>
          )}
        </button>

        {/* Bouton supprimer (hover, non-siège uniquement) */}
        {!agence.est_siege && onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="absolute top-1/2 -translate-y-1/2 right-2
                       p-1.5 rounded-lg
                       opacity-0 group-hover:opacity-100
                       text-[var(--text-muted)] hover:text-[var(--status-danger-text)]
                       hover:bg-[var(--status-danger-bg)]
                       transition-all duration-150"
            title={t.deleteBtn}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Modal confirmation — fixed, centré, backdrop ── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-xl
              border border-[var(--border)] p-6 space-y-4 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icône + titre */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--status-danger-bg)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "var(--status-danger-text)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {t.deleteBtn} l&apos;agence
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.deleteConfirm.replace("{nom}", agence.nom)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="ml-auto p-1 rounded-lg text-[var(--text-muted)]
                  hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-xl border border-[var(--border)]
                  hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
              >
                {d.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm rounded-xl font-semibold text-white
                  hover:brightness-90 transition-all"
                style={{ background: "var(--status-danger-text)" }}
              >
                {t.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}