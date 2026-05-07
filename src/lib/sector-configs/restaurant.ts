// src/lib/sector-configs/restaurant.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const restaurantDefaultFeatures: string[] = [
  "reservation_table",
  "menu_digital",
  "commande_paiement",
];

export const restaurantTheme: SectorTheme = {
  primary: "#8B1A1A",
  accent: "#E8A020",
  bg: "#FDF8F4",
  label: "Restaurant",
};