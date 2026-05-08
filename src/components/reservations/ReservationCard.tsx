// src/components/reservations/ReservationCard.tsx
"use client";
import { Calendar, Phone, Bell } from "lucide-react";
import type { Reservation, ReservationStatut } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUT_STYLES: Record<ReservationStatut, string> = {
  en_attente:               "bg-yellow-100 text-yellow-800",
  en_attente_confirmation:  "bg-orange-100 text-orange-800",
  confirmee:                "bg-green-100 text-green-800",
  annulee:                  "bg-red-100 text-red-800",
  terminee:                 "bg-gray-100 text-gray-600",
};

const STATUT_LABELS: Record<ReservationStatut, { fr: string; en: string }> = {
  en_attente:               { fr: "En attente",         en: "Pending" },
  en_attente_confirmation:  { fr: "À confirmer",        en: "To confirm" },
  confirmee:                { fr: "Confirmée",           en: "Confirmed" },
  annulee:                  { fr: "Annulée",             en: "Cancelled" },
  terminee:                 { fr: "Terminée",            en: "Done" },
};

interface Props {
  reservation: Reservation;
  locale: Locale;
  onClick?: () => void;
}

export function ReservationCard({ reservation, locale, onClick }: Props) {
  const dateDebut = new Date(reservation.date_debut).toLocaleString(
    locale === "fr" ? "fr-FR" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <Calendar size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {reservation.contact_nom}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[reservation.statut]}`}>
            {STATUT_LABELS[reservation.statut][locale]}
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] truncate mb-1">
          {reservation.ressource_nom}
        </p>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {dateDebut}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {reservation.contact_phone}
          </span>
          {reservation.necessite_rappel && (
            <span className="flex items-center gap-1 text-orange-500">
              <Bell size={11} />
              {locale === "fr" ? "Rappel" : "Remind"}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}