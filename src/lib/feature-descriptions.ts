// ============================================================
// FICHIER : src/lib/feature-descriptions.ts
// Descriptions courtes FR/EN pour chaque feature (keyed par slug backend)
// ============================================================

export interface FeatureDesc {
  fr: string;
  en: string;
}

export const FEATURE_DESCRIPTIONS: Record<string, FeatureDesc> = {
  chatbot_whatsapp: {
    fr: "Répondez à vos clients 24h/24 sur WhatsApp, sans intervention humaine.",
    en: "Reply to your customers 24/7 on WhatsApp, without human intervention.",
  },
  agent_vocal: {
    fr: "Un agent IA décroche à votre place et guide l'appelant.",
    en: "An AI agent answers calls on your behalf and guides the caller.",
  },
  faq: {
    fr: "Construisez une base de questions/réponses que le bot utilise automatiquement.",
    en: "Build a Q&A knowledge base the bot uses automatically.",
  },
  prise_rdv: {
    fr: "Laissez vos clients prendre rendez-vous directement via WhatsApp.",
    en: "Let your customers book appointments directly via WhatsApp.",
  },
  emails_rappel: {
    fr: "Envoyez des rappels email automatiques avant chaque rendez-vous.",
    en: "Send automatic email reminders before each appointment.",
  },
  dashboard: {
    fr: "Suivez vos conversations, réservations et statistiques en temps réel.",
    en: "Track your conversations, bookings and stats in real time.",
  },
  reservation_table: {
    fr: "Gérez les réservations de tables en temps réel depuis WhatsApp.",
    en: "Manage table reservations in real time from WhatsApp.",
  },
  menu_digital: {
    fr: "Partagez votre menu complet avec prix et descriptions via le bot.",
    en: "Share your full menu with prices and descriptions via the bot.",
  },
  commande_paiement: {
    fr: "Acceptez les commandes et paiements directement sur WhatsApp.",
    en: "Accept orders and payments directly on WhatsApp.",
  },
  reservation_chambre: {
    fr: "Permettez à vos clients de réserver une chambre sans appel ni email.",
    en: "Let your guests book a room without calls or emails.",
  },
  conciergerie: {
    fr: "Proposez vos services hôteliers (spa, restauration, excursions) via le bot.",
    en: "Offer hotel services (spa, dining, excursions) via the bot.",
  },
  orientation_patient: {
    fr: "Guidez les patients vers le bon service ou le bon praticien.",
    en: "Guide patients to the right department or practitioner.",
  },
  catalogue_produits_financiers: {
    fr: "Présentez vos offres de prêts, épargne et microfinance automatiquement.",
    en: "Present your loan, savings and microfinance offers automatically.",
  },
  multi_agences: {
    fr: "Gérez plusieurs agences ou points de vente depuis une seule interface.",
    en: "Manage multiple branches or points of sale from one interface.",
  },
  inscription_admission: {
    fr: "Traitez les dossiers d'inscription et de candidature en ligne.",
    en: "Process enrollment and application files online.",
  },
  communication_etablissement: {
    fr: "Envoyez des annonces et rappels aux élèves, parents et personnel.",
    en: "Send announcements and reminders to students, parents and staff.",
  },
  catalogue_produits: {
    fr: "Mettez en avant votre catalogue produits avec photos, prix et stocks.",
    en: "Showcase your product catalog with photos, prices and stock.",
  },
  suivi_commande: {
    fr: "Permettez à vos clients de suivre l'état de leur commande en temps réel.",
    en: "Let your customers track their order status in real time.",
  },
  catalogue_trajets: {
    fr: "Affichez vos lignes, horaires et tarifs de transport.",
    en: "Display your routes, schedules and transport fares.",
  },
  reservation_billet: {
    fr: "Vendez et confirmez les billets directement via WhatsApp.",
    en: "Sell and confirm tickets directly via WhatsApp.",
  },
  catalogue_services: {
    fr: "Listez vos prestations avec tarifs et disponibilités.",
    en: "List your services with prices and availability.",
  },
  conversion_prospects: {
    fr: "Qualifiez et convertissez vos prospects en clients automatiquement.",
    en: "Qualify and convert prospects into customers automatically.",
  },
  orientation_citoyens: {
    fr: "Orientez les citoyens vers les bons services et procédures administratives.",
    en: "Guide citizens to the right services and administrative procedures.",
  },
};