// src/dictionaries/fr/inscriptions.fr.ts
export const inscriptions = {
  title: "Inscriptions & admissions",
  subtitle: "Gestion des inscriptions des élèves et étudiants.",
  newBtn: "Nouvelle inscription",
  errorLoad: "Erreur lors du chargement.",
  noData: "Aucune inscription.",
  statuses: {
    en_attente: "En attente",
    en_cours: "En cours",
    admis: "Admis",
    refuse: "Refusé",
    inscrit: "Inscrit",
  },
  table: {
    etudiant: "Étudiant",
    formation: "Formation",
    statut: "Statut",
    date: "Date",
  },
  detail: {
    title: "Dossier d'inscription",
    documents: "Documents requis",
    noDocuments: "Aucun document.",
    notes: "Notes",
  },
  documents: {
    cni: "Carte nationale d'identité",
    diplome: "Diplôme",
    photo: "Photo d'identité",
    releve: "Relevé de notes",
    certificat: "Certificat médical",
  },
} as const;