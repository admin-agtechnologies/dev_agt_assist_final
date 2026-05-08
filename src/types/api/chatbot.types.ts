// src/types/api/chatbot.types.ts
// Chatbot bridge + WAHA — aligné sur apps/bots/ et apps/chatbot_bridge/ du backend AGT

// ── Chatbot (config IA liée à un Bot) ────────────────────────────────────────

export interface ChatbotConfig {
  id: string;
  bot: string;
  chatbot_service_id: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  is_deployed: boolean;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateChatbotConfigPayload {
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

// ── Sessions de test chatbot ──────────────────────────────────────────────────

export interface ChatbotTestPayload {
  bot_id: string;
  message: string;
  session_id?: string;
}

export interface ChatbotTestResponse {
  session_id: string;
  response: string;
  tokens_used: number;
}

export interface TestSessionSummary {
  id: string;
  bot: string;
  bot_nom: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

export interface TestSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface TestSessionDetail {
  id: string;
  bot: string;
  bot_nom: string;
  messages: TestSessionMessage[];
  created_at: string;
  updated_at: string;
}

// ── WAHA (WhatsApp session) ───────────────────────────────────────────────────

export type WahaStatus = 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'STOPPED' | 'FAILED';

export interface WahaStatusResponse {
  bot_id: string;
  status: WahaStatus;
  phone_number: string;
  session_name: string;
  qr_code: string | null;
  connected_at: string | null;
}

export interface WahaConnectResponse {
  bot_id: string;
  status: WahaStatus;
  qr_code: string | null;
  message: string;
}

export interface WahaDisconnectResponse {
  bot_id: string;
  status: WahaStatus;
  message: string;
}