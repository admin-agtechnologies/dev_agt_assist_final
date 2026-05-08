// src/types/api/catalogue.types.ts
export interface ItemCatalogue {
  id: string;
  nom: string;
  description: string;
  prix: number | null;
  devise: string;
  est_gratuit: boolean;
  est_sur_devis: boolean;
  disponible: boolean;
  ordre: number;
  metadata: Record<string, unknown>;
}

export interface CategorieCatalogue {
  id: string;
  nom: string;
  ordre: number;
  is_active: boolean;
  items: ItemCatalogue[];
}

export interface Catalogue {
  id: string;
  nom: string;
  description: string;
  feature_slug: string;
  agence_id: string;
  is_active: boolean;
  categories_count: number;
  created_at: string;
}

export interface CatalogueDetail extends Catalogue {
  categories: CategorieCatalogue[];
}

export interface CreateCataloguePayload {
  nom: string;
  description?: string;
  feature_slug: string;
  agence_id: string;
  is_active?: boolean;
}

export interface CreateCategoriePayload {
  nom: string;
  description?: string;
  ordre?: number;
}

export interface CreateItemPayload {
  nom: string;
  description?: string;
  prix?: number | null;
  devise?: string;
  est_gratuit?: boolean;
  est_sur_devis?: boolean;
  disponible?: boolean;
  ordre?: number;
  metadata?: Record<string, unknown>;
}

export interface CatalogueFilters {
  feature_slug?: string;
  agence_id?: string;
  page?: number;
  page_size?: number;
}