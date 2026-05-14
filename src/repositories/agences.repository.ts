// src/repositories/agences.repository.ts
// Repository pour le nouveau endpoint /api/v1/tenants/agences/ (Knowledge V2)
// Utilise AgenceKnowledge — NE PAS confondre avec Agence (ancien endpoint)

import { api } from "@/lib/api-client";
import type {
  AgenceKnowledge,
  CreateAgenceKnowledgePayload,
  UpdateAgenceKnowledgePayload,
  HorairesAgence,
} from "@/types/api/agence.types";

function extractList(data: unknown): AgenceKnowledge[] {
  if (Array.isArray(data)) return data as AgenceKnowledge[];
  const paged = data as { results?: AgenceKnowledge[] };
  return paged.results ?? [];
}

export const agencesRepository = {
  getList: (): Promise<AgenceKnowledge[]> =>
    api.get("/api/v1/tenants/agences/").then(extractList),

  getSiege: (): Promise<AgenceKnowledge> =>
    api.get("/api/v1/tenants/agences/siege/"),

  getById: (id: string): Promise<AgenceKnowledge> =>
    api.get(`/api/v1/tenants/agences/${id}/`),

  create: (payload: CreateAgenceKnowledgePayload): Promise<AgenceKnowledge> =>
    api.post("/api/v1/tenants/agences/", payload),

  update: (id: string, payload: UpdateAgenceKnowledgePayload): Promise<AgenceKnowledge> =>
    api.patch(`/api/v1/tenants/agences/${id}/`, payload),

  setHoraires: (id: string, horaires: HorairesAgence): Promise<AgenceKnowledge> =>
    api.patch(`/api/v1/tenants/agences/${id}/`, { horaires }),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/tenants/agences/${id}/`),
};