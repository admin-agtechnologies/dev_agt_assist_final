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
      notFound: "Admission not found.",
      notes: "Notes",
      docs: "Documents",
      provided: "Provided",
      missing: "Missing",
      advance: "Move to",
      statuses: {
        en_attente:          "Pending",
        documents_manquants: "Missing documents",
        en_cours:            "In progress",
        acceptee:            "Accepted",
        refusee:             "Refused",
      },
    },
  documents: {
    cni: "Carte nationale d'identité",
    diplome: "Diplôme",
    photo: "Photo d'identité",
    releve: "Relevé de notes",
    certificat: "Certificat médical",
  },
} as const;
