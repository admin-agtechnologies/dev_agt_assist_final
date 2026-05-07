// src/dictionaries/fr/dossiers.fr.ts
export const dossiers = {
  title: "Dossiers citoyens",
  subtitle: "Gestion des dossiers et démarches administratives.",
  newBtn: "Nouveau dossier",
  errorLoad: "Erreur lors du chargement.",
  noData: "Aucun dossier.",
  statuses: {
    en_attente: "En attente",
    en_cours: "En cours",
    approuve: "Approuvé",
    rejete: "Rejeté",
    clos: "Clos",
  },
  table: {
    citoyen: "Citoyen",
    type: "Type",
    statut: "Statut",
    date: "Date",
  },
  detail: {
    title: "Dossier",
    documents: "Documents",
    noDocuments: "Aucun document.",
    notes: "Notes",
  },
} as const;