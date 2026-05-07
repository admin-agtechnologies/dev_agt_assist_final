// src/repositories/agences.repository.ts
import { api } from "@/lib/api-client";
import type {
  Agence,
  CreateAgencePayload,
  HorairesOuverture,
  UpdateHorairesPayload,
  Agenda,
  CreateAgendaPayload,
  Service,
  CreateServicePayload,
  ServiceFilters,
  PaginatedResponse,
} from "@/types/api";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const agencesRepository = {
  getList: (): Promise<PaginatedResponse<Agence>> =>
    api.get("/api/v1/services/agences/").then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Agence[],
            count: (data as Agence[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Agence>),
    ),
  getSiege: (): Promise<Agence> =>
    api.get("/api/v1/services/agences/siege/"),
  getById: (id: string): Promise<Agence> =>
    api.get(`/api/v1/services/agences/${id}/`),
  create: (payload: CreateAgencePayload): Promise<Agence> =>
    api.post("/api/v1/services/agences/", payload),
  patch: (
    id: string,
    payload: Partial<CreateAgencePayload>,
  ): Promise<Agence> =>
    api.patch(`/api/v1/services/agences/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/services/agences/${id}/`),
  addService: (agenceId: string, serviceId: string): Promise<unknown> =>
    api.post(`/api/v1/services/agences/${agenceId}/services/add/`, {
      service_id: serviceId,
    }),
  removeService: (agenceId: string, serviceId: string): Promise<void> =>
    api.post(`/api/v1/services/agences/${agenceId}/services/remove/`, {
      service_id: serviceId,
    }),
};

export const horairesRepository = {
  getList: (type?: "ouverture" | "rendez_vous"): Promise<HorairesOuverture[]> =>
    api
      .get("/api/v1/services/horaires/", { params: p({ type }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HorairesOuverture[])
          : ((data as PaginatedResponse<HorairesOuverture>).results ?? []),
      ),
  getListByAgence: (agenceId: string): Promise<HorairesOuverture[]> =>
    api
      .get("/api/v1/services/horaires/", { params: p({ agence: agenceId }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HorairesOuverture[])
          : ((data as PaginatedResponse<HorairesOuverture>).results ?? []),
      ),
  create: (
    payload: UpdateHorairesPayload & {
      agence_id: string;
      type: "ouverture" | "rendez_vous";
    },
  ): Promise<HorairesOuverture> =>
    api.post("/api/v1/services/horaires/", payload),
  patch: (
    id: string,
    payload: UpdateHorairesPayload,
  ): Promise<HorairesOuverture> =>
    api.patch(`/api/v1/services/horaires/${id}/`, payload),
};

export const agendasRepository = {
  getList: (): Promise<Agenda[]> =>
    api
      .get("/api/v1/services/agendas/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as Agenda[])
          : ((data as PaginatedResponse<Agenda>).results ?? []),
      ),
  getById: (id: string): Promise<Agenda> =>
    api.get(`/api/v1/services/agendas/${id}/`),
  create: (payload: CreateAgendaPayload): Promise<Agenda> =>
    api.post("/api/v1/services/agendas/", payload),
  patch: (
    id: string,
    payload: Partial<CreateAgendaPayload>,
  ): Promise<Agenda> =>
    api.patch(`/api/v1/services/agendas/${id}/`, payload),
};

export const servicesRepository = {
  getList: (f?: ServiceFilters): Promise<PaginatedResponse<Service>> =>
    api.get("/api/v1/services/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Service[],
            count: (data as Service[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Service>),
    ),
  getById: (id: string): Promise<Service> =>
    api.get(`/api/v1/services/${id}/`),
  create: (payload: CreateServicePayload): Promise<Service> =>
    api.post("/api/v1/services/", payload),
  patch: (
    id: string,
    payload: Partial<CreateServicePayload>,
  ): Promise<Service> =>
    api.patch(`/api/v1/services/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/services/${id}/`),
};