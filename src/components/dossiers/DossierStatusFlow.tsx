"use client";
// src/components/dossiers/DossierStatusFlow.tsx

import type { DossierStatut } from "@/types/api/crm.types";
import type { Locale } from "@/contexts/LanguageContext";
import { Check, AlertCircle, XCircle } from "lucide-react";

const TERMINAL: DossierStatut[] = ["rejete", "cloture"];

const FLOW: DossierStatut[] = [
  "ouvert",
  "en_traitement",
  "en_attente_documents",
];

const LABELS: Record<DossierStatut, { fr: string; en: string }> = {
  ouvert:               { fr: "Ouvert",              en: "Open" },
  en_traitement:        { fr: "En traitement",       en: "Processing" },
  en_attente_documents: { fr: "Documents manquants", en: "Missing docs" },
  cloture:              { fr: "Clôturé",             en: "Closed" },
  rejete:               { fr: "Rejeté",              en: "Rejected" },
};

const TERMINAL_STYLES: Record<string, string> = {
  rejete:  "bg-red-100 text-red-700",
  cloture: "bg-gray-100 text-gray-500",
};

interface Props {
  statut: DossierStatut;
  locale: Locale;
}

export function DossierStatusFlow({ statut, locale }: Props) {
  if (TERMINAL.includes(statut)) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${TERMINAL_STYLES[statut]}`}>
        {statut === "rejete" ? <XCircle size={13} /> : <AlertCircle size={13} />}
        {LABELS[statut][locale]}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(statut);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FLOW.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isWarning = isActive && step === "en_attente_documents";

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={[
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                isDone
                  ? "bg-green-100 text-green-700"
                  : isWarning
                  ? "bg-orange-100 text-orange-700"
                  : isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--text-muted)]",
              ].join(" ")}
            >
              {isDone && <Check size={11} strokeWidth={2.5} />}
              {isWarning && <AlertCircle size={11} />}
              {LABELS[step][locale]}
            </div>
            {idx < FLOW.length - 1 && (
              <span className={`text-xs ${isDone ? "text-green-400" : "text-[var(--border)]"}`}>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}