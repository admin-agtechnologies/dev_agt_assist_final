"use client";
// src/components/reservations/RessourceManager/index.tsx

import { useState } from "react";
import { Plus } from "lucide-react";
import { RessourceForm } from "./RessourceForm";
import { DisponibiliteGrid } from "./DisponibiliteGrid";
import type { Ressource, CreateRessourcePayload, DisponibiliteRessource } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    title: "Ressources",
    add: "Ajouter une ressource",
    empty: "Aucune ressource configurée.",
    disponibilites: "Disponibilités",
  },
  en: {
    title: "Resources",
    add: "Add resource",
    empty: "No resources configured.",
    disponibilites: "Availability",
  },
} as const;

interface RessourceManagerProps {
  ressources: Ressource[];
  featureSlug: string;
  locale: Locale;
  onCreateRessource: (payload: CreateRessourcePayload) => Promise<void>;
  onLoadDisponibilites: (ressourceId: string) => Promise<DisponibiliteRessource[]>;
  onSaveDisponibilites: (
    ressourceId: string,
    disponibilites: Omit<DisponibiliteRessource, "id" | "est_active">[]
  ) => Promise<void>;
}

export function RessourceManager({
  ressources,
  featureSlug,
  locale,
  onCreateRessource,
  onLoadDisponibilites,
  onSaveDisponibilites,
}: RessourceManagerProps) {
  const t = LABELS[locale];
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = ressources.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text)]">{t.title}</h3>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/20 transition-colors"
        >
          <Plus size={14} />
          {t.add}
        </button>
      </div>

      {showForm && (
        <div className="card p-4">
          <RessourceForm
            featureSlug={featureSlug}
            locale={locale}
            onSave={async (payload) => {
              await onCreateRessource(payload);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {ressources.length === 0 && !showForm && (
        <p className="text-sm text-[var(--text-muted)] text-center py-8 italic">
          {t.empty}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {ressources.map((r) => (
          <div key={r.id} className="card p-4">
            <button
              type="button"
              onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{r.nom}</p>
                <p className="text-xs text-[var(--text-muted)]">{r.type}</p>
              </div>
              <span className="text-xs text-[var(--primary)]">
                {selectedId === r.id
                  ? (locale === "fr" ? "Fermer" : "Close")
                  : t.disponibilites}
              </span>
            </button>

            {selectedId === r.id && selected && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <DisponibiliteGrid
                  ressource={selected}
                  locale={locale}
                  onLoad={() => onLoadDisponibilites(r.id)}
                  onSave={(dispo) => onSaveDisponibilites(r.id, dispo)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}