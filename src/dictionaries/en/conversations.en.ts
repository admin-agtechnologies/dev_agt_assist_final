// src/dictionaries/en/conversations.en.ts
export const conversations = {
  title: "Conversations",
  subtitle: "All your client conversations.",
  noData: "No conversations.",
  errorLoad: "Error loading conversations.",
  filters: {
    allStatuses: "All statuses",
    allCanaux: "All channels",
  },
  statuses: {
    active: "Active",
    terminee: "Completed",
    transferee: "Transferred",
  },
  table: {
    client: "Client",
    bot: "Bot",
    canal: "Channel",
    contact: "Contact",
    statut: "Status",
    messages: "Messages",
    date: "Date",
  },
  detail: {
    title: "Conversation",
    rapport: "Report",
    messages: "Messages",
    actions: "Triggered actions",
    noMessages: "No messages.",
    noRapport: "No report available.",
    humanHandoff: "Transferred to a human agent",
  },
} as const;