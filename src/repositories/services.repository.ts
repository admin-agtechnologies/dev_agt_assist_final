// src/repositories/services.repository.ts
// servicesRepository — extrait de l'ancien agences.repository.ts (S21)
// Endpoint : /api/v1/services/

import { api } from "@/lib/api-client";
import type {
  Service,
  CreateServicePayload,
  ServiceFilters,
} from "@/types/api/agence.types";
import type { PaginatedResponse } from "@/types/api/shared.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

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