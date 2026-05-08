"use client";
// src/components/reservations/RessourceManager/RessourceForm.tsx

import { useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { CreateRessourcePayload } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    nom: "Nom",
    type: "Type",
    capacite: "Capacité",
    save: "Créer",
    saving: "Création…",
    cancel: "Annuler",
    typePlaceholder: "chambre, table, praticien…",
  },
  en: {
    nom: "Name",
    type: "Type",
    capacite: "Capacity",
    save: "Create",
    saving: "Creating…",
    cancel: "Cancel",
    typePlaceholder: "room, table, practitioner…",
  },
} as const;

interface RessourceFormProps {
  featureSlug: string;
  locale: Locale;
  onSave: (payload: CreateRessourcePayload) => Promise<void>;
  onCancel: () => void;
}

export function RessourceForm({ featureSlug, locale, onSave, onCancel }: RessourceFormProps) {
  const t = LABELS[locale];
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [capacite, setCapacite] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nom.trim() || !type.trim()) {
      setError(locale === "fr" ? "Nom et type sont requis." : "Name and type are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        nom: nom.trim(),
        type: type.trim(),
        capacite: Math.max(1, parseInt(capacite) || 1),
        feature_slug: featureSlug,
      });
    } catch {
      setError(locale === "fr" ? "Une erreur est survenue." : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-xs text-red-500">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t.nom} value={nom} onChange={(e) => setNom(e.target.value)} required disabled={saving} />
        <FormField label={t.type} value={type} onChange={(e) => setType(e.target.value)} placeholder={t.typePlaceholder} required disabled={saving} />
      </div>
      <FormField label={t.capacite} type="number" min="1" value={capacite} onChange={(e) => setCapacite(e.target.value)} disabled={saving} />
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving && <LoadingSpinner size={14} className="text-white" />}
          {saving ? t.saving : t.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}