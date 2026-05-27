// src/repositories/stats.repository.ts
// Repository stats — N1 (bot), N2 (multi-bot dashboard), N3 (entreprise).
// S56 création — S57 fix : api.get<T>() génériques + retrait adminStatsRepository
//   (admin ne doit pas être exposé dans le bundle client).

import { api } from "@/lib/api-client";
import type {
  BotStatsResponse,
  DashboardStatsResponse,
  EntrepriseStats,
  EntrepriseWeeklyStats,
  StatPeriodParams,
} from "@/types/api/stats.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function periodParams(p?: StatPeriodParams): Record<string, string> {
  if (!p) return {};
  const params: Record<string, string> = {};
  if (p.period)    params.period    = p.period;
  if (p.date_from) params.date_from = p.date_from;
  if (p.date_to)   params.date_to   = p.date_to;
  return params;
}

// ── N1 — Stats d'un bot spécifique ───────────────────────────────────────────

export const botStatsRepository = {
  /**
   * GET /api/v1/agent/bots/{bot_id}/stats/
   * Stats agrégées d'un bot par feature sur une période.
   */
  getStats: (
    botId: string,
    period?: StatPeriodParams,
  ): Promise<BotStatsResponse> =>
    api
      .get<BotStatsResponse>(
        `/api/v1/agent/bots/${botId}/stats/`,
        { params: periodParams(period) },
      )
      .catch((): BotStatsResponse => ({
        bot_id:  botId,
        bot_nom: "",
        period:  { date_from: "", date_to: "" },
        features: {},
      })),
};

// ── N2 — Stats multi-bot entreprise ──────────────────────────────────────────

export const dashboardStatsRepository = {
  /**
   * GET /api/v1/dashboard/stats/
   * Stats agrégées multi-bot. Filtre optionnel : bot_id, feature slug.
   */
  getStats: (
    period?: StatPeriodParams,
    botId?: string | null,
    featureSlug?: string,
  ): Promise<DashboardStatsResponse> => {
    const params: Record<string, string> = periodParams(period);
    if (botId)       params.bot_id  = botId;
    if (featureSlug) params.feature = featureSlug;
    return api
      .get<DashboardStatsResponse>("/api/v1/dashboard/stats/", { params })
      .catch((): DashboardStatsResponse => ({
        period:   { date_from: "", date_to: "" },
        bot_id:   null,
        features: {},
      }));
  },
};

// ── N3 — Dashboard entreprise ─────────────────────────────────────────────────

export const entrepriseStatsRepository = {
  /**
   * GET /api/v1/dashboard/entreprise/
   * KPIs globaux pour le hero dashboard.
   */
  getStats: (): Promise<EntrepriseStats | null> =>
    api
      .get<EntrepriseStats>("/api/v1/dashboard/entreprise/")
      .catch((): null => null),

  /**
   * GET /api/v1/dashboard/entreprise/weekly/
   * Série hebdomadaire pour graphe d'activité.
   */
  getWeekly: (): Promise<EntrepriseWeeklyStats> =>
    api
      .get<EntrepriseWeeklyStats>("/api/v1/dashboard/entreprise/weekly/")
      .then((data: EntrepriseWeeklyStats) => {
        if (data && typeof data === "object" && "data" in data) return data;
        return { data: [] };
      })
      .catch((): EntrepriseWeeklyStats => ({ data: [] })),
};

// ⚠️ adminStatsRepository retiré volontairement — ne pas exposer dans le bundle client.
// Créer un fichier src/repositories/admin.repository.ts si nécessaire côté admin.