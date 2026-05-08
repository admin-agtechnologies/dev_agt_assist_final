// src/repositories/auth.repository.ts
import { api } from "@/lib/api-client";
import type {
    User, AuthResponse, LoginPayload, RegisterPayload, GoogleAuthPayload,
    VerifyEmailPayload, ResendVerificationPayload, ForgotPasswordPayload,
    ResetPasswordPayload, MagicLinkRequestPayload, MagicLinkVerifyPayload,
    RefreshTokenPayload, LogoutPayload, DetailResponse, TokenRefreshResponse,
} from "@/types/api";

export const authRepository = {
    login: (payload: LoginPayload): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/login/", payload, { skipAuthRefresh: true }),
    register: (payload: RegisterPayload): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/register/", payload, { skipAuthRefresh: true }),
    google: (payload: GoogleAuthPayload): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/google/", payload, { skipAuthRefresh: true }),
    me: (): Promise<User> =>
        api.get<User>("/api/v1/auth/me/"),
    refreshToken: (payload: RefreshTokenPayload): Promise<TokenRefreshResponse> =>
        api.post<TokenRefreshResponse>("/api/v1/auth/token/refresh/", payload, { skipAuthRefresh: true }),
    logout: (refresh: string): Promise<DetailResponse> =>
        api.post<DetailResponse>("/api/v1/auth/logout/", { refresh } as LogoutPayload, { skipAuthRefresh: true }),
    verifyEmail: (token: string): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/verify-email/", { token } as VerifyEmailPayload, { skipAuthRefresh: true }),
    resendVerification: (email: string): Promise<DetailResponse> =>
        api.post<DetailResponse>("/api/v1/auth/resend-verification/", { email } as ResendVerificationPayload, { skipAuthRefresh: true }),
    forgotPassword: (email: string): Promise<DetailResponse> =>
        api.post<DetailResponse>("/api/v1/auth/forgot-password/", { email } as ForgotPasswordPayload, { skipAuthRefresh: true }),
    resetPassword: (token: string, new_password: string): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/reset-password/", { token, new_password } as ResetPasswordPayload, { skipAuthRefresh: true }),
    magicLinkRequest: (email: string): Promise<DetailResponse> =>
        api.post<DetailResponse>("/api/v1/auth/magic-link/request/", { email } as MagicLinkRequestPayload, { skipAuthRefresh: true }),
    magicLinkVerify: (token: string): Promise<AuthResponse> =>
        api.post<AuthResponse>("/api/v1/auth/magic-link/verify/", { token } as MagicLinkVerifyPayload, { skipAuthRefresh: true }),
};