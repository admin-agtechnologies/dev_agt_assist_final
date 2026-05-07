// src/lib/sector-configs/ecommerce.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const ecommerceDefaultFeatures: string[] = [
  "catalogue_produits",
  "commande_paiement",
  "suivi_commande",
  "conversion_prospects",
];

export const ecommerceTheme: SectorTheme = {
  primary: "#E63946",
  accent: "#FF6B6B",
  bg: "#FFF5F5",
  label: "E-commerce",
};