// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const BASE_URL = "https://dev.assist.ag-technologies.tech";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  
  verification: {
    google: "UZCK3TigSzAARnarWGDqdAjGgHiaAAd2LBpPZx1BFWA", // ← colle ta valeur ici
  },


  title: {
    default: "AGT Platform — Virtual Assistants for African SMEs | Assistants virtuels pour PME africaines",
    template: "%s | AGT Platform",
  },

  description:
    "AGT Platform is a no-code SaaS that lets African SMEs create WhatsApp & AI voice assistants in 5 minutes — available 24/7. Créez votre assistant virtuel WhatsApp et vocal IA en 5 minutes, sans code, pour les PME africaines.",

  keywords: [
    // English
    "virtual assistant African SME",
    "WhatsApp chatbot Africa",
    "AI voice agent Cameroon",
    "no-code chatbot SaaS Africa",
    "customer service automation Africa",
    "WhatsApp bot business Cameroon",
    "AI assistant small business Africa",
    "AGT Platform",
    "AG Technologies",
    // Français
    "assistant virtuel PME Cameroun",
    "chatbot WhatsApp entreprise Afrique",
    "agent IA vocal PME",
    "automatisation service client Cameroun",
    "bot WhatsApp Cameroun",
    "SaaS PME Afrique francophone",
    "chatbot no-code Cameroun",
    "assistant IA entreprise africaine",
  ],

  authors: [{ name: "AG Technologies", url: "https://ag-technologies.tech" }],
  creator: "AG Technologies",
  publisher: "AG Technologies",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fr_CM",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "AGT Platform",
    title: "AGT Platform — Virtual Assistants for African SMEs",
    description:
      "No-code SaaS platform to create WhatsApp & AI voice assistants for African businesses in 5 minutes — 24/7 customer service automation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGT Platform — Virtual Assistants for African SMEs",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AGT Platform — Virtual Assistants for African SMEs",
    description:
      "No-code SaaS to create WhatsApp & AI voice assistants for African businesses in 5 minutes. 24/7 customer service automation.",
    images: ["/og-image.png"],
    creator: "@AGTechnologies",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr-CM": BASE_URL,
      "en-US": `${BASE_URL}?lang=en`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}