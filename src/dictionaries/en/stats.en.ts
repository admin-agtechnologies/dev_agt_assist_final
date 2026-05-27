// src/dictionaries/en/stats.en.ts
// S56 — dictionnaire stats N1 + N2 + N3
// S62 — ajout libellés filtres période étendus + drill-down
export const statsEn = {
  // Page /statistiques
  title:        "Statistics",
  subtitle:     "Detailed analysis of your bots' activity.",
  allBots:      "All bots",
  filterBot:    "Filter by bot",
  noStats:      "No statistics for this period.",
  noStatsHint:  "Data will appear once the bot has processed conversations.",
  refresh:      "Refresh",
  custom:       "Custom",

  // Filtres période (S62)
  periodeJour:    "Today",
  periodeSemaine: "7 days",
  periode30:      "30 days",
  periode3m:      "3 months",
  periode6m:      "6 months",
  periodeAn:      "1 year",
  periodeCustom:  "Custom",

  // Drill-down (S62)
  voirResultats:    "View results",
  dernieresEntrees: "Recent entries",
  aucuneEntree:     "No recent entries.",

  // Périodes legacy (gardées pour compatibilité N2)
  period7:      "7 days",
  period30:     "30 days",
  period90:     "90 days",

  // KPIs
  kpiSessions:          "Sessions",
  kpiAvgMessages:       "Msg / session",
  kpiHandoffs:          "Handoffs",
  kpiResolution:        "Resolution rate",
  kpiFaqTotal:          "Questions",
  kpiTotal:             "Total",
  kpiConfirmed:         "Confirmed",
  kpiCancelled:         "Cancelled",
  kpiPending:           "Pending",
  kpiOrders:            "Orders",
  kpiRevenue:           "Revenue",
  kpiAvgCart:           "Avg cart",
  kpiRdvTotal:          "Appointments",
  kpiRdvHonored:        "Honored",
  kpiRdvCancelled:      "Cancelled",
  kpiPresence:          "Presence rate",
  kpiNewContacts:       "New contacts",
  kpiProspects:         "Prospects",
  kpiClients:           "Clients",
  kpiConversion:        "Conversion rate",
  kpiHandoffsTotal:     "Handoffs",
  kpiHandoffRate:       "Handoff rate",
  kpiEmailsTotal:       "Emails",
  kpiEmailsSent:        "Sent",
  kpiEmailsFailed:      "Failed",
  kpiSendRate:          "Send rate",
  kpiInscTotal:         "Registrations",
  kpiInscAccepted:      "Accepted",
  kpiValidation:        "Validation rate",
  kpiDossiersTotal:     "Files",
  kpiDossiersOpen:      "Open",
  kpiDossiersOngoing:   "Ongoing",
  kpiDossiersClosed:    "Closed",
  kpiConcTotal:         "Requests",
  kpiConcDone:          "Completed",
  kpiConcOngoing:       "Ongoing",
} as const;