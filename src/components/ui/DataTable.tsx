// src/components/ui/DataTable.tsx
// Table de données générique — colonnes config + pagination + loading + vide
// Utilisée dans : commandes, contacts, réservations, dossiers, inscriptions
// Zéro texte en dur — tous les labels fournis par le parent

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { EmptyState } from "./EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  /** Clé unique de la colonne */
  key: string;
  /** En-tête — vient du dictionnaire appelant */
  header: string;
  /** Rendu de la cellule */
  render: (row: T) => React.ReactNode;
  /** Largeur CSS optionnelle (ex: "w-32", "w-1/4") */
  width?: string;
  /** Alignement */
  align?: "left" | "center" | "right";
  /** Masquer sur mobile */
  hideOnMobile?: boolean;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Labels pagination — vient du dictionnaire */
  labels: {
    previous: string;
    next: string;
    of: string;
    results: string;
  };
}

export interface DataTableProps<T> {
  /** Données à afficher */
  rows: T[];
  /** Configuration des colonnes */
  columns: DataTableColumn<T>[];
  /** Clé unique par ligne */
  rowKey: (row: T) => string;
  /** Callback clic ligne (optionnel) */
  onRowClick?: (row: T) => void;
  /** En cours de chargement */
  isLoading?: boolean;
  /** Pagination (optionnel — absent = pas de pagination) */
  pagination?: DataTablePagination;
  /** Props EmptyState quand liste vide */
  emptyTitle: string;
  emptyDescription?: string;
  /** Classes additionnelles */
  className?: string;
}

// ─── Sous-composant TableSkeleton ─────────────────────────────────────────────

function TableSkeleton({ cols }: { cols: number }): React.ReactElement {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Sous-composant Pagination ────────────────────────────────────────────────

function Pagination({ p }: { p: DataTablePagination }): React.ReactElement {
  const totalPages = Math.ceil(p.total / p.pageSize);
  const from = Math.min((p.page - 1) * p.pageSize + 1, p.total);
  const to   = Math.min(p.page * p.pageSize, p.total);

  const btnClass = (disabled: boolean) =>
    [
      "p-1.5 rounded-lg border border-[var(--border,#e2e8f0)] transition-colors",
      disabled
        ? "opacity-40 cursor-not-allowed text-slate-300"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
    ].join(" ");

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border,#e2e8f0)]">
      {/* Infos */}
      <p className="text-xs text-[var(--text-muted,#64748b)]">
        {from}–{to} {p.labels.of} {p.total} {p.labels.results}
      </p>

      {/* Contrôles */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => p.onPageChange(1)}
          disabled={p.page === 1}
          className={btnClass(p.page === 1)}
          aria-label={p.labels.previous}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => p.onPageChange(p.page - 1)}
          disabled={p.page === 1}
          className={btnClass(p.page === 1)}
          aria-label={p.labels.previous}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-[var(--text,#0f172a)]">
          {p.page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => p.onPageChange(p.page + 1)}
          disabled={p.page >= totalPages}
          className={btnClass(p.page >= totalPages)}
          aria-label={p.labels.next}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => p.onPageChange(totalPages)}
          disabled={p.page >= totalPages}
          className={btnClass(p.page >= totalPages)}
          aria-label={p.labels.next}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  isLoading = false,
  pagination,
  emptyTitle,
  emptyDescription,
  className = "",
}: DataTableProps<T>): React.ReactElement {
  const alignClass: Record<string, string> = {
    left:   "text-left",
    center: "text-center",
    right:  "text-right",
  };

  return (
    <div
      className={[
        "bg-[var(--card,#ffffff)] rounded-xl border border-[var(--border,#e2e8f0)] overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          {/* En-têtes */}
          <thead>
            <tr className="border-b border-[var(--border,#e2e8f0)] bg-slate-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    "px-4 py-3 text-xs font-semibold text-[var(--text-muted,#64748b)]",
                    "uppercase tracking-wide whitespace-nowrap",
                    col.width ?? "",
                    alignClass[col.align ?? "left"],
                    col.hideOnMobile ? "hidden sm:table-cell" : "",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps */}
          <tbody className="divide-y divide-[var(--border,#e2e8f0)]">
            {isLoading ? (
              <TableSkeleton cols={columns.length} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    variant="search"
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={[
                    "transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/80"
                      : "",
                  ].join(" ")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "px-4 py-3 text-[var(--text,#0f172a)]",
                        alignClass[col.align ?? "left"],
                        col.hideOnMobile ? "hidden sm:table-cell" : "",
                      ].join(" ")}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !isLoading && rows.length > 0 && (
        <Pagination p={pagination} />
      )}
    </div>
  );
}

export default DataTable;