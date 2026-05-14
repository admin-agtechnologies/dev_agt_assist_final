export type BotType   = "whatsapp" | "vocal";
export type BotStatut = "actif" | "en_pause" | "archive";

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
  ton: string;
  signature: string;
  langues: string[];
  sections_actives: string[];
  agences_ids: string[];
  features_autorisees_slugs: string[];
  config_whatsapp: string | null;
  config_voice_ai: string | null;
  bot_paire: string | null;
  statut: BotStatut;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotConfigPayload {
  nom?: string;
  ton?: string;
  signature?: string;
  personnalite?: string;
  message_accueil?: string;
  langues?: string[];
  sections_actives?: string[];
  agences_set?: string[];
  features_set?: string[];
  statut?: BotStatut;
  is_active?: boolean;
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