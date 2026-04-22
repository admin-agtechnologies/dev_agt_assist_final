// src/repositories/index.ts
import { api } from "@/lib/api-client";
import type {
  // Auth
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  GoogleAuthPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  MagicLinkRequestPayload,
  MagicLinkVerifyPayload,
  RefreshTokenPayload,
  LogoutPayload,
  DetailResponse,
  TokenRefreshResponse,
  // Tenants
  Tenant,
  CreateTenantPayload,
  TenantFilters,
  // Bots
  Bot,
  CreateBotPayload,
  BotFilters,
  // Services
  Service,
  CreateServicePayload,
  ServiceFilters,
  // Appointments
  Appointment,
  CreateAppointmentPayload,
  AppointmentFilters,
  // Billing
  Subscription,
  Wallet,
  Plan,
  // Stats
  TenantStats,
  AdminStats,
  // Conversations
  Conversation,
  ConversationFilters,
  // Knowledge
  FAQ,
  CreateFAQPayload, 
  QuestionFrequente, 
  CreateQuestionPayload,
  TenantKnowledge,
  CreateTenantKnowledgePayload,
  ServiceKnowledge,
  CreateServiceKnowledgePayload,
  // Hours / Locations
  BusinessHours,
  CreateBusinessHoursPayload,
  Location,
  CreateLocationPayload,
  // Transactions
  Transaction,
  CreateTransactionPayload,
  // Shared
  PaginatedResponse,EntrepriseInUser,
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
      .map(([k, v]) => [k, String(v)]),
  );

// ══════════════════════════════════════════════════════════════════════════════
// AUTH — branché sur le backend Django (apps/auth_bridge/)
// ══════════════════════════════════════════════════════════════════════════════
// Tous les endpoints publics utilisent skipAuthRefresh:true pour éviter de
// déclencher un refresh sur un 401 (ex: mauvais mot de passe sur login).
// Seul /me/ et /logout/ peuvent bénéficier du refresh automatique.

export const authRepository = {
  // ── Connexion classique email/password ───────────────────────────────────
  login: (payload: LoginPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/login/", payload, {
      skipAuthRefresh: true,
    }),

  // ── Inscription — crée User + Profil, envoie email de vérification ───────
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/register/", payload, {
      skipAuthRefresh: true,
    }),

  // ── Connexion/inscription Google OAuth — trusted, skip email verify ──────
  google: (payload: GoogleAuthPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/google/", payload, {
      skipAuthRefresh: true,
    }),

  // ── Profil utilisateur connecté (Bearer token) ───────────────────────────
  me: (): Promise<User> => api.get<User>("/api/v1/auth/me/"),

  // ── Rafraîchir le access token via le refresh token ──────────────────────
  refreshToken: (payload: RefreshTokenPayload): Promise<TokenRefreshResponse> =>
    api.post<TokenRefreshResponse>("/api/v1/auth/token/refresh/", payload, {
      skipAuthRefresh: true,
    }),

  // ── Déconnexion — blacklist le refresh token ─────────────────────────────
  logout: (refresh: string): Promise<DetailResponse> => {
    const payload: LogoutPayload = { refresh };
    return api.post<DetailResponse>("/api/v1/auth/logout/", payload, {
      skipAuthRefresh: true,
    });
  },

  // ── Vérification email — consomme le token reçu par email ────────────────
  verifyEmail: (token: string): Promise<AuthResponse> => {
    const payload: VerifyEmailPayload = { token };
    return api.post<AuthResponse>("/api/v1/auth/verify-email/", payload, {
      skipAuthRefresh: true,
    });
  },

  // ── Renvoi d'un email de vérification ────────────────────────────────────
  resendVerification: (email: string): Promise<DetailResponse> => {
    const payload: ResendVerificationPayload = { email };
    return api.post<DetailResponse>(
      "/api/v1/auth/resend-verification/",
      payload,
      { skipAuthRefresh: true },
    );
  },

  // ── Mot de passe oublié — envoie un email de reset ───────────────────────
  forgotPassword: (email: string): Promise<DetailResponse> => {
    const payload: ForgotPasswordPayload = { email };
    return api.post<DetailResponse>("/api/v1/auth/forgot-password/", payload, {
      skipAuthRefresh: true,
    });
  },

  // ── Réinitialisation du mot de passe avec token ──────────────────────────
  resetPassword: (
    token: string,
    new_password: string,
  ): Promise<AuthResponse> => {
    const payload: ResetPasswordPayload = { token, new_password };
    return api.post<AuthResponse>("/api/v1/auth/reset-password/", payload, {
      skipAuthRefresh: true,
    });
  },

  // ── Demande d'un lien magique (connexion sans mot de passe) ──────────────
  magicLinkRequest: (email: string): Promise<DetailResponse> => {
    const payload: MagicLinkRequestPayload = { email };
    return api.post<DetailResponse>(
      "/api/v1/auth/magic-link/request/",
      payload,
      { skipAuthRefresh: true },
    );
  },

  // ── Validation d'un lien magique — connecte l'utilisateur ────────────────
  magicLinkVerify: (token: string): Promise<AuthResponse> => {
    const payload: MagicLinkVerifyPayload = { token };
    return api.post<AuthResponse>("/api/v1/auth/magic-link/verify/", payload, {
      skipAuthRefresh: true,
    });
  },
};
// ══════════════════════════════════════════════════════════════════════════════
// USERS — branché sur apps/users/ (update_me, change_password)
// ══════════════════════════════════════════════════════════════════════════════

