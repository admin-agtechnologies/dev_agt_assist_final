// src/app/pme/bots/_components/tabs/AgendaTab.tsx
"use client";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RendezVous } from "@/types/api";

const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const JOURS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

interface AgendaTabProps {
  appointments: RendezVous[];
  d: ReturnType<typeof useLanguage>["dictionary"];
}

export function AgendaTab({ appointments, d }: AgendaTabProps) {
  const [viewDate, setViewDate]     = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const STATUT_LABEL: Record<string, string> = {
    confirme:   d.appointments.statuses.confirmed,
    en_attente: d.appointments.statuses.pending,
    termine:    d.appointments.statuses.done,
    annule:     d.appointments.statuses.cancelled,
  };

  const year     = viewDate.getFullYear();
  const month    = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days     = new Date(year, month + 1, 0).getDate();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;

  const dayAppointments = appointments.filter(a =>
    new Date(a.scheduled_at).toDateString() === selectedDate.toDateString(),
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const rdvsByDay = new Map<string, number>();
  appointments.forEach(a => {
    const k = new Date(a.scheduled_at).toDateString();
    rdvsByDay.set(k, (rdvsByDay.get(k) ?? 0) + 1);
  });

  const today = new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* ── Mini calendrier ── */}
      <div className="card p-4 h-fit">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-black text-[var(--text)]">
            {MOIS[month]} {year}
          </p>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 mb-2">
          {JOURS.map(j => (
            <p key={j} className="text-center text-[10px] font-black text-[var(--text-muted)] py-1">{j}</p>
          ))}
        </div>

        {/* Cases jours */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const d = new Date(year, month, i + 1);
            const isToday   = d.toDateString() === today.toDateString();
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const count     = rdvsByDay.get(d.toDateString()) ?? 0;
            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(d); setViewDate(d); }}
                className={cn(
                  "w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all",
                  isSelected ? "bg-[#075E54] text-white" :
                  isToday    ? "bg-[#25D366]/20 text-[#075E54]" :
                               "hover:bg-[var(--bg)] text-[var(--text)]",
                )}
              >
                {i + 1}
                {count > 0 && (
                  <div className={cn(
                    "w-1 h-1 rounded-full mt-0.5",
                    isSelected ? "bg-white" : "bg-[#075E54]",
                  )} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { const t = new Date(); setSelectedDate(t); setViewDate(t); }}
          className="w-full mt-3 text-xs font-bold text-[#075E54] hover:bg-[#075E54]/5 py-1.5 rounded-lg transition-colors"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* ── Liste RDV du jour ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </h4>
          <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
            {dayAppointments.length} RDV
          </span>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <CalendarDays className="w-7 h-7 mb-2 opacity-20" />
            <p className="text-xs">Aucun rendez-vous ce jour</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map(apt => (
              <div key={apt.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:shadow-sm transition-all">
                <div className="bg-[var(--bg-card)] px-2 py-1 rounded-lg border border-[var(--border)] text-center min-w-[52px]">
                  <p className="text-[10px] font-bold text-[#075E54]">
                    {new Date(apt.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] truncate">{apt.client_nom}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {apt.services_detail?.[0]?.service_nom || "Consultation"}
                  </p>
                </div>
                <Badge variant={apt.statut === "confirme" ? "green" : "amber"}>
                  {STATUT_LABEL[apt.statut] ?? apt.statut}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}