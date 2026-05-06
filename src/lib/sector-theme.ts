// src/lib/sector-theme.ts
import type { SectorSlug } from "./sector-config";

export interface SectorTheme {
  primary: string;
  accent: string;
  bg: string;
  label: string;
  labelEn: string;
}

export const SECTOR_THEMES: Record<SectorSlug, SectorTheme> = {
  hotel: {
    primary: "#1A3C5E",
    accent: "#C9A84C",
    bg: "#F8F6F0",
    label: "Hôtel",
    labelEn: "Hotel",
  },
  restaurant: {
    primary: "#8B1A1A",
    accent: "#E8A020",
    bg: "#FDF8F4",
    label: "Restaurant",
    labelEn: "Restaurant",
  },
  clinical: {
    primary: "#0077B6",
    accent: "#00B4D8",
    bg: "#F0F8FF",
    label: "Santé & Hôpitaux",
    labelEn: "Health & Hospitals",
  },
  banking: {
    primary: "#1B4332",
    accent: "#40916C",
    bg: "#F0FAF4",
    label: "Banque & Microfinance",
    labelEn: "Banking & Microfinance",
  },
  school: {
    primary: "#3A0CA3",
    accent: "#7B2FBE",
    bg: "#F8F0FF",
    label: "Éducation",
    labelEn: "Education",
  },
  ecommerce: {
    primary: "#E63946",
    accent: "#FF6B6B",
    bg: "#FFF5F5",
    label: "E-commerce",
    labelEn: "E-commerce",
  },
  transport: {
    primary: "#023E8A",
    accent: "#0096C7",
    bg: "#F0F8FF",
    label: "Transport",
    labelEn: "Transport",
  },
  pme: {
    primary: "#075E54",
    accent: "#25D366",
    bg: "#F0FAF5",
    label: "PME & Entreprises",
    labelEn: "SME & Business",
  },
  public: {
    primary: "#2D3561",
    accent: "#C84B31",
    bg: "#F5F7FF",
    label: "Secteur Public",
    labelEn: "Public Sector",
  },
  custom: {
    primary: "#374151",
    accent: "#6B7280",
    bg: "#F9FAFB",
    label: "Personnalisé",
    labelEn: "Custom",
  },
  central: {
    primary: "#0D47A1",
    accent: "#00BCD4",
    bg: "#F5F9FF",
    label: "AGT Platform",
    labelEn: "AGT Platform",
  },
};