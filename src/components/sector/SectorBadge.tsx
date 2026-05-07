// src/components/sector/SectorBadge.tsx
"use client";

import { useSector } from "@/hooks/useSector";

interface SectorBadgeProps {
  /** Taille du badge. Par défaut : "md" */
  size?: "sm" | "md" | "lg";
  /** Afficher uniquement un point coloré sans label */
  dotOnly?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<SectorBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const DOT_SIZES: Record<NonNullable<SectorBadgeProps["size"]>, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function SectorBadge({ size = "md", dotOnly = false }: SectorBadgeProps) {
  const { theme } = useSector();

  if (dotOnly) {
    return (
      <span
        className={`inline-block rounded-full flex-shrink-0 ${DOT_SIZES[size]}`}
        style={{ backgroundColor: theme.primary }}
        aria-label={theme.label}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: `${theme.primary}18`,
        color: theme.primary,
        border: `1px solid ${theme.primary}30`,
      }}
    >
      <span
        className={`rounded-full flex-shrink-0 ${DOT_SIZES[size]}`}
        style={{ backgroundColor: theme.primary }}
      />
      {theme.label}
    </span>
  );
}