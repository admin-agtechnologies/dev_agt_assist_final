"use client";
// src/components/inscriptions/InscriptionStatusFlow.tsx

import type { InscriptionStatut } from "@/types/api/crm.types";
import type { Locale } from "@/contexts/LanguageContext";
import { Check, XCircle, AlertCircle } from "lucide-react";

const FLOW: InscriptionStatut[] = ["en_attente", "documents_manquants", "en_cours", "acceptee"];

const LABELS: Record<InscriptionStatut, { fr: string; en: string }> = {
  en_attente:          { fr: "En attente",          en: "Pending" },
  documents_manquants: { fr: "Documents manquants", en: "Missing docs" },
  en_cours:            { fr: "En cours",            en: "In progress" },
  acceptee:            { fr: "Acceptée",            en: "Accepted" },
  refusee:             { fr: "Refusée",             en: "Refused" },
};

interface Props {
  statut: InscriptionStatut;
  locale: Locale;
}

export function InscriptionStatusFlow({ statut, locale }: Props) {
  if (statut === "refusee") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
        <XCircle size={13} />
        {LABELS.refusee[locale]}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(statut);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FLOW.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isWarning = isActive && step === "documents_manquants";

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