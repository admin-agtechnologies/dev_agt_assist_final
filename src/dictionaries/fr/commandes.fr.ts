// src/dictionaries/fr/commandes.fr.ts
export const commandes = {
  title: "Commandes",
  subtitle: "Toutes les commandes reçues.",
  newBtn: "Nouvelle commande",
  errorLoad: "Erreur lors du chargement.",
  noData: "Aucune commande.",
  createSuccess: "Commande créée !",
  deleteSuccess: "Commande supprimée.",
  deleteError: "Erreur suppression.",
  confirmDelete: "Supprimer cette commande ?",
  statuses: {
    en_attente: "En attente",
    en_cours: "En cours",
    livre: "Livré",
    annule: "Annulé",
    rembourse: "Remboursé",
  },
  table: {
    client: "Client",
    montant: "Montant",
    statut: "Statut",
    canal: "Canal",
    date: "Date",
  },
  detail: {
    title: "Détail commande",
    items: "Articles",
    noItems: "Aucun article.",
    total: "Total",
    notes: "Notes",
  },
} as const;