// src/app/pme/appointments/components/MiniCalendar.tsx
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RendezVous } from "@/types/api";
import { type AppointmentStatus, JOURS_FR } from "../types";

// ─────────────────────────────────────────────────────────────────────────────

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface MiniCalendarProps {
  viewDate: Date;
  selDate: Date;
  rdvsByDay: Map<string, RendezVous[]>;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDay: (d: Date) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function MiniCalendar({
  viewDate,
  selDate,
  rdvsByDay,
  onPrev,
  onNext,
  onToday,
  onSelectDay,
}: MiniCalendarProps) {
  const year        = viewDate.getFullYear();
  const month       = viewDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const today       = new Date();

  return (
    <div className="card p-4">
      {/* En-tête mois */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
        </button>

        <p className="text-sm font-black text-[var(--text)]">
          {MOIS[month]} {year}
        </p>

        <button
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {JOURS_FR.map((j) => (
          <div
            key={j}
            className="text-center text-[10px] font-black text-[var(--text-muted)] py-1"
          >
            {j}
          </div>
        ))}
      </div>

      {/* Grille jours */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1;
          const date = new Date(year, month, day);
          const key  = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const rdvs = rdvsByDay.get(key) ?? [];
          const isT  = date.toDateString() === today.toDateString();
          const isS  = date.toDateString() === selDate.toDateString();

          return (
            <button
              key={day}
              onClick={() => onSelectDay(date)}
              className={cn(
                "flex flex-col items-center py-1 rounded-lg transition-all",
                isS
                  ? "bg-[#075E54] text-white"
                  : isT
                  ? "bg-[#25D366]/20 text-[#075E54]"
                  : "hover:bg-[var(--border)]/50 text-[var(--text)]",
              )}
            >
              <span className="text-[11px] font-bold">{day}</span>
              {rdvs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {rdvs.slice(0, 3).map((r, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        r.statut === "confirme"
                          ? isS
                            ? "bg-white"
                            : "bg-emerald-500"
                          : isS
                          ? "bg-white/70"
                          : "bg-amber-400",
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bouton aujourd'hui */}
      <button
        onClick={onToday}
        className="w-full mt-3 text-xs font-bold text-[#075E54] hover:bg-[#075E54]/5 py-1.5 rounded-lg transition-colors"
      >
        Aujourd&apos;hui
      </button>
    </div>
  );
}
