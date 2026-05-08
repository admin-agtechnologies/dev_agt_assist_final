// src/repositories/reservations.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Reservation, ReservationFilters, UpdateReservationStatutPayload,
  Ressource, CreateRessourcePayload, RessourceFilters,
  DisponibilitesResponse, SetDisponibilitesPayload,
} from "@/types/api/reservation.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const reservationsRepository = {
  list: (f?: ReservationFilters): Promise<PaginatedResponse<Reservation>> =>
    api.get("/api/v1/reservations/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Reservation[], count: (data as Reservation[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Reservation>),
    ),

  getById: (id: string): Promise<Reservation> =>
    api.get(`/api/v1/reservations/${id}/`),

  updateStatut: (id: string, payload: UpdateReservationStatutPayload): Promise<Reservation> =>
    api.patch(`/api/v1/reservations/${id}/statut/`, payload),

  aRappeler: (): Promise<Reservation[]> =>
    api.get("/api/v1/reservations/a-rappeler/").then((data: unknown) =>
      Array.isArray(data) ? (data as Reservation[]) : [],
    ),
};

export const ressourcesRepository = {
  list: (f?: RessourceFilters): Promise<PaginatedResponse<Ressource>> =>
    api.get("/api/v1/reservations/ressources/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Ressource[], count: (data as Ressource[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Ressource>),
    ),

  create: (payload: CreateRessourcePayload): Promise<Ressource> =>
    api.post("/api/v1/reservations/ressources/", payload),

  getDisponibilites: (id: string): Promise<DisponibilitesResponse> =>
    api.get(`/api/v1/reservations/ressources/${id}/disponibilites/`),

  setDisponibilites: (id: string, payload: SetDisponibilitesPayload): Promise<DisponibilitesResponse> =>
    api.post(`/api/v1/reservations/ressources/${id}/disponibilites/`, payload),
};