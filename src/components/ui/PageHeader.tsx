// src/components/ui/PageHeader.tsx
// En-tête de page — upgrade de SectionHeader
// Supporte : titre, sous-titre, breadcrumb, badge, actions, back button
// Zéro texte en dur — tous les labels viennent du composant appelant

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  /** Titre principal de la page */
  title: string;
  /** Sous-titre / description courte */
  subtitle?: string;
  /** Fil d'ariane optionnel */
  breadcrumb?: BreadcrumbItem[];
  /** Badge à côté du titre (ex: nombre d'éléments, statut) */
  badge?: React.ReactNode;
  /** Actions à droite (boutons, filtres…) */
  actions?: React.ReactNode;
  /** Bouton retour — label vient du dictionnaire appelant */
  backLabel?: string;
  onBack?: () => void;
  /** Classes additionnelles */
  className?: string;
}

// ─── Sous-composant Breadcrumb ────────────────────────────────────────────────

function Breadcrumb({ items }: { items: BreadcrumbItem[] }): React.ReactElement {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-slate-400">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <li aria-hidden="true">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
            )}
            <li>
              {item.href || item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-slate-600 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-slate-500 font-medium">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

// ─── Sous-composant BackButton ────────────────────────────────────────────────

function BackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  badge,
  actions,
  backLabel,
  onBack,
  className = "",
}: PageHeaderProps): React.ReactElement {
  return (
    <div className={["mb-6", className].join(" ")}>
      {/* Bouton retour */}
      {backLabel && onBack && (
        <BackButton label={backLabel} onClick={onBack} />
      )}

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-2">
          <Breadcrumb items={breadcrumb} />
        </div>
      )}

      {/* Ligne principale : titre + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {/* Titre + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text,#0f172a)] truncate">
              {title}
            </h1>
            {badge && <span className="flex-shrink-0">{badge}</span>}
          </div>

          {/* Sous-titre */}
          {subtitle && (
            <p className="mt-0.5 text-sm text-[var(--text-muted,#64748b)]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;