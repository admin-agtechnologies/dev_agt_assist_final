// src/app/(dashboard)/stats/_config/stats-feature-config.ts
// Registre open/closed des stats par feature.
// Chaque entry définit les KPIs et le type de graphe pour une feature.
//
// Pattern : ajouter une feature = ajouter 1 entrée dans STATS_FEATURE_CONFIG.
// Zéro autre fichier à modifier.
//
// S56 — création initiale.

import type { FeatureStatData } from "@/types/api/stats.types";

// ── Types du registre ─────────────────────────────────────────────────────────

export type ChartType = "area" | "bar" | "donut" | "funnel" | "grouped-bar";

export interface KpiDef {
  /** Clé dans l'objet FeatureStatData */
  key:    string;
  labelKey: string; // clé i18n dans stats.fr/en.ts
  /** Formatage : "number" | "percent" | "currency" */
  format: "number" | "percent" | "currency";
  /** Couleur CSS var ou valeur fixe (statut métier autorisé) */
  color:  string;
}

export interface ChartDef {
  type:     ChartType;
  /** Clé dans l'objet FeatureStatData contenant les données du graphe */
  dataKey:  string;
  /** Pour barres/area : clé de la valeur à tracer */
  valueKey?: string;
  /** Pour donut : chaque slice est une clé de l'objet par_statut */
  sliceColors?: Record<string, string>;
}

export interface FeatureStatsConfig {
  /** Couleur icône de la section */
  color:   string;
  kpis:    KpiDef[];
  chart?:  ChartDef;
}

// ── Couleurs sémantiques (CSS vars — aucune couleur hardcodée hors statut métier) ──

const C = {
  primary:   "var(--color-primary)",
  accent:    "var(--color-accent)",
  success:   "var(--status-success-text)",
  warning:   "var(--status-amber-text)",
  danger:    "var(--status-danger-text)",
  neutral:   "var(--text-muted)",
  info:      "var(--status-info-text)",
};

// Couleurs statut métier (réservations, commandes…) — exceptions justifiées
const STATUS_COLORS: Record<string, string> = {
  confirmee:            "var(--status-success-bg)",
  annulee:              "var(--status-danger-bg)",
  en_attente:           "var(--status-amber-bg)",
  en_attente_confirmation: "var(--status-amber-bg)",
  en_preparation:       "var(--status-info-bg)",
  livree:               "var(--status-success-bg)",
  soumise:              "var(--status-info-bg)",
  acceptee:             "var(--status-success-bg)",
  en_etude:             "var(--status-amber-bg)",
  ouvert:               "var(--status-success-bg)",
  en_cours:             "var(--status-info-bg)",
  clos:                 "var(--status-neutral-bg)",
  effectuee:            "var(--status-success-bg)",
  recue:                "var(--status-info-bg)",
  prise_en_charge:      "var(--status-amber-bg)",
  resolu:               "var(--status-success-bg)",
  en_attente_statut:    "var(--status-amber-bg)",
};

// ── Registre open/closed ──────────────────────────────────────────────────────
// Ajouter une feature = ajouter 1 clé ici. Zéro autre fichier modifié.

