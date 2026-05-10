"use client";
// ============================================================
// FICHIER : src/components/onboarding/IdentityStep.tsx
// Étape 2 : Nom de l'entreprise (seul champ obligatoire)
// ============================================================

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    title:       "Votre entreprise",
    subtitle:    "Comment s'appelle votre entreprise ? Vous pourrez compléter votre profil plus tard.",
    label:       "Nom de l'entreprise",
    placeholder: "Ex : Restaurant La Terrasse",
    confirm:     "Continuer",
    required:    "Le nom est requis.",
  },
  en: {
    title:       "Your business",
    subtitle:    "What is your business name? You can complete your profile later.",
    label:       "Business name",
    placeholder: "e.g. La Terrasse Restaurant",
    confirm:     "Continue",
    required:    "Name is required.",
  },
} as const;

interface IdentityStepProps {
  initialName:  string;
  locale:       Locale;
  accentColor:  string;
  onConfirm:    (companyName: string) => void;
}

export function IdentityStep({ initialName, locale, accentColor, onConfirm }: IdentityStepProps) {
  const t = LABELS[locale];
  const [name,  setName]  = useState(initialName);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError(t.required); return; }
    setError("");
    onConfirm(trimmed);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text)]" htmlFor="company-name">
          {t.label}
          <span className="text-red-500 ml-0.5">*</span>
        </label>

        <div className="relative">
          <Building2
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t.placeholder}
            className={[
              "w-full pl-9 pr-4 py-3 rounded-xl border-2 bg-[var(--bg)] text-[var(--text)]",
              "text-sm placeholder:text-[var(--text-muted)] outline-none transition-colors",
              error ? "border-red-400" : "border-[var(--border)] focus:border-[var(--primary)]",
            ].join(" ")}
            style={{ "--primary": accentColor } as React.CSSProperties}
            autoFocus
            autoComplete="organization"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="self-end px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: accentColor }}
      >
        {t.confirm}
      </button>
    </div>
  );
}