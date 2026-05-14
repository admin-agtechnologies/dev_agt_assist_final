// ============================================================
// FICHIER : src/app/_components/landing/LandingData.ts
// Données statiques landing hub AGT-BOT.
// SECTOR_URLS importé depuis constants.ts — un seul endroit.
// ============================================================

import {
  Briefcase, Building2, Heart, GraduationCap, ShoppingCart,
  Hotel, Landmark, Utensils, Plane, Sparkles,
  MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe,
} from "lucide-react";
// import { SECTOR_URLS, ROUTES } from "@/lib/constants";
import { ROUTES } from "@/lib/constants";
import { getSectorUrl as _getSectorUrl } from "@/lib/sector-urls";

// ── Icônes secteurs ──────────────────────────────────────────────────────────
export const SECTOR_ICON_MAP: Record<string, React.ElementType> = {
  pme: Briefcase,
  banking: Building2,
  clinical: Heart,
  school: GraduationCap,
  ecommerce: ShoppingCart,
  hotel: Hotel,
  public: Landmark,
  restaurant: Utensils,
  transport: Plane,
  custom: Sparkles,
};

// ── Icônes features ──────────────────────────────────────────────────────────
export const FEATURE_ICONS: Record<string, React.ElementType> = {
  feature1: MessageSquare,
  feature2: Phone,
  feature3: CalendarDays,
  feature4: BarChart3,
  feature5: Smartphone,
  feature6: Globe,
};

// ── Type Secteur ─────────────────────────────────────────────────────────────
export interface Sector {
  id: string;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  primary: string;
  accent: string;
  gradient: string;
  tagFr: string;
  tagEn: string;
  featuresFr: string[];
  featuresEn: string[];
  image: string;
}

