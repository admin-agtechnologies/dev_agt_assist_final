// src/app/(dashboard)/contacts/_components/StatusBadge.tsx
"use client";
import type { ContactStatut } from "@/types/api/crm.types";

const CONFIG: Record<ContactStatut, { fr: string; en: string; dot: string; bg: string; text: string; selectedBg: string }> = {
  prospect: { fr:"Prospect",  en:"Prospect", dot:"bg-blue-400",   bg:"bg-blue-50 dark:bg-blue-950/40",   text:"text-blue-700 dark:text-blue-300",   selectedBg:"bg-white/20 text-white" },
  contact:  { fr:"Contact",   en:"Contact",  dot:"bg-amber-400",  bg:"bg-amber-50 dark:bg-amber-950/40", text:"text-amber-700 dark:text-amber-300", selectedBg:"bg-white/20 text-white" },
  client:   { fr:"Client",    en:"Client",   dot:"bg-emerald-400",bg:"bg-emerald-50 dark:bg-emerald-950/40",text:"text-emerald-700 dark:text-emerald-300",selectedBg:"bg-white/20 text-white" },
  inactif:  { fr:"Inactif",   en:"Inactive", dot:"bg-gray-300",   bg:"bg-gray-100 dark:bg-gray-800",     text:"text-gray-500 dark:text-gray-400",   selectedBg:"bg-white/10 text-white/70" },
};

interface BadgeProps { statut: ContactStatut; locale?: "fr"|"en"; size?: "sm"|"md"; selected?: boolean; }
export function StatusBadge({ statut, locale="fr", size="md", selected=false }: BadgeProps) {
  const c = CONFIG[statut] ?? CONFIG.prospect;
  const label = locale === "fr" ? c.fr : c.en;
  const sz = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  if (selected) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-lg font-medium ${sz} ${c.selectedBg}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        {label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-medium border border-transparent ${sz} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

interface ScoreProps { score: 0|1|2|3; showLabel?: boolean; locale?: "fr"|"en"; }
export function ScoreIndicator({ score, showLabel=false, locale="fr" }: ScoreProps) {
  const labels = { fr:["Nouveau","Actif","Régulier","Fidèle"], en:["New","Active","Regular","Loyal"] };
  return (
    <span className="inline-flex items-center gap-0.5" title={(locale==="fr"?labels.fr:labels.en)[score]}>
      {[1,2,3].map(s => (
        <span key={s} className={`text-xs leading-none transition-colors ${s<=score ? "text-amber-400" : "text-[var(--border)]"}`}>★</span>
      ))}
      {showLabel && <span className="ml-1 text-[10px] text-[var(--text-muted)]">{(locale==="fr"?labels.fr:labels.en)[score]}</span>}
    </span>
  );
}