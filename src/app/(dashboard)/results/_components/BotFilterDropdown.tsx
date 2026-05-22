"use client";
// src/app/(dashboard)/results/_components/BotFilterDropdown.tsx
// Dropdown filtre par bot — réutilisable (results, futurs dashboards).

import { useState }    from "react";
import { Bot as BotIcon, ChevronDown } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import type { Bot }    from "@/types/api";

interface Props {
  bots:          Bot[];
  selectedBotId: string | null;
  onChange:      (id: string | null) => void;
  locale:        string;
}

export function BotFilterDropdown({ bots, selectedBotId, onChange, locale }: Props) {
  const { theme }    = useSector();
  const [open, setOpen] = useState(false);

  if (bots.length === 0) return null;

  const selected = bots.find((b) => b.id === selectedBotId);
  const label    = selected
    ? selected.nom
    : (locale === "fr" ? "Tous les bots" : "All bots");

  const handleSelect = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]
          bg-[var(--bg-card)] text-sm text-[var(--text)] hover:border-[var(--color-primary)]
          transition-all duration-200"
      >
        <BotIcon
          className="w-3.5 h-3.5"
          style={{ color: selectedBotId ? theme.primary : "var(--text-muted)" }}
        />
        <span className="max-w-[140px] truncate">{label}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px]
          bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg)]
              transition-colors font-medium text-[var(--text)]"
          >
            {locale === "fr" ? "Tous les bots" : "All bots"}
          </button>
          {bots.map((bot) => (
            <button
              key={bot.id}
              type="button"
              onClick={() => handleSelect(bot.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg)]
                transition-colors text-[var(--text)]"
              style={bot.id === selectedBotId ? { color: theme.primary } : {}}
            >
              {bot.nom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}