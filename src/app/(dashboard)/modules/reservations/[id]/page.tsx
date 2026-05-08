// src/app/(dashboard)/modules/reservations/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { reservationsRepository } from "@/repositories/reservations.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Reservation, ReservationStatut } from "@/types/api/reservation.types";

const STATUT_ORDER: ReservationStatut[] = [
    "en_attente",
    "en_attente_confirmation",
    "confirmee",
    "terminee",
];

const STATUT_STYLES: Record<ReservationStatut, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    en_attente_confirmation: "bg-orange-100 text-orange-800",
    confirmee: "bg-green-100 text-green-800",
    annulee: "bg-red-100 text-red-800",
    terminee: "bg-gray-100 text-gray-700",
};

export default function ReservationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { dictionary: d } = useLanguage();
    const t = d.reservations.detail;

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        reservationsRepository
            .getById(id)
            .then(setReservation)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    const nextStatut = (current: ReservationStatut): ReservationStatut | null => {
        const idx = STATUT_ORDER.indexOf(current);
        return idx >= 0 && idx < STATUT_ORDER.length - 1
            ? STATUT_ORDER[idx + 1]
            : null;
    };

    const handleAdvance = () => {
        if (!reservation) return;
        const next = nextStatut(reservation.statut);
        if (!next) return;
        setAdvancing(true);
        reservationsRepository
            .updateStatut(reservation.id, { statut: next })
            .then(setReservation)
            .finally(() => setAdvancing(false));
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    if (notFound || !reservation) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p className="text-[var(--text-muted)] text-sm">{t.notFound}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-4 text-sm text-[var(--primary)] underline"
                >
                    {d.common.back}
                </button>
            </div>
        );
    }

    const next = nextStatut(reservation.statut);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title={`${t.ref}${reservation.id.slice(0, 8)}`}
                onBack={() => router.back()}
            />

            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.client}</span>
                    <span className="font-medium text-[var(--text)]">{reservation.contact_nom}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.phone}</span>
                    <span className="font-medium text-[var(--text)]">{reservation.contact_phone}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.resource}</span>
                    <span className="font-medium text-[var(--text)]">{reservation.ressource_nom}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.start}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(reservation.date_debut)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.end}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(reservation.date_fin)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.reservations.table.status}</span>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[reservation.statut]}`}
                    >
                        {t.statuses[reservation.statut]}
                    </span>
                </div>
                {reservation.necessite_rappel && (
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">{t.rappelStaff}</span>
                        <span className="text-xs font-semibold text-orange-600">⚠</span>
                    </div>
                )}
                {reservation.notes && (
                    <div>
                        <span className="text-[var(--text-muted)]">{t.notes}</span>
                        <p className="mt-1 text-[var(--text)] text-xs">{reservation.notes}</p>
                    </div>
                )}
            </div>

            {next && reservation.statut !== "annulee" && (
                <div className="card p-4">
                    <button
                        type="button"
                        disabled={advancing}
                        onClick={handleAdvance}
                        className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {advancing ? <Spinner /> : `${t.advance} « ${t.statuses[next]} »`}
                    </button>
                </div>
            )}
        </div>
    );
}