// src/dictionaries/en/inscriptions.en.ts
export const inscriptions = {
  title: "Admissions",
  subtitle: "Management of student registrations and admissions.",
  newBtn: "New admission",
  errorLoad: "Error loading.",
  noData: "No admissions.",
  statuses: {
    en_attente: "Pending",
    en_cours: "In progress",
    admis: "Admitted",
    refuse: "Rejected",
    inscrit: "Enrolled",
  },
  table: {
    etudiant: "Student",
    formation: "Programme",
    statut: "Status",
    date: "Date",
  },
  detail: {
    notFound: "Admission not found.",
    docs: "Documents",
    provided: "Provided",
    missing: "Missing",
    advance: "Move to",
    statuses: {
      soumise: "Submitted",
      en_etude: "Under review",
      acceptee: "Accepted",
      refusee: "Refused",
    },
  },
  documents: {
    cni: "National identity card",
    diplome: "Diploma",
    photo: "Identity photo",
    releve: "Transcript",
    certificat: "Medical certificate",
  },
} as const;