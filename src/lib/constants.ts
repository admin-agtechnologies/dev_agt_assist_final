// src/lib/constants.ts

export const PAGE_SIZE = 20;
export const PAGE_SIZE_SM = 5;
export const DEBOUNCE_DELAY = 400;
export const TOAST_DURATION = 4000;
export const TOKEN_KEY = "agt_access_token";
export const REFRESH_KEY = "agt_refresh_token";
export const LOCALE_KEY = "agt-locale";
export const THEME_KEY = "agt-theme";
export const TENANT_KEY = "agt-tenant";
export const Z_MODAL = 9999;
export const Z_SIDEBAR = 50;
export const Z_HEADER = 30;

export const WHATSAPP_PROVIDERS = ["waha", "meta_api"] as const;
export const VOICE_AI_PROVIDERS = ["gemini", "openai"] as const;
export const PHONE_OPERATORS = ["twilio", "orange", "mtn", "camtel"] as const;
export const BOT_STATUSES = ["active", "paused", "archived"] as const;
export const APPOINTMENT_STATUSES = ["pending", "confirmed", "done", "cancelled"] as const;

// ── Routing centralisé ───────────────────────────────────────────────────────
export const ROUTES = {
  home: "/",
  login: "/login",
  pending: "/pending",
  onboarding: "/onboarding",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  magicLink: "/magic-link",
  authHandoff: "/auth-handoff",   // S8 — propagation de token cross-origin
  dashboard: "/dashboard",
  bots: "/bots",
  services: "/services",
  appointments: "/appointments",
  billing: "/billing",
  profile: "/profile",
  help: "/help",
  tutorial: "/tutorial",
  knowledge: "/knowledge",
  feedback: "/feedback",
  bug: "/bug",
} as const;

// ── Wallet cadeau de bienvenue ───────────────────────────────────────────────
// Montant affiché côté frontend (mock). En production, vient de l'API admin.
// L'admin peut désactiver ce bonus indépendamment du prix du plan Starter.
export const WELCOME_BONUS_XAF = 10_000;

// ── Plans tarifaires ─────────────────────────────────────────────────────────
// IMPORTANT : Le plan Starter est à 10 000 XAF (non gratuit).
// Le bonus wallet de bienvenue (10 000 XAF) couvre exactement ce premier mois.
export const PLANS_CONFIG =[
  {
    slug: "starter",
    name: "Starter",
    price: 10_000,
    currency: "XAF",
    billing_cycle: "monthly",
    messages_limit: 2_000,
    calls_limit: 0,
    bots_limit: 2,
    appointments_limit: 10,
    emails_limit: 50,
    highlight: false,
    features_keys: [
      "plans.features.whatsapp",
      "plans.features.appointments10",
      "plans.features.emails50",
      "plans.features.dashboard",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    price: 25_000,
    currency: "XAF",
    billing_cycle: "monthly",
    messages_limit: 5_000,
    calls_limit: 100,
    bots_limit: 3,
    appointments_limit: 100,
    emails_limit: 500,
    highlight: true,
    features_keys: [
      "plans.features.whatsapp",
      "plans.features.voiceBot",
      "plans.features.appointments100",
      "plans.features.emails500",
      "plans.features.dashboard",
      "plans.features.advancedStats",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    price: 75_000,
    currency: "XAF",
    billing_cycle: "monthly",
    messages_limit: 20_000,
    calls_limit: 500,
    bots_limit: 10,
    appointments_limit: 500,
    emails_limit: 2_000,
    highlight: false,
    features_keys:[
      "plans.features.whatsapp",
      "plans.features.voiceBot",
      "plans.features.appointments500",
      "plans.features.emails2000",
      "plans.features.dashboard",
      "plans.features.advancedStats",
      "plans.features.prioritySupport",
    ],
  },
  {
    slug: "gold",
    name: "Gold",
    price: 150_000,
    currency: "XAF",
    billing_cycle: "monthly",
    messages_limit: -1,
    calls_limit: -1,
    bots_limit: -1,
    appointments_limit: -1,
    emails_limit: -1,
    highlight: false,
    features_keys:[
      "plans.features.unlimited",
      "plans.features.whatsapp",
      "plans.features.voiceBot",
      "plans.features.dashboard",
      "plans.features.advancedStats",
      "plans.features.prioritySupport",
      "plans.features.dedicatedManager",
    ],
  },
] as const;

export type PlanSlug = (typeof PLANS_CONFIG)[number]["slug"];

// ── Sous-domaines sectoriels ─────────────────────────────────────────────────
// ⚠️  EN LOCAL  : remplace les valeurs par tes ports localhost
// ⚠️  EN PROD   : remplace par les vrais sous-domaines agt-bot.com
// Un seul endroit à modifier pour toute l'app.
// ⚠️  Doit rester synchronisé avec apps/auth_bridge/_email_urls.py SECTOR_DEV_BASES
//     côté backend (pour les liens d'email).
export const SECTOR_URLS: Record<string, string> = {
  pme:          "http://localhost:3008", // → https://pme.agt-bot.com
  banking:      "http://localhost:3002", // → https://banking.agt-bot.com
  clinical:     "http://localhost:3003", // → https://clinical.agt-bot.com
  school:       "http://localhost:3004", // → https://school.agt-bot.com
  ecommerce:    "http://localhost:3005", // → https://e-commerce.agt-bot.com
  hotel:        "http://localhost:3006", // → https://hotel.agt-bot.com
  public:       "http://localhost:3007", // → https://public.agt-bot.com
  restaurant:   "http://localhost:3001", // → https://restaurant.agt-bot.com
  transport:    "http://localhost:3009", // → https://transport.agt-bot.com
  personnalise: "/onboarding",           // → pas de sous-domaine, onboarding direct
} as const;

export type SectorKey = keyof typeof SECTOR_URLS;