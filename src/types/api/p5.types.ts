// src/types/api/p5.types.ts
// Types — modules P5 : education / sante / public

// ── Inscriptions & admissions (education) ────────────────────────────────────

/**
 * SYNC avec backend NIVEAU_CHOICES (apps/knowledge/models.py — ProgrammeAdmission)
 * Inclut les valeurs legacy "secondaire" et "superieur" pour rétrocompat.
 */
export type NiveauAdmission =
  | "primaire"
  | "college"
  | "lycee"
  | "bts_dut"
  | "licence"
  | "master"
  | "doctorat"
  | "formation_pro"
  | "autre"
  // Legacy — conservés en BD
  | "secondaire"
  | "superieur";

export interface ProgrammeAdmission {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description_fr?: string;
  niveau: NiveauAdmission;
  duree?: string;
  frais_inscription: number | null;
  conditions_admission?: string;
  date_ouverture: string | null;
  date_fermeture: string | null;
  is_available: boolean;
  ordre: number;
  // B5 S33
  frais_scolarite_annuels?: number | null;
  places_disponibles?: number | null;
  documents_requis?: string[];
  etapes_inscription?: string[];
  created_at: string;
  updated_at: string;
}

export type CreateProgrammeAdmissionPayload = Omit<
  ProgrammeAdmission, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateProgrammeAdmissionPayload = Partial<CreateProgrammeAdmissionPayload>;

// ── Orientation patient (sante) ───────────────────────────────────────────────

export interface Medecin {
  nom:   string;
  titre: string;
}

export interface SpecialiteMedicale {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description?: string;
  medecins: Medecin[];
  is_available: boolean;
  ordre: number;
  // B5 S33
  mots_cles_symptomes?: string[];
  contact_urgence?: string;
  created_at: string;
  updated_at: string;
}

export type CreateSpecialiteMedicalePayload = Omit<
  SpecialiteMedicale, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateSpecialiteMedicalePayload = Partial<CreateSpecialiteMedicalePayload>;

// ── Orientation citoyens (services publics) ───────────────────────────────────

export type CategorieServiceCitoyen =
  | "etat_civil" | "permis" | "fiscal" | "social" | "justice" | "autre";

/** Structure d'une étape de procédure (stockée en JSONField côté backend) */
export interface EtapeProcedure {
  ordre: number;
  etape: string;
}

export interface ServiceCitoyen {
  id: string;
  entreprise: string;
  nom_fr: string;
  nom_en?: string;
  description_fr?: string;
  categorie: CategorieServiceCitoyen;
  documents_requis: string[];
  duree_traitement?: string;
  frais: number | null;
  lieu?: string;
  is_available: boolean;
  ordre: number;
  // B5 S33
  etapes_procedure?: EtapeProcedure[];
  horaires_service?: Record<string, string>;
  delai_relance_jours?: number;
  created_at: string;
  updated_at: string;
}

export type CreateServiceCitoyenPayload = Omit<
  ServiceCitoyen, "id" | "entreprise" | "created_at" | "updated_at"
>;
export type UpdateServiceCitoyenPayload = Partial<CreateServiceCitoyenPayload>;