// src/types/api/index.ts

// ── Shared ────────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "pme";
  user_type: "entreprise";
  tenant_id: string | null;
  sector?: string;
  avatar: string | null;
  is_active: boolean;
  created_at?: string;
}
 
export interface LoginPayload { email: string; password: string; }
export interface AuthResponse { access: string; refresh: string; user: User; }

// ── Tenant ────────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  auth_user_id: string;
  name: string;
  slug: string;
  sector: string;
  description: string;
  whatsapp_number: string;
  phone_number: string;
  subscription_id: string | null;
  wallet_id: string | null;
  is_active: boolean;
  created_at: string;
}
export type CreateTenantPayload = Omit<Tenant, "id" | "created_at" | "subscription_id" | "wallet_id">;
export interface TenantFilters {
  search?: string;
  is_active?: boolean;
  sector?: string;
  page?: number;
  page_size?: number;
}

// ── Bot ───────────────────────────────────────────────────────────────────────
export type WhatsAppProviderType = "waha" | "meta_api";
export type VoiceAIProviderType = "gemini" | "openai";
export type PhoneOperatorType = "twilio" | "orange" | "mtn" | "camtel" | null;
export type BotStatus = "active" | "paused" | "archived";
export type BotType = "whatsapp" | "voice";

export interface Bot {
  id: string;
  tenant_id: string;
  chatbot_service_bot_id: string;
  name: string;
  welcome_message: string;
  personality: string;
  languages: string[];
  whatsapp_provider: WhatsAppProviderType;
  voice_ai_provider: VoiceAIProviderType;
  phone_operator: PhoneOperatorType;
  is_active: boolean;
  status: BotStatus;
  created_at: string;
  // Champs étendus (nouveaux)
  bot_type?: BotType;
  paired_bot_id?: string | null;
  phone_number_id?: string | null;
  main_name?: string;
  whatsapp_display_name?: string;
  voice_display_name?: string;
}
export interface CreateBotPayload {
  name: string;
  welcome_message: string;
  personality: string;
  languages: string[];
  whatsapp_provider: WhatsAppProviderType;
  voice_ai_provider: VoiceAIProviderType;
  phone_operator?: PhoneOperatorType;
  is_active?: boolean;
  bot_type?: BotType;
  phone_number_id?: string;
  paired_bot_id?: string;
  tenant_id?: string;
  status?: BotStatus;
}
export interface BotFilters {
  search?: string;
  status?: BotStatus;
  is_active?: boolean;
  tenant_id?: string;
  page?: number;
  page_size?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number | null;
  is_active: boolean;
}
export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  duration_min: number | null;
  is_active?: boolean;
  tenant_id?: string;
}
export interface ServiceFilters {
  search?: string;
  is_active?: boolean;
  tenant_id?: string;
  page?: number;
  page_size?: number;
}

// ── Appointment ───────────────────────────────────────────────────────────────
export type AppointmentStatus = "pending" | "confirmed" | "done" | "cancelled";
export interface Appointment {
  id: string;
  tenant_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  scheduled_at: string;
  status: AppointmentStatus;
  channel: "whatsapp" | "voice" | "manual";
  reminder_sent: boolean;
  notes: string;
  service_name?: string; // Ajoute cette ligne
}
export interface CreateAppointmentPayload {
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  scheduled_at: string;
  status?: AppointmentStatus;
  notes?: string;
  tenant_id?: string;
}
export interface AppointmentFilters {
  search?: string;
  status?: AppointmentStatus;
  tenant_id?: string;
  page?: number;
  page_size?: number;
}

