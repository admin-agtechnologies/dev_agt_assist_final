// src/components/dossiers/DossierCard.tsx
"use client";
import { FileText, Phone } from "lucide-react";
import type { Dossier, DossierStatut } from "@/types/api/crm.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUT_STYLES: Record<DossierStatut, string> = {
  ouvert:               "bg-blue-100 text-blue-800",
  en_traitement:        "bg-purple-100 text-purple-800",
  en_attente_documents: "bg-yellow-100 text-yellow-800",
  cloture:              "bg-gray-100 text-gray-500",
  rejete:               "bg-red-100 text-red-800",
};

const STATUT_LABELS: Record<DossierStatut, { fr: string; en: string }> = {
  ouvert:               { fr: "Ouvert",          en: "Open" },
  en_traitement:        { fr: "En traitement",   en: "In progress" },
  en_attente_documents: { fr: "Docs manquants",  en: "Missing docs" },
  cloture:              { fr: "Clôturé",         en: "Closed" },
  rejete:               { fr: "Rejeté",          en: "Rejected" },
};

interface Props {
  dossier: Dossier;
  locale: Locale;
  onClick?: () => void;
}

export function DossierCard({ dossier, locale, onClick }: Props) {
  const date = new Date(dossier.created_at).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {dossier.contact_nom}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[dossier.statut]}`}>
            {STATUT_LABELS[dossier.statut][locale]}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] truncate mb-1">
          {dossier.type_procedure}
        </p>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {dossier.contact_phone}
          </span>
          <span>{date}</span>
        </div>
      </div>
    </button>
  );
}