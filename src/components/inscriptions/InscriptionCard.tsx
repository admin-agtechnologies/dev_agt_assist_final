// src/components/inscriptions/InscriptionCard.tsx
"use client";
import { GraduationCap, Phone } from "lucide-react";
import type { Inscription, InscriptionStatut } from "@/types/api/crm.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUT_STYLES: Record<InscriptionStatut, string> = {
  en_attente:           "bg-yellow-100 text-yellow-800",
  documents_manquants:  "bg-orange-100 text-orange-800",
  en_cours:             "bg-blue-100 text-blue-800",
  acceptee:             "bg-green-100 text-green-800",
  refusee:              "bg-red-100 text-red-800",
};

const STATUT_LABELS: Record<InscriptionStatut, { fr: string; en: string }> = {
  en_attente:           { fr: "En attente",          en: "Pending" },
  documents_manquants:  { fr: "Docs manquants",       en: "Missing docs" },
  en_cours:             { fr: "En cours",             en: "In progress" },
  acceptee:             { fr: "Acceptée",             en: "Accepted" },
  refusee:              { fr: "Refusée",              en: "Refused" },
};

interface Props {
  inscription: Inscription;
  locale: Locale;
  onClick?: () => void;
}

export function InscriptionCard({ inscription, locale, onClick }: Props) {
  const date = new Date(inscription.created_at).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <GraduationCap size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {inscription.contact_nom}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[inscription.statut]}`}>
            {STATUT_LABELS[inscription.statut][locale]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {inscription.contact_phone}
          </span>
          <span>{date}</span>
        </div>
      </div>
    </button>
  );
}