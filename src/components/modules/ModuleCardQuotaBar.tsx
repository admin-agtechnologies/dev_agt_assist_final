// src/components/modules/ModuleCardQuotaBar.tsx
// S30 (Gabriel) — Extrait de ModuleCard pour modularisation.
// Barre de progression visuelle pour les modules actifs avec quota limité.
// Couleur dynamique selon le ratio consommé / total :
//   - <  50%  → vert
//   - <  80%  → orange
//   - >= 80%  → rouge
"use client";

interface Props {
  used:  number;
  quota: number;
}

export function ModuleCardQuotaBar({ used, quota }: Props) {
  if (quota <= 0) return null;

  const ratio = Math.min(used / quota, 1);
  const color = ratio < 0.5
    ? "#22c55e"   // vert
    : ratio < 0.8
      ? "#f97316" // orange
      : "#ef4444"; // rouge

  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${ratio * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}