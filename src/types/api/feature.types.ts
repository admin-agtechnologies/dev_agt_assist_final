// src/types/api/feature.types.ts
export interface Feature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en: string;
  icone: string;
  categorie: 'base' | 'sectorielle';
  is_active: boolean;
  is_mandatory: boolean;
}

export interface TenantFeature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en: string;
  icone: string;
  categorie: 'base' | 'sectorielle';
  is_active: boolean;
  is_mandatory: boolean;
  quota: number;
  is_unlimited: boolean;
}

export interface ActiveFeaturesResponse {
  features: TenantFeature[];
  count: number;
}

export interface ToggleFeatureResponse {
  slug: string;
  is_active: boolean;
  updated_at: string;
}