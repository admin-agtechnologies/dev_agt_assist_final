// src/components/ui/index.tsx
"use client";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "green" | "red" | "amber" | "violet" | "slate" | "blue";
const badgeVariants: Record<BadgeVariant, string> = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

export function Badge({ children, variant = "slate", className }: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string;
}) {
  return <span className={cn("badge", badgeVariants[variant], className)}>{children}</span>;
}

// ── Status badge helpers ──────────────────────────────────────────────────────
export function ActiveBadge({ active, labelOn, labelOff }: {
  active: boolean; labelOn?: string; labelOff?: string;
}) {
  return (
    <Badge variant={active ? "green" : "slate"}>
      {active ? (labelOn ?? "Actif") : (labelOff ?? "Inactif")}
    </Badge>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <span className={cn("spinner", className)} />;
}

// ── Loading page ──────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8 border-[#25D366] border-t-transparent" />
    </div>
  );
}

// ── Empty state (ancienne version — conservée pour compatibilité) ─────────────
export function EmptyState({ message, icon: Icon }: {
  message: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] gap-3">
      {Icon && <Icon className="w-10 h-10 opacity-40" strokeWidth={1.5} />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// ── Section header (conservé pour compatibilité) ──────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Confirm delete modal (conservé pour compatibilité) ────────────────────────
interface ConfirmDeleteProps {
  isOpen: boolean; isLoading: boolean;
  onClose: () => void; onConfirm: () => void;
  title?: string; message?: string;
}

export function ConfirmDeleteModal({
  isOpen, isLoading, onClose, onConfirm,
  title = "Êtes-vous sûr ?",
  message = "Cette action est irréversible.",
}: ConfirmDeleteProps) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={!isLoading ? onClose : undefined} />
      <div className="relative card w-full max-w-sm p-8 text-center animate-zoom-in">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Spinner className="border-white/30 border-t-white" /> : "Supprimer"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Usage bar (billing) ───────────────────────────────────────────────────────
export function UsageBar({ label, used, total, pct, color, unlimited = false }: {
  label: string; used: number; total: number | null; pct: number; color: string; unlimited?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--text-muted)] font-medium">{label}</span>
        <span className="font-bold text-[var(--text)]">
          {unlimited
            ? `${used.toLocaleString()} / ∞`
            : `${used.toLocaleString()} / ${(total ?? 0).toLocaleString()}`
          }
        </span>
      </div>
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
        {unlimited ? (
          <div className="h-full rounded-full w-full opacity-20" style={{ backgroundColor: color }} />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Nouveaux composants UI 0-D — re-exports ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export { StatusBadge }        from "./StatusBadge";
export type { StatusBadgeProps, StatusVariant, StatusSize } from "./StatusBadge";

export { EmptyState as EmptyStateV2 } from "./EmptyState";
export type { EmptyStateProps }       from "./EmptyState";

export { PageHeader }         from "./PageHeader";
export type { PageHeaderProps, BreadcrumbItem } from "./PageHeader";

export { Modal }              from "./Modal";
export type { ModalProps, ModalSize } from "./Modal";

export { ConfirmDialog }      from "./ConfirmDialog";
export type { ConfirmDialogProps, ConfirmDialogVariant } from "./ConfirmDialog";

export { FilterBar }          from "./FilterBar";
export type { FilterBarProps, FilterSelectConfig, FilterOption } from "./FilterBar";

export { DetailCard }         from "./DetailCard";
export type { DetailCardProps, DetailSection, DetailField } from "./DetailCard";

export { StatusFlow }         from "./StatusFlow";
export type { StatusFlowProps, StatusStep, StepState } from "./StatusFlow";

export { DataTable }          from "./DataTable";
export type { DataTableProps, DataTableColumn, DataTablePagination } from "./DataTable";