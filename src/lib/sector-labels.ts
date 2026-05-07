// src/lib/sector-labels.ts
// Labels métier par feature slug — FR/EN

export interface FeatureLabel {
  nav: string;
  pageTitle: string;
  empty: string;
  cta: string;
}

export const FEATURE_LABELS: Record<string, { fr: FeatureLabel; en: FeatureLabel }> = {
  reservation_table: {
    fr: { nav: 'Réservations', pageTitle: 'Réserver une table', empty: 'Aucune réservation de table', cta: 'Nouvelle réservation' },
    en: { nav: 'Reservations', pageTitle: 'Book a table', empty: 'No table reservations', cta: 'New reservation' },
  },
  reservation_chambre: {
    fr: { nav: 'Réservations', pageTitle: 'Réserver une chambre', empty: 'Aucune réservation de chambre', cta: 'Nouvelle réservation' },
    en: { nav: 'Reservations', pageTitle: 'Book a room', empty: 'No room bookings', cta: 'New booking' },
  },
  reservation_billet: {
    fr: { nav: 'Réservations', pageTitle: 'Réserver un billet', empty: 'Aucune réservation', cta: 'Nouveau billet' },
    en: { nav: 'Reservations', pageTitle: 'Book a ticket', empty: 'No bookings', cta: 'New ticket' },
  },
  prise_rdv: {
    fr: { nav: 'Rendez-vous', pageTitle: 'Prendre un rendez-vous', empty: 'Aucun rendez-vous', cta: 'Nouveau RDV' },
    en: { nav: 'Appointments', pageTitle: 'Book an appointment', empty: 'No appointments', cta: 'New appointment' },
  },
  menu_digital: {
    fr: { nav: 'Menu', pageTitle: 'Notre menu', empty: 'Menu non configuré', cta: 'Ajouter un plat' },
    en: { nav: 'Menu', pageTitle: 'Our menu', empty: 'Menu not configured', cta: 'Add a dish' },
  },
  catalogue_produits: {
    fr: { nav: 'Catalogue', pageTitle: 'Catalogue produits', empty: 'Aucun produit', cta: 'Ajouter un produit' },
    en: { nav: 'Catalogue', pageTitle: 'Product catalogue', empty: 'No products', cta: 'Add a product' },
  },
  catalogue_services: {
    fr: { nav: 'Services', pageTitle: 'Catalogue services', empty: 'Aucun service', cta: 'Ajouter un service' },
    en: { nav: 'Services', pageTitle: 'Service catalogue', empty: 'No services', cta: 'Add a service' },
  },
  catalogue_trajets: {
    fr: { nav: 'Trajets', pageTitle: 'Catalogue trajets', empty: 'Aucun trajet', cta: 'Ajouter un trajet' },
    en: { nav: 'Routes', pageTitle: 'Routes catalogue', empty: 'No routes', cta: 'Add a route' },
  },
  catalogue_produits_financiers: {
    fr: { nav: 'Produits', pageTitle: 'Produits financiers', empty: 'Aucun produit', cta: 'Ajouter un produit' },
    en: { nav: 'Products', pageTitle: 'Financial products', empty: 'No products', cta: 'Add a product' },
  },
  commande_paiement: {
    fr: { nav: 'Commandes', pageTitle: 'Commandes & paiements', empty: 'Aucune commande', cta: 'Nouvelle commande' },
    en: { nav: 'Orders', pageTitle: 'Orders & payments', empty: 'No orders', cta: 'New order' },
  },
  conciergerie: {
    fr: { nav: 'Conciergerie', pageTitle: 'Conciergerie virtuelle', empty: 'Aucune demande', cta: 'Nouvelle demande' },
    en: { nav: 'Concierge', pageTitle: 'Virtual concierge', empty: 'No requests', cta: 'New request' },
  },
  suivi_commande: {
    fr: { nav: 'Suivi', pageTitle: 'Suivi des commandes', empty: 'Aucune commande à suivre', cta: 'Voir les commandes' },
    en: { nav: 'Tracking', pageTitle: 'Order tracking', empty: 'No orders to track', cta: 'View orders' },
  },
  multi_agences: {
    fr: { nav: 'Agences', pageTitle: 'Gestion des agences', empty: 'Aucune agence', cta: 'Ajouter une agence' },
    en: { nav: 'Branches', pageTitle: 'Branch management', empty: 'No branches', cta: 'Add a branch' },
  },
  inscription_admission: {
    fr: { nav: 'Inscriptions', pageTitle: 'Inscriptions & admissions', empty: 'Aucune inscription', cta: 'Nouvelle inscription' },
    en: { nav: 'Admissions', pageTitle: 'Admissions', empty: 'No admissions', cta: 'New admission' },
  },
  orientation_patient: {
    fr: { nav: 'Patients', pageTitle: 'Orientation patients', empty: 'Aucun patient', cta: 'Nouveau patient' },
    en: { nav: 'Patients', pageTitle: 'Patient orientation', empty: 'No patients', cta: 'New patient' },
  },
  orientation_citoyens: {
    fr: { nav: 'Dossiers', pageTitle: 'Dossiers citoyens', empty: 'Aucun dossier', cta: 'Nouveau dossier' },
    en: { nav: 'Files', pageTitle: 'Citizen files', empty: 'No files', cta: 'New file' },
  },
  conversion_prospects: {
    fr: { nav: 'Prospects', pageTitle: 'Conversion prospects', empty: 'Aucun prospect', cta: 'Voir les prospects' },
    en: { nav: 'Prospects', pageTitle: 'Prospect conversion', empty: 'No prospects', cta: 'View prospects' },
  },
  communication_etablissement: {
    fr: { nav: 'Communication', pageTitle: 'Communication établissement', empty: 'Aucune communication', cta: 'Nouvelle communication' },
    en: { nav: 'Communication', pageTitle: 'School communication', empty: 'No communications', cta: 'New communication' },
  },
};

export function getFeatureLabel(
  slug: string,
  lang: 'fr' | 'en' = 'fr'
): FeatureLabel {
  const entry = FEATURE_LABELS[slug];
  if (!entry) {
    return { nav: slug, pageTitle: slug, empty: 'Aucun élément', cta: 'Ajouter' };
  }
  return entry[lang];
}