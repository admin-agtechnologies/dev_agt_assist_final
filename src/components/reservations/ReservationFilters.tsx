// src/components/reservations/ReservationFilters.tsx
"use client";
import type { ReservationStatut } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUTS: { value: ReservationStatut | ""; label: { fr: string; en: string } }[] = [
  { value: "",                       label: { fr: "Toutes",    en: "All" } },
  { value: "en_attente",             label: { fr: "En attente", en: "Pending" } },
  { value: "en_attente_confirmation",label: { fr: "À confirmer", en: "To confirm" } },
  { value: "confirmee",              label: { fr: "Confirmées", en: "Confirmed" } },
  { value: "annulee",                label: { fr: "Annulées",   en: "Cancelled" } },
  { value: "terminee",               label: { fr: "Terminées",  en: "Done" } },
];

interface Props {
  statut: ReservationStatut | "";
  onChange: (s: ReservationStatut | "") => void;
  locale: Locale;
}

export function ReservationFilters({ statut, onChange, locale }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {STATUTS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            statut === s.value
              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
              : "bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]"
          }`}
        >
          {s.label[locale]}
        </button>
      ))}
    </div>
  );
}