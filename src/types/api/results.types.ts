// src/types/api/results.types.ts
// Types des enregistrements Results — écrits par le bot, lus par le tenant.
// Distincts des types KB (configuration) et des modèles d'action (chatbot).

// ── Commande Result ───────────────────────────────────────────────────────────
// Distinct de Commande KB — champs plats retournés par /catalogue/commandes/

export interface CommandeResult {
  id:            string;
  statut:        'en_attente' | 'confirmee' | 'en_preparation' | 'prete' | 'livree' | 'annulee';
  montant_total: string;
  devise:        string;
  est_paye:      boolean;
  paye_le:       string | null;
  feature_slug:  string;
  contact_id:    string;
  contact_nom:   string;
  contact_phone: string;
  notes:         string;
  created_at:    string;
  updated_at:    string;
}

export interface CommandeResultFilters {
  feature_slug?: string;
  statut?:       string;
  page?:         number;
  page_size?:    number;
}

// ── Dossier Result ────────────────────────────────────────────────────────────

export interface DossierResult {
  id:                    string;
  numero_dossier:        string;
  type_demande:          string;
  contact:               string;
  contact_nom:           string;
  contact_phone:         string;
  statut:                'ouvert' | 'en_cours' | 'en_attente_docs' | 'valide' | 'rejete' | 'clos';
  documents_requis:      string;
  documents_fournis:     string;
  documents_manquants:   string;
  notes_administratives: string;
  metadata:              string;
  created_at:            string;
  updated_at:            string;
}

// ── Inscription Result ────────────────────────────────────────────────────────

export interface InscriptionResult {
  id:                  string;
  contact:             string;
  contact_nom:         string;
  contact_phone:       string;
  filiere:             string;
  niveau:              string;
  annee_scolaire:      string;
  statut:              'soumise' | 'en_etude' | 'acceptee' | 'refusee' | 'liste_attente';
  documents_requis:    string;
  documents_fournis:   string;
  documents_manquants: string;
  notes:               string;
  metadata:            string;
  created_at:          string;
  updated_at:          string;
}

// ── TransfertHumain Result ────────────────────────────────────────────────────

export interface TransfertHumainResult {
  id:                string;
  entreprise:        string;
  contact:           string;
  contact_nom:       string;
  contact_telephone: string;
  agence:            string;
  agence_nom:        string;
  motif:             string;
  statut:            'en_attente' | 'pris_en_charge' | 'resolu';
  assigne_a:         string | null;
  assigne_a_nom:     string | null;
  pris_en_charge_le: string | null;
  resolu_le:         string | null;
  source:            string;
  created_at:        string;
}

// ── DemandeConciergerie Result ────────────────────────────────────────────────

export interface DemandeConciergerieResult {
  id:                string;
  entreprise:        string;
  contact:           string;
  contact_nom:       string;
  contact_telephone: string;
  agence:            string;
  agence_nom:        string;
  service:           string;
  service_nom:       string;
  chambre:           string;
  heure_souhaitee:   string | null;
  notes_client:      string;
  statut:            'recue' | 'prise_en_charge' | 'en_cours' | 'effectuee' | 'annulee';
  pris_en_charge_par: string | null;
  pris_en_charge_nom: string | null;
  effectuee_le:      string | null;
  created_at:        string;
}

// ── EmailLog Result ───────────────────────────────────────────────────────────

export interface EmailLogResult {
  id:          string;
  entreprise:  string;
  destinataire: string;
  sujet:       string;
  corps:       string;
  template:    string;
  statut:      'en_attente' | 'envoye' | 'echec';
  envoye_le:   string | null;
  erreur:      string;
  source_type: string;
  source_id:   string | null;
  created_at:  string;
}

// ── ConsultationFAQ Result ────────────────────────────────────────────────────

export interface ConsultationFAQResult {
  id:                     string;
  entreprise:             string;
  contact:                string;
  contact_nom:            string;
  contact_telephone:      string;
  question_posee:         string;
  question_matchee:       string | null;
  question_matchee_texte: string | null;
  score_match:            number | null;
  reponse_donnee:         string;
  a_trouve_reponse:       boolean;
  created_at:             string;
}

export interface ConsultationFAQFilters {
  a_trouve_reponse?: boolean;
  page?:             number;
  page_size?:        number;
}