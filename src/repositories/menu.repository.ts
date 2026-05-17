// src/repositories/menu.repository.ts
import { api } from "@/lib/api-client";
import type {
  MenuCategorie,
  MenuPlat,
  CreateMenuCategoriePayload,
  UpdateMenuCategoriePayload,
  CreateMenuPlatPayload,
  UpdateMenuPlatPayload,
} from "@/types/api/menu.types";

const BASE = "/api/v1/knowledge";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

export const menuRepository = {
  // ── Catégories ────────────────────────────────────────────────────────────
  /** GET /api/v1/knowledge/menu-categories/ — liste avec plats nestés */
  getCategories: (): Promise<MenuCategorie[]> =>
    api.get(`${BASE}/menu-categories/`).then((d) => toList<MenuCategorie>(d)),

  /** POST /api/v1/knowledge/menu-categories/ */
  createCategorie: (payload: CreateMenuCategoriePayload): Promise<MenuCategorie> =>
    api.post(`${BASE}/menu-categories/`, payload),

  /** PATCH /api/v1/knowledge/menu-categories/{id}/ */
  updateCategorie: (id: string, payload: UpdateMenuCategoriePayload): Promise<MenuCategorie> =>
    api.patch(`${BASE}/menu-categories/${id}/`, payload),

  /** DELETE /api/v1/knowledge/menu-categories/{id}/ */
  deleteCategorie: (id: string): Promise<void> =>
    api.delete(`${BASE}/menu-categories/${id}/`),

  // ── Plats ─────────────────────────────────────────────────────────────────
  /** POST /api/v1/knowledge/menu-plats/ */
  createPlat: (payload: CreateMenuPlatPayload): Promise<MenuPlat> =>
    api.post(`${BASE}/menu-plats/`, payload),

  /** PATCH /api/v1/knowledge/menu-plats/{id}/ */
  updatePlat: (id: string, payload: UpdateMenuPlatPayload): Promise<MenuPlat> =>
    api.patch(`${BASE}/menu-plats/${id}/`, payload),

  /** DELETE /api/v1/knowledge/menu-plats/{id}/ */
  deletePlat: (id: string): Promise<void> =>
    api.delete(`${BASE}/menu-plats/${id}/`),
};