// ── Subscription ──────────────────────────────────────────────────────────────
export type SubscriptionStatus = "active" | "suspended" | "cancelled" | "trial";
export interface Subscription {
  id: string;
  tenant_id: string;
  plan_name: string;
  plan_slug: string;
  renewal_date?: string | null;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "yearly";
  price: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  messages_used: number;
  messages_limit: number;
  calls_used: number;
  calls_limit: number;
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface Wallet {
  id: string;
  tenant_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

// ── Plan ──────────────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_cycle: string;
  messages_limit: number;
  calls_limit: number;
  features: string[];
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface TenantStats {
  messages_today: number;
  messages_week: number;
  calls_today: number;
  calls_week: number;
  appointments_today: number;
  appointments_week: number;
  active_conversations: number;
  emails_sent_week: number;
  week_data: { day: string; messages: number; calls: number }[];
}
export interface AdminStats {
  id: string;
  total_tenants: number;
  active_tenants: number;
  total_bots: number;
  active_bots: number;
  total_messages_today: number;
  total_calls_today: number;
  mrr: number;
  tenants_growth_week: number;
}

// ── Conversation ──────────────────────────────────────────────────────────────
export interface ConversationReport {
  summary: string;
  key_takeaways: string[];
  actions: { type: string; label: string; detail: string }[];
  appointment_scheduled: boolean;
  appointment_id: string | null;
  human_handoff: boolean;
  handoff_reason: string | null;
  services_discussed: string[];
}
export interface Conversation {
  id: string;
  tenant_id: string;
  bot_id: string;
  client_identifier: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  channel: "whatsapp" | "voice";
  last_message: string;
  last_message_at: string;
  messages_count: number;
  appointment_id?: string | null;
  report?: ConversationReport | null;
}
export interface ConversationFilters {
  tenant_id?: string;
  bot_id?: string;
  channel?: string;
  page?: number;
  page_size?: number;
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  tenant_id: string;
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  category: string;
  is_active: boolean;
}
export interface CreateFAQPayload {
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  category: string;
  is_active?: boolean;
  tenant_id?: string;
}

// ── TenantKnowledge ───────────────────────────────────────────────────────────
export interface TenantKnowledge {
  id: string;
  tenant_id: string;
  slogan: string;
  website: string;
  email: string;
  transfer_whatsapp: string;
  transfer_phone: string;
  transfer_email: string;
  transfer_message: string;
  welcome_message: string;
  bot_tone: string;
  bot_personality: string;
  bot_signature: string;
  extra_info: string;
  bot_languages: string[];
  appointment_duration_min?: number;
  slot_buffer_min?: number;
}
export interface CreateTenantKnowledgePayload extends Partial<Omit<TenantKnowledge, "id">> {
  tenant_id: string;
}

// ── ServiceKnowledge ──────────────────────────────────────────────────────────
export interface ServiceKnowledge {
  id: string;
  tenant_id: string;
  service_id: string;
  welcome_message: string;
  bot_description: string;
  conditions: string;
  confirmation_message: string;
  bot_tone?: string;
  extra_info?: string;
}
export interface CreateServiceKnowledgePayload extends Partial<Omit<ServiceKnowledge, "id">> {
  tenant_id: string;
  service_id: string;
}

// ── BusinessHours ─────────────────────────────────────────────────────────────
export interface DayHours {
  open: boolean;
  from: string;
  to: string;
  start?: string;
  end?: string;
}
export interface BusinessHours {
  id: string;
  tenant_id: string;
  hours_type: "opening" | "appointments";
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}
export interface CreateBusinessHoursPayload extends Partial<Omit<BusinessHours, "id">> {
  tenant_id: string;
  hours_type: "opening" | "appointments";
}

// ── Location ──────────────────────────────────────────────────────────────────
export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  is_main: boolean;
  // Ajoute tous ces champs ci-dessous :
  whatsapp?: string;
  phone?: string;
  email?: string;
  transfer_whatsapp?: string;
  transfer_phone?: string;
  extra_info?: string;
  is_active?: boolean;
  hours?: any; // On l'avait déjà évoqué au tour précédent
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateLocationPayload extends Partial<Omit<Location, "id">> {
  tenant_id: string;
  name: string;
  address: string;
  hours?: any; // ou le type exact si tu l'as (ex: Record<string, DayHours>)
  whatsapp?: string;
  phone?: string;
  email?: string;
  transfer_whatsapp?: string;
  transfer_phone?: string;
  extra_info?: string;
  is_active?: boolean;
}

// ── Transaction ───────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  tenant_id: string;
  amount: number;
  currency: string;
  type: "credit" | "debit";
  label: string;
  created_at: string;
  operator?: string;
  reference?: string;
}
export interface CreateTransactionPayload {
  tenant_id: string;
  amount: number;
  currency?: string;
  type: "credit" | "debit";
  label: string;
  wallet_id?: string;
  balance_after?: number; // Ajoute cette ligne
  operator?: string | null; // Ajoute cette ligne
  // ... garde les champs qu'on a ajoutés avant (wallet_id, balance_after, operator)
  reference?: string | null; // Ajoute cette ligne
}

// ── PhoneNumber ───────────────────────────────────────────────────────────────
export interface PhoneNumber {
  id: string;
  number: string;
  tenant_id: string | null;
  whatsapp_bot_id: string | null;
  voice_bot_id: string | null;
  provider_name: string;
  status: string;
}