// src/repositories/index.ts
// Seul ajout par rapport au prototype : authRepository.loginWithGoogle
// Tout le reste est identique à l'existant.
import { api } from "@/lib/api-client";
import type {
  Tenant, CreateTenantPayload, TenantFilters,
  Bot, CreateBotPayload, BotFilters,
  Service, CreateServicePayload, ServiceFilters,
  Appointment, CreateAppointmentPayload, AppointmentFilters,
  Subscription, Wallet, Plan,
  TenantStats, AdminStats,
  Conversation, FAQ, CreateFAQPayload,
  ProviderConfig,
  User, AuthResponse, LoginPayload,
  PaginatedResponse,BusinessHours, AgencyLocation, TenantKnowledge, ServiceKnowledge, Transaction, CreateTransactionPayload,ConversationMessage,
} from "@/types/api";

// Helper : convertit un objet filtre en Record<string, string>
const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)])
  );

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authRepository = {
  register: async (payload: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    // Mock : cherche si l'email existe déjà
    const existing = await api.get<User[]>("/api/v1/auth/me", { params: { email: payload.email } });
    const found = Array.isArray(existing) ? existing[0] : null;
    if (found) return { access: btoa(JSON.stringify({ id: found.id, role: found.role, exp: Date.now() + 86400000 })), refresh: "mock_refresh", user: found };
    // Sinon crée un nouvel user mock
    const newUser = await api.post<User>("/api/v1/users", {
      email: payload.email, name: payload.name,
      role: "pme", tenant_id: null, avatar: null,
    });
    return { access: btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 })), refresh: "mock_refresh", user: newUser };
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const users = await api.get<User[]>("/api/v1/users", { params: { email: payload.email } });
    if (!users || users.length === 0) throw new Error("Email ou mot de passe incorrect");
    const user = users[0];
    const fakeToken = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    return { access: fakeToken, refresh: fakeToken + "_refresh", user };

  },

  // ── Connexion Google (mock) ──────────────────────────────────────────────
  // Cherche l'utilisateur par email. S'il n'existe pas, le crée (inscrit via Google).
  // En production : envoyer le credential Google au backend pour vérification.
  loginWithGoogle: async (email: string, name: string): Promise<AuthResponse> => {
    const users = await api.get<User[]>("/api/v1/users", { params: { email } });
    let user: User;
    if (users && users.length > 0) {
      user = users[0];
    } else {
      // Créer l'utilisateur à la volée (mock uniquement)
      user = await api.post<User>("/api/v1/users", {
        email, name, role: "pme", tenant_id: null, avatar: null,
      });
    }
    const fakeToken = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
    return { access: fakeToken, refresh: fakeToken + "_refresh", user };
  },

  me: (id: string): Promise<User> => api.get(`/api/v1/users/${id}`),
};

