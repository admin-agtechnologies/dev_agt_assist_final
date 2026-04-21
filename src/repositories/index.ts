// src/repositories/index.ts
import { api } from "@/lib/api-client";
import type {
  Tenant, CreateTenantPayload, TenantFilters,
  Bot, CreateBotPayload, BotFilters,
  Service, CreateServicePayload, ServiceFilters,
  Appointment, CreateAppointmentPayload, AppointmentFilters,
  Subscription,
  Wallet,
  Plan,
  TenantStats, AdminStats,
  Conversation, ConversationFilters,
  FAQ, CreateFAQPayload,
  TenantKnowledge, CreateTenantKnowledgePayload,
  ServiceKnowledge, CreateServiceKnowledgePayload,
  BusinessHours, CreateBusinessHoursPayload,
  Location, CreateLocationPayload,
  Transaction, CreateTransactionPayload,
  User, AuthResponse, LoginPayload,
  PaginatedResponse,
} from "@/types/api";

// ── Interface locale PhoneNumber ──────────────────────────────────────────────
// (pas encore dans types/api, ajouté ici pour le frontend PME)
interface PhoneNumberLocal {
  id: string;
  number: string;
  tenant_id: string | null;
  whatsapp_bot_id: string | null;
  voice_bot_id: string | null;
  provider_name: string;
  status: string;
}

// ── Helper params ─────────────────────────────────────────────────────────────
const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)])
  );

const toList = <T>(data: unknown): PaginatedResponse<T> =>
  Array.isArray(data)
    ? { results: data as T[], count: (data as T[]).length, next: null, previous: null }
    : data as PaginatedResponse<T>;

// ── Auth ─────────────────────────────────────────────────────────────────────
// ── Auth ─────────────────────────────────────────────────────────────────────
// REMPLACER le bloc authRepository dans src/repositories/index.ts
export const authRepository = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // JSON-Server mock: filtre par email, simule token JWT
    const users = await api.get<User[]>("/api/v1/users", { params: { email: payload.email } });
    if (!users || users.length === 0) throw new Error("Email ou mot de passe incorrect");
    const user = users[0];
    const fakeToken = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    return { access: fakeToken, refresh: fakeToken + "_refresh", user };
  },
  loginWithGoogle: async (email: string, name: string): Promise<AuthResponse> => {
    // Simulation Google auth
    const users = await api.get<User[]>("/api/v1/users", { params: { email } });
    if (!users || users.length === 0) throw new Error("Utilisateur non trouvé");
    const user = users[0];
    const fakeToken = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    return { access: fakeToken, refresh: fakeToken + "_refresh", user };
  },
  register: async (payload: any): Promise<AuthResponse> => {
    // Simulation d'inscription
    const user = await api.post<User>("/api/v1/users", payload);
    const fakeToken = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    return { access: fakeToken, refresh: fakeToken + "_refresh", user };
  },
  me: (id: string): Promise<User> => api.get(`/api/v1/users/${id}`),
};
 


// ── Tenants ───────────────────────────────────────────────────────────────────
export const tenantsRepository = {
  getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
    api.get("/api/v1/tenants", { params: p(f) }).then((data: unknown) => {
      const arr = Array.isArray(data)
        ? data
        : (data as PaginatedResponse<Tenant>).results
          ? (data as PaginatedResponse<Tenant>)
          : { results: data as Tenant[], count: (data as Tenant[]).length, next: null, previous: null };
      return Array.isArray(arr)
        ? { results: arr, count: arr.length, next: null, previous: null }
        : arr;
    }),
  getById: (id: string): Promise<Tenant> => api.get(`/api/v1/tenants/${id}`),
  create: (payload: CreateTenantPayload): Promise<Tenant> => api.post("/api/v1/tenants", payload),
  patch: (id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> =>
    api.patch(`/api/v1/tenants/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/tenants/${id}`),
};

// ── Bots ──────────────────────────────────────────────────────────────────────
export const botsRepository = {
  getList: (f?: BotFilters): Promise<PaginatedResponse<Bot>> =>
    api.get("/api/v1/bots", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Bot[], count: (data as Bot[]).length, next: null, previous: null }
        : data as PaginatedResponse<Bot>
    ),
  getById: (id: string): Promise<Bot> => api.get(`/api/v1/bots/${id}`),
  create: (payload: CreateBotPayload & { tenant_id?: string }): Promise<Bot> =>
    api.post("/api/v1/bots", payload),
  patch: (id: string, payload: Partial<CreateBotPayload> & Record<string, unknown>): Promise<Bot> =>
    api.patch(`/api/v1/bots/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/bots/${id}`),
};

