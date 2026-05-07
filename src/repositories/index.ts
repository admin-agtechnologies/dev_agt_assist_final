// src/repositories/index.ts
// Re-exports des fichiers par domaine
export * from "./features.repository";
export * from "./conversations.repository";
export * from "./contacts.repository";
export * from "./reservations.repository";
export * from "./agences.repository";
export * from "./catalogues.repository";
export * from "./commandes.repository";

// Tout le reste — auth, tenants, bots, chatbot, waha, feedback, onboarding
// reste ici jusqu'à migration progressive en Phase 1 et 2
import { api } from "@/lib/api-client";
import type {
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
  Tenant,
  CreateTenantPayload,
  TenantFilters,
  EntrepriseInUser,
  SecteurActivite,
  Bot,
  CreateBotPayload,
  BotFilters,
  NumeroTelephone,
  PaginatedResponse,
  ChatbotTestPayload,
  ChatbotTestResponse,
  ChatbotConfig,
  UpdateChatbotConfigPayload,
  TestSessionSummary,
  TestSessionDetail,
  WahaStatusResponse,
  WahaConnectResponse,
  WahaDisconnectResponse,
} from "@/types/api";
import type {
  ClaimBonusResponse,
  OnboardingCheckRequest,
  OnboardingResponse,
} from "@/types/onboarding";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

// ── AUTH ──────────────────────────────────────────────────────────────────────
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
    api.post<TokenRefreshResponse>(
      "/api/v1/auth/token/refresh/",
      payload,
      { skipAuthRefresh: true },
    ),
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
  resetPassword: (
    token: string,
    new_password: string,
  ): Promise<AuthResponse> =>
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

// ── USERS ─────────────────────────────────────────────────────────────────────
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

// ── TENANTS ───────────────────────────────────────────────────────────────────
export const tenantsRepository = {
  getList: (f?: TenantFilters): Promise<PaginatedResponse<Tenant>> =>
    api.get("/api/v1/tenants/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Tenant[],
            count: (data as Tenant[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Tenant>),
    ),
  getById: (id: string): Promise<Tenant> =>
    api.get(`/api/v1/tenants/${id}/`),
  create: (payload: CreateTenantPayload): Promise<Tenant> =>
    api.post("/api/v1/tenants/", payload),
  patch: (
    id: string,
    payload: Partial<CreateTenantPayload>,
  ): Promise<Tenant> =>
    api.patch(`/api/v1/tenants/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/tenants/${id}/`),
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

// ── BOTS ──────────────────────────────────────────────────────────────────────
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
  getById: (id: string): Promise<Bot> =>
    api.get(`/api/v1/bots/${id}/`),
  create: (payload: CreateBotPayload): Promise<Bot> =>
    api.post("/api/v1/bots/", payload),
  patch: (
    id: string,
    payload: Partial<CreateBotPayload> & Record<string, unknown>,
  ): Promise<Bot> =>
    api.patch(`/api/v1/bots/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/bots/${id}/`),
};

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

// ── CHATBOT BRIDGE ────────────────────────────────────────────────────────────
export const chatbotRepository = {
  testChat: (payload: ChatbotTestPayload): Promise<ChatbotTestResponse> =>
    api.post<ChatbotTestResponse>("/api/v1/chatbot/test/", payload),
  getChatbotConfig: (botId: string): Promise<ChatbotConfig> =>
    api.get<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`),
  updateChatbotConfig: (
    botId: string,
    payload: UpdateChatbotConfigPayload,
  ): Promise<ChatbotConfig> =>
    api.patch<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`, payload),
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
  getSessionDetail: (sessionId: string): Promise<TestSessionDetail> =>
    api.get<TestSessionDetail>(`/api/v1/chatbot/sessions/${sessionId}/`),
};

// ── WAHA ──────────────────────────────────────────────────────────────────────
export const wahaRepository = {
  getStatus: (botId: string): Promise<WahaStatusResponse> =>
    api.get(`/api/v1/bots/${botId}/whatsapp/status/`),
  connect: (botId: string): Promise<WahaConnectResponse> =>
    api.post(`/api/v1/bots/${botId}/whatsapp/connect/`, {}),
  disconnect: (botId: string): Promise<WahaDisconnectResponse> =>
    api.post(`/api/v1/bots/${botId}/whatsapp/disconnect/`, {}),
};

// ── FEEDBACK ──────────────────────────────────────────────────────────────────
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
  getTemoignages: (params?: {
    featured_landing?: boolean;
    featured_login?: boolean;
  }): Promise<unknown[]> =>
    api
      .get("/api/v1/feedback/temoignages/", { params: p(params) })
      .then((data: unknown) =>
        Array.isArray(data)
          ? data
          : ((data as { results?: unknown[] }).results ?? []),
      ),
};

// ── ONBOARDING ────────────────────────────────────────────────────────────────
export const onboardingRepository = {
  check: (payload: OnboardingCheckRequest): Promise<OnboardingResponse> =>
    api.post<OnboardingResponse>("/api/v1/onboarding/check/", payload),
  claimBonus: (): Promise<ClaimBonusResponse> =>
    api.post<ClaimBonusResponse>("/api/v1/onboarding/claim-bonus/", {}),
};

export const tutorialRepository = {
  getProgress: (): Promise<{
    last_step: number;
    has_completed_tutorial: boolean;
  }> => api.get("/api/v1/onboarding/tutorial/"),
  saveStep: (
    last_step: number,
  ): Promise<{ last_step: number; has_completed_tutorial: boolean }> =>
    api.patch("/api/v1/onboarding/tutorial/", { last_step }),
  complete: (): Promise<{
    last_step: number;
    has_completed_tutorial: boolean;
  }> => api.patch("/api/v1/onboarding/tutorial/", { completed: true }),
};
// ── ALIAS de compatibilité ────────────────────────────────────────────────────
// billingRepository renommé billingActionsRepository — alias pour non-régression
export { billingActionsRepository as billingRepository } from "./commandes.repository";