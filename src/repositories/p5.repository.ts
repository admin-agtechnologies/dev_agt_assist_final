// src/repositories/p5.repository.ts
import { api } from "@/lib/api-client";
import type {
  ProgrammeAdmission, CreateProgrammeAdmissionPayload, UpdateProgrammeAdmissionPayload,
  SpecialiteMedicale, CreateSpecialiteMedicalePayload, UpdateSpecialiteMedicalePayload,
  ServiceCitoyen, CreateServiceCitoyenPayload, UpdateServiceCitoyenPayload,
} from "@/types/api/p5.types";

const BASE = "/api/v1/knowledge";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return ((data as { results?: T[] }).results) ?? [];
}

// ── Programmes d'admission (education) ───────────────────────────────────────
export const programmeRepository = {
  getList: () => api.get(`${BASE}/programmes-admission/`).then(d => toList<ProgrammeAdmission>(d)),
  create:  (p: CreateProgrammeAdmissionPayload) => api.post(`${BASE}/programmes-admission/`, p) as Promise<ProgrammeAdmission>,
  update:  (id: string, p: UpdateProgrammeAdmissionPayload) => api.patch(`${BASE}/programmes-admission/${id}/`, p) as Promise<ProgrammeAdmission>,
  delete:  (id: string) => api.delete(`${BASE}/programmes-admission/${id}/`) as Promise<void>,
};

// ── Spécialités médicales (sante) ─────────────────────────────────────────────
export const specialiteRepository = {
  getList: () => api.get(`${BASE}/specialites-medicales/`).then(d => toList<SpecialiteMedicale>(d)),
  create:  (p: CreateSpecialiteMedicalePayload) => api.post(`${BASE}/specialites-medicales/`, p) as Promise<SpecialiteMedicale>,
  update:  (id: string, p: UpdateSpecialiteMedicalePayload) => api.patch(`${BASE}/specialites-medicales/${id}/`, p) as Promise<SpecialiteMedicale>,
  delete:  (id: string) => api.delete(`${BASE}/specialites-medicales/${id}/`) as Promise<void>,
};

// ── Services citoyens (services publics) ──────────────────────────────────────
export const serviceCitoyenRepository = {
  getList: () => api.get(`${BASE}/services-citoyens/`).then(d => toList<ServiceCitoyen>(d)),
  create:  (p: CreateServiceCitoyenPayload) => api.post(`${BASE}/services-citoyens/`, p) as Promise<ServiceCitoyen>,
  update:  (id: string, p: UpdateServiceCitoyenPayload) => api.patch(`${BASE}/services-citoyens/${id}/`, p) as Promise<ServiceCitoyen>,
  delete:  (id: string) => api.delete(`${BASE}/services-citoyens/${id}/`) as Promise<void>,
};