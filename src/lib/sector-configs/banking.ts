// src/lib/sector-configs/banking.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const bankingDefaultFeatures: string[] = [
  "prise_rdv",
  "catalogue_produits_financiers",
  "multi_agences",
  "conversion_prospects",
];

export const bankingTheme: SectorTheme = {
  primary: "#1B4332",
  accent: "#40916C",
  bg: "#F0FAF4",
  label: "Banque & Microfinance",
};