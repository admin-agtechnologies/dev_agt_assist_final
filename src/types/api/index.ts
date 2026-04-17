// ── Shared ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "pme" | "admin";
  tenant_id: string | null;
  avatar: string | null;
  is_active: boolean;
}
export interface LoginPayload { email: string; password: string; }
export interface AuthResponse { access: string; refresh: string; user: User; }

// ── Tenant ───────────────────────────────────────────────────────────────────
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
export interface TenantFilters { search?: string; is_active?: boolean; sector?: string; page?: number; page_size?: number; }

// ── Bot ──────────────────────────────────────────────────────────────────────
export type WhatsAppProviderType = "waha" | "meta_api";
export type VoiceAIProviderType = "gemini" | "openai";
export type PhoneOperatorType = "twilio" | "orange" | "mtn" | "camtel" | null;
export type BotStatus = "active" | "paused" | "archived";

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
}

export interface CreateBotPayload { name: string; welcome_message: string; personality: string; languages: string[]; whatsapp_provider: WhatsAppProviderType; voice_ai_provider: VoiceAIProviderType; phone_operator?: PhoneOperatorType; is_active?: boolean; }
export interface BotFilters { search?: string; status?: BotStatus; is_active?: boolean; tenant_id?: string; page?: number; page_size?: number; }

// ── Service ──────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number | null;
  is_active: boolean;
}

export interface CreateServicePayload { name: string; description: string; price: number; duration_min: number | null; is_active?: boolean; }
export interface ServiceFilters { search?: string; is_active?: boolean; tenant_id?: string; page?: number; page_size?: number; }

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
}

export interface CreateAppointmentPayload { service_id: string; client_name: string; client_phone: string; client_email?: string; scheduled_at: string; status?: AppointmentStatus; notes?: string; }
export interface AppointmentFilters { search?: string; status?: AppointmentStatus; tenant_id?: string; page?: number; page_size?: number; }

// ── Subscription ──────────────────────────────────────────────────────────────
export type SubscriptionStatus = "active" | "suspended" | "cancelled" | "trial";

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_name: string;
  plan_slug: string;
  renewal_date: string | null;
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
export interface Wallet { id: string; tenant_id: string; balance: number; currency: string; updated_at: string; }

// ── Plan ─────────────────────────────────────────────────────────────────────
export interface Plan { id: string; name: string; slug: string; price: number; currency: string; billing_cycle: string; messages_limit: number; calls_limit: number; features: string[]; }

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

export interface AdminStats { id: string; total_tenants: number; active_tenants: number; total_bots: number; active_bots: number; total_messages_today: number; total_calls_today: number; mrr: number; tenants_growth_week: number; }

// ── Conversation ──────────────────────────────────────────────────────────────
export interface Conversation { id: string; tenant_id: string; bot_id: string; client_identifier: string; client_name: string; channel: "whatsapp" | "voice"; last_message: string; last_message_at: string; messages_count: number; // Ajouter dans l'interface Conversation :
  appointment_id: string | null;}

// ── FAQ ──────────────────────────────────────────────────────────────────────
export interface FAQ { id: string; tenant_id: string; question_fr: string; question_en: string; answer_fr: string; answer_en: string; category: string; is_active: boolean; }
export interface CreateFAQPayload { question_fr: string; question_en: string; answer_fr: string; answer_en: string; category: string; is_active?: boolean; }

// ── ProviderConfig ────────────────────────────────────────────────────────────
export type ProviderType = "whatsapp" | "voice_ai" | "phone_operator";
export interface ProviderConfig { id: string; provider_type: ProviderType; provider_name: string; is_active: boolean; config: Record<string, string>; }
// ── Business Hours ────────────────────────────────────────────────────────────
export interface DayHours { open: boolean; start: string; end: string; }
export interface BusinessHours {
  id: string; tenant_id: string;
  type: "opening" | "appointments";
  monday: DayHours; tuesday: DayHours; wednesday: DayHours;
  thursday: DayHours; friday: DayHours; saturday: DayHours; sunday: DayHours;
}

// ── Location (agence) ─────────────────────────────────────────────────────────
export interface AgencyLocation {
  id: string; tenant_id: string; name: string; address: string;
  whatsapp: string; phone: string; email: string;
  transfer_whatsapp: string; transfer_phone: string;
  hours: BusinessHours | null; extra_info: string; is_active: boolean;
}

// ── TenantKnowledge ───────────────────────────────────────────────────────────
export interface TenantKnowledge {
  id: string; tenant_id: string;
  slogan: string; website: string; email: string;
  transfer_whatsapp: string; transfer_phone: string;
  transfer_email: string; transfer_message: string;
  welcome_message: string;
  bot_tone: "formal" | "semi_formal" | "casual";
  bot_personality: string; bot_languages: string[]; bot_signature: string;
  extra_info: string;
}

// ── ServiceKnowledge ──────────────────────────────────────────────────────────
export interface ServiceKnowledge {
  id: string; service_id: string; tenant_id: string;
  welcome_message: string; bot_description: string;
  bot_tone: "formal" | "semi_formal" | "casual" | "inherit";
  conditions: string; confirmation_message: string; extra_info: string;
}
