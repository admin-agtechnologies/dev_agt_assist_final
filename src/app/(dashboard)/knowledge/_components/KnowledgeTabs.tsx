// src/app/(dashboard)/knowledge/_components/KnowledgeTabs.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { cn } from "@/lib/utils";

export interface KnowledgeTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Affiche un point vert si le tab a déjà des données configurées */
  isConfigured?: boolean;
}

interface Props {
  tabs: KnowledgeTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function KnowledgeTabs({ tabs, activeTab, onChange }: Props) {
  const { theme } = useSector();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "text-sm font-medium transition-all duration-150 whitespace-nowrap",
              isActive
                ? "text-white shadow-md"
                : [
                    "bg-[var(--bg-card)] text-[var(--text-muted)]",
                    "border border-[var(--border)]",
                    "hover:text-[var(--text)] hover:border-[var(--text-muted)]",
                  ].join(" "),
            )}
            style={
              isActive
                ? { backgroundColor: theme.primary }
                : undefined
            }
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-opacity",
                  isActive ? "opacity-90" : "opacity-50",
                )}
              />
            )}

            {tab.label}

            {/* Point de complétion — visible seulement sur les tabs inactifs configurés */}
            {tab.isConfigured && !isActive && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}