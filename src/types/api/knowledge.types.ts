// src/types/api/knowledge.types.ts
// Types FAQ, Knowledge base — conservés pour pages existantes

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

export type CreateServiceKnowledgePayload = Partial<Omit<ServiceKnowledge, 'id'>> & {
  tenant_id: string;
  service_id: string;
};

export interface HelpEntry {
  id: string;
  question_fr: string;
  question_en: string;
  reponse_fr: string;
  reponse_en: string;
  categorie: string;
  is_active: boolean;
  created_at: string;
}