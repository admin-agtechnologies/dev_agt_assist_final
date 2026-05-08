// src/dictionaries/fr/conversations.fr.ts
export const conversations = {
  title: "Conversations",
  subtitle: "Toutes les conversations de vos clients.",
  noData: "Aucune conversation.",
  errorLoad: "Erreur lors du chargement.",
  filters: {
    allStatuses: "Tous les statuts",
    allCanaux: "Tous les canaux",
  },
  statuses: {
    active: "En cours",
    terminee: "Terminée",
    transferee: "Transférée",
  },
  table: {
    client: "Client",
    bot: "Bot",
    canal: "Canal",
    contact: "Contact",
    statut: "Statut",
    messages: "Messages",
    date: "Date",
  },
  detail: {
    title: "Conversation",
    rapport: "Rapport",
    messages: "Messages",
    actions: "Actions déclenchées",
    noMessages: "Aucun message.",
    noRapport: "Pas de rapport disponible.",
    humanHandoff: "Transfert vers un humain effectué",
  },
} as const;