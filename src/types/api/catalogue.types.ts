// src/types/api/catalogue.types.ts

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES LEGACY — utilisés par src/components/catalogue/ et modules/catalogue/
// NE PAS MODIFIER — APPEND ONLY
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES KNOWLEDGE BASE — module catalogue (P4)
// Utilisés par src/app/(dashboard)/knowledge/_components/catalogue/
// Alignés sur apps/knowledge/models.py — mis à jour S37
// ═══════════════════════════════════════════════════════════════════════════════

// ── Produits (ecommerce) ──────────────────────────────────────────────────────

export interface CatalogueProduit {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description_fr?: string;
  prix: number | null;
  is_available: boolean;
  ordre: number;
  // Champs étendus — utilisés dans CatalogueProduitTab
  reference?: string;
  stock?: number;       // -1 = illimité, 0 = rupture, >0 = quantité
  image_url?: string;
  created_at: string;
  updated_at: string;
}
export type CreateCatalogueProduitPayload = Omit<
  CatalogueProduit, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateCatalogueProduitPayload = Partial<CreateCatalogueProduitPayload>;

// ── Services (pme) ────────────────────────────────────────────────────────────

export interface CatalogueService {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description_fr?: string;
  prix: number | null;
  is_available: boolean;
  ordre: number;
  // Champs étendus — utilisés dans CatalogueServiceTab
  duree_min?: number | null;   // durée en minutes   // durée en minutes
  image_url?: string;
  created_at: string;
  updated_at: string;
}
export type CreateCatalogueServicePayload = Omit<
  CatalogueService, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateCatalogueServicePayload = Partial<CreateCatalogueServicePayload>;

// ── Trajets (transport) ───────────────────────────────────────────────────────

export interface CatalogueTrajet {
  id: string;
  entreprise: string;
  depart_fr: string;
  destination_fr: string;
  tarif: number | null;
  duree_estimee?: string;
  horaires_depart: string[];
  is_available: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}
export type CreateCatalogueTrajetPayload = Omit<
  CatalogueTrajet, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateCatalogueTrajetPayload = Partial<CreateCatalogueTrajetPayload>;

// ── Produits financiers (banque) ──────────────────────────────────────────────

export type TypeProduitFinancier =
  | "compte_courant" | "compte_epargne"
  | "credit" | "assurance" | "investissement";

export interface ProduitFinancier {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description_fr?: string;
  type_produit: TypeProduitFinancier;
  taux_interet: number | null;
  montant_min: number | null;
  montant_max: number | null;
  conditions?: string;
  is_available: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}
export type CreateProduitFinancierPayload = Omit<
  ProduitFinancier, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateProduitFinancierPayload = Partial<CreateProduitFinancierPayload>;