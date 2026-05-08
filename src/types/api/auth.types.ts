// src/types/api/auth.types.ts
// Auth — aligné sur apps/auth_bridge/ + apps/users/ du backend AGT

// ── Payloads requêtes ─────────────────────────────────────────────────────────

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
  token: string;
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

// ── Réponses ──────────────────────────────────────────────────────────────────

export interface TokenRefreshResponse {
  access: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// ── User (modèle central — apps/users/models.py) ──────────────────────────────

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

export interface EntrepriseInUser {
  id: string;
  name: string;
  slug: string;
  secteur_slug: string | null;
  secteur_nom: string | null;
  is_active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: UserType;
  is_active: boolean;
  is_email_verified: boolean;
  has_google_auth: boolean;
  profil: Profil | null;
  entreprise: EntrepriseInUser | null;
  created_at: string;
}