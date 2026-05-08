"use client";
// src/components/catalogue/ItemForm.tsx

import { useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";

export interface ItemFormPayload {
  nom: string;
  description?: string;
  prix?: number;
  devise: string;
  est_gratuit: boolean;
  est_sur_devis: boolean;
  disponible: boolean;
}

const LABELS = {
  fr: {
    nom: "Nom de l'article",
    description: "Description",
    prix: "Prix",
    devise: "Devise",
    gratuit: "Gratuit",
    surDevis: "Sur devis",
    disponible: "Disponible",
    save: "Ajouter",
    saving: "Ajout…",
    cancel: "Annuler",
  },
  en: {
    nom: "Item name",
    description: "Description",
    prix: "Price",
    devise: "Currency",
    gratuit: "Free",
    surDevis: "On request",
    disponible: "Available",
    save: "Add",
    saving: "Adding…",
    cancel: "Cancel",
  },
} as const;

interface ItemFormProps {
  locale: Locale;
  onSave: (payload: ItemFormPayload) => Promise<void>;
  onCancel: () => void;
}

export function ItemForm({ locale, onSave, onCancel }: ItemFormProps) {
  const t = LABELS[locale];
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [devise, setDevise] = useState("XAF");
  const [estGratuit, setEstGratuit] = useState(false);
  const [estSurDevis, setEstSurDevis] = useState(false);
  const [disponible, setDisponible] = useState(true);
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
        description: description.trim() || undefined,
        prix: estGratuit || estSurDevis ? undefined : prix ? Number(prix) : undefined,
        devise,
        est_gratuit: estGratuit,
        est_sur_devis: estSurDevis,
        disponible,
      });
    } catch {
      setError(locale === "fr" ? "Une erreur est survenue." : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <FormField
        label={t.nom}
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        error={error ?? undefined}
        disabled={saving}
      />

      <FormField
        label={t.description}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={saving}
      />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={estGratuit}
            onChange={(e) => { setEstGratuit(e.target.checked); if (e.target.checked) setEstSurDevis(false); }}
            disabled={saving}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          <span className="text-sm text-[var(--text)]">{t.gratuit}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={estSurDevis}
            onChange={(e) => { setEstSurDevis(e.target.checked); if (e.target.checked) setEstGratuit(false); }}
            disabled={saving}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          <span className="text-sm text-[var(--text)]">{t.surDevis}</span>
        </label>
      </div>

      {!estGratuit && !estSurDevis && (
        <div className="flex gap-3">
          <div className="flex-1">
            <FormField
              label={t.prix}
              type="number"
              min="0"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="w-24">
            <FormField
              label={t.devise}
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
          disabled={saving}
          className="w-4 h-4 accent-[var(--primary)]"
        />
        <span className="text-sm text-[var(--text)]">{t.disponible}</span>
      </label>

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