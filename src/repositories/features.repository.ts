// src/repositories/features.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

export interface ActiveFeature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en?: string;
  description?: string;
  categorie?: string;
  icone?: string;
  is_active: boolean;
  is_desired: boolean;        // ← choix explicite à l'inscription
  is_mandatory?: boolean;
  is_pinned?: boolean;
  used?: number | null;
  prix_unitaire?: number | null;
  quota?: number | null;
  is_unlimited?: boolean;
  included_in_plan?: boolean;
  config?: Record<string, unknown>;
}

export interface SectorFeature {
  id: string; slug: string; nom_fr: string; nom_en: string;
  icone: string; categorie: string; is_default: boolean; is_mandatory: boolean; quota_unitaire?: number;
  prix_unitaire?: number;
}

export interface ActiveFeaturesResponse { features: ActiveFeature[]; count?: number; }
export interface ToggleFeatureResponse  { slug: string; is_active: boolean; updated_at: string; }
export interface PinFeatureResponse     { slug: string; is_pinned: boolean; updated_at: string; }

const normalize = (data: unknown): ActiveFeaturesResponse => {
  if (Array.isArray(data)) return { features: data as ActiveFeature[] };
  const d = data as PaginatedResponse<ActiveFeature> | ActiveFeaturesResponse;
  if ("features" in d) return d as ActiveFeaturesResponse;
  return { features: (d as PaginatedResponse<ActiveFeature>).results ?? [] };
};

export const featuresRepository = {
  getActive: (): Promise<ActiveFeaturesResponse> =>
    api.get("/api/v1/features/active/").then(normalize).catch(() => ({ features: [] })),

  getDesired: (): Promise<ActiveFeaturesResponse> =>
    api.get("/api/v1/features/desired/").then(normalize).catch(() => ({ features: [] })),

  getSectorFeatures: (sectorSlug: string): Promise<SectorFeature[]> =>
    api.get(`/api/v1/features/by-sector/?sector=${sectorSlug}`)
      .then((d: unknown) => (d as { features?: SectorFeature[] }).features ?? [])
      .catch(() => []),

  toggle: (slug: string, is_active: boolean): Promise<ToggleFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/toggle/`, { is_active }),

  pin: (slug: string): Promise<PinFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/pin/`, {}),
};