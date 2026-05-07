// src/repositories/contacts.repository.ts
import { api } from "@/lib/api-client";
import type {
  Client,
  CreateClientPayload,
  RendezVous,
  CreateRendezVousPayload,
  RendezVousFilters,
  PolitiqueRappel,
  CreatePolitiqueRappelPayload,
  PaginatedResponse,
} from "@/types/api";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const clientsRepository = {
  getList: (): Promise<Client[]> =>
    api
      .get("/api/v1/appointments/clients/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as Client[])
          : ((data as PaginatedResponse<Client>).results ?? []),
      ),
  create: (payload: CreateClientPayload): Promise<Client> =>
    api.post("/api/v1/appointments/clients/", payload),
};

export const rendezVousRepository = {
  getList: (f?: RendezVousFilters): Promise<PaginatedResponse<RendezVous>> =>
    api.get("/api/v1/appointments/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as RendezVous[],
            count: (data as RendezVous[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<RendezVous>),
    ),
  getById: (id: string): Promise<RendezVous> =>
    api.get(`/api/v1/appointments/${id}/`),
  create: (payload: CreateRendezVousPayload): Promise<RendezVous> =>
    api.post("/api/v1/appointments/", payload),
  patch: (
    id: string,
    payload: Partial<CreateRendezVousPayload>,
  ): Promise<RendezVous> =>
    api.patch(`/api/v1/appointments/${id}/`, payload),
  confirmer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/confirmer/`, {}),
  annuler: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/annuler/`, {}),
  terminer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/terminer/`, {}),
};

export const politiquesRappelRepository = {
  getList: (): Promise<PaginatedResponse<PolitiqueRappel>> =>
    api
      .get("/api/v1/appointments/politiques-rappel/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? {
              results: data as PolitiqueRappel[],
              count: (data as PolitiqueRappel[]).length,
              next: null,
              previous: null,
            }
          : (data as PaginatedResponse<PolitiqueRappel>),
      ),
  create: (payload: CreatePolitiqueRappelPayload): Promise<PolitiqueRappel> =>
    api.post("/api/v1/appointments/politiques-rappel/", payload),
  patch: (
    id: string,
    payload: Partial<CreatePolitiqueRappelPayload>,
  ): Promise<PolitiqueRappel> =>
    api.patch(`/api/v1/appointments/politiques-rappel/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/appointments/politiques-rappel/${id}/`),
};