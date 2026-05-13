// src/app/page.tsx
// Routing conditionnel selon NEXT_PUBLIC_SECTOR :
//   hub         → Landing centrale (hub)
//   restaurant  → Landing sectorielle Restaurant
//   banking     → Landing sectorielle Banking
//   school      → Landing sectorielle École
//   (autres)    → Landing centrale par défaut
import type { Metadata } from "next";
import LandingPageContent       from "./_components/LandingPageContent";
import RestaurantLandingContent from "./_components/sector/restaurant/RestaurantLandingContent";
import BankingLandingContent    from "./_components/sector/banking/BankingLandingContent";
import SchoolLandingContent     from "./_components/sector/school/SchoolLandingContent";

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
};

export const metadata: Metadata = METADATA[SECTOR] ?? METADATA.hub;

// ── JSON-LD Organisation (commun) ────────────────────────────────────────────
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

// ── Composant par secteur ────────────────────────────────────────────────────
function SectorPage() {
  switch (SECTOR) {
    case "restaurant": return <RestaurantLandingContent />;
    case "banking":    return <BankingLandingContent />;
    case "school":     return <SchoolLandingContent />;
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