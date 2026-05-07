// src/dictionaries/en/commandes.en.ts
export const commandes = {
  title: "Orders",
  subtitle: "All orders received.",
  newBtn: "New order",
  errorLoad: "Error loading.",
  noData: "No orders.",
  createSuccess: "Order created!",
  deleteSuccess: "Order deleted.",
  deleteError: "Error deleting.",
  confirmDelete: "Delete this order?",
  statuses: {
    en_attente: "Pending",
    en_cours: "In progress",
    livre: "Delivered",
    annule: "Cancelled",
    rembourse: "Refunded",
  },
  table: {
    client: "Client",
    montant: "Amount",
    statut: "Status",
    canal: "Channel",
    date: "Date",
  },
  detail: {
    title: "Order detail",
    items: "Items",
    noItems: "No items.",
    total: "Total",
    notes: "Notes",
  },
} as const;