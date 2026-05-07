// src/components/ui/EmptyState.tsx
// État vide générique — utilisé dans tous les modules AGT
// Labels toujours fournis par le composant appelant (via dictionnaire)

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Icône SVG — fournie par le parent */
  icon?: React.ReactNode;
  /** Titre principal — vient du dictionnaire appelant */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Bouton CTA optionnel */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Variante visuelle */
  variant?: "default" | "search" | "error" | "offline";
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── Icônes par défaut ────────────────────────────────────────────────────────

function DefaultIcon(): React.ReactElement {
  return (
    <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function SearchIcon(): React.ReactElement {
  return (
    <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ErrorIcon(): React.ReactElement {
  return (
    <svg className="h-12 w-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function OfflineIcon(): React.ReactElement {
  return (
    <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
    </svg>
  );
}

const VARIANT_ICONS: Record<NonNullable<EmptyStateProps["variant"]>, React.ReactElement> = {
  default: <DefaultIcon />,
  search:  <SearchIcon />,
  error:   <ErrorIcon />,
  offline: <OfflineIcon />,
};

const VARIANT_TITLE_COLOR: Record<NonNullable<EmptyStateProps["variant"]>, string> = {
  default: "text-slate-700",
  search:  "text-slate-700",
  error:   "text-red-700",
  offline: "text-slate-700",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}: EmptyStateProps): React.ReactElement {
  const defaultIcon = VARIANT_ICONS[variant];
  const titleColor  = VARIANT_TITLE_COLOR[variant];

  return (
    <div className={["flex flex-col items-center justify-center text-center py-16 px-6", className].join(" ")}>
      <div className="mb-4 opacity-80">
        {icon ?? defaultIcon}
      </div>
      <p className={["text-base font-semibold", titleColor].join(" ")}>
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-primary,#075E54)] hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;