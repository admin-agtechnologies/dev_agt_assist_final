// src/lib/sector-configs/hotel.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const hotelDefaultFeatures: string[] = [
  "reservation_chambre",
  "conciergerie",
  "catalogue_services",
  "multi_agences",
];

export const hotelTheme: SectorTheme = {
  primary: "#1A3C5E",
  accent: "#C9A84C",
  bg: "#F8F6F0",
  label: "Hôtel",
};