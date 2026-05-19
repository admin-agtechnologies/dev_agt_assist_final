// src/app/(dashboard)/knowledge/_components/KnowledgeTabs.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight }                from "lucide-react";
import type { LucideIcon }                          from "lucide-react";
import { useSector }                                from "@/hooks/useSector";
import { cn }                                       from "@/lib/utils";

export interface KnowledgeTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  isConfigured?: boolean;
}

interface Props {
  tabs: KnowledgeTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function KnowledgeTabs({ tabs, activeTab, onChange }: Props) {
  const { theme }                           = useSector();
  const scrollRef                           = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]              = useState(false);
  const [canRight, setCanRight]             = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, [tabs, updateArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Flèche gauche */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]
            hover:text-[var(--text)] shadow-sm transition-all z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Barre scrollable */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 scroll-smooth"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon     = tab.icon;
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
              style={isActive ? { backgroundColor: theme.primary } : undefined}
            >
              {Icon && (
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-opacity",
                  isActive ? "opacity-90" : "opacity-50",
                )} />
              )}
              {tab.label}
              {tab.isConfigured && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Flèche droite */}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]
            hover:text-[var(--text)] shadow-sm transition-all z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}