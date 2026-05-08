// src/repositories/commandes.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Commande, CommandeFilters, UpdateCommandeStatutPayload,
  Plan, Subscription, Wallet, Transaction,
  CreateTransactionPayload, TenantStats, AdminStats,
} from "@/types/api/commande.types";

export interface WeeklyDataPoint {
  day: string;
  date: string;
  messages: number;
  calls: number;
}

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

// ── Commandes ─────────────────────────────────────────────────────────────────

export const commandesRepository = {
  list: (f?: CommandeFilters): Promise<PaginatedResponse<Commande>> =>
    api.get("/api/v1/commandes/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Commande[], count: (data as Commande[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Commande>),
    ),

  getById: (id: string): Promise<Commande> =>
    api.get(`/api/v1/commandes/${id}/`),

  updateStatut: (id: string, payload: UpdateCommandeStatutPayload): Promise<Commande> =>
    api.patch(`/api/v1/commandes/${id}/statut/`, payload),
};

// ── Billing ───────────────────────────────────────────────────────────────────

export const plansRepository = {
  getList: (): Promise<Plan[]> =>
    api.get("/api/v1/billing/plans/", { params: { is_active: "true" } })
      .then((data: unknown) =>
        Array.isArray(data) ? (data as Plan[]) : ((data as { results?: Plan[] }).results ?? []),
      ),
};

export const subscriptionsRepository = {
  getMine: (): Promise<Subscription | null> =>
    api.get<Subscription>("/api/v1/billing/abonnements/mon-abonnement/").catch(() => null),
  getList: (): Promise<PaginatedResponse<Subscription>> =>
    api.get("/api/v1/billing/abonnements/").then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as Subscription[], count: (data as Subscription[]).length, next: null, previous: null }
        : (data as PaginatedResponse<Subscription>),
    ),
  getById: (id: string): Promise<Subscription> =>
    api.get(`/api/v1/billing/abonnements/${id}/`),
};

export const walletsRepository = {
  getMine: (): Promise<Wallet | null> =>
    api.get("/api/v1/billing/wallets/").then((data: unknown) => {
      if (Array.isArray(data)) return data.length > 0 ? (data[0] as Wallet) : null;
      const pag = data as { results?: Wallet[] };
      return pag.results && pag.results.length > 0 ? pag.results[0] : null;
    }),
  getById: (id: string): Promise<Wallet> =>
    api.get(`/api/v1/billing/wallets/${id}/`),
};

export const transactionsRepository = {
  getMine: (): Promise<Transaction[]> =>
    api.get("/api/v1/billing/transactions/")
      .then((data: unknown) =>
        Array.isArray(data) ? (data as Transaction[]) : ((data as { results?: Transaction[] }).results ?? []),
      ),
  create: (payload: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/api/v1/billing/transactions/", payload),
};

export const billingActionsRepository = {
  initiateRecharge: (walletId: string, payload: {
    amount: number; service_paiement_id: string; phone: string; idempotency_key: string;
  }): Promise<unknown> =>
    api.post(`/api/v1/billing/wallets/${walletId}/initiate-recharge/`, payload),
  pollTransaction: (txnId: string): Promise<unknown> =>
    api.get(`/api/v1/billing/transactions/${txnId}/poll-status/`),
  previewUpgrade: (planId: string): Promise<unknown> =>
    api.get(`/api/v1/billing/plans/${planId}/preview-upgrade/`),
  confirmUpgrade: (planId: string): Promise<unknown> =>
    api.post(`/api/v1/billing/plans/${planId}/confirm-upgrade/`, {}),
  applyCode: (code: string): Promise<{
    detail: string; montant: string; devise: string; nouveau_solde: string;
  }> => api.post("/api/v1/billing/codes-recharge/apply-code/", { code }),
};

export const statsRepository = {
  getByTenant: (): Promise<TenantStats | null> =>
    api.get<TenantStats>("/api/v1/dashboard/entreprise/").catch(() => null),
  getAdmin: (): Promise<AdminStats> =>
    api.get<AdminStats>("/api/v1/dashboard/admin/"),
  getWeekly: (): Promise<WeeklyDataPoint[]> =>
    api.get<WeeklyDataPoint[]>("/api/v1/dashboard/entreprise/weekly/").catch(() => []),
};