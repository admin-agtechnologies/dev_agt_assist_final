// src/dictionaries/fr/stats.fr.ts
// S56 — dictionnaire stats N1 + N2 + N3
// S62 — ajout libellés filtres période étendus + drill-down
export const stats = {
  // Page /statistiques
  title:        "Statistiques",
  subtitle:     "Analyse détaillée de l'activité de vos bots.",
  allBots:      "Tous les bots",
  filterBot:    "Filtrer par bot",
  noStats:      "Aucune statistique sur cette période.",
  noStatsHint:  "Les données apparaîtront dès que le bot aura traité des conversations.",
  refresh:      "Actualiser",
  custom:       "Personnalisée",

  // Filtres période (S62)
  periodeJour:    "Aujourd'hui",
  periodeSemaine: "7 jours",
  periode30:      "30 jours",
  periode3m:      "3 mois",
  periode6m:      "6 mois",
  periodeAn:      "1 an",
  periodeCustom:  "Personnalisée",

  // Drill-down (S62)
  voirResultats:    "Voir les résultats",
  dernieresEntrees: "Dernières entrées",
  aucuneEntree:     "Aucune entrée récente.",

  // Périodes legacy (gardées pour compatibilité N2)
  period7:      "7 jours",
  period30:     "30 jours",
  period90:     "90 jours",

  // KPIs
  kpiSessions:          "Sessions",
  kpiAvgMessages:       "Msg / session",
  kpiHandoffs:          "Transferts",
  kpiResolution:        "Taux résolution",
  kpiFaqTotal:          "Questions",
  kpiTotal:             "Total",
  kpiConfirmed:         "Confirmées",
  kpiCancelled:         "Annulées",
  kpiPending:           "En attente",
  kpiOrders:            "Commandes",
  kpiRevenue:           "CA total",
  kpiAvgCart:           "Panier moyen",
  kpiRdvTotal:          "RDV",
  kpiRdvHonored:        "Honorés",
  kpiRdvCancelled:      "Annulés",
  kpiPresence:          "Taux présence",
  kpiNewContacts:       "Nouveaux contacts",
  kpiProspects:         "Prospects",
  kpiClients:           "Clients",
  kpiConversion:        "Taux conversion",
  kpiHandoffsTotal:     "Transferts",
  kpiHandoffRate:       "Taux transfert",
  kpiEmailsTotal:       "Emails",
  kpiEmailsSent:        "Envoyés",
  kpiEmailsFailed:      "Échoués",
  kpiSendRate:          "Taux envoi",
  kpiInscTotal:         "Inscriptions",
  kpiInscAccepted:      "Acceptées",
  kpiValidation:        "Taux validation",
  kpiDossiersTotal:     "Dossiers",
  kpiDossiersOpen:      "Ouverts",
  kpiDossiersOngoing:   "En cours",
  kpiDossiersClosed:    "Clos",
  kpiConcTotal:         "Demandes",
  kpiConcDone:          "Effectuées",
  kpiConcOngoing:       "En cours",
} as const;