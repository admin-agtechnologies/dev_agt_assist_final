// src/repositories/appointments.repository.ts
// horairesRepository + agendasRepository
// Extraits de l'ancien agences.repository.ts (remplacé par Knowledge V2 en S20)
// ⚠️ Ne pas confondre avec agencesRepository (Knowledge, /api/v1/tenants/agences/)
//    Ces repos pointent vers /api/v1/services/ (appointments)

import { api } from "@/lib/api-client";
import type {
  HorairesOuverture,
  UpdateHorairesPayload,
  Agenda,
  CreateAgendaPayload,
} from "@/types/api/agence.types";
import type { PaginatedResponse } from "@/types/api/shared.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

// ── Horaires d'ouverture / RDV ────────────────────────────────────────────────

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

// ── Agendas ───────────────────────────────────────────────────────────────────

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