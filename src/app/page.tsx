// src/app/page.tsx
// Routing conditionnel selon NEXT_PUBLIC_SECTOR :
//   hub         → Landing centrale (hub)
//   restaurant  → Landing sectorielle Restaurant
//   banking     → Landing sectorielle Banking
//   school      → Landing sectorielle École
//   ecommerce   → Landing sectorielle E-commerce
//   hotel       → Landing sectorielle Hôtel
//   transport   → Landing sectorielle Transport
//   (autres)    → Landing centrale par défaut
import type { Metadata } from "next";
import LandingPageContent           from "./_components/LandingPageContent";
import RestaurantLandingContent     from "./_components/sector/restaurant/RestaurantLandingContent";
import BankingLandingContent        from "./_components/sector/banking/BankingLandingContent";
import SchoolLandingContent         from "./_components/sector/school/SchoolLandingContent";
import EcommerceLandingContent      from "./_components/sector/ecommerce/EcommerceLandingContent";
import HotelLandingContent          from "./_components/sector/hotel/HotelLandingContent";
import TransportLandingContent      from "./_components/sector/transport/TransportLandingContent";

const SECTOR = process.env.NEXT_PUBLIC_SECTOR ?? "hub";
const BASE_URL = "https://www.agt-bot.com";

// ── Metadata dynamique par secteur ───────────────────────────────────────────
const METADATA: Record<string, Metadata> = {
  hub: {
    title: "AGT-BOT — Assistants Virtuels IA pour entreprises africaines",
    description:
      "Créez votre assistant WhatsApp & vocal IA en 5 minutes. 10 secteurs couverts, sans code, 24h/24.",
    alternates: { canonical: BASE_URL },
    openGraph: {
      url: BASE_URL,
      title: "AGT-BOT — Assistants Virtuels IA pour entreprises africaines",
      description: "Créez votre assistant WhatsApp & vocal IA en 5 minutes — sans code.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT" }],
    },
  },
  restaurant: {
    title: "AGT-BOT Restaurant — Commandes & Réservations IA par WhatsApp",
    description:
      "Automatisez vos commandes WhatsApp, réservations de table et menu digital. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://restaurant.agt-bot.com" },
    openGraph: {
      url: "https://restaurant.agt-bot.com",
      title: "AGT-BOT Restaurant — Commandes & Réservations IA",
      description: "Commandes WhatsApp, réservations de table et menu digital automatisés.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT Restaurant" }],
    },
  },
  banking: {
    title: "AGT-BOT Banking — RDV Conseiller & Produits Financiers par WhatsApp",
    description:
      "Automatisez la prise de RDV, présentez vos produits financiers et gérez toutes vos agences. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://banking.agt-bot.com" },
    openGraph: {
      url: "https://banking.agt-bot.com",
      title: "AGT-BOT Banking — RDV Conseiller & Produits Financiers",
      description: "Prise de RDV conseiller, catalogue financier et multi-agences automatisés.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT Banking" }],
    },
  },
  school: {
    title: "AGT-BOT École — Admissions & Communication IA",
    description:
      "Automatisez vos admissions, prises de RDV et la communication avec les parents. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://school.agt-bot.com" },
    openGraph: {
      url: "https://school.agt-bot.com",
      title: "AGT-BOT École — Admissions & Communication IA",
      description: "Automatisez vos admissions, prises de RDV et la communication avec les parents.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT École" }],
    },
  },
  ecommerce: {
    title: "AGT-BOT E-commerce — Catalogue, Commandes & Suivi IA",
    description:
      "Automatisez votre boutique : catalogue interactif, suivi commandes et relance panier. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://e-commerce.agt-bot.com" },
    openGraph: {
      url: "https://e-commerce.agt-bot.com",
      title: "AGT-BOT E-commerce — Catalogue, Commandes & Suivi IA",
      description: "Catalogue interactif, suivi commandes et relance panier automatisés.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT E-commerce" }],
    },
  },
  hotel: {
    title: "AGT-BOT Hôtel — Réservations & Concierge IA",
    description:
      "Automatisez vos réservations chambre, disponibilités et services concierge. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://hotel.agt-bot.com" },
    openGraph: {
      url: "https://hotel.agt-bot.com",
      title: "AGT-BOT Hôtel — Réservations & Concierge IA",
      description: "Réservations chambre, disponibilités en temps réel et concierge virtuel automatisés.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT Hôtel" }],
    },
  },
  transport: {
    title: "AGT-BOT Transport — Billets & Départs IA par WhatsApp",
    description:
      "Vendez vos billets sur WhatsApp, gérez vos départs et notifiez vos voyageurs. Sans code, prêt en 5 minutes.",
    alternates: { canonical: "https://transport.agt-bot.com" },
    openGraph: {
      url: "https://transport.agt-bot.com",
      title: "AGT-BOT Transport — Billets & Départs IA",
      description: "Vente de billets WhatsApp, gestion des départs et notifications voyageurs automatisées.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT Transport" }],
    },
  },
};

export const metadata: Metadata = METADATA[SECTOR] ?? METADATA.hub;

// ── JSON-LD Organisation (commun) ─────────────────────────────────────────────
const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AG Technologies",
  url: "https://ag-technologies.tech",
  description: "AG Technologies — SaaS d'assistants virtuels IA pour entreprises africaines.",
  foundingLocation: { "@type": "Place", name: "Yaoundé, Cameroun" },
  address: { "@type": "PostalAddress", addressCountry: "CM", addressLocality: "Yaoundé" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: ["French", "English"] },
};

// ── Composant par secteur ─────────────────────────────────────────────────────
function SectorPage() {
  switch (SECTOR) {
    case "restaurant": return <RestaurantLandingContent />;
    case "banking":    return <BankingLandingContent />;
    case "school":     return <SchoolLandingContent />;
    case "ecommerce":  return <EcommerceLandingContent />;
    case "hotel":      return <HotelLandingContent />;
    case "transport":  return <TransportLandingContent />;
    case "hub":
    default:           return <LandingPageContent />;
  }
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <SectorPage />
    </>
  );
}