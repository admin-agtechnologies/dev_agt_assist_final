// src/types/api/conversation.types.ts

export interface RapportConversation {
  id: string;
  conversation: string;
  resume: string;
  points_cles: string[];
  actions: { type: string; label: string; detail: string }[];
  tokens_utilises: number;
  rdv_planifies: number;
  emails_envoyes: number;
  transferts_humain: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  bot: string;
  bot_nom: string;
  bot_type: 'whatsapp' | 'vocal';
  client: string;
  client_nom: string;
  client_telephone: string;
  type_conversation: string | null;
  type_label: string | null;
  agenda: string | null;
  agenda_nom: string | null;
  rendez_vous: string | null;
  statut: 'en_cours' | 'terminee' | 'abandonnee';
  human_handoff: boolean;
  dernier_message: string;
  dernier_message_at: string;
  nb_messages: number;
  created_at: string;
  rapport: RapportConversation | null;
}

export interface ConversationFilters {
  bot?: string;
  statut?: string;
  human_handoff?: boolean;
  page?: number;
  page_size?: number;
}

// ── Chatbot bridge ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatTestCanal = 'whatsapp' | 'vocal';

export interface ChatbotTestPayload {
  bot_id: string;
  session_id: string;
  canal?: ChatTestCanal;
  message: string;
  history: ChatMessage[];
}

export interface CollectedData {
  nom?: string;
  telephone?: string;
  email?: string;
  notes_client?: string;
}

export interface ChatActionPayload {
  client_id?: string;
  nom?: string;
  telephone?: string;
  email?: string;
  created?: boolean;
  is_test?: boolean;
  rdv_id?: string;
  client_nom?: string;
  client_phone?: string;
  scheduled_at?: string;
  service?: { id: string; nom: string };
  agenda?: string;
  agence?: string;
  email_id?: string;
  to?: string;
  subject?: string;
  body?: string;
  raison?: string;
  persisted?: boolean;
  error?: string;
}

export interface ChatAction {
  type: 'create_client' | 'create_appointment' | 'send_email' | 'human_handoff';
  status: 'success' | 'error';
  payload: ChatActionPayload;
}

export interface ChatbotTestResponse {
  reply: string;
  intentions: string[];
  human_handoff: boolean;
  tokens_used: number;
  collected_data: CollectedData;
  conversation_summary: string;
  actions: ChatAction[];
  session_id: string;
}

export interface ChatbotConfig {
  id: string;
  bot: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  is_deployed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateChatbotConfigPayload {
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TestSessionSummary {
  id: string;
  bot: string;
  bot_nom: string;
  entreprise: string;
  entreprise_name: string;
  session_id: string;
  canal: ChatTestCanal;
  nb_messages: number;
  has_transfer: boolean;
  intentions: string[];
  collected_data: CollectedData;
  conversation_summary: string;
  tokens_total: number;
  is_test: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestMessage {
  id: string;
  session: string;
  role: 'user' | 'assistant';
  contenu: string;
  tokens: number;
  metadata: {
    intentions?: string[];
    actions_executed?: ChatAction[];
    collected_data?: CollectedData;
    conversation_summary?: string;
    raw_json?: Record<string, unknown>;
  };
  created_at: string;
}

export interface TestEmail {
  id: string;
  session: string;
  to: string;
  subject: string;
  body: string;
  is_test: boolean;
  created_at: string;
}

export interface TestSessionDetail extends TestSessionSummary {
  messages: TestMessage[];
  emails: TestEmail[];
}

// ── WAHA / WhatsApp sessions ──────────────────────────────────────────────────

export type WahaSessionStatus =
  | 'STARTING'
  | 'SCAN_QR_CODE'
  | 'WORKING'
  | 'STOPPED'
  | 'FAILED';

export interface WahaStatusResponse {
  status: WahaSessionStatus;
  phone_number: string;
  connected_at: string | null;
  qr_base64: string | null;
}

export interface WahaConnectResponse {
  status: WahaSessionStatus;
  phone_number: string;
  connected_at: string | null;
}

export interface WahaDisconnectResponse {
  status: 'STOPPED';
}

// ── Agent IA ──────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'status';

export interface AIMessage {
  id: string;
  role: MessageRole;
  contenu: string;
  created_at: string;
}

export interface AIActionDeclenchee {
  action_slug: string;
  statut: 'succes' | 'echec' | 'en_cours';
  created_at: string;
}

export interface AIContactResume {
  id: string;
  nom: string;
  phone: string;
}

export interface AIConversation {
  id: string;
  statut: 'active' | 'terminee' | 'transferee';
  canal: 'web' | 'whatsapp' | 'vocal';
  contact: AIContactResume | null;
  messages: AIMessage[];
  actions_declenchees: AIActionDeclenchee[];
}

export interface AIConversationFilters {
  statut?: 'active' | 'terminee' | 'transferee';
  canal?: 'web' | 'whatsapp' | 'vocal';
  page?: number;
  page_size?: number;
}

export interface SendMessagePayload {
  message: string;
  conversation_id: string | null;
  canal: 'web' | 'whatsapp' | 'vocal';
}

export interface SendMessageResponse {
  conversation_id: string;
  status: 'processing';
}