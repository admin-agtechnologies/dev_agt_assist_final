// Types et constantes locaux au module Bots — portée strictement locale.

import type { Bot } from "@/types/api";

export type BotData = Bot;

export interface BotPair {
  waBot: BotData;
  voiceBot: BotData | null;
}

// "settings" remplacé par "configuration" (onglet riche S22)
export type DetailTab =
  | "configuration"
  | "conversations"
  | "agenda"
  | "stats"
  | "whatsapp";

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

export const METRIC_DEFS = [
  { id: "messages",     label: "Messages",  color: "#25D366" },
  { id: "calls",        label: "Appels",    color: "#6C3CE1" },
  { id: "appointments", label: "RDV",       color: "#F59E0B" },
  { id: "emails",       label: "Emails",    color: "#0EA5E9" },
  { id: "handoffs",     label: "Transferts",color: "#EF4444" },
] as const;

export type MetricId      = "messages" | "calls" | "appointments" | "emails" | "handoffs";
export type VisibleMetrics = Record<MetricId, boolean>;