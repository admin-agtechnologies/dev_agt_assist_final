// src/repositories/features.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

export interface ActiveFeature {
  id: string;
  slug: string;
  nom?: string;
  description?: string;
  categorie?: "base" | "sectorielle";
  icone?: string;
  is_active: boolean;
  is_mandatory?: boolean;
  is_pinned?: boolean;
  used?: number;
  quota?: number | null;
  is_unlimited?: boolean;
  included_in_plan?: boolean;
  config?: Record<string, unknown>;
}

export interface ActiveFeaturesResponse {
  features: ActiveFeature[];
}

export interface ToggleFeatureResponse {
  slug: string;
  is_active: boolean;
  updated_at: string;
}

export interface PinFeatureResponse {
  slug: string;
  is_pinned: boolean;
  updated_at: string;
}

export const featuresRepository = {
  getActive: (): Promise<ActiveFeaturesResponse> =>
    api
      .get("/api/v1/features/active/")
      .then((data: unknown) => {
        if (Array.isArray(data)) return { features: data as ActiveFeature[] };
        const d = data as PaginatedResponse<ActiveFeature> | ActiveFeaturesResponse;
        if ("features" in d) return d;
        return { features: (d as PaginatedResponse<ActiveFeature>).results ?? [] };
      })
      .catch(() => ({ features: [] })),

  toggle: (slug: string, is_active: boolean): Promise<ToggleFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/toggle/`, { is_active }),

  pin: (slug: string): Promise<PinFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/pin/`, {}),
};