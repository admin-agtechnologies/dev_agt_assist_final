// src/components/modules/ModuleFilters.tsx
// S28 (donpk) :
//   - Renommage des onglets : Tous→Catalogue, Actifs→Mes modules,
//     M'intéressent→En attente, Disponibles→À activer, Upgrade requis→Booster
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
  { key: "all",       labelFr: "Catalogue",   labelEn: "Catalogue",   emojiFr: "📦" },
  { key: "active",    labelFr: "Mes modules", labelEn: "My modules",  emojiFr: "✅" },
  { key: "desired",   labelFr: "Mes favoris", labelEn: "My favorites", emojiFr: "⭐" },
  { key: "available", labelFr: "À activer",   labelEn: "To activate", emojiFr: "🔓" },
  { key: "upgrade",   labelFr: "Booster",     labelEn: "Boost",       emojiFr: "⚡" },
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
              style={isActive ? { backgroundColor: primaryColor } : {}}
            >
              <span>{emojiFr}</span>
              <span>{label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/25 text-white" : "bg-[var(--border)] text-[var(--text-muted)]",
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            locale === "fr"
              ? "Rechercher un module par nom ou description…"
              : "Search module by name or description…"
          }
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Compteur résultats */}
      {search && (
        <p className="text-xs text-[var(--text-muted)]">
          {locale === "fr" ? `${total} résultat(s)` : `${total} result(s)`}
        </p>
      )}
    </div>
  );
}