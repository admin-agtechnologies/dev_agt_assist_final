// src/app/page.tsx
import type { Metadata } from "next";
import LandingPageContent from "./_components/LandingPageContent";

const BASE_URL = "https://assist.ag-technologies.tech";

export const metadata: Metadata = {
  title: "AGT Platform — Virtual Assistants for African SMEs | Assistants virtuels PME africaines",
  description:
    "Create your WhatsApp & AI voice assistant in 5 minutes with AGT Platform — no code required. 24/7 customer service automation for African SMEs. Créez votre assistant virtuel en 5 minutes, sans code.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    url: BASE_URL,
    title: "AGT Platform — Virtual Assistants for African SMEs",
    description:
      "No-code SaaS to create WhatsApp & AI voice assistants for African businesses in 5 minutes. 24/7, no code required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGT Platform — Virtual Assistants for African SMEs",
      },
    ],
  },
};

// ── JSON-LD : AG Technologies — l'entreprise ──────────────────────────────────
const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AG Technologies",
  url: "https://ag-technologies.tech",
  logo: `${BASE_URL}/logo.png`,
  description:
    "AG Technologies is a Cameroonian tech company building SaaS solutions for African SMEs, including AGT Platform — a no-code virtual assistant platform.",
  foundingLocation: {
    "@type": "Place",
    name: "Yaoundé, Cameroon",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "CM",
    addressLocality: "Yaoundé",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["French", "English"],
  },
  sameAs: [],
};

// ── JSON-LD : AGT Platform — le produit SaaS ─────────────────────────────────
const jsonLdSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AGT Platform",
  url: BASE_URL,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Customer Service Automation",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  inLanguage: ["fr", "en"],
  author: {
    "@type": "Organization",
    name: "AG Technologies",
    url: "https://ag-technologies.tech",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "XAF",
    description:
      "Free registration — 10,000 XAF welcome bonus / Inscription gratuite — 10 000 XAF offerts",
  },
  description:
    "AGT Platform is a no-code SaaS platform enabling African SMEs to create WhatsApp chatbots and AI voice agents in under 5 minutes. 24/7 automated customer service, multilingual support, zero technical skills required.",
  featureList: [
    "WhatsApp chatbot creation without code",
    "AI voice agent for inbound calls",
    "24/7 automated customer service",
    "Multilingual support (French & English)",
    "Real-time conversation dashboard",
    "Appointment scheduling automation",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Small and Medium-sized Businesses",
    geographicArea: {
      "@type": "Place",
      name: "Sub-Saharan Africa",
    },
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <LandingPageContent />
    </>
  );
}