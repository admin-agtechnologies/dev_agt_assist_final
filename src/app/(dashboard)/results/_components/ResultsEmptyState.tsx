// src/app/(dashboard)/results/_components/ResultsEmptyState.tsx
"use client";

import { type LucideIcon, Inbox } from "lucide-react";

interface Props {
  icon?:    LucideIcon;
  message?: string;
  hint?:    string;
}

export function ResultsEmptyState({
  icon: Icon = Inbox,
  message    = "Aucun résultat pour l'instant",
  hint       = "Les données créées par le bot apparaîtront ici.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
      bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]
      animate-fade-in">

      {/* Icône avec halo */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: "var(--color-primary)" }}
          />
        </div>
        {/* Halo animé */}
        <div
          className="absolute inset-0 rounded-2xl animate-ping opacity-20"
          style={{ background: "var(--color-primary)" }}
        />
      </div>

      <div className="space-y-1.5 max-w-xs px-4">
        <p className="text-sm font-semibold text-[var(--text)]">{message}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed opacity-80">{hint}</p>
      </div>
    </div>
  );
}