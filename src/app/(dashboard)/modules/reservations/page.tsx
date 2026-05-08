// src/app/(dashboard)/modules/reservations/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { reservationsRepository } from "@/repositories/reservations.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { ReservationCard } from "@/components/reservations/ReservationCard";
import { ReservationFilters } from "@/components/reservations/ReservationFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Reservation, ReservationStatut } from "@/types/api/reservation.types";

const RESERVATION_SLUGS = ["reservation_table", "reservation_chambre", "reservation_billet", "prise_rdv"];

export default function ReservationsPage() {
  const { locale } = useLanguage();
  const { features } = useActiveFeatures();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [aRappeler, setARappeler] = useState<Reservation[]>([]);
  const [statut, setStatut] = useState<ReservationStatut | "">("");
  const [loading, setLoading] = useState(true);

  const activeFeature = features.find(
    (f) => RESERVATION_SLUGS.includes(f.slug) && f.is_active,
  );
  const labels = activeFeature
    ? getFeatureLabel(activeFeature.slug, locale)
    : { pageTitle: locale === "fr" ? "Réservations" : "Reservations", empty: locale === "fr" ? "Aucune réservation" : "No reservations", nav: "", cta: "" };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      reservationsRepository.list({ statut: statut || undefined }),
      reservationsRepository.aRappeler(),
    ])
      .then(([res, rappels]) => {
        setReservations(res.results);
        setARappeler(rappels);
      })
      .catch(() => { setReservations([]); setARappeler([]); })
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title={labels.pageTitle} />

      {aRappeler.length > 0 && (
        <div className="card p-4 border-l-4 border-orange-400 bg-orange-50">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            🔔 {aRappeler.length} {locale === "fr" ? "à rappeler" : "to remind"}
          </p>
          <div className="space-y-2">
            {aRappeler.map((r) => (
              <ReservationCard key={r.id} reservation={r} locale={locale} />
            ))}
          </div>
        </div>
      )}

      <ReservationFilters statut={statut} onChange={setStatut} locale={locale} />

      {loading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : reservations.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{labels.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}