// src/app/pme/bots/[id]/test/_components/AgendaPanel.tsx
"use client";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RendezVous } from "@/types/api";
import {
  addDays, isSameDay, slotTop, startOfWeek,
  DAYS_FR, MONTHS_FR, SLOT_H, SLOT_MIN, HOUR_START, HOUR_END,
  STATUS_BG, type SectorTheme,
} from "./test.types";

interface AgendaPanelProps {
  allAppointments: RendezVous[];
  currentDate: Date;
  theme: SectorTheme;
  onDateChange: (d: Date) => void;
}

export function AgendaPanel({ allAppointments, currentDate, theme, onDateChange }: AgendaPanelProps) {
  const weekStart   = startOfWeek(currentDate);
  const displayDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots   = Array.from(
    { length: ((HOUR_END - HOUR_START) * 60) / SLOT_MIN },
    (_, i) => {
      const total = HOUR_START * 60 + i * SLOT_MIN;
      return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    },
  );

  const periodLabel = `${weekStart.getDate()} ${MONTHS_FR[weekStart.getMonth()]} — ${addDays(weekStart, 6).getDate()} ${MONTHS_FR[addDays(weekStart, 6).getMonth()]} ${weekStart.getFullYear()}`;

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2"
        style={{ backgroundColor: `${theme.primary}10` }}>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: theme.primary }} />
          <p className="text-xs font-bold text-[var(--text)]">Agenda temps réel</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onDateChange(addDays(currentDate, -7))}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
          <button onClick={() => onDateChange(new Date())}
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[var(--border)] hover:bg-[var(--bg)] transition-colors text-[var(--text-muted)]">
            Auj.
          </button>
          <button onClick={() => onDateChange(addDays(currentDate, 7))}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-center text-[var(--text-muted)] py-1 border-b border-[var(--border)]">
        {periodLabel}
      </p>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-[32px_repeat(7,1fr)] border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="border-r border-[var(--border)]" />
        {displayDays.map((day, i) => {
          const isToday  = isSameDay(day, new Date());
          const dayLabel = DAYS_FR[day.getDay() === 0 ? 6 : day.getDay() - 1];
          return (
            <div key={i} className={cn(
              "py-2 text-center border-r border-[var(--border)] last:border-r-0",
              isToday && "bg-[#25D366]/5",
            )}>
              <p className={cn("text-[8px] font-black uppercase", isToday ? "text-[#25D366]" : "text-[var(--text-muted)]")}>
                {dayLabel}
              </p>
              <p className={cn(
                "text-xs font-bold mt-0.5",
                isToday
                  ? "w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center mx-auto text-[10px]"
                  : "text-[var(--text)]",
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grille horaire */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: "520px" }}>
        <div className="grid grid-cols-[32px_repeat(7,1fr)]">
          <div className="border-r border-[var(--border)]">
            {timeSlots.map(slot => (
              <div key={slot} style={{ height: SLOT_H }}
                className="border-b border-[var(--border)] flex items-start justify-end pr-1 pt-0.5">
                <span className="text-[8px] text-[var(--text-muted)] font-mono">{slot}</span>
              </div>
            ))}
          </div>
          {displayDays.map((day, di) => {
            const dayApts = allAppointments.filter(a => isSameDay(new Date(a.scheduled_at), day));
            const isToday = isSameDay(day, new Date());
            const totalH  = timeSlots.length * SLOT_H;
            return (
              <div key={di}
                className={cn("relative border-r border-[var(--border)] last:border-r-0", isToday && "bg-[#25D366]/[0.02]")}
                style={{ height: totalH }}>
                {timeSlots.map((_, si) => (
                  <div key={si} style={{ top: si * SLOT_H, height: SLOT_H }}
                    className="absolute inset-x-0 border-b border-[var(--border)]" />
                ))}
                {dayApts.map(apt => {
                  const top    = slotTop(new Date(apt.scheduled_at));
                  const height = Math.max(SLOT_H * 0.9, 28);
                  const isMock = apt.id.startsWith("mock-");
                  return (
                    <div key={apt.id}
                      style={{ top, height, left: 1, right: 1 }}
                      className={cn(
                        "absolute rounded-md border-l-2 px-1 py-0.5 overflow-hidden z-10",
                        isMock ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20" : (STATUS_BG[apt.statut] ?? STATUS_BG.en_attente),
                      )}>
                      <p className={cn("text-[8px] font-bold truncate leading-tight",
                        isMock ? "text-amber-700 dark:text-amber-300" : "text-[var(--text)]")}>
                        {isMock ? "⚡ " : ""}{apt.client_nom}
                      </p>
                      <p className="text-[7px] opacity-70 flex items-center gap-0.5">
                        <Clock className="w-2 h-2 inline" />
                        {new Date(apt.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-4 bg-[var(--bg)]">
        {[
          { cls: "bg-[#25D366]/20 border-[#25D366]",        label: "Confirmé"   },
          { cls: "bg-amber-100 border-amber-400",            label: "En attente" },
          { cls: "bg-amber-50 border-dashed border-amber-400", label: "Simulé ⚡" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-sm border-l-2", cls)} />
            <span className="text-[9px] text-[var(--text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}