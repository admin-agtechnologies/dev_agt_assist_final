// src/app/pme/appointments/components/DayCalendar.tsx
"use client";
import { Clock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RendezVous, HorairesOuverture } from "@/types/api";
import {
  type AppointmentStatus,
  type DayVal,
  STATUS_BLOCK,
  STATUS_LABELS,
  PX_PER_MIN,
  toMin,
  toTime,
  dateToJourKey,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────

interface DayCalendarProps {
  date: Date;
  rdvs: RendezVous[];
  horairesRdv: HorairesOuverture | null;
  dureeMin: number;
  bufferMin: number;
  onSlotClick: (time: string) => void;
  onRdvClick: (rdv: RendezVous) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function DayCalendar({
  date,
  rdvs,
  horairesRdv,
  dureeMin,
  bufferMin,
  onSlotClick,
  onRdvClick,
}: DayCalendarProps) {
  const jourKey  = dateToJourKey(date);
  const h        = horairesRdv?.[jourKey] as DayVal | undefined;
  const isOpen   = h?.open ?? true;
  const startMin = toMin(h?.start ?? "08:00");
  const endMin   = toMin(h?.end   ?? "18:00");

  // RDV du jour uniquement
  const dayRdvs = rdvs.filter((r) => {
    const d = new Date(r.scheduled_at);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth()    === date.getMonth() &&
      d.getDate()     === date.getDate()
    );
  });

  const totalMin = endMin - startMin;
  const totalPx  = Math.max(totalMin * PX_PER_MIN, 200);
  const slotPx   = dureeMin  * PX_PER_MIN;
  const bufferPx = bufferMin * PX_PER_MIN;

  // Lignes d'heure (toutes les 60 min)
  const hourLines: number[] = [];
  for (let m = startMin; m <= endMin; m += 60) hourLines.push(m);

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[var(--text-muted)]">
        <Clock className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">Fermé ce jour</p>
        <p className="text-xs opacity-60">Aucun créneau disponible</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-y-auto"
      style={{ height: Math.min(totalPx + 32, 600) }}
    >
      <div className="relative" style={{ height: totalPx, minHeight: 200 }}>

        {/* Lignes d'heure */}
        {hourLines.map((min) => {
          const top = (min - startMin) * PX_PER_MIN;
          return (
            <div
              key={min}
              className="absolute left-0 right-0 flex items-center gap-2 pointer-events-none"
              style={{ top }}
            >
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-10 text-right flex-shrink-0 select-none">
                {toTime(min)}
              </span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
          );
        })}

        {/* Créneaux cliquables */}
        {(() => {
          const slots = [];
          const step = dureeMin + bufferMin;
          for (let m = startMin; m + dureeMin <= endMin; m += step) {
            const top   = (m - startMin) * PX_PER_MIN;
            const heure = toTime(m);
            // Un créneau est occupé si un RDV actif se trouve
            // à moins de (dureeMin + bufferMin) minutes de ce créneau.
            // Cohérent avec la validation backend.
            const slotTotal = dureeMin + bufferMin;
            const occupied = dayRdvs
              .filter((r) => r.statut === "en_attente" || r.statut === "confirme")
              .some((r) => {
                const rm =
                  new Date(r.scheduled_at).getHours() * 60 +
                  new Date(r.scheduled_at).getMinutes();
                return Math.abs(rm - m) < slotTotal;
              });

            slots.push(
              <div
                key={m}
                onClick={() => !occupied && onSlotClick(heure)}
                className={cn(
                  "absolute left-12 right-0 rounded-lg transition-all group",
                  occupied
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-[#075E54]/5",
                )}
                style={{ top, height: slotPx - 2 }}
              >
                {!occupied && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#075E54] opacity-0 group-hover:opacity-50 font-semibold select-none">
                    + RDV à {heure}
                  </span>
                )}
              </div>,
            );

            // Zone tampon
            if (bufferMin > 0 && m + dureeMin < endMin) {
              slots.push(
                <div
                  key={`buf-${m}`}
                  className="absolute left-12 right-0 bg-gray-100/60 rounded-sm border-y border-dashed border-gray-200"
                  style={{
                    top: top + slotPx,
                    height: bufferPx - 1,
                    pointerEvents: "none",
                  }}
                >
                  {bufferPx > 12 && (
                    <span className="absolute inset-0 flex items-center px-2 text-[9px] text-gray-400 select-none">
                      tampon {bufferMin}min
                    </span>
                  )}
                </div>,
              );
            }
          }
          return slots;
        })()}

        {/* Blocs RDV positionnés */}
        {dayRdvs.map((rdv) => {
          const s   = new Date(rdv.scheduled_at);
          const min = s.getHours() * 60 + s.getMinutes();
          if (min < startMin || min >= endMin) return null;
          const top    = (min - startMin) * PX_PER_MIN;
          const height = Math.max(slotPx - 2, 28);
          const st     =
            STATUS_BLOCK[rdv.statut as AppointmentStatus] ??
            STATUS_BLOCK.en_attente;

          return (
            <div
              key={rdv.id}
              onClick={(e) => {
                e.stopPropagation();
                onRdvClick(rdv);
              }}
              className={cn(
                "absolute rounded-lg px-3 py-1.5 cursor-pointer z-10 overflow-hidden",
                "transition-all hover:shadow-md hover:brightness-95 active:scale-[0.99]",
                st.bg,
                st.border,
              )}
              style={{ top, height, left: "3rem", right: "0.5rem" }}
            >
              <div className="flex items-start gap-2 h-full">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0",
                    st.dot,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[11px] font-bold truncate flex items-center gap-1",
                      st.text,
                    )}
                  >
                    {s.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <span className="font-normal opacity-70">—</span>
                    {rdv.client_nom}
                  </p>
                  {height > 36 && (
                    <p className={cn("text-[10px] opacity-60 truncate", st.text)}>
                      {rdv.client_telephone && (
                        <span>{rdv.client_telephone} · </span>
                      )}
                      {STATUS_LABELS[rdv.statut as AppointmentStatus]}
                    </p>
                  )}
                </div>
                <Pencil
                  className={cn(
                    "w-3 h-3 flex-shrink-0 opacity-40 mt-0.5",
                    st.text,
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}