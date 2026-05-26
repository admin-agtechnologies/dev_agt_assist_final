"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/PanelAccordion.tsx
// Accordion générique léger — partageable par tous les panneaux du module test/.
// Distinct de BotConfigElements/Accordion (pas de couleurs sectorielles).

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PanelAccordionProps {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PanelAccordion({ icon, title, badge, defaultOpen = false, children }: PanelAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg)] transition-colors"
      >
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge !== undefined && badge !== 0 && (
            <span className="text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {open
            ? <ChevronUp   className="w-3 h-3 text-[var(--text-muted)]" />
            : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
        </div>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}