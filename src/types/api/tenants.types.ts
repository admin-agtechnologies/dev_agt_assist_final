// src/types/api/tenant.types.ts
// Types Tenant admin — utilisés par tenantsRepository et LeftCockpitPanel.
// Ces types vivaient dans bot.types.ts avant la refacto S23.
// Ajouté S25 — fix DETTE-S24-01 (4 erreurs tsc pré-existantes).

export interface Tenant {
  id: string;
  auth_user_id: string;
  name: string;
  slug: string;
  sector: string;
  description: string;
  whatsapp_number: string;
  phone_number: string;
  subscription_id: string | null;
  wallet_id: string | null;
  is_active: boolean;
  created_at: string;
}

export type CreateTenantPayload = Omit<
  Tenant,
  "id" | "created_at" | "subscription_id" | "wallet_id"
>;

export interface TenantFilters {
  search?: string;
  is_active?: boolean;
  sector?: string;
  page?: number;
  page_size?: number;
}