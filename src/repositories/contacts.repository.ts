// src/repositories/contacts.repository.ts
// Repository CRM — /api/v1/contacts/
// Pattern identique aux autres repositories du projet.

import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api/shared.types";
import type {
  Contact,
  ContactDetail,
  ContactFilters,
  ConversationCRM,
  ConversationCRMFilters,
  ContactAnalyseResponse,
} from "@/types/api/crm.types";

const BASE = "/api/v1/contacts";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const contactsRepository = {
  // ── Liste paginée + filtres ────────────────────────────────────────────────
  getList: (filters?: ContactFilters): Promise<PaginatedResponse<Contact>> =>
    api.get(`${BASE}/`, { params: p(filters) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Contact[], count: (data as Contact[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Contact>),
    ),

  // ── Fiche complète ─────────────────────────────────────────────────────────
  getById: (id: string): Promise<ContactDetail> =>
    api.get(`${BASE}/${id}/`) as Promise<ContactDetail>,

  // ── Mise à jour (statut, tags, metadata) ─────────────────────────────────
  patch: (id: string, payload: Partial<Pick<Contact, "statut" | "tags" | "nom" | "prenom" | "email">>): Promise<ContactDetail> =>
    api.patch(`${BASE}/${id}/`, payload) as Promise<ContactDetail>,

  // ── Conversations du contact + rapports IA ────────────────────────────────
  getConversations: (id: string, filters?: ConversationCRMFilters): Promise<PaginatedResponse<ConversationCRM>> =>
    api.get(`${BASE}/${id}/conversations/`, { params: p(filters) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as ConversationCRM[], count: (data as ConversationCRM[]).length, next: null, previous: null }
        : (data as PaginatedResponse<ConversationCRM>),
    ),

  // ── Analyse KPIs + comportemental ─────────────────────────────────────────
  getAnalyse: (id: string): Promise<ContactAnalyseResponse> =>
    api.get(`${BASE}/${id}/analyse/`) as Promise<ContactAnalyseResponse>,

  // ── Ajouter une note ──────────────────────────────────────────────────────
  addNote: (id: string, text: string): Promise<{ note: object; notes: object[] }> =>
    api.post(`${BASE}/${id}/notes/`, { text }) as Promise<{ note: object; notes: object[] }>,

  // ── Gérer les tags ────────────────────────────────────────────────────────
  addTag: (id: string, tag: string): Promise<{ tags: string[] }> =>
    api.post(`${BASE}/${id}/tags/`, { tag, action: "add" }) as Promise<{ tags: string[] }>,

  removeTag: (id: string, tag: string): Promise<{ tags: string[] }> =>
    api.post(`${BASE}/${id}/tags/`, { tag, action: "remove" }) as Promise<{ tags: string[] }>,
};