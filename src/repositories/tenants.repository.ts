// src/repositories/tenants.repository.ts
import { api } from "@/lib/api-client";
import type {
    Tenant, CreateTenantPayload, TenantFilters,
    EntrepriseInUser, SecteurActivite, PaginatedResponse,
} from "@/types/api";

const p = (f?: object): Record<string, string> =>
    Object.fromEntries(
        Object.entries(f ?? {})
            .filter(([, v]) => v !== undefined && v !== "" && v !== null)
            .map(([k, v]) => [k, String(v)]),
    );

export const tenantsRepository = {
    getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
        api.get("/api/v1/tenants/", { params: p(f) }).then((data: unknown) =>
            Array.isArray(data)
                ? { results: data as Tenant[], count: (data as Tenant[]).length, next: null, previous: null }
                : (data as PaginatedResponse<Tenant>),
        ),
    getById: (id: string): Promise<Tenant> =>
        api.get(`/api/v1/tenants/${id}/`),
    create: (payload: CreateTenantPayload): Promise<Tenant> =>
        api.post("/api/v1/tenants/", payload),
    patch: (id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> =>
        api.patch(`/api/v1/tenants/${id}/`, payload),
    delete: (id: string): Promise<void> =>
        api.delete(`/api/v1/tenants/${id}/`),
    meUpdate: (payload: {
        name?: string; description?: string; whatsapp_number?: string;
        phone_number?: string; email?: string; site_web?: string; secteur_id?: string;
    }): Promise<EntrepriseInUser> =>
        api.patch<EntrepriseInUser>("/api/v1/tenants/me_update/", payload),
};

export const secteursRepository = {
    getList: (): Promise<SecteurActivite[]> =>
        api.get("/api/v1/tenants/secteurs/").then((data: unknown) =>
            Array.isArray(data)
                ? (data as SecteurActivite[])
                : ((data as { results?: SecteurActivite[] }).results ?? []),
        ),
};