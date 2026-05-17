// src/repositories/catalogue.repository.ts
import { api } from "@/lib/api-client";
import type {
  CatalogueProduit,  CreateCatalogueProduitPayload,  UpdateCatalogueProduitPayload,
  CatalogueService,  CreateCatalogueServicePayload,  UpdateCatalogueServicePayload,
  CatalogueTrajet,   CreateCatalogueTrajetPayload,   UpdateCatalogueTrajetPayload,
  ProduitFinancier,  CreateProduitFinancierPayload,  UpdateProduitFinancierPayload,
} from "@/types/api/catalogue.types";

const BASE = "/api/v1/knowledge";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

// ── Produits ──────────────────────────────────────────────────────────────────
export const catalogueProduitRepository = {
  getList: () => api.get(`${BASE}/catalogue-produits/`).then((d) => toList<CatalogueProduit>(d)),
  create:  (p: CreateCatalogueProduitPayload) => api.post(`${BASE}/catalogue-produits/`, p) as Promise<CatalogueProduit>,
  update:  (id: string, p: UpdateCatalogueProduitPayload) => api.patch(`${BASE}/catalogue-produits/${id}/`, p) as Promise<CatalogueProduit>,
  delete:  (id: string) => api.delete(`${BASE}/catalogue-produits/${id}/`) as Promise<void>,
};

// ── Services ──────────────────────────────────────────────────────────────────
export const catalogueServiceRepository = {
  getList: () => api.get(`${BASE}/catalogue-services/`).then((d) => toList<CatalogueService>(d)),
  create:  (p: CreateCatalogueServicePayload) => api.post(`${BASE}/catalogue-services/`, p) as Promise<CatalogueService>,
  update:  (id: string, p: UpdateCatalogueServicePayload) => api.patch(`${BASE}/catalogue-services/${id}/`, p) as Promise<CatalogueService>,
  delete:  (id: string) => api.delete(`${BASE}/catalogue-services/${id}/`) as Promise<void>,
};

// ── Trajets ───────────────────────────────────────────────────────────────────
export const catalogueTrajetRepository = {
  getList: () => api.get(`${BASE}/catalogue-trajets/`).then((d) => toList<CatalogueTrajet>(d)),
  create:  (p: CreateCatalogueTrajetPayload) => api.post(`${BASE}/catalogue-trajets/`, p) as Promise<CatalogueTrajet>,
  update:  (id: string, p: UpdateCatalogueTrajetPayload) => api.patch(`${BASE}/catalogue-trajets/${id}/`, p) as Promise<CatalogueTrajet>,
  delete:  (id: string) => api.delete(`${BASE}/catalogue-trajets/${id}/`) as Promise<void>,
};

// ── Produits financiers ───────────────────────────────────────────────────────
export const produitFinancierRepository = {
  getList: () => api.get(`${BASE}/produits-financiers/`).then((d) => toList<ProduitFinancier>(d)),
  create:  (p: CreateProduitFinancierPayload) => api.post(`${BASE}/produits-financiers/`, p) as Promise<ProduitFinancier>,
  update:  (id: string, p: UpdateProduitFinancierPayload) => api.patch(`${BASE}/produits-financiers/${id}/`, p) as Promise<ProduitFinancier>,
  delete:  (id: string) => api.delete(`${BASE}/produits-financiers/${id}/`) as Promise<void>,
};