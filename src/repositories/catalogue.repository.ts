// src/repositories/catalogue.repository.ts
// Migration S1/S2 → S3 (B5 S38)
// Les 4 repositories KB pointent désormais vers ItemCatalogue S3.
// URLs inchangées côté backend — seuls les types de retour changent.

import { api } from "@/lib/api-client";
import type {
  // S3 — types KB unifiés
  CatalogueItemKB,
  CreateCatalogueItemKBPayload,
  UpdateCatalogueItemKBPayload,
  // ProduitFinancier conserve son type étendu
  ProduitFinancierKB,
  CreateProduitFinancierKBPayload,
  UpdateProduitFinancierKBPayload,
} from "@/types/api/catalogue.types";

const BASE = "/api/v1/knowledge";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

// ── Produits (catalogue_produits — e-commerce) ────────────────────────────────
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

// ── Services (catalogue_services — PME/services) ──────────────────────────────
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

// ── Trajets (catalogue_trajets — transport) ───────────────────────────────────
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

// ── Produits financiers (catalogue_produits_financiers — banking) ─────────────
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

// ── Menu digital (menu_digital — restaurant) ──────────────────────────────────
// Remplace MenuCategorie/MenuPlat S1 supprimés
export const menuDigitalRepository = {
  getList: () =>
    api.get(`${BASE}/menu-items/`).then((d) => toList<CatalogueItemKB>(d)),
  create: (p: CreateCatalogueItemKBPayload) =>
    api.post(`${BASE}/menu-items/`, p) as Promise<CatalogueItemKB>,
  update: (id: string, p: UpdateCatalogueItemKBPayload) =>
    api.patch(`${BASE}/menu-items/${id}/`, p) as Promise<CatalogueItemKB>,
  delete: (id: string) =>
    api.delete(`${BASE}/menu-items/${id}/`) as Promise<void>,
};