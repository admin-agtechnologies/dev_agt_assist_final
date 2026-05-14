// src/app/(dashboard)/knowledge/_components/KnowledgeTabs.tsx
"use client";

import { useSector } from "@/hooks/useSector";
import { cn } from "@/lib/utils";

export interface KnowledgeTab {
  id: string;
  label: string;
}

interface Props {
  tabs: KnowledgeTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function KnowledgeTabs({ tabs, activeTab, onChange }: Props) {
  const { theme } = useSector();

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              isActive
                ? "text-white shadow-sm"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]",
            )}
            style={isActive ? { backgroundColor: theme.primary } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}