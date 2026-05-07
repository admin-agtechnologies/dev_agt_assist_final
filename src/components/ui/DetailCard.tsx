// src/components/ui/DetailCard.tsx
// Carte de détail — affiche des paires label/valeur structurées
// Utilisée dans : détail commande, contact, réservation, dossier, inscription
// Zéro texte en dur — tous les labels fournis par le parent

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DetailField {
  /** Label — vient du dictionnaire appelant */
  label: string;
  /** Valeur — string, number, ou ReactNode (badge, lien…) */
  value: React.ReactNode;
  /** Masquer ce champ si value est vide/null */
  hideIfEmpty?: boolean;
  /** Prend toute la largeur de la grille */
  fullWidth?: boolean;
}

export interface DetailSection {
  /** Titre de section optionnel */
  title?: string;
  /** Champs de cette section */
  fields: DetailField[];
}

export interface DetailCardProps {
  /** Sections de champs */
  sections: DetailSection[];
  /** Titre de la carte */
  title?: string;
  /** Badge ou action à droite du titre */
  headerRight?: React.ReactNode;
  /** Nombre de colonnes sur desktop */
  cols?: 2 | 3;
  /** Classes additionnelles */
  className?: string;
}

// ─── Sous-composant Field ─────────────────────────────────────────────────────

function Field({
  field,
  cols,
}: {
  field: DetailField;
  cols: 2 | 3;
}): React.ReactElement | null {
  // Masquer si vide
  const isEmpty =
    field.value === null ||
    field.value === undefined ||
    field.value === "" ||
    field.value === "-";

  if (field.hideIfEmpty && isEmpty) return null;

  const colSpanClass =
    field.fullWidth
      ? cols === 3
        ? "col-span-3"
        : "col-span-2"
      : "col-span-1";

  return (
    <div className={colSpanClass}>
      <dt className="text-xs font-medium text-[var(--text-muted,#64748b)] uppercase tracking-wide mb-0.5">
        {field.label}
      </dt>
      <dd className="text-sm text-[var(--text,#0f172a)] font-medium break-words">
        {isEmpty ? (
          <span className="text-slate-300 italic">—</span>
        ) : (
          field.value
        )}
      </dd>
    </div>
  );
}

// ─── Sous-composant Section ───────────────────────────────────────────────────

function Section({
  section,
  cols,
  isFirst,
}: {
  section: DetailSection;
  cols: 2 | 3;
  isFirst: boolean;
}): React.ReactElement {
  const gridClass = cols === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className={isFirst ? "" : "pt-4 border-t border-[var(--border,#e2e8f0)]"}>
      {section.title && (
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted,#64748b)] mb-3">
          {section.title}
        </p>
      )}
      <dl className={`grid ${gridClass} gap-x-6 gap-y-4`}>
        {section.fields.map((field, i) => (
          <Field key={i} field={field} cols={cols} />
        ))}
      </dl>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function DetailCard({
  sections,
  title,
  headerRight,
  cols = 2,
  className = "",
}: DetailCardProps): React.ReactElement {
  return (
    <div
      className={[
        "bg-[var(--card,#ffffff)] rounded-xl border border-[var(--border,#e2e8f0)]",
        "overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Header carte */}
      {(title || headerRight) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--border,#e2e8f0)]">
          {title && (
            <h3 className="text-sm font-bold text-[var(--text,#0f172a)]">
              {title}
            </h3>
          )}
          {headerRight && (
            <div className="flex-shrink-0">{headerRight}</div>
          )}
        </div>
      )}

      {/* Corps */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {sections.map((section, i) => (
          <Section
            key={i}
            section={section}
            cols={cols}
            isFirst={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

export default DetailCard;