// src/types/api/catalogue.types.ts
// Migration S1/S2 → S3 (B5 S38)
//
// SUPPRIMÉ (S2 legacy) :
//   CatalogueProduit, CatalogueService, CatalogueTrajet, ProduitFinancier
//   et leurs Create/Update payloads
//
// AJOUTÉ (S3 canonique) :
//   CatalogueItemKB     — type unifié pour produits, services, trajets, menu
//   ProduitFinancierKB  — étend CatalogueItemKB avec DetailsFinanciers
//
// CONSERVÉ inchangé :
//   Catalogue, CatalogueDetail, CategorieCatalogue, ItemCatalogue,
//   CreateCataloguePayload, CreateCategoriePayload, CreateItemPayload,
//   CatalogueFilters (utilisés par catalogues.repository.ts)

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES CATALOGUE GÉNÉRIQUE (catalogues.repository.ts — non modifiés)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Catalogue {
  id: string;
  entreprise: string;
  agence: string;
  agence_id: string; 
  feature: string;
  feature_slug: string;
  nom: string;
  categories_count: number;
  description?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CategorieCatalogue {
  id: string;
  catalogue: string;
  nom: string;
  description?: string;
  ordre: number;
  is_active: boolean;
  items: ItemCatalogue[];
  metadata?: Record<string, unknown>;
}

export interface ItemCatalogue {
  id: string;
  categorie: string;
  nom: string;
  description?: string;
  prix?: number | null;
  devise?: string;
  est_gratuit?: boolean;
  est_sur_devis?: boolean;
  disponible: boolean;
  ordre: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CatalogueDetail extends Catalogue {
  categories: Array<CategorieCatalogue & { items: ItemCatalogue[] }>;
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
// TYPES KNOWLEDGE BASE S3 — ItemCatalogueKB
// Alignés sur ItemCatalogueKBSerializer (B5 S38)
// Utilisés par src/app/(dashboard)/knowledge/_components/catalogue/
// ═══════════════════════════════════════════════════════════════════════════════

/** Type unifié S3 pour tous les tabs catalogue KB (produits, services, trajets, menu). */
export interface CatalogueItemKB {
  id: string;
  // Champs calculés par le serializer
  feature_slug: string | null;
  categorie: string;          // UUID de la CategorieCatalogue
  categorie_nom: string | null;
  agence_id: string;
  categories_count: number;
  // Champs principaux
  nom: string;
  description?: string;
  prix: number | null;
  devise: string;
  est_gratuit: boolean;
  est_sur_devis: boolean;
  disponible: boolean;
  ordre: number;
  // S33 — enrichissements
  action_suivante: "aucune" | "proposer_rdv" | "proposer_commande" | "traiter_demande";
  image_url?: string;
  temps_preparation_min?: number | null;
  allergenes?: string[];
  est_disponible_aujourd_hui: boolean;
  stock?: number | null;
  poids_grammes?: number | null;
  reference_sku?: string;
  marque?: string;
  unite_mesure?: string;
  duree_validite?: string;
  details_financiers?: DetailsFinanciersKB | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type CreateCatalogueItemKBPayload = {
  nom: string;
  description?: string;
  prix?: number | null;
  devise?: string;
  est_gratuit?: boolean;
  est_sur_devis?: boolean;
  disponible?: boolean;
  ordre?: number;
  action_suivante?: CatalogueItemKB["action_suivante"];
  image_url?: string;
  temps_preparation_min?: number | null;
  allergenes?: string[];
  est_disponible_aujourd_hui?: boolean;
  stock?: number | null;
  reference_sku?: string;
  marque?: string;
  unite_mesure?: string;
  duree_validite?: string;
  // Catégorie : passer l'id d'une catégorie existante OU `categorie_nom` pour auto-création
  categorie?: string;
  categorie_nom?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateCatalogueItemKBPayload = Partial<CreateCatalogueItemKBPayload>;

// ── DetailsFinanciers (banking) ───────────────────────────────────────────────

export type GrandTypeFinancier =
  | "compte" | "credit" | "epargne" | "carte" | "transfert" | "autre";

export type TauxTypeFinancier = "fixe" | "variable" | "negocie";

export interface DetailsFinanciersKB {
  id: string;
  grand_type: GrandTypeFinancier;
  sous_type?: string;
  taux_annuel_min?: number | null;
  taux_annuel_max?: number | null;
  taux_type: TauxTypeFinancier;
  montant_min?: number | null;
  montant_max?: number | null;
  devise: string;
  duree_min_mois?: number | null;
  duree_max_mois?: number | null;
  documents_requis?: string[];
  delai_traitement?: string;
  conditions_specifiques?: Record<string, unknown>;
  mis_a_jour_le: string;
}

/** ProduitFinancierKB étend CatalogueItemKB avec details_financiers obligatoires. */
export interface ProduitFinancierKB extends CatalogueItemKB {
  details_financiers: DetailsFinanciersKB;
}

export type CreateProduitFinancierKBPayload = CreateCatalogueItemKBPayload & {
  details_financiers?: Partial<DetailsFinanciersKB>;
};

export type UpdateProduitFinancierKBPayload = Partial<CreateProduitFinancierKBPayload>;