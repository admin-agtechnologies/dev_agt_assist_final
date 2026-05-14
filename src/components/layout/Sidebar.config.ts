// src/components/layout/Sidebar.config.ts
// DIFF — 1 ligne à changer :
//   knowledge: "/faq"  →  knowledge: "/knowledge"
//
// Fichier complet ci-dessous (remplacer l'existant) :

export const FEATURE_TO_ROUTE: Record<string, string> = {
  // Réservations
  reservation_table:   "/modules/reservations",
  reservation_chambre: "/modules/reservations",
  reservation_billet:  "/modules/reservations",
  prise_rdv:           "/modules/reservations",

  // Catalogues
  menu_digital:        "/modules/catalogue",
  catalogue_produits:  "/modules/catalogue",
  catalogue_credits:   "/modules/catalogue",
  catalogue_services:  "/modules/catalogue",
  catalogue_filieres:  "/modules/catalogue",
  catalogue_trajets:   "/modules/catalogue",
  catalogue_demarches: "/modules/catalogue",

  // Commandes
  commande_paiement:   "/modules/commandes",
  suivi_commande:      "/modules/commandes",
  conciergerie:        "/modules/commandes",

  // Inscriptions
  inscription_etudiant: "/modules/inscriptions",
  inscription_membre:   "/modules/inscriptions",

  // Dossiers
  suivi_dossier: "/modules/dossiers",

  // Bots
  chatbot_whatsapp: "/bots",
  agent_vocal:      "/bots",
};

export const DASHBOARD_ROUTES = {
  tutorial:      "/tutorial",
  help:          "/help",
  feedback:      "/feedback",
  report:        "/bug",
  home:          "/dashboard",
  conversations: "/conversations",
  contacts:      "/contacts",
  bots:          "/bots",
  knowledge:     "/knowledge",   // ← MODIFIÉ (était /faq)
  billing:       "/billing",
  profile:       "/profile",
  modules:       "/modules",
  welcome:       "/welcome",
} as const;