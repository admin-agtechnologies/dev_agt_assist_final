// src/types/api/p5.types.ts
// Types — modules P5 : education / sante / public

// ── Inscriptions & admissions (education) ─────────────────────────────────────

export type NiveauAdmission = "primaire" | "secondaire" | "superieur" | "formation_pro";

export interface ProgrammeAdmission {
  id: string; entreprise: string;
  nom_fr: string; nom_en?: string;
  description_fr?: string;
  niveau: NiveauAdmission;
  duree?: string;
  frais_inscription: number | null;
  conditions_admission?: string;
  date_ouverture: string | null;
  date_fermeture: string | null;
  is_available: boolean; ordre: number;
  created_at: string; updated_at: string;
}
export type CreateProgrammeAdmissionPayload = Omit<ProgrammeAdmission, "id"|"entreprise"|"created_at"|"updated_at">;
export type UpdateProgrammeAdmissionPayload = Partial<CreateProgrammeAdmissionPayload>;

// ── Orientation patient (sante) ────────────────────────────────────────────────

export interface Medecin {
  nom: string;
  titre: string;
}

export interface SpecialiteMedicale {
  id: string; entreprise: string;
  nom_fr: string; nom_en?: string;
  description_fr?: string;
  medecins: Medecin[];
  equipements: string[];
  tarif_consultation: number | null;
  duree_consultation_min: number | null;
  is_available: boolean; ordre: number;
  created_at: string; updated_at: string;
}
export type CreateSpecialiteMedicalePayload = Omit<SpecialiteMedicale, "id"|"entreprise"|"created_at"|"updated_at">;
export type UpdateSpecialiteMedicalePayload = Partial<CreateSpecialiteMedicalePayload>;

// ── Orientation citoyens (services publics) ────────────────────────────────────

export type CategorieServiceCitoyen =
  | "etat_civil" | "permis" | "fiscal" | "social" | "justice" | "autre";

export interface ServiceCitoyen {
  id: string; entreprise: string;
  nom_fr: string; nom_en?: string;
  description_fr?: string;
  categorie: CategorieServiceCitoyen;
  documents_requis: string[];
  duree_traitement?: string;
  frais: number | null;
  lieu?: string;
  is_available: boolean; ordre: number;
  created_at: string; updated_at: string;
}
export type CreateServiceCitoyenPayload = Omit<ServiceCitoyen, "id"|"entreprise"|"created_at"|"updated_at">;
export type UpdateServiceCitoyenPayload = Partial<CreateServiceCitoyenPayload>;