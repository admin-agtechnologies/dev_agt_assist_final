// src/lib/sector-configs/transport.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const transportDefaultFeatures: string[] = [
  "reservation_billet",
  "catalogue_trajets",
  "suivi_commande",
];

export const transportTheme: SectorTheme = {
  primary: "#023E8A",
  accent: "#0096C7",
  bg: "#F0F8FF",
  label: "Transport",
};