// ── Tenants ──────────────────────────────────────────────────────────────────
export const tenantsRepository = {
  getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
    api.get("/api/v1/tenants", { params: p(f) }).then((data: unknown) => {
      const arr = Array.isArray(data) ? data : (data as PaginatedResponse<Tenant>).results
        ? (data as PaginatedResponse<Tenant>)
        : { results: data as Tenant[], count: (data as Tenant[]).length, next: null, previous: null };
      return Array.isArray(arr) ? { results: arr, count: arr.length, next: null, previous: null } : arr;
    }),
  getById: (id: string): Promise<Tenant> => api.get(`/api/v1/tenants/${id}`),
  create: (payload: CreateTenantPayload): Promise<Tenant> => api.post("/api/v1/tenants", payload),
  patch: (id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> => api.patch(`/api/v1/tenants/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/tenants/${id}`),
};

// ── Bots ──────────────────────────────────────────────────────────────────────
export const botsRepository = {
  getList: (f?: BotFilters): Promise<PaginatedResponse<Bot>> =>
    api.get("/api/v1/bots", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data) ? { results: data as Bot[], count: (data as Bot[]).length, next: null, previous: null } : data as PaginatedResponse<Bot>
    ),
  getById: (id: string): Promise<Bot> => api.get(`/api/v1/bots/${id}`),
  create: (payload: CreateBotPayload & { tenant_id: string }): Promise<Bot> => api.post("/api/v1/bots", payload),
  patch: (id: string, payload: Partial<CreateBotPayload>): Promise<Bot> => api.patch(`/api/v1/bots/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/bots/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────
export const servicesRepository = {
  getList: (f?: ServiceFilters): Promise<PaginatedResponse<Service>> =>
    api.get("/api/v1/services", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data) ? { results: data as Service[], count: (data as Service[]).length, next: null, previous: null } : data as PaginatedResponse<Service>
    ),
  getById: (id: string): Promise<Service> => api.get(`/api/v1/services/${id}`),
  create: (payload: CreateServicePayload & { tenant_id: string }): Promise<Service> => api.post("/api/v1/services", payload),
  patch: (id: string, payload: Partial<CreateServicePayload>): Promise<Service> => api.patch(`/api/v1/services/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/services/${id}`),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsRepository = {
  getList: (f?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> =>
    api.get("/api/v1/appointments", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data) ? { results: data as Appointment[], count: (data as Appointment[]).length, next: null, previous: null } : data as PaginatedResponse<Appointment>
    ),
  getById: (id: string): Promise<Appointment> => api.get(`/api/v1/appointments/${id}`),
  create: (payload: CreateAppointmentPayload & { tenant_id: string }): Promise<Appointment> => api.post("/api/v1/appointments", payload),
  patch: (id: string, payload: Partial<CreateAppointmentPayload>): Promise<Appointment> => api.patch(`/api/v1/appointments/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/appointments/${id}`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsRepository = {
  getList: (): Promise<PaginatedResponse<Subscription>> =>
    api.get("/api/v1/subscriptions").then((data: unknown) =>
      Array.isArray(data) ? { results: data as Subscription[], count: (data as Subscription[]).length, next: null, previous: null } : data as PaginatedResponse<Subscription>
    ),
  getByTenant: (tenantId: string): Promise<Subscription | null> =>
    api.get("/api/v1/subscriptions", { params: { tenant_id: tenantId } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as Subscription : null)),
  getById: (id: string): Promise<Subscription> => api.get(`/api/v1/subscriptions/${id}`),
  patch: (id: string, payload: Partial<Subscription>): Promise<Subscription> => api.patch(`/api/v1/subscriptions/${id}`, payload),
};

// ── Plans ─────────────────────────────────────────────────────────────────────
export const plansRepository = {
  getList: (): Promise<Plan[]> => api.get<Plan[]>("/api/v1/plans"),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsRepository = {
  getByTenant: (tenantId: string): Promise<TenantStats | null> =>
    api.get("/api/v1/stats", { params: { tenant_id: tenantId } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as TenantStats : null)),
  getAdmin: (): Promise<AdminStats> => api.get("/api/v1/admin-stats"),
};

// ── Conversations ─────────────────────────────────────────────────────────────
// ── Conversations ─────────────────────────────────────────────────────────────
export const conversationsRepository = {
  getList: (filters?: { tenant_id?: string; bot_id?: string }): Promise<PaginatedResponse<Conversation>> =>
    api.get("/api/v1/conversations", { params: filters ? Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    ) as Record<string, string> : {} }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Conversation[], count: (data as Conversation[]).length, next: null, previous: null }
        : data as PaginatedResponse<Conversation>
    ),
  getById: (id: string): Promise<Conversation> => api.get(`/api/v1/conversations/${id}`),
};

// ── ConversationMessages ──────────────────────────────────────────────────────
export const conversationMessagesRepository = {
  getByConversation: (conversationId: string): Promise<ConversationMessage[]> =>
    api.get("/api/v1/conversation-messages", { params: { conversation_id: conversationId } })
      .then((data: unknown) => Array.isArray(data) ? data as ConversationMessage[] : []),
};

// ── FAQ ───────────────────────────────────────────────────────────────────────
export const faqRepository = {
  getList: (tenantId?: string): Promise<PaginatedResponse<FAQ>> =>
    api.get("/api/v1/faq", { params: tenantId ? { tenant_id: tenantId } : {} }).then((data: unknown) =>
      Array.isArray(data) ? { results: data as FAQ[], count: (data as FAQ[]).length, next: null, previous: null } : data as PaginatedResponse<FAQ>
    ),
  create: (payload: CreateFAQPayload & { tenant_id: string }): Promise<FAQ> => api.post("/api/v1/faq", payload),
  patch: (id: string, payload: Partial<CreateFAQPayload>): Promise<FAQ> => api.patch(`/api/v1/faq/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/faq/${id}`),
};

// ── Provider Configs ──────────────────────────────────────────────────────────
export const providerConfigsRepository = {
  getList: (): Promise<PaginatedResponse<ProviderConfig>> =>
    api.get("/api/v1/provider-configs").then((data: unknown) =>
      Array.isArray(data) ? { results: data as ProviderConfig[], count: (data as ProviderConfig[]).length, next: null, previous: null } : data as PaginatedResponse<ProviderConfig>
    ),
  patch: (id: string, payload: Partial<ProviderConfig>): Promise<ProviderConfig> => api.patch(`/api/v1/provider-configs/${id}`, payload),
};

// ── Business Hours ────────────────────────────────────────────────────────────
export const businessHoursRepository = {
  getByTenant: (tenantId: string, type: "opening" | "appointments"): Promise<BusinessHours | null> =>
   api.get("/api/v1/business-hours/", { params: { tenant_id: tenantId, type } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as BusinessHours : null)),
  patch: (id: string, payload: Partial<BusinessHours>): Promise<BusinessHours> =>
    api.patch(`/api/v1/business-hours/${id}/`, payload),
};

// ── Locations ─────────────────────────────────────────────────────────────────
export const locationsRepository = {
  getList: (tenantId: string): Promise<AgencyLocation[]> =>
    api.get("/api/v1/locations", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data as AgencyLocation[] : []),
  create: (payload: Omit<AgencyLocation, "id">): Promise<AgencyLocation> => api.post("/api/v1/locations", payload),
  patch: (id: string, payload: Partial<AgencyLocation>): Promise<AgencyLocation> => api.patch(`/api/v1/locations/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/locations/${id}`),
};

// ── TenantKnowledge ───────────────────────────────────────────────────────────
export const tenantKnowledgeRepository = {
  getByTenant: (tenantId: string): Promise<TenantKnowledge | null> =>
    api.get("/api/v1/tenant-knowledge/", { params: { tenant_id: tenantId } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as TenantKnowledge : null)),
  patch: (id: string, payload: Partial<TenantKnowledge>): Promise<TenantKnowledge> =>
    api.patch(`/api/v1/tenant-knowledge/${id}/`, payload),
  create: (payload: Omit<TenantKnowledge, "id">): Promise<TenantKnowledge> =>
    api.post("/api/v1/tenant-knowledge/", payload),
};

// ── ServiceKnowledge ──────────────────────────────────────────────────────────
export const serviceKnowledgeRepository = {
  getByService: (serviceId: string): Promise<ServiceKnowledge | null> =>
    api.get("/api/v1/service-knowledge", { params: { service_id: serviceId } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as ServiceKnowledge : null)),
  patch: (id: string, payload: Partial<ServiceKnowledge>): Promise<ServiceKnowledge> =>
    api.patch(`/api/v1/service-knowledge/${id}`, payload),
  create: (payload: Omit<ServiceKnowledge, "id">): Promise<ServiceKnowledge> =>
    api.post("/api/v1/service-knowledge", payload),
};

// ── Wallets (enrichi) ─────────────────────────────────────────────────────────
export const walletsRepository = {
  getByTenant: (tenantId: string): Promise<Wallet | null> =>
    api.get("/api/v1/wallets", { params: { tenant_id: tenantId } })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data[0] as Wallet : null)),
  getById: (id: string): Promise<Wallet> => api.get(`/api/v1/wallets/${id}`),
  patch: (id: string, payload: Partial<Wallet>): Promise<Wallet> =>
    api.patch(`/api/v1/wallets/${id}`, payload),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsRepository = {
  getByTenant: (tenantId: string): Promise<Transaction[]> =>
    api.get("/api/v1/transactions", { params: { tenant_id: tenantId } })
      .then((data: unknown) => Array.isArray(data) ? data as Transaction[] : []),
  create: (payload: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/api/v1/transactions", payload),
};