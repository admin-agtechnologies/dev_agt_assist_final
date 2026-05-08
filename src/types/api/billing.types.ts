// src/types/api/billing.types.ts
// Billing — aligné sur apps/billing/models.py du backend AGT

// ── Plan ──────────────────────────────────────────────────────────────────────

export type BillingCycle = 'mensuel' | 'annuel';

export interface Plan {
  id: string;
  nom: string;
  slug: string;
  prix: number;
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
  created_at: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  entreprise: string;
  solde: number;
  devise: string;
  frozen_balance: number;
  created_at: string;
  updated_at: string;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export type TransactionType = 'credit' | 'debit';
export type TransactionCategory = 'recharge' | 'abonnement' | 'bonus' | 'remboursement' | 'autre';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface ServicePaiement {
  id: string;
  nom: string;
  type: 'orange_money' | 'mtn_momo' | 'stripe' | 'systeme';
  is_active: boolean;
}

export interface Transaction {
  id: string;
  wallet: string;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  montant: number;
  solde_apres: number | null;
  service_paiement: ServicePaiement | null;
  reference: string;
  external_reference: string | null;
  label: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  page?: number;
  page_size?: number;
}

// ── CodeRecharge ──────────────────────────────────────────────────────────────

export type CodeRechargeStatut = 'actif' | 'utilise' | 'expire';

export interface CodeRecharge {
  id: string;
  code: string;
  montant: number;
  devise: string;
  statut: CodeRechargeStatut;
  expires_at: string | null;
  created_at: string;
}

export interface UseCodeRechargePayload {
  code: string;
}