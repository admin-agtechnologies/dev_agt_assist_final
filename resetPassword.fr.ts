// src/dictionaries/fr/resetPassword.fr.ts
export const resetPassword = {
  title: "Réinitialiser votre mot de passe",
  subtitle: "Choisissez un nouveau mot de passe pour votre compte.",
  newPassword: "Nouveau mot de passe",
  confirmPassword: "Confirmer le mot de passe",
  passwordPlaceholder: "••••••••",
  submitBtn: "Mettre à jour le mot de passe",
  passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
  passwordsMismatch: "Les mots de passe ne correspondent pas.",
  successTitle: "Mot de passe mis à jour ✓",
  successSubtitle: "Redirection vers votre tableau de bord…",
  errorTitle: "Lien invalide",
  errorMissingToken:
    "Aucun jeton de réinitialisation fourni. Demandez un nouveau lien.",
  errorGeneric:
    "Impossible de réinitialiser votre mot de passe. Le lien a peut-être expiré.",
  backToLogin: "Retour à la connexion",
} as const;
