// src/components/modules/ModuleFilters.tsx
// Barre de filtres de la marketplace : tabs par statut + recherche plein texte.
"use client";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterTab } from "@/hooks/useModuleMarket";
import type { Locale } from "@/contexts/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TabDef {
  key: FilterTab;
  labelFr: string;
  labelEn: string;
  emojiFr: string;
}

interface Props {
  activeFilter: FilterTab;
  onFilterChange: (f: FilterTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
  counts: Record<FilterTab, number>;
  locale: Locale;
  primaryColor: string;
  total: number;
}

// ── Config des tabs ───────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { key: "all",       labelFr: "Tous",            labelEn: "All",            emojiFr: "📦" },
  { key: "active",    labelFr: "Actifs",           labelEn: "Active",         emojiFr: "✅" },
  { key: "desired",   labelFr: "M'intéressent",   labelEn: "Interested",     emojiFr: "⭐" },
  { key: "available", labelFr: "Disponibles",     labelEn: "Available",      emojiFr: "🔓" },
  { key: "upgrade",   labelFr: "Upgrade requis",  labelEn: "Upgrade needed", emojiFr: "⬆️" },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export function ModuleFilters({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
  locale,
  primaryColor,
  total,
}: Props) {
  return (
    <div className="space-y-3">

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, labelFr, labelEn, emojiFr }) => {
          const isActive = activeFilter === key;
          const count    = counts[key];
          const label    = locale === "fr" ? labelFr : labelEn;

          return (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold",
                "transition-all duration-150 border",
                isActive
                  ? "text-white border-transparent shadow-sm"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)]",
                !isActive && "hover:text-[var(--text)] hover:border-[var(--text-muted)]",
              )}
              style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            >
              <span>{emojiFr}</span>
              <span>{label}</span>
              <span
                className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-[var(--border)] text-[var(--text-muted)]",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ligne de recherche + compteur */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              locale === "fr"
                ? "Rechercher un module par nom ou description…"
                : "Search by name or description…"
            }
            className={cn(
              "w-full pl-9 pr-9 py-2.5 rounded-xl text-sm",
              "bg-[var(--bg-card)] border border-[var(--border)]",
              "text-[var(--text)] placeholder-[var(--text-muted)]",
              "focus:outline-none focus:border-[var(--color-primary)] transition-colors",
            )}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Compteur résultats */}
        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap flex-shrink-0">
          {total} {locale === "fr" ? "module" : "module"}{total > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}