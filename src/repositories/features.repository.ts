// src/repositories/features.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

// ActiveFeature — compatible ancien et nouveau backend.
// Les champs du nouveau backend (id, nom, description...) sont optionnels :
// s'ils sont absents (ancien backend), rien ne casse.
export interface ActiveFeature {
  slug: string;
  is_active: boolean;
  // Champs optionnels — présents uniquement avec le nouveau backend AGT v2
  id?: string;
  nom?: string;
  description?: string;
  categorie?: 'base' | 'sectorielle';
  icone?: string;
  is_mandatory?: boolean;
  config?: Record<string, unknown>;
  // Champs legacy — ancien backend uniquement
  label_fr?: string;
  label_en?: string;
}

export interface ActiveFeaturesResponse {
  features: ActiveFeature[];
}

export interface ToggleFeatureResponse {
  slug: string;
  is_active: boolean;
  updated_at: string;
}

export const featuresRepository = {

  // GET /api/v1/features/active/
  // Normalise les 3 formats possibles : { features: [] }, résultat paginé, tableau direct
  getActive: (): Promise<ActiveFeaturesResponse> =>
    api
      .get("/api/v1/features/active/")
      .then((data: unknown) => {
        if (Array.isArray(data)) return { features: data as ActiveFeature[] };
        const pag = data as PaginatedResponse<ActiveFeature> | ActiveFeaturesResponse;
        if ("features" in pag) return pag;
        return { features: (pag as PaginatedResponse<ActiveFeature>).results ?? [] };
      })
      .catch(() => ({ features: [] })),

  // POST /api/v1/features/{slug}/toggle/
  // Erreur 400 FEATURE_MANDATORY si la feature est obligatoire — à gérer côté appelant
  toggle: (slug: string, is_active: boolean): Promise<ToggleFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/toggle/`, { is_active }),
};