// src/app/pme/dashboard/_components/TodayAppointments.tsx
"use client";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { RendezVous } from "@/types/api";

interface Props {
  appointments: RendezVous[];
  labels: {
    title: string;
    viewAgenda: string;
    none: string;
    statuses: {
      confirme: string;
      en_attente: string;
      termine: string;
      annule: string;
    };
  };
}

const statusVariant: Record<string, "green" | "amber" | "slate" | "red"> = {
  confirme: "green",
  en_attente: "amber",
  termine: "slate",
  annule: "red",
};

export function TodayAppointments({ appointments, labels }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--text)]">{labels.title}</h2>
        <Link
          href={ROUTES.appointments}
          className="text-xs text-[#075E54] font-semibold hover:underline"
        >
          {labels.viewAgenda}
        </Link>
      </div>
      {appointments.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] text-center py-4">{labels.none}</p>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {appt.client_nom}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {formatDateTime(appt.scheduled_at)}
                </p>
              </div>
              <Badge variant={statusVariant[appt.statut] ?? "slate"}>
                {labels.statuses[appt.statut as keyof typeof labels.statuses] ?? appt.statut}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}