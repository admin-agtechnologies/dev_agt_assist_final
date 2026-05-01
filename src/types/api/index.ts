// src/types/api/index.ts

// ── Shared ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DetailResponse {
  detail: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export type UserType = "superadmin" | "admin" | "entreprise";

export interface Profil {
  id: string;
  avatar: string | null;
  telephone: string;
  bio: string;
  ville: string;
  pays: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  label: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
}

export interface SecteurActivite {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
}

export interface EntrepriseInUser {
  id: string;
  name: string;
  slug: string;
  secteur: SecteurActivite | null;
  description: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  site_web: string;
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: UserType;
  is_active: boolean;
  is_email_verified: boolean;
  has_google_auth: boolean;
  roles: Role[];
  profil: Profil | null;
  entreprise: EntrepriseInUser | null;
  permissions: string[];
  created_at: string;
  // Conservé pour compatibilité pages non encore migrées
  tenant_id?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}
export interface GoogleAuthPayload {
  email: string;
  name?: string;
  google_id?: string;
}
export interface VerifyEmailPayload {
  token: string;
}
export interface ResendVerificationPayload {
  email: string;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}
export interface MagicLinkRequestPayload {
  email: string;
}
export interface MagicLinkVerifyPayload {
  token: string;
}
export interface RefreshTokenPayload {
  refresh: string;
}
export interface LogoutPayload {
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
export interface TokenRefreshResponse {
  access: string;
}
export interface EmailNotVerifiedResponse {
  detail: "EMAIL_NOT_VERIFIED";
  email: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// TENANT
// ══════════════════════════════════════════════════════════════════════════════
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
export type CreateTenantPayload = Omit<
  Tenant,
  "id" | "created_at" | "subscription_id" | "wallet_id"
>;
export interface TenantFilters {
  search?: string;
  is_active?: boolean;
  sector?: string;
  page?: number;
  page_size?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// BOT
// Aligné avec apps/bots/models.py et apps/bots/serializers.py
// ══════════════════════════════════════════════════════════════════════════════

/** Valeurs exactes du champ Bot.statut côté Django. */
export type BotStatut = "actif" | "en_pause" | "archive";

/** Valeurs exactes du champ Bot.bot_type côté Django. */
export type BotType = "whatsapp" | "vocal";

/**
 * Représentation d'un Bot telle que retournée par BotSerializer.
 * Tous les noms de champs sont ceux du modèle Django.
 */
export interface Bot {
  id: string;
  entreprise: string; // UUID FK → Entreprise
  entreprise_name: string;
  numero: string | null; // UUID FK → NumeroTelephone (null si non assigné)
  numero_value: string | null; // Valeur lisible du numéro (ex: "+237699000001")
  bot_type: BotType;
  nom: string;
  message_accueil: string;
  personnalite: string;
  langues: string[]; // JSONField Django — tableau de codes langue
  config_whatsapp: string | null; // UUID FK → ConfigProvider
  config_voice_ai: string | null; // UUID FK → ConfigProvider
  bot_paire: string | null; // UUID O2O → Bot (le WA pointe vers le Vocal)
  statut: BotStatut;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload de création / mise à jour d'un Bot. */
export interface CreateBotPayload {
  nom: string;
  message_accueil?: string;
  personnalite?: string;
  langues?: string[];
  bot_type?: BotType;
  is_active?: boolean;
  statut?: BotStatut;
  entreprise?: string;
  numero?: string | null;
  bot_paire?: string | null;
}

export interface BotFilters {
  search?: string;
  statut?: BotStatut;
  is_active?: boolean;
  bot_type?: BotType;
  page?: number;
  page_size?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// NUMÉRO DE TÉLÉPHONE
// ══════════════════════════════════════════════════════════════════════════════
export interface NumeroTelephone {
  id: string;
  numero: string;
  operateur: {
    id: string;
    nom: string;
    slug: string;
    pays: string;
    is_active: boolean;
    created_at: string;
  } | null;
  config_provider: string | null;
  entreprise: string | null;
  entreprise_name: string | null;
  statut: "disponible" | "assigne" | "suspendu";
  notes: string;
  created_at: string;
  updated_at: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════════════════════════════════════════
export interface Service {
  id: string;
  entreprise: string;
  entreprise_name: string;
  nom: string;
  description: string;
  prix: number;
  duree_min: number | null;
  is_active: boolean;
  created_at: string;
}
export interface CreateServicePayload {
  nom: string;
  description: string;
  prix: number;
  duree_min: number | null;
  is_active?: boolean;
}
export interface ServiceFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENCE & HORAIRES & AGENDA
// ══════════════════════════════════════════════════════════════════════════════

export interface DaySchedule {
  open: boolean;
  start: string;
  end: string;
  slot_min?: number;
}

export interface HorairesOuverture {
  id: string;
  agence: string;
  type: "ouverture" | "rendez_vous";
  lundi: DaySchedule;
  mardi: DaySchedule;
  mercredi: DaySchedule;
  jeudi: DaySchedule;
  vendredi: DaySchedule;
  samedi: DaySchedule;
  dimanche: DaySchedule;
  created_at: string;
}

export interface UpdateHorairesPayload {
  lundi?: DaySchedule;
  mardi?: DaySchedule;
  mercredi?: DaySchedule;
  jeudi?: DaySchedule;
  vendredi?: DaySchedule;
  samedi?: DaySchedule;
  dimanche?: DaySchedule;
}

export interface Agence {
  id: string;
  entreprise: string;
  nom: string;
  adresse: string;
  ville: string;
  whatsapp: string;
  telephone: string;
  email: string;
  transfer_whatsapp: string;
  transfer_phone: string;
  extra_info: string;
  is_active: boolean;
  is_siege: boolean;
  horaires: HorairesOuverture[];
  services_count: number;
  service_ids: string[];
  created_at: string;
}
export interface CreateAgencePayload {
  nom: string;
  adresse?: string;
  ville?: string;
  whatsapp?: string;
  telephone?: string;
  email?: string;
  transfer_whatsapp?: string;
  transfer_phone?: string;
  extra_info?: string;
  is_active?: boolean;
  service_ids?: string[];
}
export interface Agenda {
  id: string;
  agence: string | null;
  agence_nom: string | null;
  nom: string;
  description: string;
  duree_rdv_min: number;
  buffer_min: number;
  bots_ids: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreateAgendaPayload {
  agence?: string;
  nom: string;
  description?: string;
  duree_rdv_min?: number;
  buffer_min?: number;
  is_active?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDEZ-VOUS
// ══════════════════════════════════════════════════════════════════════════════

export interface ServiceRDV {
  id: number;
  service: string;
  service_nom: string;
  service_prix: string;
}

export interface RendezVous {
  id: string;
  agenda: string;
  agenda_nom: string;
  agence: string | null;
  agence_nom: string | null;
  client: string;
  client_nom: string;
  client_telephone: string;
  bot: string | null;
  statut: "en_attente" | "confirme" | "annule" | "termine";
  canal: "whatsapp" | "vocal" | "manuel";
  scheduled_at: string;
  reminder_sent: boolean;
  notes: string;
  services_detail: ServiceRDV[];
  created_at: string;
}
export interface CreateRendezVousPayload {
  agenda: string;
  agence?: string | null;
  client?: string;
  client_nom?: string;
  client_telephone?: string;
  client_email?: string;
  statut?: "en_attente" | "confirme" | "annule" | "termine";
  canal?: "whatsapp" | "vocal" | "manuel";
  scheduled_at: string;
  notes?: string;
}
export interface RendezVousFilters {
  statut?: string;
  canal?: string;
  date?: string;
  page?: number;
  page_size?: number;
}

export interface Client {
  id: string;
  entreprise: string;
  nom: string;
  telephone: string;
  email: string;
  created_at: string;
}
export interface CreateClientPayload {
  nom: string;
  telephone?: string;
  email?: string;
}

export interface PolitiqueRappel {
  id: string;
  entreprise: string;
  nom: string;
  canal: "whatsapp" | "email" | "sms" | "appel";
  delai_heures: number;
  message_template: string;
  is_active: boolean;
  created_at: string;
}
export interface CreatePolitiqueRappelPayload {
  nom: string;
  canal: "whatsapp" | "email" | "sms" | "appel";
  delai_heures?: number;
  message_template?: string;
  is_active?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// BILLING
// ══════════════════════════════════════════════════════════════════════════════

export type SubscriptionStatus = "actif" | "suspendu" | "expire" | "en_attente";

export interface Subscription {
  id: string;
  entreprise: string;
  entreprise_name: string;
  plan: Plan;
  statut: SubscriptionStatus;
  billing_cycle: string;
  periode_debut: string;
  periode_fin: string;
  date_renouvellement: string | null;
  usage_messages: number;
  usage_appels: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  entreprise: string;
  entreprise_name: string;
  solde: number;
  frozen_balance: number;
  total_balance: number;
  devise: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  nom: string;
  slug: string;
  prix: number;
  devise: string;
  billing_cycle: string;
  limite_messages: number;
  limite_appels: number;
  limite_bots: number;
  limite_rdv: number;
  is_active: boolean;
  highlight: boolean;
  features: string[];
  created_at: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// Aligné avec apps/dashboard/serializers.py → EntrepriseStatsSerializer
// ══════════════════════════════════════════════════════════════════════════════
export interface TenantStats {
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
export interface AdminStats {
  total_entreprises: number;
  entreprises_actives: number;
  total_bots: number;
  bots_actifs: number;
  total_conversations_aujourdhui: number;
  total_rdv_aujourdhui: number;
  mrr: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION
// Aligné avec apps/conversations/serializers.py → ConversationSerializer
// ══════════════════════════════════════════════════════════════════════════════

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
  bot_type: "whatsapp" | "vocal";
  client: string;
  client_nom: string;
  client_telephone: string;
  type_conversation: string | null;
  type_label: string | null;
  agenda: string | null;
  agenda_nom: string | null;
  rendez_vous: string | null;
  statut: "en_cours" | "terminee" | "abandonnee";
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

// ══════════════════════════════════════════════════════════════════════════════
// FAQ / KNOWLEDGE
// ══════════════════════════════════════════════════════════════════════════════
export interface FAQ {
  id: string;
  entreprise: string;
  titre: string;
  is_active: boolean;
  created_at: string;
}
export interface CreateFAQPayload {
  entreprise: string;
  titre: string;
  is_active?: boolean;
}

export interface QuestionFrequente {
  id: string;
  faq: string;
  question_fr: string;
  question_en: string;
  reponse_fr: string;
  reponse_en: string;
  categorie: string;
  is_active: boolean;
  created_at: string;
}
export interface CreateQuestionPayload {
  faq: string;
  question_fr: string;
  question_en?: string;
  reponse_fr: string;
  reponse_en?: string;
  categorie?: string;
  is_active?: boolean;
}

export interface TenantKnowledge {
  id: string;
  entreprise: string;
  slogan: string;
  site_web: string;
  email_contact: string;
  transfer_email: string;
  transfer_whatsapp: string;
  transfer_phone: string;
  transfer_message: string;
  message_accueil: string;
  bot_tone: string;
  bot_personality: string;
  bot_languages: string[];
  bot_signature: string;
  extra_info: string;
  duree_rdv_min: number;
  buffer_slot_min: number;
  created_at: string;
  updated_at: string;
}
export interface CreateTenantKnowledgePayload {
  entreprise?: string;
  slogan?: string;
  site_web?: string;
  email_contact?: string;
  transfer_email?: string;
  transfer_whatsapp?: string;
  transfer_phone?: string;
  transfer_message?: string;
  message_accueil?: string;
  bot_tone?: string;
  bot_personality?: string;
  bot_languages?: string[];
  bot_signature?: string;
  extra_info?: string;
  duree_rdv_min?: number;
  buffer_slot_min?: number;
}

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
export interface CreateServiceKnowledgePayload extends Partial<
  Omit<ServiceKnowledge, "id">
> {
  tenant_id: string;
  service_id: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTION
// ══════════════════════════════════════════════════════════════════════════════
export interface Transaction {
  id: string;
  wallet: string;
  type: string;
  type_display: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  montant: number;
  solde_apres: number | null;
  service_paiement: string | null;
  service_paiement_nom: string | null;
  reference: string;
  external_reference: string | null;
  label: string;
  created_at: string;
}
export interface CreateTransactionPayload {
  wallet: string;
  montant: number;
  type: string;
  label: string;
  service_paiement?: string | null;
}

// ══════════════════════════════════════════════════════════════════════════════
// CHATBOT BRIDGE
// Aligné avec apps/chatbot_bridge — POST /api/v1/chatbot/test/
//                                   GET/PATCH /api/v1/bots/{id}/chatbot/
//                                   GET /api/v1/chatbot/sessions/
// ══════════════════════════════════════════════════════════════════════════════

/** Message de l'historique envoyé au LLM. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Canal du simulateur. */
export type ChatTestCanal = "whatsapp" | "vocal";

/** Payload POST /api/v1/chatbot/test/ */
export interface ChatbotTestPayload {
  bot_id: string;
  session_id: string;
  canal?: ChatTestCanal;
  message: string;
  history: ChatMessage[];
}

/** Données client collectées par le LLM au fil de la conversation. */
export interface CollectedData {
  nom?: string;
  telephone?: string;
  email?: string;
  notes_client?: string;
}

/** Payload d'une action exécutée par le bot (create_client, create_appointment…). */
export interface ChatActionPayload {
  // create_client
  client_id?: string;
  nom?: string;
  telephone?: string;
  email?: string;
  created?: boolean;
  is_test?: boolean;
  // create_appointment
  rdv_id?: string;
  client_nom?: string;
  client_phone?: string;
  scheduled_at?: string;
  service?: { id: string; nom: string };
  agenda?: string;
  agence?: string;
  // send_email
  email_id?: string;
  to?: string;
  subject?: string;
  body?: string;
  // human_handoff
  raison?: string;
  persisted?: boolean;
  // erreur
  error?: string;
}

export interface ChatAction {
  type: "create_client" | "create_appointment" | "send_email" | "human_handoff";
  status: "success" | "error";
  payload: ChatActionPayload;
}

/** Réponse POST /api/v1/chatbot/test/ */
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

/** Configuration IA d'un bot — GET/PATCH /api/v1/bots/{id}/chatbot/ */
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

/** Session de test — GET /api/v1/chatbot/sessions/ */
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

/** Message d'une session — GET /api/v1/chatbot/sessions/{id}/messages/ */
export interface TestMessage {
  id: string;
  session: string;
  role: "user" | "assistant";
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

/** Email d'une session — GET /api/v1/chatbot/sessions/{id}/emails/ */
export interface TestEmail {
  id: string;
  session: string;
  to: string;
  subject: string;
  body: string;
  is_test: boolean;
  created_at: string;
}

/** Session enrichie avec messages et emails imbriqués. */
export interface TestSessionDetail extends TestSessionSummary {
  messages: TestMessage[];
  emails: TestEmail[];
}

// ══════════════════════════════════════════════════════════════════════════════
// PLATFORM HELP (FAQ gérée par l'admin AGT)
// ══════════════════════════════════════════════════════════════════════════════
export type HelpCategorie = "general" | "bots" | "billing" | "rdv" | "technique";

export interface HelpEntry {
  id: string;
  categorie: HelpCategorie;
  question_fr: string;
  question_en: string;
  reponse_fr: string;
  reponse_en: string;
  ordre: number;
}