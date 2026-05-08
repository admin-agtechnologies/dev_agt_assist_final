// src/app/(dashboard)/modules/dossiers/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeatureLabel } from "@/lib/sector-labels";
import { DossierCard } from "@/components/dossiers/DossierCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Dossier, DossierStatut } from "@/types/api/crm.types";
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

const STATUTS: { value: DossierStatut | ""; label: { fr: string; en: string } }[] = [
  { value: "",                    label: { fr: "Tous",           en: "All" } },
  { value: "ouvert",              label: { fr: "Ouverts",        en: "Open" } },
  { value: "en_traitement",       label: { fr: "En traitement",  en: "In progress" } },
  { value: "en_attente_documents",label: { fr: "Docs manquants", en: "Missing docs" } },
  { value: "cloture",             label: { fr: "Clôturés",       en: "Closed" } },
  { value: "rejete",              label: { fr: "Rejetés",        en: "Rejected" } },
];

export default function DossiersPage() {
  const { locale } = useLanguage();
  const labels = getFeatureLabel("orientation_citoyens", locale);

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [statut, setStatut] = useState<DossierStatut | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = statut ? { statut } : {};
    api
      .get("/api/v1/dossiers/", { params })
      .then((data: unknown) => {
        const res = data as PaginatedResponse<Dossier>;
        setDossiers(Array.isArray(data) ? (data as Dossier[]) : res.results ?? []);
      })
      .catch(() => setDossiers([]))
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
      ) : dossiers.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{labels.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dossiers.map((d) => (
            <DossierCard key={d.id} dossier={d} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}