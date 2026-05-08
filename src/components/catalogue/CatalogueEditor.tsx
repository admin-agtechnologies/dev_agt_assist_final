"use client";
// src/components/catalogue/CatalogueEditor.tsx

import { useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Catalogue, CreateCataloguePayload } from "@/types/api/catalogue.types";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    nom: "Nom du catalogue",
    description: "Description",
    actif: "Catalogue actif",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
  },
  en: {
    nom: "Catalogue name",
    description: "Description",
    actif: "Active catalogue",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
  },
} as const;

interface CatalogueEditorProps {
  initial?: Partial<Catalogue>;
  locale: Locale;
  onSave: (payload: CreateCataloguePayload) => Promise<void>;
  onCancel: () => void;
}

export function CatalogueEditor({
  initial,
  locale,
  onSave,
  onCancel,
}: CatalogueEditorProps) {
  const t = LABELS[locale];
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
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
        is_active: isActive,
        feature_slug: initial?.feature_slug ?? "",
        agence_id: initial?.agence_id ?? "",
      });
    } catch {
      setError(locale === "fr" ? "Une erreur est survenue." : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label={t.nom}
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        error={error ?? undefined}
        disabled={saving}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text)]">{t.description}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={saving}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none disabled:opacity-50"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={saving}
          className="w-4 h-4 accent-[var(--primary)]"
        />
        <span className="text-sm text-[var(--text)]">{t.actif}</span>
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