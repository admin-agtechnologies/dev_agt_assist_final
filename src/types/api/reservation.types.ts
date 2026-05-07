// src/types/api/reservation.types.ts
// Ressources, Disponibilités, Réservations — nouveau backend AGT v2

// ── Statuts ───────────────────────────────────────────────────────────────────

export type ReservationStatut =
  | 'en_attente'
  | 'en_attente_confirmation'
  | 'confirmee'
  | 'annulee'
  | 'terminee';

// ── Ressource ─────────────────────────────────────────────────────────────────

export interface Ressource {
  id: string;
  nom: string;
  type: string;                        // 'chambre' | 'table' | 'praticien' | 'trajet' | ...
  capacite: number;
  feature_slug: string;
  agence_id: string | null;
  est_active: boolean;
  metadata: Record<string, unknown>;   // données spécifiques au secteur
  created_at: string;
}

export interface CreateRessourcePayload {
  nom: string;
  type: string;
  capacite: number;
  feature_slug: string;
  agence_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface RessourceFilters {
  type?: string;
  est_active?: boolean;
  feature_slug?: string;
  page?: number;
  page_size?: number;
}

// ── Disponibilités ────────────────────────────────────────────────────────────

export interface DisponibiliteRessource {
  id: string;
  jour_semaine: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=lundi … 6=dimanche
  heure_debut: string;                         // format "HH:MM"
  heure_fin: string;                           // format "HH:MM"
  est_active: boolean;
}

export interface DisponibilitesResponse {
  ressource_id: string;
  disponibilites: DisponibiliteRessource[];
}

export interface SetDisponibilitesPayload {
  disponibilites: Omit<DisponibiliteRessource, 'id' | 'est_active'>[];
}

// ── Réservation ───────────────────────────────────────────────────────────────

export interface Reservation {
  id: string;
  ressource_id: string;
  ressource_nom: string;
  contact_nom: string;
  contact_phone: string;
  statut: ReservationStatut;
  date_debut: string;
  date_fin: string;
  necessite_rappel: boolean;
  notes: string | null;
  created_at: string;
}

export interface UpdateReservationStatutPayload {
  statut: ReservationStatut;
}

export interface ReservationFilters {
  statut?: ReservationStatut;
  date_from?: string;    // format "YYYY-MM-DD"
  date_to?: string;      // format "YYYY-MM-DD"
  ressource_id?: string;
  page?: number;
  page_size?: number;
}