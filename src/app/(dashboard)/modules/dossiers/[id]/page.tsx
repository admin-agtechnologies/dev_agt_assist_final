// src/app/(dashboard)/modules/dossiers/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Dossier, DossierStatut } from "@/types/api/crm.types";

const STATUT_ORDER: DossierStatut[] = [
    "ouvert",
    "en_traitement",
    "en_attente_documents",
    "cloture",
];

const STATUT_STYLES: Record<DossierStatut, string> = {
    ouvert: "bg-blue-100 text-blue-800",
    en_traitement: "bg-purple-100 text-purple-800",
    en_attente_documents: "bg-orange-100 text-orange-800",
    cloture: "bg-gray-100 text-gray-700",
    rejete: "bg-red-100 text-red-800",
};

export default function DossierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { dictionary: d } = useLanguage();
    const t = d.dossiers.detail;

    const [dossier, setDossier] = useState<Dossier | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get(`/api/v1/dossiers/${id}/`)
            .then((data: unknown) => setDossier(data as Dossier))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    const nextStatut = (current: DossierStatut): DossierStatut | null => {
        const idx = STATUT_ORDER.indexOf(current);
        return idx >= 0 && idx < STATUT_ORDER.length - 1
            ? STATUT_ORDER[idx + 1]
            : null;
    };

    const handleAdvance = () => {
        if (!dossier) return;
        const next = nextStatut(dossier.statut);
        if (!next) return;
        setAdvancing(true);
        api
            .patch(`/api/v1/dossiers/${dossier.id}/`, { statut: next })
            .then((data: unknown) => setDossier(data as Dossier))
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

    if (notFound || !dossier) {
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

    const next = nextStatut(dossier.statut);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title={dossier.contact_nom ?? dossier.titre}
                subtitle={dossier.type_procedure ?? ""}
                onBack={() => router.back()}
            />

            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.dossiers.table.citoyen}</span>
                    <span className="font-medium text-[var(--text)]">{dossier.contact_phone}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.dossiers.table.statut}</span>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[dossier.statut]}`}
                    >
                        {t.statuses[dossier.statut]}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.createdAt}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(dossier.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.updatedAt}</span>
                    <span className="font-medium text-[var(--text)]">{formatDate(dossier.updated_at)}</span>
                </div>
                {dossier.notes && (
                    <div>
                        <span className="text-[var(--text-muted)]">{t.adminNotes}</span>
                        <p className="mt-1 text-[var(--text)] text-xs">{dossier.notes}</p>
                    </div>
                )}
            </div>

            {next && dossier.statut !== "rejete" && (
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