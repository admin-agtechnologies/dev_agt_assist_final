// src/app/(dashboard)/bots/_components/bots.types.ts
import type { Bot } from "@/types/api";

export type BotData = Bot;

export interface BotPair {
  waBot: BotData;
  voiceBot: BotData | null;
}

// ── S54 — tabs dynamiques (clients retiré des fixes → feature gestion_crm) ───
export type FixedTab = "configuration" | "conversations" | "stats" | "whatsapp";
export type FeatureTab = `feature:${string}`;
export type DetailTab = FixedTab | FeatureTab;

export interface FeatureTabDef {
  slug: string;
  label: { fr: string; en: string };
  icon: React.ElementType;
  special?: "chatbot";
  fetcher?: (params: {
    page: number;
    page_size: number;
    bot_id: string;
  }) => Promise<import("@/types/api").PaginatedResponse<{ id: string }>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultCard?: React.ComponentType<{ item: any }>;
  emptyMessage: { fr: string; en: string };
  emptyHint:    { fr: string; en: string };
}

// ── S51 — Métriques Stats ─────────────────────────────────────────────────────
export type MetricId = "messages" | "calls" | "appointments" | "emails" | "handoffs";
export type VisibleMetrics = Record<MetricId, boolean>;

export const METRIC_DEFS: Array<{ id: MetricId; label: string; color: string }> = [
  { id: "messages",     label: "Messages",   color: "#6366f1" },
  { id: "calls",        label: "Appels",     color: "#8b5cf6" },
  { id: "appointments", label: "RDV",        color: "#10b981" },
  { id: "emails",       label: "Emails",     color: "#f59e0b" },
  { id: "handoffs",     label: "Transferts", color: "#ef4444" },
];

// ── Legacy (conservé pour compatibilité) ─────────────────────────────────────
export const SECTOR_COLORS: Record<string, { primary: string; accent: string }> = {
  sante: { primary: "#0EA5E9", accent: "#38BDF8" },
  santé: { primary: "#0EA5E9", accent: "#38BDF8" },
  juridique: { primary: "#1E3A5F", accent: "#3B82F6" },
  beaute: { primary: "#EC4899", accent: "#F9A8D4" },
  beauté: { primary: "#EC4899", accent: "#F9A8D4" },
  restauration: { primary: "#F97316", accent: "#FDBA74" },
  commerce: { primary: "#8B5CF6", accent: "#C4B5FD" },
  finance: { primary: "#059669", accent: "#34D399" },
  education: { primary: "#6366F1", accent: "#A5B4FC" },
  transport: { primary: "#64748B", accent: "#94A3B8" },
  default: { primary: "#075E54", accent: "#25D366" },
};

export function getSectorColor(sector: string): { primary: string; accent: string } {
  const key = (sector ?? "").toLowerCase().replace(/[éè]/g, "e").replace(/[àâ]/g, "a");
  return SECTOR_COLORS[key] ?? SECTOR_COLORS.default;
}

export const MOCK_WEEK_DATA = [
  { day: "Lun", messages: 38, calls: 3, appointments: 2, emails: 10, handoffs: 1 },
  { day: "Mar", messages: 52, calls: 5, appointments: 4, emails: 15, handoffs: 2 },
  { day: "Mer", messages: 45, calls: 2, appointments: 1, emails:  8, handoffs: 0 },
  { day: "Jeu", messages: 61, calls: 7, appointments: 5, emails: 20, handoffs: 3 },
  { day: "Ven", messages: 48, calls: 4, appointments: 3, emails: 12, handoffs: 1 },
  { day: "Sam", messages: 32, calls: 2, appointments: 8, emails:  5, handoffs: 0 },
  { day: "Dim", messages: 36, calls: 3, appointments: 6, emails:  7, handoffs: 1 },
];

export interface MockMessage { role: "bot" | "client"; text: string; time: string; }

export const MOCK_HISTORY: Record<string, MockMessage[]> = {
  default: [
    { role: "client", text: "Bonjour, je voudrais prendre un rendez-vous.", time: "14:02" },
    { role: "bot",    text: "Bonjour ! Bien sûr, pour quel service ?",      time: "14:02" },
    { role: "client", text: "Une consultation médicale.",                    time: "14:03" },
    { role: "bot",    text: "Parfait. Quelle date vous convient ?",          time: "14:03" },
    { role: "client", text: "Demain à 10h si possible.",                     time: "14:04" },
    { role: "bot",    text: "RDV confirmé pour demain à 10h. Vous recevrez un rappel.", time: "14:04" },
  ],
};