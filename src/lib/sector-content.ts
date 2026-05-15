// src/lib/sector-content.ts
// SOURCE DE VÉRITÉ — Contenu marketing par secteur (citations, stats, slogans, badge).
// Trio cohérent avec sector-config.ts (routing) et sector-theme.ts (visuel).

import type { SectorSlug } from "./sector-config";

export interface SectorStat {
  value: string;
  labelFr: string;
  labelEn: string;
}

export interface SectorTestimonial {
  quoteFr: string;
  quoteEn: string;
  author: string;       // Prénom + métier + ville
  initials: string;     // 2 lettres affichées dans l'avatar
}

export interface SectorContent {
  /** Sous-titre principal (panneau gauche AuthShell) */
  taglineFr: string;
  taglineEn: string;
  /** Description courte sous le tagline */
  descriptionFr: string;
  descriptionEn: string;
  /** Témoignage client */
  testimonial: SectorTestimonial;
  /** Trois stats affichées en grille (3 colonnes) */
  stats: [SectorStat, SectorStat, SectorStat];
  /** Badge bonus en bas du panneau */
  badgeFr: string;
  badgeEn: string;
  /** Exemple de nom d'entreprise (placeholder onboarding IdentityStep) */
  businessExampleFr: string;
  businessExampleEn: string;
}

