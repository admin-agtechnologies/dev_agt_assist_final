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
  EntrepriseInUser,
  // Bots
  Bot,
  CreateBotPayload,
  BotFilters,
  NumeroTelephone,
  // Services
  Service,
  CreateServicePayload,
  ServiceFilters,
  // Agences / Horaires / Agendas
  Agence,
  CreateAgencePayload,
  HorairesOuverture,
  UpdateHorairesPayload,
  Agenda,
  CreateAgendaPayload,
  // Rendez-vous
  RendezVous,
  CreateRendezVousPayload,
  RendezVousFilters,
  // Clients
  Client,
  CreateClientPayload,
  // Politiques rappel
  PolitiqueRappel,
  CreatePolitiqueRappelPayload,
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
  // Transactions
  Transaction,
  CreateTransactionPayload,
  // Shared
  PaginatedResponse,
  ChatbotTestResponse,
  ChatbotTestPayload,
} from "@/types/api";

// ── Helper params ─────────────────────────────────────────────────────────────
const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export const authRepository = {
  login: (payload: LoginPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/login/", payload, {
      skipAuthRefresh: true,
    }),

  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/register/", payload, {
      skipAuthRefresh: true,
    }),

  google: (payload: GoogleAuthPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>("/api/v1/auth/google/", payload, {
      skipAuthRefresh: true,
    }),

  me: (): Promise<User> => api.get<User>("/api/v1/auth/me/"),

  refreshToken: (payload: RefreshTokenPayload): Promise<TokenRefreshResponse> =>
    api.post<TokenRefreshResponse>("/api/v1/auth/token/refresh/", payload, {
      skipAuthRefresh: true,
    }),

  logout: (refresh: string): Promise<DetailResponse> =>
    api.post<DetailResponse>(
      "/api/v1/auth/logout/",
      { refresh } as LogoutPayload,
      { skipAuthRefresh: true },
    ),

  verifyEmail: (token: string): Promise<AuthResponse> =>
    api.post<AuthResponse>(
      "/api/v1/auth/verify-email/",
      { token } as VerifyEmailPayload,
      { skipAuthRefresh: true },
    ),

  resendVerification: (email: string): Promise<DetailResponse> =>
    api.post<DetailResponse>(
      "/api/v1/auth/resend-verification/",
      { email } as ResendVerificationPayload,
      { skipAuthRefresh: true },
    ),

  forgotPassword: (email: string): Promise<DetailResponse> =>
    api.post<DetailResponse>(
      "/api/v1/auth/forgot-password/",
      { email } as ForgotPasswordPayload,
      { skipAuthRefresh: true },
    ),

  resetPassword: (token: string, new_password: string): Promise<AuthResponse> =>
    api.post<AuthResponse>(
      "/api/v1/auth/reset-password/",
      { token, new_password } as ResetPasswordPayload,
      { skipAuthRefresh: true },
    ),

  magicLinkRequest: (email: string): Promise<DetailResponse> =>
    api.post<DetailResponse>(
      "/api/v1/auth/magic-link/request/",
      { email } as MagicLinkRequestPayload,
      { skipAuthRefresh: true },
    ),

  magicLinkVerify: (token: string): Promise<AuthResponse> =>
    api.post<AuthResponse>(
      "/api/v1/auth/magic-link/verify/",
      { token } as MagicLinkVerifyPayload,
      { skipAuthRefresh: true },
    ),
};

