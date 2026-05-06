// src/lib/sector-labels.ts

export interface FeatureLabel {
  nav: string;
  pageTitle: string;
  empty: string;
  cta: string;
}

type LangLabels = { fr: FeatureLabel; en: FeatureLabel };

export const FEATURE_LABELS: Record<string, LangLabels> = {
  reservation_table: {
    fr: { nav: "Réservations", pageTitle: "Réserver une table", empty: "Aucune réservation", cta: "Nouvelle réservation" },
    en: { nav: "Reservations", pageTitle: "Book a table", empty: "No reservations", cta: "New reservation" },
  },
  reservation_chambre: {
    fr: { nav: "Chambres", pageTitle: "Réserver une chambre", empty: "Aucune réservation", cta: "Nouvelle réservation" },
    en: { nav: "Rooms", pageTitle: "Book a room", empty: "No reservations", cta: "New reservation" },
  },
  prise_rdv: {
    fr: { nav: "Rendez-vous", pageTitle: "Prendre un rendez-vous", empty: "Aucun rendez-vous", cta: "Nouveau RDV" },
    en: { nav: "Appointments", pageTitle: "Book an appointment", empty: "No appointments", cta: "New appointment" },
  },
  reservation_billet: {
    fr: { nav: "Billets", pageTitle: "Réserver un billet", empty: "Aucun billet", cta: "Réserver" },
    en: { nav: "Tickets", pageTitle: "Book a ticket", empty: "No tickets", cta: "Book" },
  },
  menu_digital: {
    fr: { nav: "Menu", pageTitle: "Notre menu", empty: "Menu vide", cta: "Ajouter un plat" },
    en: { nav: "Menu", pageTitle: "Our menu", empty: "Empty menu", cta: "Add item" },
  },
  catalogue_produits: {
    fr: { nav: "Catalogue", pageTitle: "Nos produits", empty: "Aucun produit", cta: "Ajouter un produit" },
    en: { nav: "Catalogue", pageTitle: "Our products", empty: "No products", cta: "Add product" },
  },
  catalogue_services: {
    fr: { nav: "Services", pageTitle: "Catalogue services & tarifs", empty: "Aucun service", cta: "Ajouter un service" },
    en: { nav: "Services", pageTitle: "Services & pricing", empty: "No services", cta: "Add service" },
  },
  catalogue_produits_financiers: {
    fr: { nav: "Produits", pageTitle: "Nos produits financiers", empty: "Aucun produit", cta: "Ajouter" },
    en: { nav: "Products", pageTitle: "Our financial products", empty: "No products", cta: "Add" },
  },
  orientation_patient: {
    fr: { nav: "Spécialités", pageTitle: "Nos spécialités médicales", empty: "Aucune spécialité", cta: "Ajouter" },
    en: { nav: "Specialties", pageTitle: "Our medical specialties", empty: "No specialties", cta: "Add" },
  },
  catalogue_trajets: {
    fr: { nav: "Trajets", pageTitle: "Trajets & tarifs", empty: "Aucun trajet", cta: "Ajouter un trajet" },
    en: { nav: "Routes", pageTitle: "Routes & fares", empty: "No routes", cta: "Add route" },
  },
  commande_paiement: {
    fr: { nav: "Commandes", pageTitle: "Commandes & paiements", empty: "Aucune commande", cta: "Voir les commandes" },
    en: { nav: "Orders", pageTitle: "Orders & payments", empty: "No orders", cta: "View orders" },
  },
  inscription_admission: {
    fr: { nav: "Inscriptions", pageTitle: "Dossiers d'inscription", empty: "Aucune inscription", cta: "Voir les inscriptions" },
    en: { nav: "Applications", pageTitle: "Application files", empty: "No applications", cta: "View applications" },
  },
  orientation_citoyens: {
    fr: { nav: "Dossiers", pageTitle: "Dossiers citoyens", empty: "Aucun dossier", cta: "Voir les dossiers" },
    en: { nav: "Files", pageTitle: "Citizen files", empty: "No files", cta: "View files" },
  },
  multi_agences: {
    fr: { nav: "Agences", pageTitle: "Nos agences", empty: "Aucune agence", cta: "Nouvelle agence" },
    en: { nav: "Branches", pageTitle: "Our branches", empty: "No branches", cta: "New branch" },
  },
  conversion_prospects: {
    fr: { nav: "Prospects", pageTitle: "Prospects & contacts", empty: "Aucun prospect", cta: "Voir les prospects" },
    en: { nav: "Prospects", pageTitle: "Prospects & contacts", empty: "No prospects", cta: "View prospects" },
  },

  conciergerie: {
    fr: { nav: "Conciergerie", pageTitle: "Conciergerie virtuelle", empty: "Aucun service de conciergerie", cta: "Ajouter un service" },
    en: { nav: "Concierge", pageTitle: "Virtual concierge", empty: "No concierge services", cta: "Add service" },
  },
  suivi_commande: {
    fr: { nav: "Suivi commandes", pageTitle: "Suivi des commandes", empty: "Aucune commande à suivre", cta: "Voir les commandes" },
    en: { nav: "Order tracking", pageTitle: "Order tracking", empty: "No orders to track", cta: "View orders" },
  },
  communication_etablissement: {
    fr: { nav: "Communication", pageTitle: "Communication établissement", empty: "Aucune communication", cta: "Nouvelle communication" },
    en: { nav: "Communication", pageTitle: "Establishment communication", empty: "No communications", cta: "New communication" },
  },
};

export function getFeatureLabel(
  slug: string,
  lang: "fr" | "en" = "fr"
): FeatureLabel {
  const entry = FEATURE_LABELS[slug];
  if (!entry) return { nav: slug, pageTitle: slug, empty: "", cta: "" };
  return entry[lang];
}