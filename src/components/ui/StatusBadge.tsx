// src/components/ui/StatusBadge.tsx
// Badge de statut générique — couvre tous les domaines AGT
// Zéro texte en dur : labels via prop ou dictionnaire appelant

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusVariant =
  // Commandes / Réservations / Contacts
  | "en_attente"
  | "confirme"
  | "annule"
  | "termine"
  // Commandes spécifiques
  | "en_preparation"
  | "pret"
  | "livre"
  // Dossiers / Inscriptions
  | "ouvert"
  | "en_cours"
  | "ferme"
  | "accepte"
  | "rejete"
  // Bots
  | "actif"
  | "en_pause"
  | "archive"
  // Abonnements
  | "suspendu"
  | "expire"
  // Conversations
  | "terminee"
  | "abandonnee"
  // Générique
  | "success"
  | "error"
  | "warning"
  | "info";

export type StatusSize = "xs" | "sm" | "md";

export interface StatusBadgeProps {
  /** Valeur du statut (détermine la couleur) */
  variant: StatusVariant;
  /** Label affiché — doit venir du dictionnaire appelant, jamais en dur ici */
  label: string;
  /** Taille du badge */
  size?: StatusSize;
  /** Afficher le point indicateur */
  dot?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── Config couleurs ──────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<StatusVariant, string> = {
  // Vert — positif, confirmé, actif
  confirme:       "bg-emerald-100 text-emerald-800 border-emerald-200",
  actif:          "bg-emerald-100 text-emerald-800 border-emerald-200",
  accepte:        "bg-emerald-100 text-emerald-800 border-emerald-200",
  livre:          "bg-emerald-100 text-emerald-800 border-emerald-200",
  success:        "bg-emerald-100 text-emerald-800 border-emerald-200",
  ouvert:         "bg-emerald-100 text-emerald-800 border-emerald-200",

  // Bleu — en cours, actif neutre
  en_cours:       "bg-blue-100 text-blue-800 border-blue-200",
  en_preparation: "bg-blue-100 text-blue-800 border-blue-200",
  info:           "bg-blue-100 text-blue-800 border-blue-200",

  // Jaune / Amber — en attente, à traiter
  en_attente:     "bg-amber-100 text-amber-800 border-amber-200",
  pret:           "bg-amber-100 text-amber-800 border-amber-200",
  warning:        "bg-amber-100 text-amber-800 border-amber-200",
  en_pause:       "bg-amber-100 text-amber-800 border-amber-200",

  // Rouge — annulé, erreur, rejeté
  annule:         "bg-red-100 text-red-800 border-red-200",
  rejete:         "bg-red-100 text-red-800 border-red-200",
  error:          "bg-red-100 text-red-800 border-red-200",
  expire:         "bg-red-100 text-red-800 border-red-200",
  abandonnee:     "bg-red-100 text-red-800 border-red-200",

  // Gris — terminé, archivé, fermé
  termine:        "bg-slate-100 text-slate-600 border-slate-200",
  terminee:       "bg-slate-100 text-slate-600 border-slate-200",
  archive:        "bg-slate-100 text-slate-600 border-slate-200",
  ferme:          "bg-slate-100 text-slate-600 border-slate-200",
  suspendu:       "bg-slate-100 text-slate-600 border-slate-200",
};

const DOT_STYLES: Record<StatusVariant, string> = {
  confirme:       "bg-emerald-500",
  actif:          "bg-emerald-500",
  accepte:        "bg-emerald-500",
  livre:          "bg-emerald-500",
  success:        "bg-emerald-500",
  ouvert:         "bg-emerald-500",
  en_cours:       "bg-blue-500",
  en_preparation: "bg-blue-500",
  info:           "bg-blue-500",
  en_attente:     "bg-amber-500",
  pret:           "bg-amber-500",
  warning:        "bg-amber-500",
  en_pause:       "bg-amber-500",
  annule:         "bg-red-500",
  rejete:         "bg-red-500",
  error:          "bg-red-500",
  expire:         "bg-red-500",
  abandonnee:     "bg-red-500",
  termine:        "bg-slate-400",
  terminee:       "bg-slate-400",
  archive:        "bg-slate-400",
  ferme:          "bg-slate-400",
  suspendu:       "bg-slate-400",
};

const SIZE_STYLES: Record<StatusSize, string> = {
  xs: "text-[10px] px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1.5",
  md: "text-sm px-2.5 py-1 gap-1.5",
};

const DOT_SIZE: Record<StatusSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function StatusBadge({
  variant,
  label,
  size = "sm",
  dot = false,
  className = "",
}: StatusBadgeProps): React.ReactElement {
  const colorClass = VARIANT_STYLES[variant] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const dotColor   = DOT_STYLES[variant]    ?? "bg-slate-400";

  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full border",
        SIZE_STYLES[size],
        colorClass,
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={["rounded-full flex-shrink-0", DOT_SIZE[size], dotColor].join(" ")}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

export default StatusBadge;