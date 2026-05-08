// src/app/(dashboard)/modules/inscriptions/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureLabel } from "@/lib/sector-labels";
import { InscriptionCard } from "@/components/inscriptions/InscriptionCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Inscription, InscriptionStatut } from "@/types/api/crm.types";
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

const STATUTS: { value: InscriptionStatut | ""; label: { fr: string; en: string } }[] = [
  { value: "",                     label: { fr: "Toutes",            en: "All" } },
  { value: "en_attente",           label: { fr: "En attente",        en: "Pending" } },
  { value: "documents_manquants",  label: { fr: "Docs manquants",    en: "Missing docs" } },
  { value: "en_cours",             label: { fr: "En cours",          en: "In progress" } },
  { value: "acceptee",             label: { fr: "Acceptées",         en: "Accepted" } },
  { value: "refusee",              label: { fr: "Refusées",          en: "Refused" } },
];

export default function InscriptionsPage() {
  const { locale } = useLanguage();
  const labels = getFeatureLabel("inscription_admission", locale);

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [statut, setStatut] = useState<InscriptionStatut | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = statut ? { statut } : {};
    api
      .get("/api/v1/inscriptions/", { params })
      .then((data: unknown) => {
        const res = data as PaginatedResponse<Inscription>;
        setInscriptions(Array.isArray(data) ? (data as Inscription[]) : res.results ?? []);
      })
      .catch(() => setInscriptions([]))
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title={labels.pageTitle} />

      <div className="flex gap-2 flex-wrap">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatut(s.value)}
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

      {loading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : inscriptions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{labels.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inscriptions.map((i) => (
            <InscriptionCard key={i.id} inscription={i} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}