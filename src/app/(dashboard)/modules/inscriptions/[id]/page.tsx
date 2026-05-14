// src/app/(dashboard)/modules/inscriptions/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Inscription, InscriptionStatut } from "@/types/api/crm.types";

const STATUT_ORDER: InscriptionStatut[] = [
    "en_attente",
    "documents_manquants",
    "en_cours",
    "acceptee",
];

const STATUT_STYLES: Record<InscriptionStatut, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    documents_manquants: "bg-orange-100 text-orange-800",
    en_cours: "bg-blue-100 text-blue-800",
    acceptee: "bg-green-100 text-green-800",
    refusee: "bg-red-100 text-red-800",
};

export default function InscriptionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { dictionary: d } = useLanguage();
    const t = d.inscriptions.detail;

    const [inscription, setInscription] = useState<Inscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get(`/api/v1/inscriptions/${id}/`)
            .then((data: unknown) => setInscription(data as Inscription))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    const nextStatut = (current: InscriptionStatut): InscriptionStatut | null => {
        const idx = STATUT_ORDER.indexOf(current);
        return idx >= 0 && idx < STATUT_ORDER.length - 1
            ? STATUT_ORDER[idx + 1]
            : null;
    };

    const handleAdvance = () => {
        if (!inscription) return;
        const next = nextStatut(inscription.statut);
        if (!next) return;
        setAdvancing(true);
        api
            .patch(`/api/v1/inscriptions/${inscription.id}/`, { statut: next })
            .then((data: unknown) => setInscription(data as Inscription))
            .finally(() => setAdvancing(false));
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    if (notFound || !inscription) {
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

    const next = nextStatut(inscription.statut);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title={inscription.contact_nom ?? inscription.filiere}
                subtitle={inscription.contact_phone ?? ""}
                onBack={() => router.back()}
            />

            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.inscriptions.table.statut}</span>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[inscription.statut]}`}
                    >
                        {t.statuses[inscription.statut]}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.common.createdAt}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(inscription.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.common.updatedAt}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(inscription.updated_at)}</span>
                </div>
                {inscription.notes && (
                    <div>
                        <span className="text-[var(--text-muted)]">{t.notes}</span>
                        <p className="mt-1 text-[var(--text)] text-xs">{inscription.notes}</p>
                    </div>
                )}
            </div>

            {next && inscription.statut !== "refusee" && (
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