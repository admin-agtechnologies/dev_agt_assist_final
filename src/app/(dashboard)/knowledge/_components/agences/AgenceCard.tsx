// src/app/(dashboard)/knowledge/_components/agences/AgenceCard.tsx
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

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(false);
    onDelete?.(agence.id);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(false);
  };

  return (
    <div className="relative group">

      {/* ── Bouton de sélection ─────────────────────────────────────────────── */}
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

          {/* Statut actif — CSS vars */}
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

      {/* ── Bouton supprimer (hover) ────────────────────────────────────────── */}
      {!agence.est_siege && onDelete && !confirmOpen && (
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

      {/* ── Modal confirmation inline ───────────────────────────────────────── */}
      {confirmOpen && (
        <div
          className="absolute inset-0 z-10 rounded-xl border-2 px-4 py-3
                     flex items-center gap-3 animate-zoom-in"
          style={{
            borderColor: "var(--status-danger-text)",
            background:  "var(--bg-card)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AlertTriangle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--status-danger-text)" }}
          />
          <p className="text-xs font-medium text-[var(--text)] flex-1 leading-tight">
            {t.deleteConfirm.replace("{nom}", agence.nom)}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white
                         transition-all hover:brightness-90"
              style={{ background: "var(--status-danger-text)" }}
            >
              {t.deleteBtn}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]
                         hover:bg-[var(--bg)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}