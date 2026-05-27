// src/repositories/knowledge.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  FAQ, CreateFAQPayload,
  QuestionFrequente, CreateQuestionPayload,
  TenantKnowledge, CreateTenantKnowledgePayload,
  ServiceKnowledge, CreateServiceKnowledgePayload,
  HelpEntry,
  ScenarioProspection, CreateScenarioProspectionPayload,
} from "@/types/api/knowledge.types";

const toList = <T>(data: unknown): T[] =>
  Array.isArray(data) ? (data as T[]) : ((data as PaginatedResponse<T>).results ?? []);

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const faqRepository = {
  getList: (): Promise<PaginatedResponse<FAQ>> =>
    api.get("/api/v1/knowledge/faqs/").then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as FAQ[], count: (data as FAQ[]).length, next: null, previous: null }
        : (data as PaginatedResponse<FAQ>),
    ),
  create: (payload: CreateFAQPayload): Promise<FAQ> =>
    api.post("/api/v1/knowledge/faqs/", payload),
  patch: (id: string, payload: Partial<CreateFAQPayload>): Promise<FAQ> =>
    api.patch(`/api/v1/knowledge/faqs/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/faqs/${id}/`),
};

// ── Questions ─────────────────────────────────────────────────────────────────

export const questionsRepository = {
  getList: (): Promise<QuestionFrequente[]> =>
    api.get("/api/v1/knowledge/questions/").then((data: unknown) => toList<QuestionFrequente>(data)),
  create: (payload: CreateQuestionPayload): Promise<QuestionFrequente> =>
    api.post("/api/v1/knowledge/questions/", payload),
  patch: (id: string, payload: Partial<CreateQuestionPayload>): Promise<QuestionFrequente> =>
    api.patch(`/api/v1/knowledge/questions/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/questions/${id}/`),
};

// ── Profil entreprise (KB) ────────────────────────────────────────────────────

export const tenantKnowledgeRepository = {
  getMine: (): Promise<TenantKnowledge | null> =>
    api.get("/api/v1/knowledge/profils/").then((data: unknown) => {
      if (Array.isArray(data) && data.length > 0) return data[0] as TenantKnowledge;
      const pag = data as { results?: TenantKnowledge[] };
      return pag.results && pag.results.length > 0 ? pag.results[0] : null;
    }).catch(() => null),
  create: (payload: CreateTenantKnowledgePayload): Promise<TenantKnowledge> =>
    api.post("/api/v1/knowledge/profils/", payload),
  patch: (id: string, payload: Partial<CreateTenantKnowledgePayload>): Promise<TenantKnowledge> =>
    api.patch(`/api/v1/knowledge/profils/${id}/`, payload),
};

// ── Service knowledge ─────────────────────────────────────────────────────────

export const serviceKnowledgeRepository = {
  getByService: (serviceId: string): Promise<ServiceKnowledge> =>
    api.get("/api/v1/knowledge/descriptions/", { params: { service_id: serviceId } })
      .then((data: unknown) =>
        Array.isArray(data) ? (data[0] as ServiceKnowledge) : (data as ServiceKnowledge),
      ),
  create: (payload: CreateServiceKnowledgePayload): Promise<ServiceKnowledge> =>
    api.post("/api/v1/knowledge/descriptions/", payload),
  patch: (id: string, payload: Partial<CreateServiceKnowledgePayload>): Promise<ServiceKnowledge> =>
    api.patch(`/api/v1/knowledge/descriptions/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/descriptions/${id}/`),
};

// ── Aide plateforme ───────────────────────────────────────────────────────────

export const platformHelpRepository = {
  getList: (): Promise<HelpEntry[]> =>
    api.get("/api/v1/platform/help/").then((data: unknown) => toList<HelpEntry>(data)),
};

// ── B5 S35 — Scénarios de prospection ────────────────────────────────────────

export const scenarioProspectionRepository = {
  getList: (): Promise<ScenarioProspection[]> =>
    api.get("/api/v1/knowledge/scenarios-prospection/").then((data: unknown) =>
      toList<ScenarioProspection>(data),
    ),
  create: (payload: CreateScenarioProspectionPayload): Promise<ScenarioProspection> =>
    api.post("/api/v1/knowledge/scenarios-prospection/", payload),
  patch: (id: string, payload: Partial<CreateScenarioProspectionPayload>): Promise<ScenarioProspection> =>
    api.patch(`/api/v1/knowledge/scenarios-prospection/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/scenarios-prospection/${id}/`),
};