// ── 10 Secteurs ──────────────────────────────────────────────────────────────
export const SECTORS: Sector[] = [
  {
    id: "pme",
    nameFr: "PME", nameEn: "SME",
    descFr: "Automatisez votre service client et vos rendez-vous.",
    descEn: "Automate your customer service and appointments.",
    primary: "#075E54", accent: "#25D366",
    gradient: "from-[#075E54] to-[#128C7E]",
    tagFr: "Solution phare", tagEn: "Flagship solution",
    featuresFr: ["WhatsApp 24/7", "Agent vocal IA", "Gestion RDV", "Tableau de bord"],
    featuresEn: ["WhatsApp 24/7", "AI voice agent", "Appointment mgmt", "Dashboard"],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1400&q=80",
  },
  {
    id: "banking",
    nameFr: "Bancaire", nameEn: "Banking",
    descFr: "Conseil client automatisé et gestion de comptes.",
    descEn: "Automated customer advice and account management.",
    primary: "#059669", accent: "#34D399",
    gradient: "from-[#059669] to-[#047857]",
    tagFr: "Finance & Banque", tagEn: "Finance & Banking",
    featuresFr: ["Conseil financier IA", "Suivi de comptes", "Alertes transaction", "Support 24/7"],
    featuresEn: ["AI financial advice", "Account tracking", "Transaction alerts", "24/7 support"],
    image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1400&q=80",
  },
  {
    id: "clinical",
    nameFr: "Clinique", nameEn: "Clinic",
    descFr: "Prise de RDV médicaux et suivi patient automatisé.",
    descEn: "Automated medical appointment booking and patient follow-up.",
    primary: "#0EA5E9", accent: "#38BDF8",
    gradient: "from-[#0EA5E9] to-[#0284C7]",
    tagFr: "Santé & Médical", tagEn: "Health & Medical",
    featuresFr: ["RDV médical auto", "Rappels patients", "Suivi prescriptions", "Urgences 24/7"],
    featuresEn: ["Auto medical booking", "Patient reminders", "Prescription tracking", "24/7 emergencies"],
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1400&q=80",
  },
  {
    id: "school",
    nameFr: "École", nameEn: "School",
    descFr: "Communication parents-élèves simplifiée et automatisée.",
    descEn: "Simplified parent-student communication.",
    primary: "#6366F1", accent: "#A5B4FC",
    gradient: "from-[#6366F1] to-[#4F46E5]",
    tagFr: "Éducation & Formation", tagEn: "Education & Training",
    featuresFr: ["Infos résultats", "Alertes absences", "Inscriptions auto", "FAQ parents"],
    featuresEn: ["Grade info", "Absence alerts", "Auto enrollment", "Parent FAQ"],
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80",
  },
  {
    id: "ecommerce",
    nameFr: "E-commerce", nameEn: "E-commerce",
    descFr: "Suivi commandes et support client intelligent.",
    descEn: "Order tracking and intelligent customer support.",
    primary: "#8B5CF6", accent: "#C4B5FD",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    tagFr: "Commerce en ligne", tagEn: "Online commerce",
    featuresFr: ["Suivi commandes", "Support retours", "Recommandations IA", "Stock temps réel"],
    featuresEn: ["Order tracking", "Returns support", "AI recommendations", "Real-time stock"],
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
  },
  {
    id: "hotel",
    nameFr: "Hôtel", nameEn: "Hotel",
    descFr: "Réservations et conciergerie virtuelle 24h/24.",
    descEn: "Reservations and virtual concierge 24/7.",
    primary: "#64748B", accent: "#94A3B8",
    gradient: "from-[#334155] to-[#1E293B]",
    tagFr: "Hôtellerie & Accueil", tagEn: "Hospitality",
    featuresFr: ["Réservations auto", "Conciergerie IA", "Check-in/out", "Services hôtel"],
    featuresEn: ["Auto reservations", "AI concierge", "Check-in/out info", "Hotel services"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
  },
  {
    id: "public",
    nameFr: "Secteur Public", nameEn: "Public Sector",
    descFr: "Services aux citoyens accessibles 24/7.",
    descEn: "Citizen services accessible 24/7.",
    primary: "#1E3A5F", accent: "#3B82F6",
    gradient: "from-[#1E3A5F] to-[#1E40AF]",
    tagFr: "Administration publique", tagEn: "Public administration",
    featuresFr: ["Info citoyens", "Suivi dossiers", "Prise de RDV", "Alertes officielles"],
    featuresEn: ["Citizen info", "File tracking", "Appointment booking", "Official alerts"],
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1400&q=80",
  },
  {
    id: "restaurant",
    nameFr: "Restaurant", nameEn: "Restaurant",
    descFr: "Commandes, réservations et livraisons automatisées.",
    descEn: "Automated orders, reservations and deliveries.",
    primary: "#F97316", accent: "#FDBA74",
    gradient: "from-[#F97316] to-[#EA580C]",
    tagFr: "Restauration", tagEn: "Food & Beverage",
    featuresFr: ["Commandes WhatsApp", "Réservations tables", "Menu digital", "Livraisons suivi"],
    featuresEn: ["WhatsApp orders", "Table reservations", "Digital menu", "Delivery tracking"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80",
  },
  {
    id: "transport",
    nameFr: "Voyage", nameEn: "Travel",
    descFr: "Devis, réservations et assistance voyage IA.",
    descEn: "Quotes, bookings and AI travel assistance.",
    primary: "#06B6D4", accent: "#67E8F9",
    gradient: "from-[#06B6D4] to-[#0891B2]",
    tagFr: "Voyage & Tourisme", tagEn: "Travel & Tourism",
    featuresFr: ["Devis instantanés", "Réservations billets", "Visas & documents", "Assistance voyage"],
    featuresEn: ["Instant quotes", "Ticket booking", "Visas & docs", "Travel assistance"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80",
  },
  {
    id: "custom",
    nameFr: "Personnalisé", nameEn: "Custom",
    descFr: "Une solution sur mesure pour votre métier unique.",
    descEn: "A tailor-made solution for your unique business.",
    primary: "#374151", accent: "#9CA3AF",
    gradient: "from-[#1F2937] to-[#111827]",
    tagFr: "Sur mesure", tagEn: "Custom solution",
    featuresFr: ["Flux personnalisés", "Intégrations métier", "Branding sur mesure", "Support dédié"],
    featuresEn: ["Custom flows", "Business integrations", "Custom branding", "Dedicated support"],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80",
  },
];

// ── Helper URL secteur → SectorCard uniquement ───────────────────────────────
// ── Helper URL secteur → SectorCard uniquement ───────────────────────────────
// Délègue à la source de vérité unique (`@/lib/sector-urls`).
// Re-export pour compatibilité des imports existants.
export const getSectorUrl = _getSectorUrl;

// ── Types HeroSlide ──────────────────────────────────────────────────────────
export type SlideType = "general" | "feature" | "sector";

export interface HeroSlide {
  type: SlideType;
  image: string;
  badgeFr: string;
  badgeEn: string;
  line1Fr: string;
  line1En: string;
  line2Fr: string;
  line2En: string;
  accent: string;
  badgeIcon: "zap" | "message" | "phone" | "sparkles";
  overlayA: string;
  overlayB: string;
  ctaFr: string;
  ctaEn: string;
  ctaHref: string;
  featuresFr?: string[];
  featuresEn?: string[];
}

// ── 13 slides ────────────────────────────────────────────────────────────────
export const HERO_SLIDES: HeroSlide[] = [
  // 1 — Général
  {
    type: "general",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80",
    badgeFr: "10 000 FCFA offerts à l'inscription", badgeEn: "10,000 XAF offered at registration",
    line1Fr: "Votre assistant virtuel,", line1En: "Your virtual assistant,",
    line2Fr: "prêt en 5 minutes.", line2En: "ready in 5 minutes.",
    accent: "#25D366", badgeIcon: "zap",
    overlayA: "#075E54CC", overlayB: "#022c22EE",
    ctaFr: "Créer mon assistant", ctaEn: "Create my assistant",
    ctaHref: ROUTES.onboarding,
  },
  // 2 — WhatsApp
  {
    type: "feature",
    image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1400&q=80",
    badgeFr: "WhatsApp · 24h/24 · 7j/7", badgeEn: "WhatsApp · 24/7",
    line1Fr: "Il répond à vos clients", line1En: "It answers your clients",
    line2Fr: "même quand vous dormez.", line2En: "even while you sleep.",
    accent: "#25D366", badgeIcon: "message",
    overlayA: "#022c22E8", overlayB: "#075E54CC",
    ctaFr: "Démarrer maintenant", ctaEn: "Get started now",
    ctaHref: ROUTES.onboarding,
  },
  // 3 — Agent Vocal
  {
    type: "feature",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80",
    badgeFr: "Agent Vocal IA nouvelle génération", badgeEn: "Next-gen AI Voice Agent",
    line1Fr: "Un agent IA qui décroche", line1En: "An AI agent that answers",
    line2Fr: "à votre place.", line2En: "in your place.",
    accent: "#A78BFA", badgeIcon: "phone",
    overlayA: "#2D1B69E0", overlayB: "#075E54C0",
    ctaFr: "Essayer l'agent vocal", ctaEn: "Try the voice agent",
    ctaHref: ROUTES.onboarding,
  },
  // 4 — PME
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1400&q=80",
    badgeFr: "Solution PME", badgeEn: "SME Solution",
    line1Fr: "Boostez votre PME", line1En: "Boost your SME",
    line2Fr: "avec l'IA WhatsApp.", line2En: "with WhatsApp AI.",
    accent: "#25D366", badgeIcon: "zap",
    overlayA: "#075E54CC", overlayB: "#022c22EE",
    ctaFr: "Démarrer pour ma PME", ctaEn: "Start for my SME",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["WhatsApp 24/7", "Agent vocal IA", "Gestion RDV", "Tableau de bord"],
    featuresEn: ["WhatsApp 24/7", "AI voice agent", "Appointment mgmt", "Dashboard"],
  },
  // 5 — Bancaire
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1400&q=80",
    badgeFr: "Finance & Banque", badgeEn: "Finance & Banking",
    line1Fr: "Votre conseiller bancaire IA,", line1En: "Your AI banking advisor,",
    line2Fr: "disponible 24h/24.", line2En: "available 24/7.",
    accent: "#34D399", badgeIcon: "zap",
    overlayA: "#064E3BCC", overlayB: "#059669EE",
    ctaFr: "Démarrer pour ma banque", ctaEn: "Start for my bank",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Conseil financier IA", "Suivi de comptes", "Alertes transaction", "Support 24/7"],
    featuresEn: ["AI financial advice", "Account tracking", "Transaction alerts", "24/7 support"],
  },
  // 6 — Clinique
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1400&q=80",
    badgeFr: "Santé & Médical", badgeEn: "Health & Medical",
    line1Fr: "Votre clinique connectée,", line1En: "Your clinic connected,",
    line2Fr: "patients servis 24h/24.", line2En: "patients served 24/7.",
    accent: "#38BDF8", badgeIcon: "phone",
    overlayA: "#0C4A6EDD", overlayB: "#0284C7BB",
    ctaFr: "Démarrer pour ma clinique", ctaEn: "Start for my clinic",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["RDV médical auto", "Rappels patients", "Suivi prescriptions", "Urgences 24/7"],
    featuresEn: ["Auto medical booking", "Patient reminders", "Prescription tracking", "24/7 emergencies"],
  },
  // 7 — École
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80",
    badgeFr: "Éducation & Formation", badgeEn: "Education & Training",
    line1Fr: "L'école du futur,", line1En: "The school of the future,",
    line2Fr: "connectée à chaque famille.", line2En: "connected to every family.",
    accent: "#A5B4FC", badgeIcon: "message",
    overlayA: "#312E81E0", overlayB: "#4338CACC",
    ctaFr: "Démarrer pour mon école", ctaEn: "Start for my school",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Infos résultats", "Alertes absences", "Inscriptions auto", "FAQ parents"],
    featuresEn: ["Grade info", "Absence alerts", "Auto enrollment", "Parent FAQ"],
  },
  // 8 — E-commerce
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
    badgeFr: "Commerce en ligne", badgeEn: "Online commerce",
    line1Fr: "Boostez vos ventes", line1En: "Boost your sales",
    line2Fr: "avec l'IA 24h/24.", line2En: "with AI 24/7.",
    accent: "#C4B5FD", badgeIcon: "zap",
    overlayA: "#4C1D95DD", overlayB: "#7C3AEDCC",
    ctaFr: "Démarrer pour ma boutique", ctaEn: "Start for my store",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Suivi commandes", "Support retours", "Recommandations IA", "Stock temps réel"],
    featuresEn: ["Order tracking", "Returns support", "AI recommendations", "Real-time stock"],
  },
  // 9 — Hôtel
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
    badgeFr: "Hôtellerie & Accueil", badgeEn: "Hospitality",
    line1Fr: "Votre hôtel intelligent,", line1En: "Your smart hotel,",
    line2Fr: "conciergerie IA 24h/24.", line2En: "AI concierge 24/7.",
    accent: "#94A3B8", badgeIcon: "sparkles",
    overlayA: "#1E293BEE", overlayB: "#334155CC",
    ctaFr: "Démarrer pour mon hôtel", ctaEn: "Start for my hotel",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Réservations auto", "Conciergerie IA", "Check-in/out", "Services hôtel"],
    featuresEn: ["Auto reservations", "AI concierge", "Check-in/out info", "Hotel services"],
  },
  // 10 — Secteur Public
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1400&q=80",
    badgeFr: "Administration publique", badgeEn: "Public administration",
    line1Fr: "Vos citoyens servis", line1En: "Your citizens served",
    line2Fr: "à toute heure.", line2En: "around the clock.",
    accent: "#3B82F6", badgeIcon: "zap",
    overlayA: "#1E3A5FEE", overlayB: "#1E40AFCC",
    ctaFr: "Démarrer pour mon administration", ctaEn: "Start for my administration",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Info citoyens", "Suivi dossiers", "Prise de RDV", "Alertes officielles"],
    featuresEn: ["Citizen info", "File tracking", "Appointment booking", "Official alerts"],
  },
  // 11 — Restaurant
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80",
    badgeFr: "Restauration", badgeEn: "Food & Beverage",
    line1Fr: "Votre restaurant digital,", line1En: "Your digital restaurant,",
    line2Fr: "commandes & réservations IA.", line2En: "AI orders & reservations.",
    accent: "#FDBA74", badgeIcon: "message",
    overlayA: "#9A3412E0", overlayB: "#EA580CCC",
    ctaFr: "Démarrer pour mon restaurant", ctaEn: "Start for my restaurant",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Commandes WhatsApp", "Réservations tables", "Menu digital", "Livraisons suivi"],
    featuresEn: ["WhatsApp orders", "Table reservations", "Digital menu", "Delivery tracking"],
  },
  // 12 — Voyage
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80",
    badgeFr: "Voyage & Tourisme", badgeEn: "Travel & Tourism",
    line1Fr: "Votre agence voyage IA,", line1En: "Your AI travel agency,",
    line2Fr: "devis & réservations instant.", line2En: "instant quotes & bookings.",
    accent: "#67E8F9", badgeIcon: "sparkles",
    overlayA: "#0C4A6EDD", overlayB: "#0891B2CC",
    ctaFr: "Démarrer pour mon agence", ctaEn: "Start for my agency",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Devis instantanés", "Réservations billets", "Visas & documents", "Assistance voyage"],
    featuresEn: ["Instant quotes", "Ticket booking", "Visas & docs", "Travel assistance"],
  },
  // 13 — Personnalisé
  {
    type: "sector",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80",
    badgeFr: "Solution sur mesure", badgeEn: "Custom solution",
    line1Fr: "Votre métier est unique,", line1En: "Your business is unique,",
    line2Fr: "votre assistant aussi.", line2En: "so is your assistant.",
    accent: "#9CA3AF", badgeIcon: "sparkles",
    overlayA: "#111827EE", overlayB: "#1F2937CC",
    ctaFr: "Créer ma solution sur mesure", ctaEn: "Create my custom solution",
    ctaHref: ROUTES.onboarding,
    featuresFr: ["Flux personnalisés", "Intégrations métier", "Branding sur mesure", "Support dédié"],
    featuresEn: ["Custom flows", "Business integrations", "Custom branding", "Dedicated support"],
  },
];

