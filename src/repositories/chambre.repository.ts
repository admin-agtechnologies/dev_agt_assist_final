// src/repositories/chambre.repository.ts
import { api } from "@/lib/api-client";
import type {
  ChambreType,
  CreateChambreTypePayload,
  UpdateChambreTypePayload,
} from "@/types/api/chambre.types";

const BASE = "/api/v1/knowledge/chambre-types";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

export const chambreRepository = {
  /** GET /api/v1/knowledge/chambre-types/ */
  getList: (): Promise<ChambreType[]> =>
    api.get(`${BASE}/`).then((d) => toList<ChambreType>(d)),

  /** POST /api/v1/knowledge/chambre-types/ */
  create: (payload: CreateChambreTypePayload): Promise<ChambreType> =>
    api.post(`${BASE}/`, payload),

  /** PATCH /api/v1/knowledge/chambre-types/{id}/ */
  update: (id: string, payload: UpdateChambreTypePayload): Promise<ChambreType> =>
    api.patch(`${BASE}/${id}/`, payload),

  /** DELETE /api/v1/knowledge/chambre-types/{id}/ */
  delete: (id: string): Promise<void> =>
    api.delete(`${BASE}/${id}/`),
};