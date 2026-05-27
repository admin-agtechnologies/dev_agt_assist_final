"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/BotConfigElements.tsx
// Primitives UI de BotConfigTab : Accordion, CheckRow, useInputFocus.
// Séparées pour réutilisabilité potentielle dans d'autres tabs de configuration.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── useInputFocus ─────────────────────────────────────────────────────────────

export function useInputFocus(colors: { primary: string }) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.boxShadow  = `0 0 0 2px ${colors.primary}40`;
      e.currentTarget.style.borderColor = colors.primary;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.boxShadow  = "";
      e.currentTarget.style.borderColor = "";
    },
  };
}

// ── Accordion ─────────────────────────────────────────────────────────────────

interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  colors: { primary: string; accent: string };
}

export function Accordion({ icon, title, badge, defaultOpen = false, children, colors }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-200"
      style={{ background: "var(--bg-card)" }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-[var(--bg)]"
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${colors.primary}18` }}
        >
          <span style={{ color: colors.primary }}>{icon}</span>
        </div>
        <span className="flex-1 text-sm font-black uppercase tracking-widest text-[var(--text)]">
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]">
            {badge}
          </span>
        )}
        <div
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-300 flex-shrink-0",
            open && "rotate-180",
          )}
          style={{ background: "var(--bg)" }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 border-t border-[var(--border)] space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── CheckRow ──────────────────────────────────────────────────────────────────

interface CheckRowProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label: string;
  sub?: string;
  badge?: string;
  badgeVariant?: "default" | "kb";
  colors: { primary: string; accent: string };
}

export function CheckRow({
  checked, onChange, disabled, label, sub, badge, badgeVariant = "default", colors,
}: CheckRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
        style={checked && !disabled ? { accentColor: colors.primary } : {}}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[var(--text)]">{label}</span>
        {sub && <span className="text-xs text-[var(--text-muted)] ml-2">{sub}</span>}
      </div>
      {badge && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
          badgeVariant === "kb"
            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700"
            : "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]",
        )}>
          {badge}
        </span>
      )}
    </div>
  );
}