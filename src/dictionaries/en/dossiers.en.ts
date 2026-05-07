// src/dictionaries/en/dossiers.en.ts
export const dossiers = {
  title: "Citizen files",
  subtitle: "Management of files and administrative procedures.",
  newBtn: "New file",
  errorLoad: "Error loading.",
  noData: "No files.",
  statuses: {
    en_attente: "Pending",
    en_cours: "In progress",
    approuve: "Approved",
    rejete: "Rejected",
    clos: "Closed",
  },
  table: {
    citoyen: "Citizen",
    type: "Type",
    statut: "Status",
    date: "Date",
  },
  detail: {
    title: "File",
    documents: "Documents",
    noDocuments: "No documents.",
    notes: "Notes",
  },
} as const;