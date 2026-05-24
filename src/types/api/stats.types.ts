// src/types/api/stats.types.ts
// Stats dashboard — aligné sur apps/dashboard/ + apps/agent/bot_stats.py
// S56 — Enrichissement complet : N1 (bot stats) + N2 (multi-bot) + N3 (dashboard)
// S62 — +HistoriquePoint + historique? sur toutes les interfaces features

// ── Types partagés ────────────────────────────────────────────────────────────

export type StatPeriod = "7d" | "30d" | "90d" | "custom";

export interface StatPeriodParams {
  period?: StatPeriod;
  date_from?: string; // YYYY-MM-DD
  date_to?:   string; // YYYY-MM-DD
}

/** Point de série temporelle — conversations par jour */
export interface StatSeriesPoint {
  date:  string; // YYYY-MM-DD
  count: number;
}

/** Point historique retourné par le backend S61 — AreaChart N1 */
export interface HistoriquePoint {
  date:   string; // YYYY-MM-DD
  valeur: number;
}

// ── Stats par feature (retournées par FEATURE_AGGREGATORS backend) ─────────────

export interface ChatbotStats {
  total_sessions:             number;
  avg_messages_par_session:   number;
  transferts_humain:          number;
  taux_resolution:            number; // %
  series:                     StatSeriesPoint[];
  historique?:                HistoriquePoint[];
}

export interface ReservationStats {
  total:       number;
  confirmees:  number;
  annulees:    number;
  en_attente:  number;
  par_statut?: Record<string, number>;
  historique?: HistoriquePoint[];
}

export interface CommandeStats {
  total:        number;
  ca_total:     number;
  panier_moyen: number;
  par_statut?:  Record<string, number>;
  historique?:  HistoriquePoint[];
}

export interface PriseRdvStats {
  total:         number;
  honores:       number;
  annules:       number;
  taux_presence: number; // %
  par_statut?:   Record<string, number>;
  historique?:   HistoriquePoint[];
}

export interface ContactsCrmStats {
  nouveaux_contacts: number;
  prospects:         number;
  clients:           number;
  taux_conversion:   number; // %
  par_statut?:       Record<string, number>;
  historique?:       HistoriquePoint[];
}

export interface FaqStats {
  total_consultations: number;
  top_questions:       { question_faq__question_fr: string; nb: number }[];
  historique?:         HistoriquePoint[];
}

export interface TransfertStats {
  total_transferts: number;
  taux_transfert:   number; // %
  par_statut?:      Record<string, number>;
  historique?:      HistoriquePoint[];
}

export interface EmailStats {
  total:       number;
  envoyes:     number;
  echoues:     number;
  taux_envoi:  number; // %
  historique?: HistoriquePoint[];
}

export interface InscriptionStats {
  total:           number;
  acceptees:       number;
  en_attente:      number;
  taux_validation: number; // %
  par_statut?:     Record<string, number>;
  historique?:     HistoriquePoint[];
}

export interface DossierStats {
  total:       number;
  ouverts:     number;
  en_cours:    number;
  clos:        number;
  par_statut?: Record<string, number>;
  historique?: HistoriquePoint[];
}

export interface ConciergericStats {
  total:       number;
  effectuees:  number;
  en_cours:    number;
  par_statut?: Record<string, number>;
  historique?: HistoriquePoint[];
}

/** Union discriminée — données d'une feature dans la réponse stats */
export type FeatureStatData =
  | ChatbotStats
  | ReservationStats
  | CommandeStats
  | PriseRdvStats
  | ContactsCrmStats
  | FaqStats
  | TransfertStats
  | EmailStats
  | InscriptionStats
  | DossierStats
  | ConciergericStats
  | Record<string, unknown>; // fallback pour futures features

// ── Réponse endpoint N1 : GET /api/v1/agent/bots/{id}/stats/ ─────────────────

export interface BotStatsResponse {
  bot_id:   string;
  bot_nom:  string;
  period: {
    date_from: string;
    date_to:   string;
  };
  features: Record<string, FeatureStatData>;
}

// ── Réponse endpoint N2 : GET /api/v1/dashboard/stats/ ───────────────────────

export interface DashboardStatsResponse {
  period: {
    date_from: string;
    date_to:   string;
  };
  bot_id:   string | null;
  features: Record<string, FeatureStatData>;
}

// ── Stats entreprise enrichies (N3 dashboard) ─────────────────────────────────
// GET /api/v1/dashboard/entreprise/ — S56 enrichi — S62 conservé intact

export interface EntrepriseStats {
  // Nouvelles métriques réelles (S56)
  conversations_semaine:        number;
  conversations_actives:        number;
  actions_declenchees_semaine:  number;
  nouveaux_contacts_semaine:    number;
  taux_resolution:              number; // %
  features_actives:             string[];
  secteur_slug:                 string | null;
  // Rétrocompatibilité (anciens champs conservés)
  messages_aujourdhui:          number;
  messages_semaine:             number;
  rdv_aujourdhui:               number;
  rdv_semaine:                  number;
  email_rappels_semaine:        number;
  email_rappels_envoyes:        number;
  email_rappels_echoues:        number;
}

// ── Stats hebdomadaires (courbes N3) ─────────────────────────────────────────

export interface WeeklyDataPoint {
  date:          string; // YYYY-MM-DD
  conversations: number;
  rdv:           number;
}

export interface EntrepriseWeeklyStats {
  data: WeeklyDataPoint[];
}

// ── Stats admin AGT ───────────────────────────────────────────────────────────

export interface AdminStats {
  total_entreprises:              number;
  entreprises_actives:            number;
  total_bots:                     number;
  bots_actifs:                    number;
  total_conversations_aujourdhui: number;
  total_rdv_aujourdhui:           number;
  mrr:                            number;
}