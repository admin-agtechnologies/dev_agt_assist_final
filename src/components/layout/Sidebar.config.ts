// src/components/layout/Sidebar.config.ts
// Mapping feature slug → route du module sectoriel
// Utilisé par SidebarDynamicNav pour construire la navigation dynamique.
// Règle : plusieurs features peuvent pointer vers la même route (ex: tous les
// catalogues pointent vers /modules/catalogue). On dédoublonne côté composant.

export const FEATURE_TO_ROUTE: Record<string, string> = {
  // ── Catalogue ────────────────────────────────────────────────────────────────
  menu_digital:                  '/modules/catalogue',
  catalogue_produits:            '/modules/catalogue',
  catalogue_services:            '/modules/catalogue',
  catalogue_trajets:             '/modules/catalogue',
  catalogue_produits_financiers: '/modules/catalogue',

  // ── Réservations ─────────────────────────────────────────────────────────────
  reservation_table:             '/modules/reservations',
  reservation_chambre:           '/modules/reservations',
  reservation_billet:            '/modules/reservations',
  prise_rdv:                     '/modules/reservations',

  // ── Commandes ────────────────────────────────────────────────────────────────
  commande_paiement:             '/modules/commandes',
  conciergerie:                  '/modules/commandes',
  suivi_commande:                '/modules/commandes',

  // ── Multi-agences ────────────────────────────────────────────────────────────
  multi_agences:                 '/modules/agences',

  // ── Éducation ────────────────────────────────────────────────────────────────
  inscription_admission:         '/modules/inscriptions',
  communication_etablissement:   '/modules/inscriptions',

  // ── Secteur public ───────────────────────────────────────────────────────────
  orientation_citoyens:          '/modules/dossiers',

  // ── CRM & Prospects ──────────────────────────────────────────────────────────
  conversion_prospects:          '/contacts',

  // ── Santé ────────────────────────────────────────────────────────────────────
  orientation_patient:           '/contacts',
};

// Routes statiques du dashboard — toujours visibles, indépendantes des features
export const DASHBOARD_ROUTES = {
  home:          '/dashboard',
  conversations: '/conversations',
  contacts:      '/contacts',
  bots:          '/bots',
  knowledge:     '/faq',
  billing:       '/billing',
  settings:      '/settings',
} as const;