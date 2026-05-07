// src/lib/sector-configs/clinical.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const clinicalDefaultFeatures: string[] = [
  "prise_rdv",
  "orientation_patient",
  "catalogue_services",
  "multi_agences",
];

export const clinicalTheme: SectorTheme = {
  primary: "#0077B6",
  accent: "#00B4D8",
  bg: "#F0F8FF",
  label: "Santé & Hôpitaux",
};