// ── Phone Numbers ─────────────────────────────────────────────────────────────
export const phoneNumbersRepository = {
  getList: (f?: { tenant_id?: string }): Promise<PhoneNumberLocal[]> =>
    api.get("/api/v1/phone-numbers", { params: p(f) })
      .then((data: unknown) => Array.isArray(data) ? data as PhoneNumberLocal[] : []),
  getById: (id: string): Promise<PhoneNumberLocal> =>
    api.get(`/api/v1/phone-numbers/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────
export const servicesRepository = {
  getList: (f?: ServiceFilters): Promise<PaginatedResponse<Service>> =>
    api.get("/api/v1/services", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Service[], count: (data as Service[]).length, next: null, previous: null }
        : data as PaginatedResponse<Service>
    ),
  getById: (id: string): Promise<Service> => api.get(`/api/v1/services/${id}`),
  create: (payload: CreateServicePayload & { tenant_id?: string }): Promise<Service> =>
    api.post("/api/v1/services", payload),
  patch: (id: string, payload: Partial<CreateServicePayload>): Promise<Service> =>
    api.patch(`/api/v1/services/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/services/${id}`),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsRepository = {
  getList: (f?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> =>
    api.get("/api/v1/appointments", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Appointment[], count: (data as Appointment[]).length, next: null, previous: null }
        : data as PaginatedResponse<Appointment>
    ),
  getById: (id: string): Promise<Appointment> => api.get(`/api/v1/appointments/${id}`),
  create: (payload: CreateAppointmentPayload & { tenant_id?: string }): Promise<Appointment> =>
    api.post("/api/v1/appointments", payload),
  patch: (id: string, payload: Partial<CreateAppointmentPayload>): Promise<Appointment> =>
    api.patch(`/api/v1/appointments/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/appointments/${id}`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsRepository = {
  getList: (): Promise<PaginatedResponse<Subscription>> =>
    api.get("/api/v1/subscriptions").then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Subscription[], count: (data as Subscription[]).length, next: null, previous: null }
        : data as PaginatedResponse<Subscription>
    ),
  getByTenant: (tenantId: string): Promise<Subscription | null> =>
    api.get("/api/v1/subscriptions", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0 ? data[0] as Subscription : null
      ),
  getById: (id: string): Promise<Subscription> => api.get(`/api/v1/subscriptions/${id}`),
  patch: (id: string, payload: Partial<Subscription>): Promise<Subscription> =>
    api.patch(`/api/v1/subscriptions/${id}`, payload),
};

// ── Wallets ───────────────────────────────────────────────────────────────────
export const walletsRepository = {
  getByTenant: (tenantId: string): Promise<Wallet | null> =>
    api.get("/api/v1/wallets", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0 ? data[0] as Wallet : null
      ),
  getById: (id: string): Promise<Wallet> => api.get(`/api/v1/wallets/${id}`),
  patch: (id: string, payload: Partial<Wallet>): Promise<Wallet> =>
    api.patch(`/api/v1/wallets/${id}`, payload),
};

// ── Plans ─────────────────────────────────────────────────────────────────────
export const plansRepository = {
  getList: (): Promise<Plan[]> => api.get<Plan[]>("/api/v1/plans"),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsRepository = {
  getByTenant: (tenantId: string): Promise<TenantStats | null> =>
    api.get("/api/v1/stats", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0 ? data[0] as TenantStats : null
      ),
  getAdmin: (): Promise<AdminStats> => api.get("/api/v1/admin-stats"),
};

// ── Conversations ─────────────────────────────────────────────────────────────
export const conversationsRepository = {
  getList: (f?: ConversationFilters | string): Promise<PaginatedResponse<Conversation>> => {
    // Accepte soit un string (tenant_id direct) soit un objet filtres
    const filters = typeof f === "string" ? { tenant_id: f } : f;
    return api.get("/api/v1/conversations", { params: p(filters) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Conversation[], count: (data as Conversation[]).length, next: null, previous: null }
        : data as PaginatedResponse<Conversation>
    );
  },
  getMessages: (conversationId: string) =>
    api.get(`/api/v1/conversation-messages`, { params: { conversation_id: conversationId } })
      .then((data: unknown) => Array.isArray(data) ? data : []),
};

// ── FAQ ───────────────────────────────────────────────────────────────────────
export const faqRepository = {
  getList: (tenantId?: string): Promise<PaginatedResponse<FAQ>> =>
    api.get("/api/v1/faq", { params: tenantId ? { tenant_id: tenantId } : {} })
      .then((data: unknown) =>
        Array.isArray(data)
          ? { results: data as FAQ[], count: (data as FAQ[]).length, next: null, previous: null }
          : data as PaginatedResponse<FAQ>
      ),
  create: (payload: CreateFAQPayload): Promise<FAQ> => api.post("/api/v1/faq", payload),
  patch: (id: string, payload: Partial<CreateFAQPayload>): Promise<FAQ> =>
    api.patch(`/api/v1/faq/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/faq/${id}`),
};

// ── TenantKnowledge ───────────────────────────────────────────────────────────
export const tenantKnowledgeRepository = {
  getByTenant: (tenantId: string): Promise<TenantKnowledge> =>
    api.get("/api/v1/tenant-knowledge", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data[0] as TenantKnowledge : data as TenantKnowledge),
  create: (payload: CreateTenantKnowledgePayload): Promise<TenantKnowledge> =>
    api.post("/api/v1/tenant-knowledge", payload),
  patch: (id: string, payload: Partial<CreateTenantKnowledgePayload>): Promise<TenantKnowledge> =>
    api.patch(`/api/v1/tenant-knowledge/${id}`, payload),
};

// ── ServiceKnowledge ──────────────────────────────────────────────────────────
// ── ServiceKnowledge ──────────────────────────────────────────────────────────
export const serviceKnowledgeRepository = {
  getByTenant: (tenantId: string): Promise<ServiceKnowledge[]> =>
    api.get("/api/v1/service-knowledge", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data as ServiceKnowledge[] : []),
  getByService: (serviceId: string): Promise<ServiceKnowledge> =>
    api.get("/api/v1/service-knowledge", { params: { service_id: serviceId } })
      .then((data: unknown) => Array.isArray(data) ? data[0] as ServiceKnowledge : data as ServiceKnowledge),
  create: (payload: CreateServiceKnowledgePayload): Promise<ServiceKnowledge> =>
    api.post("/api/v1/service-knowledge", payload),
  patch: (id: string, payload: Partial<CreateServiceKnowledgePayload>): Promise<ServiceKnowledge> =>
    api.patch(`/api/v1/service-knowledge/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/service-knowledge/${id}`),
};

// ── BusinessHours ─────────────────────────────────────────────────────────────
export const businessHoursRepository = {
  getByTenant: (tenantId: string, type?: string): Promise<BusinessHours | null> =>
    api.get("/api/v1/business-hours", {
      params: p({ tenant_id: tenantId, hours_type: type }),
    }).then((data: unknown) =>
      Array.isArray(data) && data.length > 0 ? data[0] as BusinessHours : null
    ),
  create: (payload: CreateBusinessHoursPayload): Promise<BusinessHours> =>
    api.post("/api/v1/business-hours", payload),
  patch: (id: string, payload: Partial<CreateBusinessHoursPayload>): Promise<BusinessHours> =>
    api.patch(`/api/v1/business-hours/${id}`, payload), 
};

// ── Locations ─────────────────────────────────────────────────────────────────
export const locationsRepository = {
  getByTenant: (tenantId: string): Promise<Location[]> =>
    api.get("/api/v1/locations", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data as Location[] : []),
  create: (payload: CreateLocationPayload): Promise<Location> =>
    api.post("/api/v1/locations", payload),
  patch: (id: string, payload: Partial<CreateLocationPayload>): Promise<Location> =>
    api.patch(`/api/v1/locations/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/locations/${id}`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsRepository = {
  getByTenant: (tenantId: string): Promise<Transaction[]> =>
    api.get("/api/v1/transactions", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data as Transaction[] : []),
  create: (payload: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/api/v1/transactions", payload),
};