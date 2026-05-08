// src/app/pme/bots/[id]/test/_components/AccordionBlock.tsx
"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeftPanel } from "./test.types";

export interface AccordionBlockProps {
  id: LeftPanel;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean;
  primaryColor: string;
  children: React.ReactNode;
}

export function AccordionBlock({
  title, icon, badge, badgeColor, isOpen, onToggle, highlight, primaryColor, children,
}: AccordionBlockProps) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
        highlight ? "border-2 shadow-md" : "border-[var(--border)]",
      )}
      style={highlight ? { borderColor: primaryColor, boxShadow: `0 0 0 3px ${primaryColor}15` } : {}}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--bg)] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0" style={{ color: primaryColor }}>{icon}</span>
          <span className="text-xs font-bold text-[var(--text)] truncate">{title}</span>
          {badge && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white"
              style={{ backgroundColor: badgeColor ?? primaryColor }}>
              {badge}
            </span>
          )}
          {highlight && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }} />
          )}
        </div>
        {isOpen
          ? <ChevronUp  className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}