// src/components/ui/FilterBar.tsx
// Barre de filtres générique — recherche + selects + reset
// Utilisée dans : commandes, contacts, réservations, catalogue, dossiers, inscriptions
// Zéro texte en dur — tous les labels fournis par le parent

"use client";

import React, { useId } from "react";
import { Search, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectConfig {
  /** Identifiant unique du filtre */
  key: string;
  /** Placeholder du select — vient du dictionnaire */
  placeholder: string;
  /** Options disponibles */
  options: FilterOption[];
  /** Valeur courante */
  value: string;
  /** Callback changement */
  onChange: (value: string) => void;
}

export interface FilterBarProps {
  /** Valeur courante de la recherche */
  searchValue: string;
  /** Callback recherche */
  onSearchChange: (value: string) => void;
  /** Placeholder champ recherche — vient du dictionnaire */
  searchPlaceholder: string;
  /** Selects de filtres additionnels (statut, type…) */
  filters?: FilterSelectConfig[];
  /** Label bouton reset — vient du dictionnaire */
  resetLabel?: string;
  /** Callback reset global */
  onReset?: () => void;
  /** True si au moins un filtre est actif */
  hasActiveFilters?: boolean;
  /** Classes additionnelles */
  className?: string;
}

// ─── Sous-composant SearchInput ───────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  placeholder,
  inputId,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputId: string;
}): React.ReactElement {
  return (
    <div className="relative flex-1 min-w-[180px] max-w-xs">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full pl-9 pr-3 py-2 text-sm rounded-lg border",
          "border-[var(--border,#e2e8f0)] bg-[var(--card,#ffffff)]",
          "text-[var(--text,#0f172a)] placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#075E54)]/30",
          "transition-shadow",
        ].join(" ")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Sous-composant FilterSelect ──────────────────────────────────────────────

function FilterSelect({
  config,
  selectId,
}: {
  config: FilterSelectConfig;
  selectId: string;
}): React.ReactElement {
  return (
    <select
      id={selectId}
      value={config.value}
      onChange={(e) => config.onChange(e.target.value)}
      className={[
        "py-2 pl-3 pr-8 text-sm rounded-lg border appearance-none",
        "border-[var(--border,#e2e8f0)] bg-[var(--card,#ffffff)]",
        "text-[var(--text,#0f172a)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#075E54)]/30",
        "transition-shadow cursor-pointer",
        config.value
          ? "text-[var(--text,#0f172a)] font-medium"
          : "text-slate-400",
      ].join(" ")}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        backgroundSize: "16px",
      }}
    >
      <option value="">{config.placeholder}</option>
      {config.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  resetLabel,
  onReset,
  hasActiveFilters = false,
  className = "",
}: FilterBarProps): React.ReactElement {
  const uid = useId();

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-2",
        className,
      ].join(" ")}
      role="search"
    >
      {/* Recherche texte */}
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        inputId={`${uid}-search`}
      />

      {/* Selects de filtres */}
      {filters.map((f, i) => (
        <FilterSelect
          key={f.key}
          config={f}
          selectId={`${uid}-filter-${i}`}
        />
      ))}

      {/* Bouton reset */}
      {hasActiveFilters && onReset && resetLabel && (
        <button
          type="button"
          onClick={onReset}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm",
            "font-medium text-slate-500 hover:text-slate-700",
            "border border-[var(--border,#e2e8f0)] hover:bg-slate-50",
            "transition-colors",
          ].join(" ")}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {resetLabel}
        </button>
      )}
    </div>
  );
}

export default FilterBar;