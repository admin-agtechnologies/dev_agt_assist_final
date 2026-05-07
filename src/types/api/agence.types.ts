// src/types/api/agence.types.ts
// Service, Agence, HorairesOuverture, Agenda

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
  type: 'ouverture' | 'rendez_vous';
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