// ── Témoignages ──────────────────────────────────────────────────────────────
export interface Testimonial {
  name: string; role: string; company: string;
  city: string; avatar: string; rating: number;
  textFr: string; textEn: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: "Jean-Paul Mbarga", role: "Directeur", company: "Albatros Hôtel", city: "Yaoundé", avatar: "JM", rating: 5, textFr: "Depuis AGT-BOT, notre réception virtuelle répond aux clients 24h/24. Les réservations ont augmenté de 35% en 2 mois.", textEn: "Since AGT-BOT, our virtual reception answers clients 24/7. Bookings increased by 35% in 2 months." },
  { name: "Christelle Nkomo", role: "Responsable Digital", company: "Orange Cameroun", city: "Douala", avatar: "CN", rating: 5, textFr: "L'assistant WhatsApp gère des centaines de demandes simultanément. Le temps de réponse est passé de 4h à moins de 30 secondes.", textEn: "The WhatsApp assistant handles hundreds of requests. Response time dropped from 4h to under 30 seconds." },
  { name: "Patrick Essama", role: "Gérant", company: "Finex Voyage", city: "Yaoundé", avatar: "PE", rating: 5, textFr: "Nos clients reçoivent leurs devis et confirmations instantanément via WhatsApp. AGT-BOT a transformé notre service.", textEn: "Our clients receive quotes and travel confirmations instantly via WhatsApp. AGT-BOT transformed our service." },
  { name: "Dr. Aminatou Bello", role: "Médecin-chef", company: "Clinique Sainte-Marie", city: "Bafoussam", avatar: "AB", rating: 5, textFr: "La gestion des rendez-vous est entièrement automatisée. Plus de files d'attente. Nos patients adorent prendre RDV à toute heure.", textEn: "Appointment management is fully automated. No more queues. Our patients love being able to book at any hour." },
  { name: "Samuel Tchatchou", role: "CEO", company: "TechBuild Cameroun", city: "Douala", avatar: "ST", rating: 5, textFr: "En 5 minutes, notre assistant était opérationnel. L'agent vocal IA impressionne nos clients. Rentabilisé dès la première semaine.", textEn: "In 5 minutes, our assistant was operational. The AI voice agent impresses our clients. Paid off in the first week." },
];

// ── URL vidéo démo ───────────────────────────────────────────────────────────
export const DEMO_VIDEO_URL =
  "https://api.salma.agtgroupholding.com/media/seed/bourses/demo.mp4";