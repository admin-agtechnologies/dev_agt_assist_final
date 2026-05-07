// src/types/api/user.types.ts

export type UserType = 'superadmin' | 'admin' | 'entreprise';

export interface Profil {
  id: string;
  avatar: string | null;
  telephone: string;
  bio: string;
  ville: string;
  pays: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  label: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
}

export interface SecteurActivite {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
}

export interface EntrepriseInUser {
  id: string;
  name: string;
  slug: string;
  secteur: SecteurActivite | null;
  description: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  site_web: string;
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: UserType;
  is_active: boolean;
  is_email_verified: boolean;
  has_google_auth: boolean;
  roles: Role[];
  profil: Profil | null;
  entreprise: EntrepriseInUser | null;
  permissions: string[];
  created_at: string;
  /** @deprecated Conservé pour compatibilité pages non encore migrées */
  tenant_id?: string | null;
}

// ── Auth payloads ─────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}
export interface GoogleAuthPayload {
  email: string;
  name?: string;
  google_id?: string;
}
export interface VerifyEmailPayload {
  token: string;
}
export interface ResendVerificationPayload {
  email: string;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}
export interface MagicLinkRequestPayload {
  email: string;
}
export interface MagicLinkVerifyPayload {
  token: string;
}
export interface RefreshTokenPayload {
  refresh: string;
}
export interface LogoutPayload {
  refresh: string;
}

// ── Auth responses ────────────────────────────────────────────────────────────

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
export interface TokenRefreshResponse {
  access: string;
}
export interface EmailNotVerifiedResponse {
  detail: 'EMAIL_NOT_VERIFIED';
  email: string;
}