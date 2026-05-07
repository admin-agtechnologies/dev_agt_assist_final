// src/dictionaries/fr/services.fr.ts
export const services = {
  title: "Services",
  subtitle: "Les services proposés par votre assistant.",
  newBtn: "Nouveau service",
  errorLoad: "Erreur lors du chargement.",
  createSuccess: "Service créé !",
  deleteSuccess: "Service supprimé.",
  deleteError: "Erreur suppression.",
  confirmDelete: "Supprimer ce service ?",
  noData: "Aucun service configuré.",
  free: "Gratuit",
  table: {
    name: "Nom",
    description: "Description",
    price: "Tarif",
    duration: "Durée",
    status: "Statut",
  },
  modal: {
    createTitle: "Nouveau Service",
    editTitle: "Modifier le Service",
    btnCreate: "Créer",
    btnUpdate: "Mettre à jour",
    fields: {
      name: "Nom",
      description: "Description",
      price: "Prix (XAF)",
      duration: "Durée (min)",
      isActive: "Actif",
    },
  },
} as const;