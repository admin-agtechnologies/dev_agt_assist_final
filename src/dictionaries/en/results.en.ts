// src/dictionaries/en/results.en.ts
export const results = {
  // ── Page ──────────────────────────────────────────────────────────────────
  pageTitle:    "Bot results",
  pageSubtitle: "Everything your bot has created for you",

  // ── ResultListTab ──────────────────────────────────────────────────────────
  resultCount_one:   "{{count}} result",
  resultCount_other: "{{count}} results",
  loadMore:          "Load more ({{count}} remaining)",
  loading:           "Loading…",

  // ── ResultsEmptyState ──────────────────────────────────────────────────────
  emptyDefault:         "No results yet",
  emptyDefaultHint:     "Data created by the bot will appear here.",
  emptyFaq:             "No FAQ consultations",
  emptyFaqHint:         "Questions asked to the bot will appear here.",
  emptyReservation:     "No reservations",
  emptyReservationHint: "Reservations made by the bot will appear here.",
  emptyCommande:        "No orders",
  emptyCommandeHint:    "Orders placed via the bot will appear here.",
  emptyConcierge:       "No concierge requests",
  emptyConciergeHint:   "Service requests will appear here.",
  emptyInscription:     "No admissions",
  emptyInscriptionHint: "Admissions submitted via the bot will appear here.",
  emptyDossier:         "No files",
  emptyDossierHint:     "Files opened via the bot will appear here.",
  emptyContact:         "No contacts",
  emptyContactHint:     "Contacts enriched by the bot will appear here.",
  emptyProspect:        "No leads",
  emptyProspectHint:    "Leads captured by the bot will appear here.",
  emptyTransfert:       "No handoffs",
  emptyTransfertHint:   "Transfers to a human agent will appear here.",
  emptyEmail:           "No emails sent",
  emptyEmailHint:       "Emails sent by the bot will appear here.",

  // ── Champs communs ─────────────────────────────────────────────────────────
  paid:       "Paid",
  unpaid:     "Unpaid",
  score:      "Score",
  assignedTo: "Assigned to",
  room:       "Room",

  // ── Statuts contacts ───────────────────────────────────────────────────────
  contactStatuses: {
    prospect: "Prospect",
    contact:  "Contact",
    client:   "Client",
  },

  // ── Statuts transferts humains ─────────────────────────────────────────────
  transfertStatuses: {
    en_attente:     "Pending",
    pris_en_charge: "In progress",
    resolu:         "Resolved",
  },

  // ── Statuts conciergerie ───────────────────────────────────────────────────
  conciergStatuses: {
    recue:           "Received",
    prise_en_charge: "In progress",
    en_cours:        "Ongoing",
    effectuee:       "Completed",
    annulee:         "Cancelled",
  },

  // ── Statuts emails ─────────────────────────────────────────────────────────
  emailStatuses: {
    envoye:     "Sent",
    echec:      "Failed",
    en_attente: "Pending",
  },

  // ── Sources emails ─────────────────────────────────────────────────────────
  emailSources: {
    rappel:      "Reminder",
    dossier:     "File",
    commande:    "Order",
    reservation: "Reservation",
    inscription: "Admission",
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────
  faqAnswered:   "Answer found",
  faqUnanswered: "Unanswered",
} as const;