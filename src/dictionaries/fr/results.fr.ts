// src/dictionaries/fr/results.fr.ts
export const results = {
  // ── Page ──────────────────────────────────────────────────────────────────
  pageTitle:    "Résultats du bot",
  pageSubtitle: "Tout ce que votre bot a créé pour vous",

  // ── ResultListTab ──────────────────────────────────────────────────────────
  resultCount_one:   "{{count}} résultat",
  resultCount_other: "{{count}} résultats",
  loadMore:          "Voir plus ({{count}} restants)",
  loading:           "Chargement…",

  // ── ResultsEmptyState ──────────────────────────────────────────────────────
  emptyDefault:     "Aucun résultat pour l'instant",
  emptyDefaultHint: "Les données créées par le bot apparaîtront ici.",
  emptyFaq:         "Aucune consultation FAQ",
  emptyFaqHint:     "Les questions posées au bot apparaîtront ici.",
  emptyReservation: "Aucune réservation",
  emptyReservationHint: "Les réservations prises par le bot apparaîtront ici.",
  emptyCommande:    "Aucune commande",
  emptyCommandeHint:"Les commandes passées via le bot apparaîtront ici.",
  emptyConcierge:   "Aucune demande conciergerie",
  emptyConciergeHint:"Les demandes de service apparaîtront ici.",
  emptyInscription: "Aucune inscription",
  emptyInscriptionHint: "Les inscriptions soumises via le bot apparaîtront ici.",
  emptyDossier:     "Aucun dossier",
  emptyDossierHint: "Les dossiers ouverts via le bot apparaîtront ici.",
  emptyContact:     "Aucun contact",
  emptyContactHint: "Les contacts enrichis par le bot apparaîtront ici.",
  emptyProspect:    "Aucun prospect",
  emptyProspectHint:"Les prospects capturés par le bot apparaîtront ici.",
  emptyTransfert:   "Aucun transfert",
  emptyTransfertHint:"Les transferts vers un agent humain apparaîtront ici.",
  emptyEmail:       "Aucun email envoyé",
  emptyEmailHint:   "Les emails envoyés par le bot apparaîtront ici.",

  // ── Champs communs ─────────────────────────────────────────────────────────
  paid:    "Payé",
  unpaid:  "Non payé",
  score:   "Score",
  assignedTo: "Assigné à",
  room:    "Chambre",

  // ── Statuts contacts ───────────────────────────────────────────────────────
  contactStatuses: {
    prospect: "Prospect",
    contact:  "Contact",
    client:   "Client",
  },

  // ── Statuts transferts humains ─────────────────────────────────────────────
  transfertStatuses: {
    en_attente:     "En attente",
    pris_en_charge: "Pris en charge",
    resolu:         "Résolu",
  },

  // ── Statuts conciergerie ───────────────────────────────────────────────────
  conciergStatuses: {
    recue:           "Reçue",
    prise_en_charge: "Prise en charge",
    en_cours:        "En cours",
    effectuee:       "Effectuée",
    annulee:         "Annulée",
  },

  // ── Statuts emails ─────────────────────────────────────────────────────────
  emailStatuses: {
    envoye:     "Envoyé",
    echec:      "Échec",
    en_attente: "En attente",
  },

  // ── Sources emails ─────────────────────────────────────────────────────────
  emailSources: {
    rappel:      "Rappel",
    dossier:     "Dossier",
    commande:    "Commande",
    reservation: "Réservation",
    inscription: "Inscription",
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────
  faqAnswered:    "Réponse trouvée",
  faqUnanswered:  "Sans réponse",
} as const;