// ══════════════════════════════════════════════════════════════════════════════
// USERS
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
  updateMe: (payload: UpdateMePayload): Promise<User> =>
    api.patch<User>("/api/v1/users/update_me/", payload),
  changePassword: (payload: ChangePasswordPayload): Promise<DetailResponse> =>
    api.post<DetailResponse>("/api/v1/users/change_password/", payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// TENANTS
// ══════════════════════════════════════════════════════════════════════════════
export const tenantsRepository = {
  getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
    api.get("/api/v1/tenants/", { params: p(f) }).then((data: unknown) => {
      const arr = Array.isArray(data)
        ? data
        : (data as PaginatedResponse<Tenant>).results
          ? data
          : data;
      return Array.isArray(arr)
        ? {
            results: arr as Tenant[],
            count: (arr as Tenant[]).length,
            next: null,
            previous: null,
          }
        : (arr as PaginatedResponse<Tenant>);
    }),
  getById: (id: string): Promise<Tenant> => api.get(`/api/v1/tenants/${id}/`),
  create: (payload: CreateTenantPayload): Promise<Tenant> =>
    api.post("/api/v1/tenants/", payload),
  patch: (id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> =>
    api.patch(`/api/v1/tenants/${id}/`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/tenants/${id}/`),
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

// ══════════════════════════════════════════════════════════════════════════════
// BOTS
// Champs alignés avec BotSerializer Django :
//   nom, message_accueil, personnalite, langues, bot_type,
//   statut (actif/en_pause/archive), bot_paire, numero, numero_value
// L'entreprise est injectée automatiquement côté backend (perform_create).
// ══════════════════════════════════════════════════════════════════════════════
export const botsRepository = {
  getList: (f?: BotFilters): Promise<PaginatedResponse<Bot>> =>
    api.get("/api/v1/bots/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Bot[],
            count: (data as Bot[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Bot>),
    ),
  getById: (id: string): Promise<Bot> => api.get(`/api/v1/bots/${id}/`),
  create: (payload: CreateBotPayload): Promise<Bot> =>
    api.post("/api/v1/bots/", payload),
  patch: (
    id: string,
    payload: Partial<CreateBotPayload> & Record<string, unknown>,
  ): Promise<Bot> => api.patch(`/api/v1/bots/${id}/`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/bots/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// NUMÉROS DE TÉLÉPHONE
// Endpoint réservé aux admins AGT (read-only depuis l'espace PME).
// ══════════════════════════════════════════════════════════════════════════════
export const phoneNumbersRepository = {
  getList: (f?: { entreprise?: string }): Promise<NumeroTelephone[]> =>
    api
      .get("/api/v1/bots/numeros/", { params: p(f) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as NumeroTelephone[])
          : ((data as PaginatedResponse<NumeroTelephone>).results ?? []),
      ),
  getById: (id: string): Promise<NumeroTelephone> =>
    api.get(`/api/v1/bots/numeros/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════════════════════════
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
  getById: (id: string): Promise<Service> => api.get(`/api/v1/services/${id}/`),
  create: (payload: CreateServicePayload): Promise<Service> =>
    api.post("/api/v1/services/", payload),
  patch: (
    id: string,
    payload: Partial<CreateServicePayload>,
  ): Promise<Service> => api.patch(`/api/v1/services/${id}/`, payload),
  delete: (id: string): Promise<void> => api.delete(`/api/v1/services/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// AGENCES
// ══════════════════════════════════════════════════════════════════════════════
export const agencesRepository = {
  getList: (): Promise<PaginatedResponse<Agence>> =>
    api.get("/api/v1/services/agences/").then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Agence[],
            count: (data as Agence[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Agence>),
    ),
  getById: (id: string): Promise<Agence> =>
    api.get(`/api/v1/services/agences/${id}/`),
  create: (payload: CreateAgencePayload): Promise<Agence> =>
    api.post("/api/v1/services/agences/", payload),
  patch: (id: string, payload: Partial<CreateAgencePayload>): Promise<Agence> =>
    api.patch(`/api/v1/services/agences/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/services/agences/${id}/`),
  addService: (agenceId: string, serviceId: string): Promise<unknown> =>
    api.post(`/api/v1/services/agences/${agenceId}/services/add/`, {
      service_id: serviceId,
    }),
  removeService: (agenceId: string, serviceId: string): Promise<void> =>
    api.post(`/api/v1/services/agences/${agenceId}/services/remove/`, {
      service_id: serviceId,
    }),
};

// ══════════════════════════════════════════════════════════════════════════════
// HORAIRES D'OUVERTURE
// ══════════════════════════════════════════════════════════════════════════════
export const horairesRepository = {
  getList: (type?: "ouverture" | "rendez_vous"): Promise<HorairesOuverture[]> =>
    api
      .get("/api/v1/services/horaires/", { params: p({ type }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HorairesOuverture[])
          : ((data as PaginatedResponse<HorairesOuverture>).results ?? []),
      ),
  patch: (
    id: string,
    payload: UpdateHorairesPayload,
  ): Promise<HorairesOuverture> =>
    api.patch(`/api/v1/services/horaires/${id}/`, payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// AGENDAS
// ══════════════════════════════════════════════════════════════════════════════
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
  patch: (id: string, payload: Partial<CreateAgendaPayload>): Promise<Agenda> =>
    api.patch(`/api/v1/services/agendas/${id}/`, payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// RENDEZ-VOUS
// ══════════════════════════════════════════════════════════════════════════════
export const rendezVousRepository = {
  getList: (f?: RendezVousFilters): Promise<PaginatedResponse<RendezVous>> =>
    api.get("/api/v1/appointments/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as RendezVous[],
            count: (data as RendezVous[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<RendezVous>),
    ),
  getById: (id: string): Promise<RendezVous> =>
    api.get(`/api/v1/appointments/${id}/`),
  create: (payload: CreateRendezVousPayload): Promise<RendezVous> =>
    api.post("/api/v1/appointments/", payload),
  patch: (
    id: string,
    payload: Partial<CreateRendezVousPayload>,
  ): Promise<RendezVous> => api.patch(`/api/v1/appointments/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/appointments/${id}/`),
  confirmer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/confirmer/`, {}),
  annuler: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/annuler/`, {}),
  terminer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/terminer/`, {}),
  addService: (id: string, serviceId: string): Promise<unknown> =>
    api.post(`/api/v1/appointments/${id}/services/add/`, {
      service_id: serviceId,
    }),
  removeService: (id: string, serviceId: string): Promise<void> =>
    api.post(`/api/v1/appointments/${id}/services/remove/`, {
      service_id: serviceId,
    }),
};

// ══════════════════════════════════════════════════════════════════════════════
// CLIENTS
// ══════════════════════════════════════════════════════════════════════════════
export const clientsRepository = {
  getList: (search?: string): Promise<PaginatedResponse<Client>> =>
    api
      .get("/api/v1/appointments/clients/", { params: p({ search }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? {
              results: data as Client[],
              count: (data as Client[]).length,
              next: null,
              previous: null,
            }
          : (data as PaginatedResponse<Client>),
      ),
  create: (payload: CreateClientPayload): Promise<Client> =>
    api.post("/api/v1/appointments/clients/", payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// POLITIQUES DE RAPPEL
// ══════════════════════════════════════════════════════════════════════════════
export const politiquesRappelRepository = {
  getList: (): Promise<PaginatedResponse<PolitiqueRappel>> =>
    api.get("/api/v1/appointments/politiques-rappel/").then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as PolitiqueRappel[],
            count: (data as PolitiqueRappel[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<PolitiqueRappel>),
    ),
  create: (payload: CreatePolitiqueRappelPayload): Promise<PolitiqueRappel> =>
    api.post("/api/v1/appointments/politiques-rappel/", payload),
  patch: (
    id: string,
    payload: Partial<CreatePolitiqueRappelPayload>,
  ): Promise<PolitiqueRappel> =>
    api.patch(`/api/v1/appointments/politiques-rappel/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/appointments/politiques-rappel/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════════════════════
export const subscriptionsRepository = {
  getList: (): Promise<PaginatedResponse<Subscription>> =>
    api.get("/api/v1/billing/abonnements/").then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Subscription[],
            count: (data as Subscription[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Subscription>),
    ),
  getMine: (): Promise<Subscription | null> =>
    api
      .get<Subscription>("/api/v1/billing/abonnements/mon-abonnement/")
      .catch(() => null),
  getById: (id: string): Promise<Subscription> =>
    api.get(`/api/v1/billing/abonnements/${id}/`),
  patch: (id: string, payload: Partial<Subscription>): Promise<Subscription> =>
    api.patch(`/api/v1/billing/abonnements/${id}/`, payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// WALLETS
// ══════════════════════════════════════════════════════════════════════════════
export const walletsRepository = {
  getMine: (): Promise<Wallet | null> =>
    api
      .get("/api/v1/billing/wallets/")
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0 ? (data[0] as Wallet) : null,
      ),
  getById: (id: string): Promise<Wallet> =>
    api.get(`/api/v1/billing/wallets/${id}/`),
  patch: (id: string, payload: Partial<Wallet>): Promise<Wallet> =>
    api.patch(`/api/v1/billing/wallets/${id}/`, payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// PLANS
// ══════════════════════════════════════════════════════════════════════════════
export const plansRepository = {
  getList: (): Promise<Plan[]> =>
    api
      .get("/api/v1/billing/plans/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as Plan[])
          : ((data as { results?: Plan[] }).results ?? []),
      ),
};

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// Endpoint réel : /api/v1/dashboard/entreprise/ (auth-based, pas de tenant_id)
// Endpoint admin : /api/v1/dashboard/admin/
// ══════════════════════════════════════════════════════════════════════════════
export const statsRepository = {
  // Le paramètre _tenantId est conservé pour compatibilité des call-sites existants
  // mais n'est pas transmis — le backend filtre automatiquement par user connecté.
  getByTenant: (_tenantId?: string | null): Promise<TenantStats | null> =>
    api.get<TenantStats>("/api/v1/dashboard/entreprise/").catch(() => null),
  getAdmin: (): Promise<AdminStats> =>
    api.get<AdminStats>("/api/v1/dashboard/admin/"),
};

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONS
// Aligné avec ConversationViewSet — isolation tenant auto via auth
// ══════════════════════════════════════════════════════════════════════════════
export const conversationsRepository = {
  // Les filtres supportés côté backend : statut, human_handoff, bot
  getList: (
    f?: ConversationFilters,
  ): Promise<PaginatedResponse<Conversation>> =>
    api.get("/api/v1/conversations/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Conversation[],
            count: (data as Conversation[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Conversation>),
    ),
  getById: (id: string): Promise<Conversation> =>
    api.get(`/api/v1/conversations/${id}/`),
  getMessages: (conversationId: string) =>
    api
      .get(`/api/v1/conversations/${conversationId}/messages/`)
      .then((data: unknown) => (Array.isArray(data) ? data : [])),
  getRapport: (conversationId: string) =>
    api
      .get(`/api/v1/conversations/${conversationId}/rapport/`)
      .catch(() => null),
};

// ══════════════════════════════════════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════════════════════════════════════
export const faqRepository = {
  getList: (): Promise<PaginatedResponse<FAQ>> =>
    api.get("/api/v1/knowledge/faqs/").then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as FAQ[],
            count: (data as FAQ[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<FAQ>),
    ),
  create: (payload: CreateFAQPayload): Promise<FAQ> =>
    api.post("/api/v1/knowledge/faqs/", payload),
  patch: (id: string, payload: Partial<CreateFAQPayload>): Promise<FAQ> =>
    api.patch(`/api/v1/knowledge/faqs/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/faqs/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONS FREQUENTES
// ══════════════════════════════════════════════════════════════════════════════
export const questionsRepository = {
  getList: (): Promise<QuestionFrequente[]> =>
    api
      .get("/api/v1/knowledge/questions/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as QuestionFrequente[])
          : ((data as { results?: QuestionFrequente[] }).results ?? []),
      ),
  create: (payload: CreateQuestionPayload): Promise<QuestionFrequente> =>
    api.post("/api/v1/knowledge/questions/", payload),
  patch: (
    id: string,
    payload: Partial<CreateQuestionPayload>,
  ): Promise<QuestionFrequente> =>
    api.patch(`/api/v1/knowledge/questions/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/questions/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// TENANT KNOWLEDGE
// ══════════════════════════════════════════════════════════════════════════════
export const tenantKnowledgeRepository = {
  getMine: (): Promise<TenantKnowledge | null> =>
    api
      .get("/api/v1/knowledge/profils/")
      .then((data: unknown) =>
        Array.isArray(data) && data.length > 0
          ? (data[0] as TenantKnowledge)
          : null,
      )
      .catch(() => null),
  create: (payload: CreateTenantKnowledgePayload): Promise<TenantKnowledge> =>
    api.post("/api/v1/knowledge/profils/", payload),
  patch: (
    id: string,
    payload: Partial<CreateTenantKnowledgePayload>,
  ): Promise<TenantKnowledge> =>
    api.patch(`/api/v1/knowledge/profils/${id}/`, payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// SERVICE KNOWLEDGE
// ══════════════════════════════════════════════════════════════════════════════
export const serviceKnowledgeRepository = {
  getByTenant: (tenantId: string): Promise<ServiceKnowledge[]> =>
    api
      .get("/api/v1/knowledge/descriptions/", {
        params: { tenant_id: tenantId },
      })
      .then((data: unknown) =>
        Array.isArray(data) ? (data as ServiceKnowledge[]) : [],
      ),
  getByService: (serviceId: string): Promise<ServiceKnowledge> =>
    api
      .get("/api/v1/knowledge/descriptions/", {
        params: { service_id: serviceId },
      })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data[0] as ServiceKnowledge)
          : (data as ServiceKnowledge),
      ),
  create: (payload: CreateServiceKnowledgePayload): Promise<ServiceKnowledge> =>
    api.post("/api/v1/knowledge/descriptions/", payload),
  patch: (
    id: string,
    payload: Partial<CreateServiceKnowledgePayload>,
  ): Promise<ServiceKnowledge> =>
    api.patch(`/api/v1/knowledge/descriptions/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/knowledge/descriptions/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════════════════════════════════════════
export const transactionsRepository = {
  getMine: (): Promise<Transaction[]> =>
    api
      .get("/api/v1/billing/transactions/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as Transaction[])
          : ((data as { results?: Transaction[] }).results ?? []),
      ),
  create: (payload: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/api/v1/billing/transactions/", payload),
};

// ══════════════════════════════════════════════════════════════════════════════
// BILLING ACTIONS
// ══════════════════════════════════════════════════════════════════════════════
export const billingRepository = {
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

  previewUpgrade: (planId: string) =>
    api.get(`/api/v1/billing/plans/${planId}/preview-upgrade/`),

  confirmUpgrade: (planId: string) =>
    api.post(`/api/v1/billing/plans/${planId}/confirm-upgrade/`, {}),
};

// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// Aligné avec apps/feedback/views.py
// ══════════════════════════════════════════════════════════════════════════════
export interface CreateProblemePayload {
  contenu: string;
}

export const feedbackRepository = {
  // Signaler un problème — POST /api/v1/feedback/problemes/
  createProbleme: (payload: CreateProblemePayload) =>
    api.post("/api/v1/feedback/problemes/", payload),
  // Témoignages publics (lecture seule côté PME)
  getTemoignages: (params?: {
    featured_landing?: boolean;
    featured_login?: boolean;
  }) =>
    api
      .get("/api/v1/feedback/temoignages/", { params: p(params) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? data
          : ((data as { results?: unknown[] }).results ?? []),
      ),
};

export const chatbotRepository = {
  testChat: (payload: ChatbotTestPayload): Promise<ChatbotTestResponse> =>
    api.post("/api/v1/chatbot/test/", payload),
};
