"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/modal-primitives.tsx
// Primitives UI partagées par tous les modals du module test/.

import { X } from "lucide-react";
import type { AIActionDeclenchee } from "@/types/api/agent.types";

// ── Overlay ───────────────────────────────────────────────────────────────────

export function Overlay({ open, onClose, children, width = "w-[400px]" }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`${width} max-h-[560px] overflow-y-auto bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── ModalHeader ───────────────────────────────────────────────────────────────

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-card)] z-10">
      <span className="text-[13px] font-medium text-[var(--text)]">{title}</span>
      <button
        onClick={onClose}
        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── DataRow ───────────────────────────────────────────────────────────────────

export function DataRow({ label, value, warn }: {
  label: string;
  value?: string | null;
  warn?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 py-1.5 text-[12px]">
      <span className="text-[var(--text-muted)] w-24 flex-shrink-0">{label}</span>
      <span className={warn
        ? "text-amber-600 dark:text-amber-400 font-medium"
        : "text-[var(--text)] font-medium"
      }>
        {value}
      </span>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

export function StatusBadge({ statut }: { statut: AIActionDeclenchee["statut"] }) {
  const ok = statut === "succes";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      ok
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    }`}>
      {ok ? "SUCCÈS" : statut.toUpperCase().replace("_", " ")}
    </span>
  );
}