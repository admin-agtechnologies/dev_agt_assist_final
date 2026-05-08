// src/repositories/catalogues.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Catalogue,
  CatalogueDetail,
  CatalogueFilters,
  CreateCataloguePayload,
  CreateCategoriePayload,
  CreateItemPayload,
  ItemCatalogue,
  CategorieCatalogue,
} from "@/types/api/catalogue.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const cataloguesRepository = {
  list: (f?: CatalogueFilters): Promise<PaginatedResponse<Catalogue>> =>
    api.get("/api/v1/catalogues/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Catalogue[], count: (data as Catalogue[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Catalogue>),
    ),

  getById: (id: string): Promise<CatalogueDetail> =>
    api.get(`/api/v1/catalogues/${id}/`),

  create: (payload: CreateCataloguePayload): Promise<Catalogue> =>
    api.post("/api/v1/catalogues/", payload),

  addCategorie: (catalogueId: string, payload: CreateCategoriePayload): Promise<CategorieCatalogue> =>
    api.post(`/api/v1/catalogues/${catalogueId}/categories/`, payload),

  addItem: (categorieId: string, payload: CreateItemPayload): Promise<ItemCatalogue> =>
    api.post(`/api/v1/categories/${categorieId}/items/`, payload),

  updateItem: (itemId: string, payload: Partial<CreateItemPayload>): Promise<ItemCatalogue> =>
    api.patch(`/api/v1/items/${itemId}/`, payload),

  deleteItem: (itemId: string): Promise<void> =>
    api.delete(`/api/v1/items/${itemId}/`),
};