// src/lib/constants.ts

export const PAGE_SIZE       = 20;
export const PAGE_SIZE_SM    = 5;
export const DEBOUNCE_DELAY  = 400;
export const TOAST_DURATION  = 4000;
export const TOKEN_KEY       = "agt_access_token";
export const REFRESH_KEY     = "agt_refresh_token";
export const LOCALE_KEY      = "agt-locale";
export const THEME_KEY       = "agt-theme";
export const TENANT_KEY      = "agt-tenant";
export const Z_MODAL         = 9999;
export const Z_SIDEBAR       = 50;
export const Z_HEADER        = 30;

export const WHATSAPP_PROVIDERS  = ["waha", "meta_api"] as const;
export const VOICE_AI_PROVIDERS  = ["gemini", "openai"] as const;
export const PHONE_OPERATORS     = ["twilio", "orange", "mtn", "camtel"] as const;
export const BOT_STATUSES        = ["active", "paused", "archived"] as const;
export const APPOINTMENT_STATUSES = ["pending", "confirmed", "done", "cancelled"] as const;

// ── Routing centralisé ───────────────────────────────────────────────────────
export const ROUTES = {
  home:           "/",
  login:          "/login",
  pending:        "/pending",
  onboarding:     "/onboarding",
  verifyEmail:    "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword:  "/reset-password",
  magicLink:      "/magic-link",
  authHandoff:    "/auth-handoff",
  dashboard:      "/dashboard",
  bots:           "/bots",
  services:       "/services",
  appointments:   "/appointments",
  billing:        "/billing",
  profile:        "/profile",
  help:           "/help",
  tutorial:       "/tutorial",
  knowledge:      "/knowledge",
  feedback:       "/feedback",
  bug:            "/bug",
} as const;

// ── Wallet cadeau de bienvenue ───────────────────────────────────────────────
// Couvre exactement le plan Découverte (10 000 XAF) → premier mois offert.
// En production, la valeur réelle vient de l'API admin (PlatformSettings).
export const WELCOME_BONUS_XAF = 10_000;

// ── Plans tarifaires S24 ─────────────────────────────────────────────────────
// Synchronisé avec billing_seeder.py (apps/tenants/seeders/billing_seeder.py)
// 4 plans : Découverte · Starter · Business · Pro
// Le frontend lit les plans en temps réel via GET /api/v1/billing/plans/
// Cette config statique est utilisée pour l'affichage offline / SSG uniquement.
export const PLANS_CONFIG = [
  {
    slug: "decouverte",
    name: "Découverte",
    price: 10_000,
    installation_fee: 0,
    currency: "XAF",
    billing_cycle: "mensuel",
    messages_limit: 100,
    calls_limit: 10,
    bots_limit: 1,
    appointments_limit: 15,
    emails_limit: 50,
    highlight: false,
    features_keys: [
      "plans.features.whatsapp",
      "plans.features.vocal",
      "plans.features.dashboard",
      "plans.features.faq",
      "plans.features.crm",
    ],
  },
  {
    slug: "starter",
    name: "Starter",
    price: 50_000,
    installation_fee: 100_000,
    currency: "XAF",
    billing_cycle: "mensuel",
    messages_limit: 30_000,
    calls_limit: 500,
    bots_limit: 2,
    appointments_limit: 300,
    emails_limit: 5_000,
    highlight: false,
    features_keys: [
      "plans.features.whatsapp",
      "plans.features.vocal",
      "plans.features.dashboard",
      "plans.features.faq",
      "plans.features.crm",
      "plans.features.orders",
      "plans.features.payment",
    ],
  },
  {
    slug: "business",
    name: "Business",
    price: 150_000,
    installation_fee: 250_000,
    currency: "XAF",
    billing_cycle: "mensuel",
    messages_limit: 100_000,
    calls_limit: 2_000,
    bots_limit: 5,
    appointments_limit: 1_500,
    emails_limit: 20_000,
    highlight: true,
    features_keys: [
      "plans.features.whatsapp",
      "plans.features.vocal",
      "plans.features.dashboard",
      "plans.features.faq",
      "plans.features.crm",
      "plans.features.orders",
      "plans.features.payment",
      "plans.features.prospecting",
      "plans.features.multiAgences",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    price: 300_000,
    installation_fee: 500_000,
    currency: "XAF",
    billing_cycle: "mensuel",
    messages_limit: -1,
    calls_limit: -1,
    bots_limit: -1,
    appointments_limit: -1,
    emails_limit: -1,
    highlight: false,
    features_keys: [
      "plans.features.unlimited",
      "plans.features.whatsapp",
      "plans.features.vocal",
      "plans.features.dashboard",
      "plans.features.prioritySupport",
      "plans.features.dedicatedManager",
    ],
  },
] as const;

export type PlanSlug = (typeof PLANS_CONFIG)[number]["slug"];

// ── Sous-domaines sectoriels ─────────────────────────────────────────────────
// ⚠️ DEPRECATED — remplacé par getSectorUrl(slug) dans @/lib/sector-urls
// Conservé uniquement pour compatibilité avec LandingData.ts (à migrer en S25)
export const SECTOR_URLS: Record<string, string> = {
  restaurant: "http://localhost:3001",
  banking:    "http://localhost:3002",
  clinical:   "http://localhost:3003",
  school:     "http://localhost:3004",
  ecommerce:  "http://localhost:3005",
  hotel:      "http://localhost:3006",
  public:     "http://localhost:3007",
  pme:        "http://localhost:3008",
  transport:  "http://localhost:3009",
};