export const STATS_FEATURE_CONFIG: Record<string, FeatureStatsConfig> = {

  // ── Sessions WhatsApp ──────────────────────────────────────────────────────
  chatbot_whatsapp: {
    color: C.primary,
    kpis: [
      { key: "total_sessions",           labelKey: "kpiSessions",      format: "number",  color: C.primary  },
      { key: "avg_messages_par_session", labelKey: "kpiAvgMessages",   format: "number",  color: C.neutral  },
      { key: "transferts_humain",        labelKey: "kpiHandoffs",      format: "number",  color: C.warning  },
      { key: "taux_resolution",          labelKey: "kpiResolution",    format: "percent", color: C.success  },
    ],
    chart: {
      type:     "area",
      dataKey:  "series",
      valueKey: "count",
    },
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────
  faq: {
    color: C.info,
    kpis: [
      { key: "total_consultations", labelKey: "kpiFaqTotal", format: "number", color: C.info },
    ],
    chart: {
      type:    "bar",
      dataKey: "top_questions",
      valueKey: "nb",
    },
  },

  // ── Réservations table / chambre / billet / ressource ─────────────────────
  reservation_table: {
    color: C.accent,
    kpis: [
      { key: "total",      labelKey: "kpiTotal",      format: "number",  color: C.accent  },
      { key: "confirmees", labelKey: "kpiConfirmed",  format: "number",  color: C.success },
      { key: "annulees",   labelKey: "kpiCancelled",  format: "number",  color: C.danger  },
      { key: "en_attente", labelKey: "kpiPending",    format: "number",  color: C.warning },
    ],
    chart: {
      type:         "donut",
      dataKey:      "par_statut",
      sliceColors:  STATUS_COLORS,
    },
  },
  reservation_chambre: {
    color: C.accent,
    kpis: [
      { key: "total",      labelKey: "kpiTotal",     format: "number", color: C.accent  },
      { key: "confirmees", labelKey: "kpiConfirmed", format: "number", color: C.success },
      { key: "annulees",   labelKey: "kpiCancelled", format: "number", color: C.danger  },
    ],
    chart: { type: "donut", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  reservation_billet: {
    color: C.accent,
    kpis: [
      { key: "total",      labelKey: "kpiTotal",     format: "number", color: C.accent  },
      { key: "confirmees", labelKey: "kpiConfirmed", format: "number", color: C.success },
    ],
    chart: { type: "donut", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  reservation_ressource: {
    color: C.accent,
    kpis: [
      { key: "total",      labelKey: "kpiTotal",     format: "number", color: C.accent  },
      { key: "confirmees", labelKey: "kpiConfirmed", format: "number", color: C.success },
    ],
    chart: { type: "donut", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Commandes / Menu / Catalogue ──────────────────────────────────────────
  menu_digital: {
    color: C.primary,
    kpis: [
      { key: "total",       labelKey: "kpiOrders",   format: "number",   color: C.primary },
      { key: "ca_total",    labelKey: "kpiRevenue",  format: "currency", color: C.success },
      { key: "panier_moyen",labelKey: "kpiAvgCart",  format: "currency", color: C.neutral },
    ],
    chart: { type: "bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  commande_paiement: {
    color: C.primary,
    kpis: [
      { key: "total",        labelKey: "kpiOrders",  format: "number",   color: C.primary },
      { key: "ca_total",     labelKey: "kpiRevenue", format: "currency", color: C.success },
      { key: "panier_moyen", labelKey: "kpiAvgCart", format: "currency", color: C.neutral },
    ],
    chart: { type: "bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  catalogue_produits: {
    color: C.primary,
    kpis: [
      { key: "total",        labelKey: "kpiOrders",  format: "number",   color: C.primary },
      { key: "ca_total",     labelKey: "kpiRevenue", format: "currency", color: C.success },
      { key: "panier_moyen", labelKey: "kpiAvgCart", format: "currency", color: C.neutral },
    ],
    chart: { type: "bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Prise de RDV ──────────────────────────────────────────────────────────
  prise_rdv: {
    color: C.info,
    kpis: [
      { key: "total",         labelKey: "kpiRdvTotal",    format: "number",  color: C.info    },
      { key: "honores",       labelKey: "kpiRdvHonored",  format: "number",  color: C.success },
      { key: "annules",       labelKey: "kpiRdvCancelled",format: "number",  color: C.danger  },
      { key: "taux_presence", labelKey: "kpiPresence",    format: "percent", color: C.primary },
    ],
    chart: { type: "grouped-bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  orientation_patient: {
    color: C.info,
    kpis: [
      { key: "total",         labelKey: "kpiRdvTotal",   format: "number",  color: C.info    },
      { key: "honores",       labelKey: "kpiRdvHonored", format: "number",  color: C.success },
      { key: "taux_presence", labelKey: "kpiPresence",   format: "percent", color: C.primary },
    ],
    chart: { type: "grouped-bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── CRM / Contacts ────────────────────────────────────────────────────────
  gestion_crm: {
    color: C.success,
    kpis: [
      { key: "nouveaux_contacts", labelKey: "kpiNewContacts",  format: "number",  color: C.success },
      { key: "prospects",         labelKey: "kpiProspects",    format: "number",  color: C.warning },
      { key: "clients",           labelKey: "kpiClients",      format: "number",  color: C.primary },
      { key: "taux_conversion",   labelKey: "kpiConversion",   format: "percent", color: C.accent  },
    ],
    chart: { type: "funnel", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  prospection_active: {
    color: C.success,
    kpis: [
      { key: "nouveaux_contacts", labelKey: "kpiNewContacts", format: "number",  color: C.success },
      { key: "taux_conversion",   labelKey: "kpiConversion",  format: "percent", color: C.accent  },
    ],
    chart: { type: "funnel", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Transfert humain ──────────────────────────────────────────────────────
  transfert_humain: {
    color: C.warning,
    kpis: [
      { key: "total_transferts", labelKey: "kpiHandoffsTotal", format: "number",  color: C.warning },
      { key: "taux_transfert",   labelKey: "kpiHandoffRate",   format: "percent", color: C.danger  },
    ],
    chart: { type: "donut", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Emails ────────────────────────────────────────────────────────────────
  email_notifications: {
    color: C.info,
    kpis: [
      { key: "total",      labelKey: "kpiEmailsTotal",  format: "number",  color: C.info    },
      { key: "envoyes",    labelKey: "kpiEmailsSent",   format: "number",  color: C.success },
      { key: "echoues",    labelKey: "kpiEmailsFailed", format: "number",  color: C.danger  },
      { key: "taux_envoi", labelKey: "kpiSendRate",     format: "percent", color: C.primary },
    ],
    chart: { type: "grouped-bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
  communication_etablissement: {
    color: C.info,
    kpis: [
      { key: "total",      labelKey: "kpiEmailsTotal", format: "number",  color: C.info    },
      { key: "envoyes",    labelKey: "kpiEmailsSent",  format: "number",  color: C.success },
      { key: "taux_envoi", labelKey: "kpiSendRate",    format: "percent", color: C.primary },
    ],
    chart: { type: "grouped-bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Inscriptions ──────────────────────────────────────────────────────────
  inscription: {
    color: C.accent,
    kpis: [
      { key: "total",           labelKey: "kpiInscTotal",    format: "number",  color: C.accent  },
      { key: "acceptees",       labelKey: "kpiInscAccepted", format: "number",  color: C.success },
      { key: "en_attente",      labelKey: "kpiPending",      format: "number",  color: C.warning },
      { key: "taux_validation", labelKey: "kpiValidation",   format: "percent", color: C.primary },
    ],
    chart: { type: "funnel", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Dossiers ──────────────────────────────────────────────────────────────
  dossiers: {
    color: C.neutral,
    kpis: [
      { key: "total",    labelKey: "kpiDossiersTotal",  format: "number", color: C.neutral },
      { key: "ouverts",  labelKey: "kpiDossiersOpen",   format: "number", color: C.success },
      { key: "en_cours", labelKey: "kpiDossiersOngoing",format: "number", color: C.info    },
      { key: "clos",     labelKey: "kpiDossiersClosed", format: "number", color: C.neutral },
    ],
    chart: { type: "bar", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },

  // ── Conciergerie ──────────────────────────────────────────────────────────
  conciergerie: {
    color: C.accent,
    kpis: [
      { key: "total",      labelKey: "kpiConcTotal",    format: "number", color: C.accent  },
      { key: "effectuees", labelKey: "kpiConcDone",     format: "number", color: C.success },
      { key: "en_cours",   labelKey: "kpiConcOngoing",  format: "number", color: C.info    },
    ],
    chart: { type: "donut", dataKey: "par_statut", sliceColors: STATUS_COLORS },
  },
};

/** Lookup rapide slug → config stats */
export function getFeatureStatsConfig(slug: string): FeatureStatsConfig | null {
  return STATS_FEATURE_CONFIG[slug] ?? null;
}