// src/app/(dashboard)/results/_components/ResultsEmptyState.tsx
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
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center
      bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
      <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      <p className="text-sm font-medium text-[var(--text-muted)]">{message}</p>
      <p className="text-xs text-[var(--text-muted)] max-w-xs opacity-70">{hint}</p>
    </div>
  );
}