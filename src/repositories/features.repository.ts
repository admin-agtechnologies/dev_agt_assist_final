// src/repositories/features.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

export interface ActiveFeature {
  slug: string;
  is_active: boolean;
  label_fr?: string;
  label_en?: string;
}

export interface ActiveFeaturesResponse {
  features: ActiveFeature[];
}

export const featuresRepository = {
  getActive: (): Promise<ActiveFeaturesResponse> =>
    api
      .get("/api/v1/features/active/")
      .then((data: unknown) => {
        if (Array.isArray(data)) return { features: data as ActiveFeature[] };
        const pag = data as
          | PaginatedResponse<ActiveFeature>
          | ActiveFeaturesResponse;
        if ("features" in pag) return pag;
        return {
          features: (pag as PaginatedResponse<ActiveFeature>).results ?? [],
        };
      })
      .catch(() => ({ features: [] })),
};