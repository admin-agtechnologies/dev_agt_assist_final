// src/app/_components/landing/LandingData.ts
import { MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe } from "lucide-react";

export const FEATURE_ICONS = [MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe];

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  city: string;
  avatar: string;
  rating: number;
  textFr: string;
  textEn: string;
}

export interface HeroSlide {
  image: string;
  overlayColor: string;
  badgeFr: string;
  badgeEn: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  accentColor: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jean-Paul Mbarga",
    role: "Directeur",
    company: "Albatros Hôtel",
    city: "Yaoundé",
    avatar: "JM",
    rating: 5,
    textFr: "Depuis AGT Platform, notre réception virtuelle répond aux clients 24h/24. Les réservations ont augmenté de 35% en 2 mois. Un outil indispensable pour notre hôtel.",
    textEn: "Since AGT Platform, our virtual reception answers clients 24/7. Bookings increased by 35% in 2 months. An essential tool for our hotel.",
  },
  {
    name: "Christelle Nkomo",
    role: "Responsable Digital",
    company: "Orange Cameroun",
    city: "Douala",
    avatar: "CN",
    rating: 5,
    textFr: "L'assistant WhatsApp gère des centaines de demandes clients simultanément. Le temps de réponse est passé de 4h à moins de 30 secondes.",
    textEn: "The WhatsApp assistant handles hundreds of customer requests simultaneously. Response time dropped from 4h to under 30 seconds.",
  },
  {
    name: "Patrick Essama",
    role: "Gérant",
    company: "Finex Voyage",
    city: "Yaoundé",
    avatar: "PE",
    rating: 5,
    textFr: "Nos clients reçoivent leurs devis et confirmations de voyage instantanément via WhatsApp. AGT Platform a transformé notre service client.",
    textEn: "Our clients receive their quotes and travel confirmations instantly via WhatsApp. AGT Platform transformed our customer service.",
  },
  {
    name: "Dr. Aminatou Bello",
    role: "Médecin-chef",
    company: "Clinique Sainte-Marie",
    city: "Bafoussam",
    avatar: "AB",
    rating: 5,
    textFr: "La gestion des rendez-vous est maintenant entièrement automatisée. Nos patients adorent pouvoir prendre RDV à n'importe quelle heure.",
    textEn: "Appointment management is now fully automated. Our patients love being able to book at any hour.",
  },
  {
    name: "Samuel Tchatchou",
    role: "CEO",
    company: "TechBuild Cameroun",
    city: "Douala",
    avatar: "ST",
    rating: 5,
    textFr: "En 5 minutes de configuration, notre assistant était opérationnel. Un investissement rentabilisé dès la première semaine.",
    textEn: "In 5 minutes of setup, our assistant was operational. An investment that paid off in the first week.",
  },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero/hero-1.jpg",
    overlayColor: "from-[#075E54]/80 via-[#075E54]/60 to-[#022c22]/70",
    badgeFr: " 10 000 FCFA offerts à l'inscription",
    badgeEn: " 10,000 XAF offered at registration",
    titleFr: "Votre assistant virtuel,",
    titleEn: "Your virtual assistant,",
    subtitleFr: "prêt en 5 minutes.",
    subtitleEn: "ready in 5 minutes.",
    accentColor: "#25D366",
  },
  {
    image: "/images/hero/hero-2.png",
    overlayColor: "from-[#022c22]/85 via-[#075E54]/70 to-[#075E54]/60",
    badgeFr: " WhatsApp · 24h/24 · 7j/7",
    badgeEn: " WhatsApp · 24/7",
    titleFr: "Répondez à vos clients",
    titleEn: "Answer your customers",
    subtitleFr: "même quand vous dormez.",
    subtitleEn: "even while you sleep.",
    accentColor: "#25D366",
  },
  {
    image: "/images/hero/hero-3.jpg",
    overlayColor: "from-[#2D1B69]/85 via-[#6C3CE1]/65 to-[#2D1B69]/70",
    badgeFr: " Agent Vocal IA nouvelle génération",
    badgeEn: " Next-gen AI Voice Agent",
    titleFr: "Un agent IA qui décroche",
    titleEn: "An AI agent that answers",
    subtitleFr: "à votre place.",
    subtitleEn: "in your place.",
    accentColor: "#8B5CF6",
  },
];