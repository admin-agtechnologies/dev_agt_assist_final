// src/repositories/catalogue.repository.ts
// B5 S38/S39 — Migration S2→S3
// Endpoints inchangés (même URLs), types de retour mis à jour → CatalogueItemKB
// Les anciens types CatalogueProduit/Service/Trajet/ProduitFinancier sont supprimés.
import { api } from "@/lib/api-client";
import type {
  Catalogue,               CreateCataloguePayload,
  CatalogueDetail,
  CategorieCatalogue,      CreateCategoriePayload,
  ItemCatalogue,           CreateItemPayload,
  CatalogueFilters,
  CatalogueItemKB,         CreateCatalogueItemKBPayload, UpdateCatalogueItemKBPayload,
  ProduitFinancierKB,      CreateProduitFinancierKBPayload, UpdateProduitFinancierKBPayload,
} from "@/types/api/catalogue.types";

const BASE = "/api/v1/knowledge";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

// ── Catalogues génériques (catalogues.repository — admin) ────────────────────

export const catalogueRepository = {
  getList: (filters?: CatalogueFilters) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.get<Catalogue[]>(`${BASE}/catalogues/`, { params: filters as any }),
  getById: (id: string) =>
    api.get<CatalogueDetail>(`${BASE}/catalogues/${id}/`),
  create: (p: CreateCataloguePayload) =>
    api.post<Catalogue>(`${BASE}/catalogues/`, p),
  update: (id: string, p: Partial<CreateCataloguePayload>) =>
    api.patch<Catalogue>(`${BASE}/catalogues/${id}/`, p),
  delete: (id: string) =>
    api.delete(`${BASE}/catalogues/${id}/`) as Promise<void>,
  addCategorie: (catalogueId: string, p: CreateCategoriePayload) =>
    api.post<CategorieCatalogue>(`${BASE}/catalogues/${catalogueId}/categories/`, p),
  addItem: (categorieId: string, p: CreateItemPayload) =>
    api.post<ItemCatalogue>(`${BASE}/categories/${categorieId}/items/`, p),
};

// ── Produits (ecommerce) — S3 ─────────────────────────────────────────────────

export const catalogueProduitRepository = {
  getList: () =>
    api.get(`${BASE}/catalogue-produits/`).then((d) => toList<CatalogueItemKB>(d)),
  create: (p: CreateCatalogueItemKBPayload) =>
    api.post(`${BASE}/catalogue-produits/`, p) as Promise<CatalogueItemKB>,
  update: (id: string, p: UpdateCatalogueItemKBPayload) =>
    api.patch(`${BASE}/catalogue-produits/${id}/`, p) as Promise<CatalogueItemKB>,
  delete: (id: string) =>
    api.delete(`${BASE}/catalogue-produits/${id}/`) as Promise<void>,
};

// ── Services (pme / hotel / sante) — S3 ──────────────────────────────────────

export const catalogueServiceRepository = {
  getList: () =>
    api.get(`${BASE}/catalogue-services/`).then((d) => toList<CatalogueItemKB>(d)),
  create: (p: CreateCatalogueItemKBPayload) =>
    api.post(`${BASE}/catalogue-services/`, p) as Promise<CatalogueItemKB>,
  update: (id: string, p: UpdateCatalogueItemKBPayload) =>
    api.patch(`${BASE}/catalogue-services/${id}/`, p) as Promise<CatalogueItemKB>,
  delete: (id: string) =>
    api.delete(`${BASE}/catalogue-services/${id}/`) as Promise<void>,
};

// ── Trajets (transport) — S3 ──────────────────────────────────────────────────

export const catalogueTrajetRepository = {
  getList: () =>
    api.get(`${BASE}/catalogue-trajets/`).then((d) => toList<CatalogueItemKB>(d)),
  create: (p: CreateCatalogueItemKBPayload) =>
    api.post(`${BASE}/catalogue-trajets/`, p) as Promise<CatalogueItemKB>,
  update: (id: string, p: UpdateCatalogueItemKBPayload) =>
    api.patch(`${BASE}/catalogue-trajets/${id}/`, p) as Promise<CatalogueItemKB>,
  delete: (id: string) =>
    api.delete(`${BASE}/catalogue-trajets/${id}/`) as Promise<void>,
};

// ── Produits financiers (banque) — S3 ─────────────────────────────────────────

export const produitFinancierRepository = {
  getList: () =>
    api.get(`${BASE}/produits-financiers/`).then((d) => toList<ProduitFinancierKB>(d)),
  create: (p: CreateProduitFinancierKBPayload) =>
    api.post(`${BASE}/produits-financiers/`, p) as Promise<ProduitFinancierKB>,
  update: (id: string, p: UpdateProduitFinancierKBPayload) =>
    api.patch(`${BASE}/produits-financiers/${id}/`, p) as Promise<ProduitFinancierKB>,
  delete: (id: string) =>
    api.delete(`${BASE}/produits-financiers/${id}/`) as Promise<void>,
};

// END OF FILE: src/repositories/catalogue.repository.ts