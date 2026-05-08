// src/components/commandes/CommandeStatusBadge.tsx
"use client";
import type { CommandeStatut } from "@/types/api/commande.types";

const STATUT_STYLES: Record<CommandeStatut, string> = {
  en_attente:      "bg-yellow-100 text-yellow-800",
  confirmee:       "bg-blue-100 text-blue-800",
  en_preparation:  "bg-purple-100 text-purple-800",
  prete:           "bg-indigo-100 text-indigo-800",
  livree:          "bg-green-100 text-green-800",
  annulee:         "bg-red-100 text-red-800",
};

const STATUT_LABELS: Record<CommandeStatut, { fr: string; en: string }> = {
  en_attente:      { fr: "En attente",     en: "Pending" },
  confirmee:       { fr: "Confirmée",      en: "Confirmed" },
  en_preparation:  { fr: "En préparation", en: "Preparing" },
  prete:           { fr: "Prête",          en: "Ready" },
  livree:          { fr: "Livrée",         en: "Delivered" },
  annulee:         { fr: "Annulée",        en: "Cancelled" },
};

interface Props {
  statut: CommandeStatut;
  locale?: "fr" | "en";
}

export function CommandeStatusBadge({ statut, locale = "fr" }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[statut]}`}>
      {STATUT_LABELS[statut][locale]}
    </span>
  );
}