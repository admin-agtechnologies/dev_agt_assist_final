// src/types/api/bot.types.ts
// Types Bot, Tenant, NumeroTelephone — anciens types conservés pour pages existantes

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
  'id' | 'created_at' | 'subscription_id' | 'wallet_id'
>;

export interface TenantFilters {
  search?: string;
  is_active?: boolean;
  sector?: string;
  page?: number;
  page_size?: number;
}

export type BotStatut = 'actif' | 'en_pause' | 'archive';
export type BotType = 'whatsapp' | 'vocal';

export interface Bot {
  id: string;
  entreprise: string;
  entreprise_name: string;
  numero: string | null;
  numero_value: string | null;
  bot_type: BotType;
  nom: string;
  message_accueil: string;
  personnalite: string;
  langues: string[];
  config_whatsapp: string | null;
  config_voice_ai: string | null;
  bot_paire: string | null;
  statut: BotStatut;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  statut: 'disponible' | 'assigne' | 'suspendu';
  notes: string;
  created_at: string;
  updated_at: string;
}