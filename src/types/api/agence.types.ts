// src/types/api/agence.types.ts
// Service, Agence, HorairesOuverture, Agenda — utilisés par appointments, agences, etc.

// ══════════════════════════════════════════════════════════════════════════════
// TYPES EXISTANTS — NE PAS MODIFIER (utilisés par appointments/)
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
// TYPES KNOWLEDGE V2 — APPEND ONLY — session 21
// Alignés sur apps/tenants/AgenceSerializer (backend S20)
// Noms de champs exacts du serializer : est_siege, est_active, phone,
// whatsapp_transfert, phone_transfert, email_transfert, message_transfert
// ══════════════════════════════════════════════════════════════════════════════

export interface HoraireJour {
  ouvert: boolean;
  debut: string; // "08:00"
  fin: string;   // "18:00"
}

/** Format exact du JSONField horaires du modèle Agence (apps/tenants/models.py) */
export interface HorairesAgence {
  lundi: HoraireJour;
  mardi: HoraireJour;
  mercredi: HoraireJour;
  jeudi: HoraireJour;
  vendredi: HoraireJour;
  samedi: HoraireJour;
  dimanche: HoraireJour;
}

export const JOURS_SEMAINE = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
] as const;

export type JourSemaine = typeof JOURS_SEMAINE[number];

/** Agence retournée par GET /api/v1/tenants/agences/ (AgenceSerializer backend) */
export interface AgenceKnowledge {
  id: string;
  entreprise_id: string;
  entreprise_name: string;
  nom: string;
  slug: string;
  est_siege: boolean;
  email: string;
  phone: string;
  whatsapp: string;
  whatsapp_transfert: string;
  phone_transfert: string;
  email_transfert: string;
  message_transfert: string;
  adresse: string;
  ville: string;
  pays: string;
  horaires: HorairesAgence;
  est_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgenceKnowledgePayload {
  nom: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  whatsapp_transfert?: string;
  phone_transfert?: string;
  email_transfert?: string;
  message_transfert?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  horaires?: HorairesAgence;
  est_active?: boolean;
}

export type UpdateAgenceKnowledgePayload = Partial<CreateAgenceKnowledgePayload>;

export interface ReseauxSociaux {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  tiktok?: string;
}

export interface ProfilEntrepriseKnowledge {
  id: string;
  entreprise: string;
  slogan: string;
  site_web: string;
  email_contact: string;
  reseaux_sociaux: ReseauxSociaux;
  extra_info: string;
  updated_at: string;
}

export interface UpdateProfilKnowledgePayload {
  slogan?: string;
  site_web?: string;
  email_contact?: string;
  reseaux_sociaux?: Partial<ReseauxSociaux>;
  extra_info?: string;
}