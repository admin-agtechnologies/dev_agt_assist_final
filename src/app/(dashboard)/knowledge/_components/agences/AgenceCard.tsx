// src/app/(dashboard)/knowledge/_components/agences/AgenceCard.tsx
"use client";

import { MapPin, Trash2 } from "lucide-react";
import { useSector }      from "@/hooks/useSector";
import { useLanguage }    from "@/contexts/LanguageContext";
import { cn }             from "@/lib/utils";
import type { AgenceKnowledge } from "@/types/api/agence.types";

interface Props {
  agence:     AgenceKnowledge;
  isSelected: boolean;
  onClick:    () => void;
  onDelete?:  (id: string) => void;
}

/**
 * Mini-card de la liste d'agences — sert uniquement à sélectionner une agence.
 * L'édition se fait dans AgenceDetailPanel (panel de droite).
 */
export function AgenceCard({ agence, isSelected, onClick, onDelete }: Props) {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.agences;

  return (
    // ── Wrapper : relative + group pour le hover du bouton delete ──
    <div className="relative group">

      {/* ── Bouton de sélection principal ─────────────────────── */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full text-left px-4 py-3 rounded-xl border transition-all duration-150",
          isSelected
            ? "shadow-sm"
            : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)]",
          // Décale le contenu à droite si le bouton delete est présent
          !agence.est_siege && onDelete && "pr-9",
        )}
        style={
          isSelected
            ? {
                borderColor:     theme.primary,
                backgroundColor: `${theme.primary}12`,
              }
            : undefined
        }
      >
        {/* Nom + badge siège */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
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

          {/* Statut actif */}
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0",
              agence.est_active
                ? "bg-green-100 text-green-700"
                : "bg-[var(--bg)] text-[var(--text-muted)]",
            )}
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

      {/* ── Bouton supprimer — hors du bouton principal, masqué pour le siège ── */}
      {!agence.est_siege && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer l'agence "${agence.nom}" ?`)) {
              onDelete(agence.id);
            }
          }}
          className="absolute top-1/2 -translate-y-1/2 right-2
                     p-1.5 rounded-lg
                     opacity-0 group-hover:opacity-100
                     hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-500
                     transition-all duration-150"
          title="Supprimer cette agence"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
}