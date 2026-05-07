// src/types/api/contact.types.ts
// Client, RendezVous, PolitiqueRappel

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
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
  canal: 'whatsapp' | 'vocal' | 'manuel';
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
  statut?: 'en_attente' | 'confirme' | 'annule' | 'termine';
  canal?: 'whatsapp' | 'vocal' | 'manuel';
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
  canal: 'whatsapp' | 'email' | 'sms' | 'appel';
  delai_heures: number;
  message_template: string;
  is_active: boolean;
  created_at: string;
}
export interface CreatePolitiqueRappelPayload {
  nom: string;
  canal: 'whatsapp' | 'email' | 'sms' | 'appel';
  delai_heures?: number;
  message_template?: string;
  is_active?: boolean;
}