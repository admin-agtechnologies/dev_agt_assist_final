// src/types/api/crm.types.ts
export type ContactStatut = 'prospect' | 'contact' | 'client' | 'inactif';

export interface ContactCRMSignal {
  id: string;
  type: string;
  valeur: string;
  poids: number;
  created_at: string;
}

export interface Contact {
  id: string;
  nom: string;
  phone: string;
  email: string | null;
  statut: ContactStatut;
  nb_visites: number;
  agence_id: string | null;
  crm_signals: ContactCRMSignal[];
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  statut?: ContactStatut;
  search?: string;
  agence_id?: string;
  page?: number;
  page_size?: number;
}

export type InscriptionStatut =
  | 'en_attente'
  | 'documents_manquants'
  | 'en_cours'
  | 'acceptee'
  | 'refusee';

export interface Inscription {
  id: string;
  contact_nom: string;
  contact_phone: string;
  statut: InscriptionStatut;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InscriptionFilters {
  statut?: InscriptionStatut;
  page?: number;
  page_size?: number;
}

export type DossierStatut =
  | 'ouvert'
  | 'en_traitement'
  | 'en_attente_documents'
  | 'cloture'
  | 'rejete';

export interface Dossier {
  id: string;
  contact_nom: string;
  contact_phone: string;
  type_procedure: string;
  statut: DossierStatut;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DossierFilters {
  statut?: DossierStatut;
  page?: number;
  page_size?: number;
}