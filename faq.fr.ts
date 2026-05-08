// src/dictionaries/fr/faq.fr.ts
export const faq = {
  title: "FAQ",
  subtitle: "Les questions fréquentes de vos clients.",
  newBtn: "Nouvelle question",
  errorLoad: "Erreur lors du chargement.",
  createSuccess: "Question créée !",
  deleteSuccess: "Question supprimée.",
  deleteError: "Erreur suppression.",
  confirmDelete: "Supprimer cette question ?",
  noData: "Aucune question configurée.",
  modal: {
    createTitle: "Nouvelle question",
    editTitle: "Modifier la question",
    btnCreate: "Créer",
    btnUpdate: "Mettre à jour",
    fields: {
      questionFr: "Question (FR)",
      questionEn: "Question (EN)",
      answerFr: "Réponse (FR)",
      answerEn: "Réponse (EN)",
      category: "Catégorie",
      isActive: "Active",
    },
  },
} as const;
