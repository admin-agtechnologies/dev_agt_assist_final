// src/components/commandes/CommandeFilters.tsx
"use client";
import type { CommandeStatut } from "@/types/api/commande.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUTS: { value: CommandeStatut | ""; label: { fr: string; en: string } }[] = [
  { value: "",              label: { fr: "Tous",           en: "All" } },
  { value: "en_attente",    label: { fr: "En attente",     en: "Pending" } },
  { value: "confirmee",     label: { fr: "Confirmées",     en: "Confirmed" } },
  { value: "en_preparation",label: { fr: "En préparation", en: "Preparing" } },
  { value: "prete",         label: { fr: "Prêtes",         en: "Ready" } },
  { value: "livree",        label: { fr: "Livrées",        en: "Delivered" } },
  { value: "annulee",       label: { fr: "Annulées",       en: "Cancelled" } },
];

interface Props {
  statut: CommandeStatut | "";
  onChange: (s: CommandeStatut | "") => void;
  locale: Locale;
}

export function CommandeFilters({ statut, onChange, locale }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {STATUTS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
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
  );
}