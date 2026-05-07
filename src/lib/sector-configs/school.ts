// src/lib/sector-configs/school.ts
import type { SectorTheme } from "@/lib/sector-theme";

export const schoolDefaultFeatures: string[] = [
  "inscription_admission",
  "prise_rdv",
  "communication_etablissement",
  "catalogue_services",
];

export const schoolTheme: SectorTheme = {
  primary: "#3A0CA3",
  accent: "#7B2FBE",
  bg: "#F8F0FF",
  label: "Éducation",
};