// src/app/(dashboard)/modules/commandes/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { commandesRepository } from "@/repositories/commandes.repository";
import { CommandeStatusBadge } from "@/components/commandes/CommandeStatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Commande, CommandeStatut } from "@/types/api/commande.types";

const STATUT_ORDER: CommandeStatut[] = [
    "en_attente",
    "confirmee",
    "en_preparation",
    "prete",
    "livree",
];

export default function CommandeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { dictionary: d, locale } = useLanguage();
    const t = d.commandes.detail;

    const [commande, setCommande] = useState<Commande | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        commandesRepository
            .getById(id)
            .then(setCommande)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    const nextStatut = (current: CommandeStatut): CommandeStatut | null => {
        const idx = STATUT_ORDER.indexOf(current);
        return idx >= 0 && idx < STATUT_ORDER.length - 1
            ? STATUT_ORDER[idx + 1]
            : null;
    };

    const handleAdvance = () => {
        if (!commande) return;
        const next = nextStatut(commande.statut);
        if (!next) return;
        setAdvancing(true);
        commandesRepository
            .updateStatut(commande.id, { statut: next })
            .then(setCommande)
            .finally(() => setAdvancing(false));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    if (notFound || !commande) {
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

    const next = nextStatut(commande.statut);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader title={`${t.ref}${commande.id.slice(0, 8)}`} onBack={() => router.back()} />

            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.client}</span>
                    <span className="font-medium text-[var(--text)]">{commande.contact_nom}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.phone}</span>
                    <span className="font-medium text-[var(--text)]">{commande.contact_phone}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{d.commandes.table.statut}</span>
                    <CommandeStatusBadge statut={commande.statut} locale={locale} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.payment}</span>
                    <span
                        className={`text-xs font-semibold ${commande.est_paye ? "text-green-600" : "text-yellow-600"}`}
                    >
                        {commande.est_paye ? t.paid : t.pending}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{t.total}</span>
                    <span className="font-bold text-[var(--text)]">
                        {commande.montant_total.toLocaleString(locale)} {commande.devise}
                    </span>
                </div>
                {commande.notes && (
                    <div>
                        <span className="text-[var(--text-muted)]">{t.notes}</span>
                        <p className="mt-1 text-[var(--text)] text-xs">{commande.notes}</p>
                    </div>
                )}
            </div>

            <div className="card p-4">
                <h2 className="font-semibold text-[var(--text)] mb-3 text-sm">{t.lines}</h2>
                {commande.lignes.length === 0 ? (
                    <p className="text-[var(--text-muted)] text-xs">{t.noLines}</p>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {commande.lignes.map((ligne) => (
                            <li key={ligne.id} className="flex justify-between items-center py-2 text-sm">
                                <div>
                                    <p className="font-medium text-[var(--text)]">{ligne.item_nom}</p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {t.qty} {ligne.quantite} ×{" "}
                                        {ligne.prix_unitaire.toLocaleString(locale)} {commande.devise}
                                    </p>
                                </div>
                                <span className="font-semibold text-[var(--primary)]">
                                    {ligne.sous_total.toLocaleString(locale)} {commande.devise}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {next && commande.statut !== "annulee" && (
                <div className="card p-4">
                    <button
                        type="button"
                        disabled={advancing}
                        onClick={handleAdvance}
                        className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {advancing ? <Spinner /> : `${t.advance} « ${d.commandes.statuses[next]} »`}
                    </button>
                </div>
            )}
        </div>
    );
}