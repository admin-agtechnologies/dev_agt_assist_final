// src/repositories/results.repository.ts
// Endpoints Results — données créées par le bot, lues par le tenant.
// Distinct des repositories KB (configuration).

import { api } from "@/lib/api-client";
import type { PaginatedResponse }          from "@/types/api";
import type { Reservation, ReservationFilters } from "@/types/api/reservation.types";
import type {
  CommandeResult, CommandeResultFilters,
  DossierResult, InscriptionResult,
  TransfertHumainResult, DemandeConciergerieResult,
  EmailLogResult, ConsultationFAQResult, ConsultationFAQFilters,
} from "@/types/api/results.types";
import type { Contact, ContactFilters } from "@/types/api/crm.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

const toPage = <T>(data: unknown): PaginatedResponse<T> =>
  Array.isArray(data)
    ? { results: data as T[], count: (data as T[]).length, next: null, previous: null }
    : (data as PaginatedResponse<T>);

// ── Réservations Results ──────────────────────────────────────────────────────
export const reservationsResultRepository = {
  getList: (f?: ReservationFilters): Promise<PaginatedResponse<Reservation>> =>
    api.get("/api/v1/reservations/", { params: p(f) }).then(toPage<Reservation>),

  updateStatut: (id: string, statut: string) =>
    api.patch(`/api/v1/reservations/${id}/statut/`, { statut }) as Promise<Reservation>,
};

// ── Commandes Results ─────────────────────────────────────────────────────────
export const commandesResultRepository = {
  getList: (f?: CommandeResultFilters): Promise<PaginatedResponse<CommandeResult>> =>
    api.get("/api/v1/catalogue/commandes/", { params: p(f) }).then(toPage<CommandeResult>),

  updateStatut: (id: string, statut: string) =>
    api.patch(`/api/v1/catalogue/commandes/${id}/statut/`, { statut }) as Promise<CommandeResult>,
};

// ── Inscriptions Results ──────────────────────────────────────────────────────
export const inscriptionsResultRepository = {
  getList: (f?: { statut?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<InscriptionResult>> =>
    api.get("/api/v1/inscriptions/", { params: p(f) }).then(toPage<InscriptionResult>),
};

// ── Dossiers Results ──────────────────────────────────────────────────────────
export const dossiersResultRepository = {
  getList: (f?: { statut?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<DossierResult>> =>
    api.get("/api/v1/dossiers/", { params: p(f) }).then(toPage<DossierResult>),
};

// ── Contacts Results ──────────────────────────────────────────────────────────
export const contactsResultRepository = {
  getList: (f?: ContactFilters): Promise<PaginatedResponse<Contact>> =>
    api.get("/api/v1/contacts/", { params: p(f) }).then(toPage<Contact>),
};

// ── Transferts humains Results ────────────────────────────────────────────────
export const transfertsResultRepository = {
  getList: (f?: { statut?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<TransfertHumainResult>> =>
    api.get("/api/v1/knowledge/transferts-humains/", { params: p(f) }).then(toPage<TransfertHumainResult>),

  updateStatut: (id: string, statut: string) =>
    api.patch(`/api/v1/knowledge/transferts-humains/${id}/statut/`, { statut }) as Promise<TransfertHumainResult>,
};

// ── Demandes conciergerie Results ─────────────────────────────────────────────
export const conciergerieResultRepository = {
  getList: (f?: { statut?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<DemandeConciergerieResult>> =>
    api.get("/api/v1/knowledge/demandes-conciergerie/", { params: p(f) }).then(toPage<DemandeConciergerieResult>),

  updateStatut: (id: string, statut: string) =>
    api.patch(`/api/v1/knowledge/demandes-conciergerie/${id}/statut/`, { statut }) as Promise<DemandeConciergerieResult>,
};

// ── Email logs Results ────────────────────────────────────────────────────────
export const emailLogsResultRepository = {
  getList: (f?: { statut?: string; source_type?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<EmailLogResult>> =>
    api.get("/api/v1/notifications/email-logs/", { params: p(f) }).then(toPage<EmailLogResult>),
};

// ── Consultations FAQ Results ─────────────────────────────────────────────────
export const consultationsFAQResultRepository = {
  getList: (f?: ConsultationFAQFilters): Promise<PaginatedResponse<ConsultationFAQResult>> =>
    api.get("/api/v1/knowledge/consultations-faq/", { params: p(f) }).then(toPage<ConsultationFAQResult>),
};