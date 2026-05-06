// src/lib/sector-config.ts
import { ENV } from "./env";

export type SectorSlug =
  | "hotel"
  | "restaurant"
  | "clinical"
  | "banking"
  | "school"
  | "ecommerce"
  | "transport"
  | "pme"
  | "public"
  | "custom"
  | "central";

const SUBDOMAIN_MAP: Record<string, SectorSlug> = {
  hotel: "hotel",
  restaurant: "restaurant",
  clinical: "clinical",
  banking: "banking",
  school: "school",
  "e-commerce": "ecommerce",
  ecommerce: "ecommerce",
  travell: "transport",
  transport: "transport",
  pme: "pme",
  public: "public",
  custom: "custom",
  www: "central",
};

const VALID_SECTORS: SectorSlug[] = [
  "hotel", "restaurant", "clinical", "banking", "school",
  "ecommerce", "transport", "pme", "public", "custom", "central",
];

export function getCurrentSector(): SectorSlug {
  // Priorité 1 : variable d'environnement (dev local ou déploiement CI)
  if (ENV.SECTOR && VALID_SECTORS.includes(ENV.SECTOR as SectorSlug)) {
    return ENV.SECTOR as SectorSlug;
  }
  // Priorité 2 : sous-domaine (production sur agt-bot.com)
  if (typeof window !== "undefined") {
    const subdomain = window.location.hostname.split(".")[0];
    if (subdomain in SUBDOMAIN_MAP) return SUBDOMAIN_MAP[subdomain];
  }
  // Fallback : pme (ton front actuel par défaut)
  return "pme";
}