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

  // Tenants
  Tenant,
  CreateTenantPayload,
  TenantFilters,
  EntrepriseInUser,
  SecteurActivite,
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
  // Chatbot bridge
  ChatbotConfig,
  UpdateChatbotConfigPayload,
  TestSessionSummary,
  TestSessionDetail,
  // Platform help
  HelpEntry,
} from "@/types/api";
import type { ClaimBonusResponse, OnboardingCheckRequest, OnboardingResponse } from "@/types/onboarding";

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

// Juste après tenantsRepository, ajouter :
export const secteursRepository = {
  getList: (): Promise<SecteurActivite[]> =>
    api
      .get("/api/v1/tenants/secteurs/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as SecteurActivite[])
          : ((data as { results?: SecteurActivite[] }).results ?? []),
      ),
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

  // Retourne l'agence siege de l'entreprise connectee
  getSiege: (): Promise<Agence> => api.get("/api/v1/services/agences/siege/"),

  getById: (id: string): Promise<Agence> =>
    api.get(`/api/v1/services/agences/${id}/`),

  create: (payload: CreateAgencePayload): Promise<Agence> =>
    api.post("/api/v1/services/agences/", payload),

  patch: (id: string, payload: Partial<CreateAgencePayload>): Promise<Agence> =>
    api.patch(`/api/v1/services/agences/${id}/`, payload),

  // Protege cote backend — retourne 403 si is_siege=true
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
  // Lister les horaires (filtrable par agence et/ou type)
  getList: (type?: "ouverture" | "rendez_vous"): Promise<HorairesOuverture[]> =>
    api
      .get("/api/v1/services/horaires/", { params: p({ type }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HorairesOuverture[])
          : ((data as PaginatedResponse<HorairesOuverture>).results ?? []),
      ),

  // Lister les horaires d'une agence specifique
  getListByAgence: (agenceId: string): Promise<HorairesOuverture[]> =>
    api
      .get("/api/v1/services/horaires/", { params: p({ agence: agenceId }) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HorairesOuverture[])
          : ((data as PaginatedResponse<HorairesOuverture>).results ?? []),
      ),

  // Creer des horaires (POST)
  create: (
    payload: UpdateHorairesPayload & {
      agence_id: string;
      type: "ouverture" | "rendez_vous";
    },
  ): Promise<HorairesOuverture> =>
    api.post("/api/v1/services/horaires/", payload),

  // Mettre a jour des horaires (PATCH)
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

  confirmer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/confirmer/`, {}),

  annuler: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/annuler/`, {}),

  terminer: (id: string): Promise<RendezVous> =>
    api.post(`/api/v1/appointments/${id}/terminer/`, {}),

  patch: (
    id: string,
    payload: Partial<CreateRendezVousPayload>,
  ): Promise<RendezVous> => api.patch(`/api/v1/appointments/${id}/`, payload),
};
// ══════════════════════════════════════════════════════════════════════════════
// CLIENTS
// ══════════════════════════════════════════════════════════════════════════════
export const clientsRepository = {
  getList: (): Promise<Client[]> =>
    api
      .get("/api/v1/appointments/clients/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as Client[])
          : ((data as PaginatedResponse<Client>).results ?? []),
      ),
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
    api.get("/api/v1/billing/wallets/").then((data: unknown) => {
      // L'API retourne soit un array direct, soit une réponse paginée
      if (Array.isArray(data)) {
        return data.length > 0 ? (data[0] as Wallet) : null;
      }
      const paginated = data as { results?: Wallet[] };
      return paginated.results && paginated.results.length > 0
        ? paginated.results[0]
        : null;
    }),
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
      .get("/api/v1/billing/plans/", { params: { is_active: "true" } })
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
  // PAR :
  getMine: (): Promise<TenantKnowledge | null> =>
    api
      .get("/api/v1/knowledge/profils/")
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0)
          return data[0] as TenantKnowledge;
        const paginated = data as { results?: TenantKnowledge[] };
        if (paginated.results && paginated.results.length > 0)
          return paginated.results[0];
        return null;
      })
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
  applyCode: (
    code: string,
  ): Promise<{
    detail: string;
    montant: string;
    devise: string;
    nouveau_solde: string;
  }> => api.post("/api/v1/billing/codes-recharge/apply-code/", { code }),
};

// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// Aligné avec apps/feedback/views.py
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// Aligné avec apps/feedback/views.py
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ══════════════════════════════════════════════════════════════════════════════
export interface CreateTemoignagePayload {
  note: number;
  contenu: string;
}

export interface CreateProblemePayload {
  categorie: string;
  severite: string;
  titre: string;
  contenu: string;
}

export const feedbackRepository = {
  createTemoignage: (payload: CreateTemoignagePayload): Promise<unknown> =>
    api.post("/api/v1/feedback/temoignages/", payload),

  createProbleme: (payload: CreateProblemePayload): Promise<unknown> =>
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

// ══════════════════════════════════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════════════════════════════════


export const onboardingRepository = {
  check: (payload: OnboardingCheckRequest): Promise<OnboardingResponse> =>
    api.post<OnboardingResponse>("/api/v1/onboarding/check/", payload),

  claimBonus: (): Promise<ClaimBonusResponse> =>
    api.post<ClaimBonusResponse>("/api/v1/onboarding/claim-bonus/", {}),
};

// ══════════════════════════════════════════════════════════════════════════════
// PLATFORM HELP (FAQ gérée par admin, lue par PME)
// ══════════════════════════════════════════════════════════════════════════════
export const platformHelpRepository = {
  getList: (): Promise<HelpEntry[]> =>
    api
      .get("/api/v1/platform/help/")
      .then((data: unknown) =>
        Array.isArray(data)
          ? (data as HelpEntry[])
          : ((data as { results?: HelpEntry[] }).results ?? []),
      ),
};

// ══════════════════════════════════════════════════════════════════════════════
// CHATBOT BRIDGE
// Aligné avec apps/chatbot_bridge/views.py + session_views.py
// POST /api/v1/chatbot/test/
// GET/PATCH /api/v1/bots/{id}/chatbot/
// GET /api/v1/chatbot/sessions/
// GET /api/v1/chatbot/sessions/{id}/
// ══════════════════════════════════════════════════════════════════════════════
export const chatbotRepository = {
  /** Envoie un message au bot et reçoit la réponse enrichie des actions. */
  testChat: (payload: ChatbotTestPayload): Promise<ChatbotTestResponse> =>
    api.post<ChatbotTestResponse>("/api/v1/chatbot/test/", payload),

  /** Lit la configuration IA d'un bot. Crée le chatbot si inexistant. */
  getChatbotConfig: (botId: string): Promise<ChatbotConfig> =>
    api.get<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`),

  /** Met à jour la configuration IA d'un bot (system_prompt, temperature, max_tokens). */
  updateChatbotConfig: (
    botId: string,
    payload: UpdateChatbotConfigPayload,
  ): Promise<ChatbotConfig> =>
    api.patch<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`, payload),

  /** Liste les sessions de test d'un bot, triées par date décroissante. */
  getSessions: (
    botId: string,
  ): Promise<PaginatedResponse<TestSessionSummary>> =>
    api
      .get("/api/v1/chatbot/sessions/", {
        params: { bot: botId, ordering: "-created_at" },
      })
      .then((data: unknown) =>
        Array.isArray(data)
          ? {
              results: data as TestSessionSummary[],
              count: (data as TestSessionSummary[]).length,
              next: null,
              previous: null,
            }
          : (data as PaginatedResponse<TestSessionSummary>),
      ),

  /** Détail complet d'une session avec messages et emails imbriqués. */
  getSessionDetail: (sessionId: string): Promise<TestSessionDetail> =>
    api.get<TestSessionDetail>(`/api/v1/chatbot/sessions/${sessionId}/`),
};