export interface UpdateMePayload {
  name?: string;
  telephone?: string;
  bio?: string;
  ville?: string;
  pays?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const usersRepository = {
  // PATCH /api/v1/users/update_me/ — met à jour nom + champs profil
  updateMe: (payload: UpdateMePayload): Promise<User> =>
    api.patch<User>("/api/v1/users/update_me/", payload),

  // POST /api/v1/users/change_password/ — change le mot de passe
  changePassword: (payload: ChangePasswordPayload): Promise<DetailResponse> =>
    api.post<DetailResponse>("/api/v1/users/change_password/", payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// TENANTS — à aligner sur le backend Django dans une session dédiée
// ══════════════════════════════════════════════════════════════════════════════
export const tenantsRepository = {
  getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
    api.get("/api/v1/tenants", { params: p(f) }).then((data: unknown) => {
      const arr = Array.isArray(data)
        ? data
        : (data as PaginatedResponse<Tenant>).results
          ? (data as PaginatedResponse<Tenant>)
          : {
              results: data as Tenant[],
              count: (data as Tenant[]).length,
              next: null,
              previous: null,
            };
      return Array.isArray(arr)
        ? { results: arr, count: arr.length, next: null, previous: null }
        : arr;
    }),
  getById: (id: string): Promise<Tenant> => api.get(`/api/v1/tenants/${id}`),
  create: (payload: CreateTenantPayload): Promise<Tenant> => api.post("/api/v1/tenants", payload),
 patch: (id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> =>
    api.patch(`/api/v1/tenants/${id}/`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/tenants/${id}/`),

  // PATCH /api/v1/tenants/me_update/ — PME met à jour sa propre entreprise
  meUpdate: (payload: {
    name?: string;
    description?: string;
    whatsapp_number?: string;
    phone_number?: string;
    email?: string;
    site_web?: string;
    secteur_id?: string;
  }): Promise<EntrepriseInUser> =>
    api.patch<EntrepriseInUser>("/api/v1/tenants/me_update/", payload),
};

// ── Bots ──────────────────────────────────────────────────────────────────────
export const botsRepository = {
  getList: (f?: BotFilters): Promise<PaginatedResponse<Bot>> =>
    api.get("/api/v1/bots", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Bot[],
            count: (data as Bot[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Bot>),
    ),
  getById: (id: string): Promise<Bot> => api.get(`/api/v1/bots/${id}`),
  create: (payload: CreateBotPayload & { tenant_id?: string }): Promise<Bot> =>
    api.post("/api/v1/bots", payload),
  patch: (
    id: string,
    payload: Partial<CreateBotPayload> & Record<string, unknown>,
  ): Promise<Bot> => api.patch(`/api/v1/bots/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/bots/${id}`),
};

// ── Phone Numbers ─────────────────────────────────────────────────────────────
export const phoneNumbersRepository = {
  getList: (f?: { tenant_id?: string }): Promise<PhoneNumberLocal[]> =>
    api
      .get("/api/v1/phone-numbers", { params: p(f) })
      .then((data: unknown) =>
        Array.isArray(data) ? (data as PhoneNumberLocal[]) : [],
      ),
  getById: (id: string): Promise<PhoneNumberLocal> =>
    api.get(`/api/v1/phone-numbers/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────
export const servicesRepository = {
  getList: (f?: ServiceFilters): Promise<PaginatedResponse<Service>> =>
    api.get("/api/v1/services", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Service[],
            count: (data as Service[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Service>),
    ),
  getById: (id: string): Promise<Service> => api.get(`/api/v1/services/${id}`),
  create: (
    payload: CreateServicePayload & { tenant_id?: string },
  ): Promise<Service> => api.post("/api/v1/services", payload),
  patch: (
    id: string,
    payload: Partial<CreateServicePayload>,
  ): Promise<Service> => api.patch(`/api/v1/services/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/services/${id}`),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsRepository = {
  getList: (f?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> =>
    api.get("/api/v1/appointments", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Appointment[],
            count: (data as Appointment[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Appointment>),
    ),
  getById: (id: string): Promise<Appointment> =>
    api.get(`/api/v1/appointments/${id}`),
  create: (
    payload: CreateAppointmentPayload & { tenant_id?: string },
  ): Promise<Appointment> => api.post("/api/v1/appointments", payload),
  patch: (
    id: string,
    payload: Partial<CreateAppointmentPayload>,
  ): Promise<Appointment> => api.patch(`/api/v1/appointments/${id}`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/appointments/${id}`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsRepository = {
  getList: (): Promise<PaginatedResponse<Subscription>> =>
    api.get("/api/v1/billing/abonnements/").then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Subscription[], count: (data as Subscription[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Subscription>),
    ),
  getMine: (): Promise<Subscription | null> =>
    api.get<Subscription>("/api/v1/billing/abonnements/mon-abonnement/").catch(() => null),
  getById: (id: string): Promise<Subscription> =>
    api.get(`/api/v1/billing/abonnements/${id}/`),
  patch: (id: string, payload: Partial<Subscription>): Promise<Subscription> =>
    api.patch(`/api/v1/billing/abonnements/${id}/`, payload),
};

// ── Wallets ───────────────────────────────────────────────────────────────────
export const walletsRepository = {
  getMine: (): Promise<Wallet | null> =>
    api.get("/api/v1/billing/wallets/").then((data: unknown) =>
      Array.isArray(data) && data.length > 0 ? (data[0] as Wallet) : null,
    ),
  getById: (id: string): Promise<Wallet> =>
    api.get(`/api/v1/billing/wallets/${id}/`),
  patch: (id: string, payload: Partial<Wallet>): Promise<Wallet> =>
    api.patch(`/api/v1/billing/wallets/${id}/`, payload),
};

// ── Plans ─────────────────────────────────────────────────────────────────────
export const plansRepository = {
  getList: (): Promise<Plan[]> =>
    api.get("/api/v1/billing/plans/").then((data: unknown) =>
      Array.isArray(data) ? data as Plan[]
        : (data as { results?: Plan[] }).results ?? []
    ),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsRepository = {
  getByTenant: (tenantId: string): Promise<TenantStats | null> =>
    api
      .get("/api/v1/stats", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0
          ? (data[0] as TenantStats)
          : null,
      ),
  getAdmin: (): Promise<AdminStats> => api.get("/api/v1/admin-stats"),
};

// ── Conversations ─────────────────────────────────────────────────────────────
export const conversationsRepository = {
  getList: (
    f?: ConversationFilters | string,
  ): Promise<PaginatedResponse<Conversation>> => {
    const filters = typeof f === "string" ? { tenant_id: f } : f;
    return api
      .get("/api/v1/conversations", { params: p(filters) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? {
              results: data as Conversation[],
              count: (data as Conversation[]).length,
              next: null,
              previous: null,
            }
          : (data as PaginatedResponse<Conversation>),
      );
  },
  getMessages: (conversationId: string) =>
    api
      .get(`/api/v1/conversation-messages`, {
        params: { conversation_id: conversationId },
      })
      .then((data: unknown) => (Array.isArray(data) ? data : [])),
};

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

// ── Questions Fréquentes ──────────────────────────────────────────────────────
export const questionsRepository = {
  getList: (): Promise<QuestionFrequente[]> =>
    api.get("/api/v1/knowledge/questions/").then((data: unknown) =>
      Array.isArray(data) ? data as QuestionFrequente[]
        : (data as { results?: QuestionFrequente[] }).results ?? []
    ),
  create: (payload: CreateQuestionPayload): Promise<QuestionFrequente> =>
    api.post("/api/v1/knowledge/questions/", payload),
  patch: (id: string, payload: Partial<CreateQuestionPayload>): Promise<QuestionFrequente> =>
    api.patch(`/api/v1/knowledge/questions/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/questions/${id}/`),
};

// ── TenantKnowledge ───────────────────────────────────────────────────────────
export const tenantKnowledgeRepository = {
  getMine: (): Promise<TenantKnowledge | null> =>
    api.get("/api/v1/knowledge/profils/").then((data: unknown) =>
      Array.isArray(data) && data.length > 0 ? (data[0] as TenantKnowledge) : null
    ).catch(() => null),
  create: (payload: CreateTenantKnowledgePayload): Promise<TenantKnowledge> =>
    api.post("/api/v1/knowledge/profils/", payload),
  patch: (id: string, payload: Partial<CreateTenantKnowledgePayload>): Promise<TenantKnowledge> =>
    api.patch(`/api/v1/knowledge/profils/${id}/`, payload),
};

// ── ServiceKnowledge ──────────────────────────────────────────────────────────
export const serviceKnowledgeRepository = {
  getByTenant: (tenantId: string): Promise<ServiceKnowledge[]> =>
    api
      .get("/api/v1/service-knowledge", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) ? (data as ServiceKnowledge[]) : [],
      ),
  getByService: (serviceId: string): Promise<ServiceKnowledge> =>
    api
      .get("/api/v1/service-knowledge", { params: { service_id: serviceId } })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data[0] as ServiceKnowledge)
          : (data as ServiceKnowledge),
      ),
  create: (payload: CreateServiceKnowledgePayload): Promise<ServiceKnowledge> =>
    api.post("/api/v1/service-knowledge", payload),
  patch: (
    id: string,
    payload: Partial<CreateServiceKnowledgePayload>,
  ): Promise<ServiceKnowledge> =>
    api.patch(`/api/v1/service-knowledge/${id}`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/service-knowledge/${id}`),
};

// ── BusinessHours ─────────────────────────────────────────────────────────────
export const businessHoursRepository = {
  getByTenant: (
    tenantId: string,
    type?: string,
  ): Promise<BusinessHours | null> =>
    api
      .get("/api/v1/business-hours", {
        params: p({ tenant_id: tenantId, hours_type: type }),
      })
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0
          ? (data[0] as BusinessHours)
          : null,
      ),
  create: (payload: CreateBusinessHoursPayload): Promise<BusinessHours> =>
    api.post("/api/v1/business-hours", payload),
  patch: (
    id: string,
    payload: Partial<CreateBusinessHoursPayload>,
  ): Promise<BusinessHours> =>
    api.patch(`/api/v1/business-hours/${id}`, payload),
};

// ── Locations ─────────────────────────────────────────────────────────────────
export const locationsRepository = {
  getByTenant: (tenantId: string): Promise<Location[]> =>
    api
      .get("/api/v1/locations", { params: { tenant_id: tenantId } })
      .then((data: unknown) =>
        Array.isArray(data) ? (data as Location[]) : [],
      ),
  create: (payload: CreateLocationPayload): Promise<Location> =>
    api.post("/api/v1/locations", payload),
  patch: (
    id: string,
    payload: Partial<CreateLocationPayload>,
  ): Promise<Location> => api.patch(`/api/v1/locations/${id}`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/locations/${id}`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsRepository = {
  getMine: (): Promise<Transaction[]> =>
    api.get("/api/v1/billing/transactions/").then((data: unknown) =>
      Array.isArray(data) ? (data as Transaction[])
        : (data as { results?: Transaction[] }).results ?? []
    ),
  create: (payload: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/api/v1/billing/transactions/", payload),
};

// src/repositories/index.ts

export const billingRepository = {
  // Recharge
  initiateRecharge: (
    walletId: string,
    payload: {
      amount: number;
      service_paiement_id: string;
      phone: string;
      idempotency_key: string;
    },
  ) =>
    api.post(`/api/v1/billing/wallets/${walletId}/initiate-recharge/`, payload),

  pollTransaction: (txnId: string) =>
    api.get(`/api/v1/billing/transactions/${txnId}/poll-status/`),

  // Plan
  previewUpgrade: (planId: string) =>
    api.get(`/api/v1/billing/plans/${planId}/preview-upgrade/`),

  confirmUpgrade: (planId: string) =>
    api.post(`/api/v1/billing/plans/${planId}/confirm-upgrade/`, {}),
};
