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
    notFound: "File not found.",
    ref: "Reference",
    createdAt: "Created",
    updatedAt: "Updated",
    adminNotes: "Administrative notes",
    advance: "Move to",
    statuses: {
      ouvert: "Open",
      en_cours: "In progress",
      en_attente: "On hold",
      clos: "Closed",
    },
  },
} as const;