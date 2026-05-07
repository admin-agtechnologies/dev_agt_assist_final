// src/dictionaries/en/conversations.en.ts
export const conversations = {
  title: "Conversations",
  subtitle: "All conversations from your bots.",
  noData: "No conversations.",
  errorLoad: "Error loading.",
  filters: {
    allStatuses: "All statuses",
    allBots: "All bots",
  },
  statuses: {
    en_cours: "In progress",
    terminee: "Completed",
    abandonnee: "Abandoned",
  },
  table: {
    client: "Client",
    bot: "Bot",
    canal: "Channel",
    statut: "Status",
    messages: "Messages",
    date: "Date",
  },
  detail: {
    title: "Conversation",
    rapport: "Report",
    messages: "Messages",
    noMessages: "No messages.",
    noRapport: "No report available.",
    humanHandoff: "Human handoff performed",
  },
} as const;