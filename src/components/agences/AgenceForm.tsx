"use client";
// src/components/agences/AgenceForm.tsx

import { useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Agence, CreateAgencePayload } from "@/types/api/agence.types";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    nom: "Nom de l'agence",
    adresse: "Adresse",
    ville: "Ville",
    whatsapp: "WhatsApp",
    telephone: "Téléphone",
    email: "Email",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
  },
  en: {
    nom: "Agency name",
    adresse: "Address",
    ville: "City",
    whatsapp: "WhatsApp",
    telephone: "Phone",
    email: "Email",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
  },
} as const;

interface AgenceFormProps {
  initial?: Partial<Agence>;
  locale: Locale;
  onSave: (payload: CreateAgencePayload) => Promise<void>;
  onCancel: () => void;
}

export function AgenceForm({ initial, locale, onSave, onCancel }: AgenceFormProps) {
  const t = LABELS[locale];

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nom.trim()) {
      setError(locale === "fr" ? "Le nom est requis." : "Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        nom: nom.trim(),
        adresse: adresse.trim() || undefined,
        ville: ville.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        telephone: telephone.trim() || undefined,
        email: email.trim() || undefined,
      });
    } catch {
      setError(locale === "fr" ? "Une erreur est survenue." : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField label={t.nom} value={nom} onChange={(e) => setNom(e.target.value)} required error={error ?? undefined} disabled={saving} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t.adresse} value={adresse} onChange={(e) => setAdresse(e.target.value)} disabled={saving} />
        <FormField label={t.ville} value={ville} onChange={(e) => setVille(e.target.value)} disabled={saving} />
        <FormField label={t.whatsapp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" disabled={saving} />
        <FormField label={t.telephone} value={telephone} onChange={(e) => setTelephone(e.target.value)} type="tel" disabled={saving} />
        <FormField label={t.email} value={email} onChange={(e) => setEmail(e.target.value)} type="email" disabled={saving} className="sm:col-span-2" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <LoadingSpinner size={14} className="text-white" />}
          {saving ? t.saving : t.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}