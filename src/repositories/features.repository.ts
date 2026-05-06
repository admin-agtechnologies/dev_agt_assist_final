// src/repositories/features.repository.ts
import { api } from "@/lib/api-client";
import type { SectorSlug } from "@/lib/sector-config";
import { ENV } from "@/lib/env";

export interface ActiveFeature {
  id?: string;
  slug: string;
  nom: string;
  description?: string;
  categorie: "base" | "sectorielle";
  icone: string;
  is_active: boolean;
  is_mandatory?: boolean;
  config?: Record<string, unknown>;
  ordre?: number;
}

export interface ActiveFeaturesResponse {
  features: ActiveFeature[];
}

// ── Fallback local si le backend n'est pas encore prêt ───────────────────────
// Slugs alignés exactement avec le seed backend (04_seed_data.md)
const FALLBACK_FEATURES: Record<SectorSlug, string[]> = {
  hotel: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "reservation_chambre", "conciergerie",
  ],
  restaurant: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "reservation_table", "menu_digital", "commande_paiement",
  ],
  clinical: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "prise_rdv", "orientation_patient",
  ],
  banking: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "catalogue_produits_financiers", "multi_agences",
  ],
  school: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "inscription_admission", "communication_etablissement", "prise_rdv",
  ],
  ecommerce: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "catalogue_produits", "commande_paiement", "suivi_commande",
  ],
  transport: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "catalogue_trajets", "reservation_billet",
  ],
  pme: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "catalogue_services", "prise_rdv", "conversion_prospects",
  ],
  public: [
    "dashboard", "chatbot_whatsapp", "agent_vocal",
    "faq", "emails_rappel",
    "orientation_citoyens", "prise_rdv",
  ],
  custom: [
    "dashboard", "chatbot_whatsapp", "faq",
  ],
  central: [
    "dashboard",
  ],
};

function buildFallback(sector: SectorSlug): ActiveFeaturesResponse {
  const slugs = FALLBACK_FEATURES[sector] ?? FALLBACK_FEATURES.pme;
  return {
    features: slugs.map((slug, i) => ({
      slug,
      nom: slug,
      categorie: i < 6 ? "base" : "sectorielle",
      icone: "circle",
      is_active: true,
      is_mandatory: slug === "dashboard" || slug === "faq",
      ordre: i,
    })),
  };
}

// ── Repository ────────────────────────────────────────────────────────────────
export const featuresRepository = {
  // GET /api/v1/features/active/
  getActive: async (): Promise<ActiveFeaturesResponse> => {
    try {
      return await api.get<ActiveFeaturesResponse>("/api/v1/features/active/");
    } catch {
      // Fallback si le backend n'est pas encore prêt
      const sector = (ENV.SECTOR || "pme") as SectorSlug;
      return buildFallback(sector);
    }
  },

  // POST /api/v1/features/{slug}/toggle/
  toggle: async (
    slug: string,
    isActive: boolean
  ): Promise<ActiveFeature> => {
    return api.post<ActiveFeature>(`/api/v1/features/${slug}/toggle/`, {
      is_active: isActive,
    });
  },
};