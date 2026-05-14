// src/repositories/rendezVous.repository.ts
// Repository rendez-vous métier — /api/v1/services/rendez-vous/

import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api/shared.types";
import type { RendezVous, CreateRendezVousPayload } from "@/types/api/contact.types";

// Ré-exporter les types pour les consumers qui importent depuis ce module
export type { RendezVous, CreateRendezVousPayload };

const BASE = "/api/v1/services/rendez-vous";

export const rendezVousRepository = {
  getList: (filters?: Record<string, string>): Promise<PaginatedResponse<RendezVous>> =>
    api.get(`${BASE}/`, { params: filters }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as RendezVous[], count: (data as RendezVous[]).length, next: null, previous: null }
        : (data as PaginatedResponse<RendezVous>),
    ),

  getById: (id: string): Promise<RendezVous> =>
    api.get(`${BASE}/${id}/`) as Promise<RendezVous>,

  create: (payload: CreateRendezVousPayload): Promise<RendezVous> =>
    api.post(`${BASE}/`, payload) as Promise<RendezVous>,

  patch: (id: string, payload: Partial<CreateRendezVousPayload> & { statut?: string }): Promise<RendezVous> =>
    api.patch(`${BASE}/${id}/`, payload) as Promise<RendezVous>,

  confirmer: (id: string): Promise<RendezVous> =>
    api.post(`${BASE}/${id}/confirmer/`, {}) as Promise<RendezVous>,

  annuler: (id: string): Promise<RendezVous> =>
    api.post(`${BASE}/${id}/annuler/`, {}) as Promise<RendezVous>,

  terminer: (id: string): Promise<RendezVous> =>
    api.post(`${BASE}/${id}/terminer/`, {}) as Promise<RendezVous>,
};