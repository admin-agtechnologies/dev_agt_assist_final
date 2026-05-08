"use client";
// src/app/(dashboard)/agences/page.tsx

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { agencesRepository } from "@/repositories/agences.repository";
import { AgenceForm } from "@/components/agences/AgenceForm";
import { QuotaWarning } from "@/components/agences/QuotaWarning";
import { LoadingPage } from "@/components/data/LoadingSpinner";
import type { Agence, CreateAgencePayload } from "@/types/api/agence.types";

const LABELS = {
  fr: {
    title: "Agences",
    add: "Nouvelle agence",
    empty: "Aucune agence configurée.",
    siege: "Siège",
    active: "Active",
    inactive: "Inactive",
    services: (n: number) => `${n} service${n > 1 ? "s" : ""}`,
  },
  en: {
    title: "Agencies",
    add: "New agency",
    empty: "No agencies configured.",
    siege: "Headquarters",
    active: "Active",
    inactive: "Inactive",
    services: (n: number) => `${n} service${n > 1 ? "s" : ""}`,
  },
} as const;

export default function AgencesPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const t = LABELS[locale];

  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Quota depuis le plan de l'entreprise (fallback 1)
  const limiteAgences = 1; // TODO: lire depuis user.entreprise.abonnement.plan.limite_agences quand disponible

  const load = useCallback(async () => {
    try {
      const res = await agencesRepository.getList();
      setAgences(res.results);
    } catch {
      setAgences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: CreateAgencePayload) => {
    await agencesRepository.create(payload);
    setShowForm(false);
    await load();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text)]">{t.title}</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={agences.length >= limiteAgences}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Plus size={15} />
          {t.add}
        </button>
      </div>

      <QuotaWarning current={agences.length} limite={limiteAgences} locale={locale} />

      {showForm && (
        <div className="card p-5">
          <AgenceForm
            locale={locale}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {agences.length === 0 && !showForm ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-12 italic">{t.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {agences.map((agence) => (
            <div key={agence.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{agence.nom}</p>
                  {agence.is_siege && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium flex-shrink-0">
                      {t.siege}
                    </span>
                  )}
                </div>
                {agence.ville && (
                  <p className="text-xs text-[var(--text-muted)]">{agence.ville}</p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.services(agence.services_count)}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  agence.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {agence.is_active ? t.active : t.inactive}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}