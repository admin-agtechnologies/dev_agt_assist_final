"use client";
// src/components/commandes/CommandeStatusFlow.tsx

import type { CommandeStatut } from "@/types/api/commande.types";
import type { Locale } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";

// Ordre linéaire des statuts (hors annulée)
const FLOW: CommandeStatut[] = [
  "en_attente",
  "confirmee",
  "en_preparation",
  "prete",
  "livree",
];

const LABELS: Record<CommandeStatut, { fr: string; en: string }> = {
  en_attente:     { fr: "En attente",    en: "Pending" },
  confirmee:      { fr: "Confirmée",     en: "Confirmed" },
  en_preparation: { fr: "En préparation",en: "Preparing" },
  prete:          { fr: "Prête",         en: "Ready" },
  livree:         { fr: "Livrée",        en: "Delivered" },
  annulee:        { fr: "Annulée",       en: "Cancelled" },
};

interface Props {
  statut: CommandeStatut;
  locale: Locale;
}

export function CommandeStatusFlow({ statut, locale }: Props) {
  if (statut === "annulee") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        {LABELS.annulee[locale]}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(statut);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FLOW.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={[
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                isDone
                  ? "bg-green-100 text-green-700"
                  : isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--text-muted)]",
              ].join(" ")}
            >
              {isDone && <Check size={11} strokeWidth={2.5} />}
              {LABELS[step][locale]}
            </div>

            {idx < FLOW.length - 1 && (
              <span
                className={`text-xs ${
                  isDone ? "text-green-400" : "text-[var(--border)]"
                }`}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}