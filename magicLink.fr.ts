// src/dictionaries/fr/magicLink.fr.ts
export const magicLink = {
  loading: "Connexion en cours…",
  loadingSubtitle: "Veuillez patienter quelques instants.",
  successTitle: "Bienvenue ✓",
  successSubtitle: "Vous êtes connecté. Redirection…",
  errorTitle: "Lien invalide",
  errorSubtitle:
    "Les liens magiques expirent après 15 minutes. Demandez-en un nouveau depuis la page de connexion.",
  errorMissingToken: "Aucun jeton magique fourni.",
  errorGeneric: "Ce lien magique n'est plus valide.",
  backToLogin: "Retour à la connexion",
} as const;
