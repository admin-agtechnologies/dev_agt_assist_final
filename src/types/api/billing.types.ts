// src/types/api/billing.types.ts
// Billing — aligné sur apps/billing/models.py du backend AGT

// ── Plan ──────────────────────────────────────────────────────────────────────

export type BillingCycle = 'mensuel' | 'annuel';

export interface Plan {
  id: string;
  nom: string;
  slug: string;
  prix: number;
  frais_installation: number;   // S24 — frais uniques à l'activation (0 = gratuit)
  devise: string;
  billing_cycle: BillingCycle;
  limite_messages: number;
  limite_appels: number;
  limite_bots: number;
  limite_rdv: number;
  limite_emails: number;
  limite_agences: number;
  limite_services: number;
  highlight: boolean;
  is_active: boolean;
  features: string[];
  created_at: string;
}

// ── Abonnement ────────────────────────────────────────────────────────────────

export type AbonnementStatut = 'actif' | 'suspendu' | 'resilie' | 'essai';

export interface Abonnement {
  id: string;
  entreprise: string;
  plan: Plan;
  statut: AbonnementStatut;
  billing_cycle: BillingCycle;
  periode_debut: string;
  periode_fin: string;
  date_renouvellement: string | null;
  usage_messages: number;
  usage_appels: number;
  usage_rdv: number;
  usage_emails: number;
  days_remaining: number;
  created_at: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  entreprise: string;
  entreprise_name: string;
  solde: number;
  devise: string;
  frozen_balance: number;
  total_balance: number;
  updated_at: string;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export type TransactionType = 'recharge' | 'subscription' | 'upgrade' | 'overage' | 'refund' | 'bonus';
export type TransactionCategory = 'recharge' | 'abonnement' | 'bonus' | 'remboursement' | 'autre';
export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'expired';

export interface ServicePaiement {
  id: string;
  nom: string;
  type: 'orange_money' | 'mtn_momo' | 'stripe' | 'systeme';
  is_active: boolean;
}

export interface Transaction {
  id: string;
  wallet: string;
  type: string;
  type_display: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  montant: number;
  solde_apres: number | null;
  service_paiement: string | null;
  service_paiement_nom: string | null;
  reference: string;
  external_reference: string | null;
  label: string;
  created_at: string;
}

export interface TransactionFilters {
  type?: string;
  category?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

// ── Subscription (alias Abonnement — utilisé par les pages billing) ───────────

export type SubscriptionStatus = 'actif' | 'suspendu' | 'resilie' | 'essai';

export interface Subscription {
  id: string;
  entreprise: string;
  entreprise_name: string;
  plan: Plan;
  statut: SubscriptionStatus;
  billing_cycle: string;
  periode_debut: string;
  periode_fin: string;
  date_renouvellement: string | null;
  usage_messages: number;
  usage_appels: number;
  usage_rdv: number;
  usage_emails: number;
  days_remaining: number;
  created_at: string;
}

// ── CodeRecharge ──────────────────────────────────────────────────────────────

export interface CodeRecharge {
  id: string;
  code: string;
  montant: number;
  devise: string;
  label: string;
  is_active: boolean;
  is_single_use: boolean;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateTransactionPayload {
  wallet: string;
  montant: number;
  type: string;
  label: string;
  service_paiement?: string;
}

export interface TopUpPayload {
  amount: number;
  phone: string;
  operator: string;
}