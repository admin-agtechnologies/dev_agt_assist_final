// src/lib/sector-configs/public.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const publicDefaultFeatures: string[] = [
  "orientation_citoyens",
  "prise_rdv",
  "multi_agences",
];

export const publicTheme: SectorTheme = {
  primary: "#2D3561",
  accent: "#C84B31",
  bg: "#F5F7FF",
  label: "Secteur Public",
};