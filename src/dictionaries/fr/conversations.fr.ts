// src/dictionaries/fr/conversations.fr.ts
export const conversations = {
  title: "Conversations",
  subtitle: "Toutes les conversations de vos bots.",
  noData: "Aucune conversation.",
  errorLoad: "Erreur lors du chargement.",
  filters: {
    allStatuses: "Tous les statuts",
    allBots: "Tous les bots",
  },
  statuses: {
    en_cours: "En cours",
    terminee: "Terminée",
    abandonnee: "Abandonnée",
  },
  table: {
    client: "Client",
    bot: "Bot",
    canal: "Canal",
    statut: "Statut",
    messages: "Messages",
    date: "Date",
  },
  detail: {
    title: "Conversation",
    rapport: "Rapport",
    messages: "Messages",
    noMessages: "Aucun message.",
    noRapport: "Pas de rapport disponible.",
    humanHandoff: "Transfert humain effectué",
  },
} as const;