// src/types/api/stats.types.ts
// Stats dashboard — aligné sur apps/dashboard/ du backend AGT
// Endpoints : GET /api/v1/dashboard/entreprise/ | GET /api/v1/dashboard/admin/

// ── Stats entreprise (dashboard PME) ─────────────────────────────────────────

export interface EntrepriseStats {
  messages_aujourdhui: number;
  messages_semaine: number;
  appels_aujourdhui: number;
  rdv_aujourdhui: number;
  rdv_semaine: number;
  conversations_actives: number;
  email_rappels_semaine: number;
  email_rappels_envoyes: number;
  email_rappels_echoues: number;
}

// ── Stats hebdomadaires (courbes) ─────────────────────────────────────────────

export interface WeeklyDataPoint {
  date: string;          // format "YYYY-MM-DD"
  messages: number;
  appels: number;
  rdv: number;
}

export interface EntrepriseWeeklyStats {
  data: WeeklyDataPoint[];
}

// ── Stats admin AGT ───────────────────────────────────────────────────────────

export interface AdminStats {
  total_entreprises: number;
  entreprises_actives: number;
  total_bots: number;
  bots_actifs: number;
  total_conversations_aujourdhui: number;
  total_rdv_aujourdhui: number;
  mrr: number;
}