export const SECTOR_CONTENT: Record<SectorSlug, SectorContent> = {
  restaurant: {
    taglineFr: "Votre restaurant ne ferme jamais.",
    taglineEn: "Your restaurant never closes.",
    descriptionFr: "Plus de 200 restaurants au Cameroun gèrent leurs réservations avec AGT.",
    descriptionEn: "Over 200 restaurants in Cameroon manage their bookings with AGT.",
    testimonial: {
      quoteFr: "Depuis AGT, on remplit nos vendredis soirs sans effort. Le bot prend les réservations même en plein service.",
      quoteEn: "Since AGT, we fill our Friday nights effortlessly. The bot takes bookings even during service.",
      author: "Paul Eyenga · Le Bantou Gourmet, Yaoundé",
      initials: "PE",
    },
    stats: [
      { value: "+35%", labelFr: "Réservations", labelEn: "Bookings" },
      { value: "24/7", labelFr: "Disponibilité", labelEn: "Always on" },
      { value: "2min", labelFr: "Pour réserver", labelEn: "To book" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Restaurant La Terrasse",
    businessExampleEn: "e.g. La Terrasse Restaurant",
  },

  hotel: {
    taglineFr: "Vos clients réservent à toute heure.",
    taglineEn: "Your guests book at any hour.",
    descriptionFr: "Hôtels et lodges africains automatisent leurs réservations chambres avec AGT.",
    descriptionEn: "African hotels and lodges automate room bookings with AGT.",
    testimonial: {
      quoteFr: "Les voyageurs nous écrivent à 2h du matin et reçoivent leur confirmation. Notre taux d'occupation a grimpé.",
      quoteEn: "Travellers reach out at 2 AM and get their confirmation. Our occupancy rate jumped.",
      author: "Aminata Sow · Lodge Kribi Beach, Kribi",
      initials: "AS",
    },
    stats: [
      { value: "+22%", labelFr: "Taux occupation", labelEn: "Occupancy rate" },
      { value: "24/7", labelFr: "Réservations", labelEn: "Bookings" },
      { value: "0", labelFr: "Appel manqué", labelEn: "Missed calls" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Lodge Kribi Beach",
    businessExampleEn: "e.g. Kribi Beach Lodge",
  },

  clinical: {
    taglineFr: "Vos patients sont orientés, même la nuit.",
    taglineEn: "Your patients are guided, even at night.",
    descriptionFr: "Cliniques et cabinets fluidifient l'accueil patient avec un agent IA.",
    descriptionEn: "Clinics streamline patient intake with an AI agent.",
    testimonial: {
      quoteFr: "Notre secrétariat ne déborde plus. Les patients prennent leurs RDV en autonomie et reçoivent les rappels.",
      quoteEn: "Our front desk no longer overwhelmed. Patients book on their own and get reminders.",
      author: "Dr. Christelle Mbarga · Clinique de la Cathédrale, Yaoundé",
      initials: "CM",
    },
    stats: [
      { value: "−60%", labelFr: "Appels manqués", labelEn: "Missed calls" },
      { value: "3000+", labelFr: "RDV / mois", labelEn: "Bookings / mo" },
      { value: "97%", labelFr: "Patients orientés", labelEn: "Patients routed" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Clinique de la Cathédrale",
    businessExampleEn: "e.g. Cathedral Clinic",
  },

  banking: {
    taglineFr: "Vos clients sont guidés sans attendre.",
    taglineEn: "Your clients are guided without waiting.",
    descriptionFr: "Banques et microfinances orientent leurs clients avec un assistant 24h/24.",
    descriptionEn: "Banks and microfinance institutions guide clients with a 24/7 assistant.",
    testimonial: {
      quoteFr: "Les demandes de prêt sont pré-qualifiées par le bot. Nos conseillers ne traitent que les dossiers prêts.",
      quoteEn: "Loan applications are pre-qualified by the bot. Our advisors only handle ready files.",
      author: "Joseph Tchana · MicroFinance Express, Douala",
      initials: "JT",
    },
    stats: [
      { value: "−70%", labelFr: "Temps d'attente", labelEn: "Wait time" },
      { value: "5000+", labelFr: "Clients orientés", labelEn: "Clients routed" },
      { value: "24/7", labelFr: "Information", labelEn: "Information" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : MicroFinance Express",
    businessExampleEn: "e.g. MicroFinance Express",
  },

  school: {
    taglineFr: "Inscriptions et infos, sans file d'attente.",
    taglineEn: "Enrollment and info, without queues.",
    descriptionFr: "Écoles et universités automatisent admissions et communications avec AGT.",
    descriptionEn: "Schools and universities automate admissions and communications with AGT.",
    testimonial: {
      quoteFr: "Les parents posent toutes leurs questions au bot avant l'inscription. Notre administration respire enfin.",
      quoteEn: "Parents ask all their questions to the bot before enrolling. Our admin finally has room to breathe.",
      author: "Béatrice Nkeng · Institut Polyvalent du Centre, Yaoundé",
      initials: "BN",
    },
    stats: [
      { value: "+40%", labelFr: "Inscriptions en ligne", labelEn: "Online enrollments" },
      { value: "24/7", labelFr: "Renseignements", labelEn: "Information" },
      { value: "−50%", labelFr: "Charge admin", labelEn: "Admin load" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : École Bilingue Étoile",
    businessExampleEn: "e.g. Étoile Bilingual School",
  },

  ecommerce: {
    taglineFr: "Vos commandes ne dorment jamais.",
    taglineEn: "Your orders never sleep.",
    descriptionFr: "Boutiques en ligne africaines convertissent et suivent leurs ventes avec AGT.",
    descriptionEn: "African online stores convert and track their sales with AGT.",
    testimonial: {
      quoteFr: "Le bot relance les paniers abandonnés et répond aux questions produit. Mes ventes nocturnes ont doublé.",
      quoteEn: "The bot recovers abandoned carts and answers product questions. My night sales doubled.",
      author: "Linda Mvondo · Mama Linda Cosmétiques, Douala",
      initials: "LM",
    },
    stats: [
      { value: "×2", labelFr: "Conversion", labelEn: "Conversion" },
      { value: "24/7", labelFr: "Support client", labelEn: "Customer care" },
      { value: "−80%", labelFr: "Paniers perdus", labelEn: "Lost carts" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Boutique Mvog-Mbi",
    businessExampleEn: "e.g. Mvog-Mbi Boutique",
  },

  transport: {
    taglineFr: "Vos billets se vendent pendant que vous roulez.",
    taglineEn: "Your tickets sell while you drive.",
    descriptionFr: "Compagnies de transport vendent leurs billets sur WhatsApp avec AGT.",
    descriptionEn: "Transport companies sell tickets on WhatsApp with AGT.",
    testimonial: {
      quoteFr: "Les clients réservent leurs trajets sans appeler le guichet. Nos départs partent pleins.",
      quoteEn: "Clients book their trips without calling the counter. Our buses leave full.",
      author: "Samuel Etoa · Express Trans Cameroun, Yaoundé",
      initials: "SE",
    },
    stats: [
      { value: "+45%", labelFr: "Billets en ligne", labelEn: "Online tickets" },
      { value: "24/7", labelFr: "Réservations", labelEn: "Bookings" },
      { value: "0", labelFr: "Place perdue", labelEn: "Empty seats" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Trans Express Douala",
    businessExampleEn: "e.g. Trans Express Douala",
  },

  pme: {
    taglineFr: "Votre PME, professionnelle 24h/24.",
    taglineEn: "Your SME, professional 24/7.",
    descriptionFr: "Des milliers de PME camerounaises font confiance à AGT.",
    descriptionEn: "Thousands of Cameroonian SMEs trust AGT.",
    testimonial: {
      quoteFr: "Depuis AGT, nos rendez-vous ont augmenté de 40%. L'assistant répond même la nuit.",
      quoteEn: "Since AGT, our appointments increased by 40%. The assistant responds even at night.",
      author: "Marie Ngo · Pharmacie du Centre, Yaoundé",
      initials: "MN",
    },
    stats: [
      { value: "50k+", labelFr: "Messages / jour", labelEn: "Messages / day" },
      { value: "99%", labelFr: "Disponibilité", labelEn: "Uptime" },
      { value: "5min", labelFr: "Pour démarrer", labelEn: "To start" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : MC Consulting",
    businessExampleEn: "e.g. MC Consulting",
  },

  public: {
    taglineFr: "Les citoyens trouvent toujours une réponse.",
    taglineEn: "Citizens always find an answer.",
    descriptionFr: "Administrations africaines orientent les citoyens avec un agent IA.",
    descriptionEn: "African administrations guide citizens with an AI agent.",
    testimonial: {
      quoteFr: "Les usagers obtiennent l'information sans se déplacer. Nos guichets se concentrent sur les cas complexes.",
      quoteEn: "Users get information without coming in. Our desks focus on complex cases.",
      author: "Innocent Bayemi · Mairie de Bafoussam, Bafoussam",
      initials: "IB",
    },
    stats: [
      { value: "−65%", labelFr: "Files d'attente", labelEn: "Queue length" },
      { value: "10k+", labelFr: "Citoyens orientés", labelEn: "Citizens routed" },
      { value: "24/7", labelFr: "Information", labelEn: "Information" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Mairie de Yaoundé III",
    businessExampleEn: "e.g. Yaoundé District 3 City Hall",
  },

  custom: {
    taglineFr: "Un assistant IA, à votre image.",
    taglineEn: "An AI assistant, your way.",
    descriptionFr: "Composez votre propre solution avec les fonctionnalités qui vous correspondent.",
    descriptionEn: "Build your own solution with the features that fit your needs.",
    testimonial: {
      quoteFr: "On a démarré avec deux modules, on en a ajouté quatre en six mois. AGT s'adapte à notre rythme.",
      quoteEn: "We started with two modules, added four in six months. AGT adapts to our pace.",
      author: "Équipe AGT-BOT",
      initials: "AB",
    },
    stats: [
      { value: "23", labelFr: "Modules disponibles", labelEn: "Available modules" },
      { value: "24/7", labelFr: "Disponibilité", labelEn: "Always on" },
      { value: "5min", labelFr: "Pour démarrer", labelEn: "To start" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Ma société",
    businessExampleEn: "e.g. My business",
  },

  // Hub central — contenu marketing cross-secteur (vitrine globale)
  central: {
    taglineFr: "Votre assistant virtuel, disponible 24h/24.",
    taglineEn: "Your virtual assistant, available 24/7.",
    descriptionFr: "Des milliers d'entreprises africaines, dans 10 secteurs, font confiance à AGT.",
    descriptionEn: "Thousands of African businesses, across 10 sectors, trust AGT.",
    testimonial: {
      quoteFr: "AGT a transformé la relation client de notre groupe. Chaque filiale a son agent IA, partout en Afrique.",
      quoteEn: "AGT transformed our group's customer relationship. Each subsidiary has its AI agent, all across Africa.",
      author: "Équipe AG Technologies",
      initials: "AG",
    },
    stats: [
      { value: "10", labelFr: "Secteurs couverts", labelEn: "Sectors covered" },
      { value: "1000+", labelFr: "Entreprises actives", labelEn: "Active businesses" },
      { value: "5min", labelFr: "Pour démarrer", labelEn: "To start" },
    ],
    badgeFr: "10 000 FCFA offerts à l'inscription",
    badgeEn: "10,000 XAF offered at sign-up",
    businessExampleFr: "Ex : Ma société",
    businessExampleEn: "e.g. My business",
  },
};

/** Helper de lecture — fallback central si slug inconnu. */
export function getSectorContent(sector: SectorSlug): SectorContent {
  return SECTOR_CONTENT[sector] ?? SECTOR_CONTENT.central;
}

// END OF FILE: src/lib/sector-content.ts