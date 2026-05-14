// src/types/api/crm.types.ts
// Types CRM — alignés exactement sur les composants existants du projet

export type ContactStatut = "prospect" | "contact" | "client" | "inactif";
export type ContactSource  = "whatsapp" | "vocal" | "web" | "manuel";

export interface ContactNote {
  text:        string;
  created_at:  string;
  author_name: string;
}

export interface ContactCRMSignal {
  id:              string;
  feature_slug:    string;
  type:            "interet" | "preference" | "budget" | "comportement";
  valeur:          string;
  poids:           number;
  conversation_id: string | null;
  detected_at:     string;
  created_at:      string; // non-optionnel — utilisé dans contacts/[id]/page.tsx
}

export interface InteractionContact {
  id:             string;
  type:           "commande" | "reservation" | "rdv" | "message" | "inscription" | "dossier" | "note";
  resume:         string;
  reference_id:   string | null;
  reference_type: string | null;
  metadata:       Record<string, unknown>;
  created_at:     string;
}

export interface TacheRelance {
  id:              string;
  besoin_resume:   string;
  urgence:         "haute" | "normale" | "basse";
  statut:          "ouverte" | "en_cours" | "close";
  assignee_id:     string | null;
  date_echeance:   string | null;
  notes:           string;
  conversation_id: string | null;
  created_at:      string;
  updated_at:      string;
}

// crm_signals non-optionnel (avec défaut []) — utilisé directement dans les pages existantes
export interface Contact {
  id:                   string;
  nom:                  string;
  prenom:               string | null;
  nom_complet:          string;
  phone:                string;
  email:                string | null;
  statut:               ContactStatut;
  source:               ContactSource;
  tags:                 string[];
  score:                0 | 1 | 2 | 3;
  nb_conversations:     number;
  nb_rdv:               number;
  derniere_interaction: string | null;
  agence_id:            string | null;
  agence_nom:           string | null;
  created_at:           string;
  crm_signals:          ContactCRMSignal[];  // non-optionnel, [] par défaut
  nb_visites?:          number;
  derniere_visite?:     string | null;
}

export interface ContactDetail extends Contact {
  notes:              ContactNote[];
  metadata:           Record<string, unknown>;
  feature_origine_id: string | null;
  interactions:       InteractionContact[];
  taches_relance:     TacheRelance[];
  updated_at:         string;
}

export interface RapportConversationCRM {
  id:                string;
  resume:            string;
  points_cles:       string[];
  actions:           { type: string; label: string; detail: string }[];
  tokens_utilises:   number;
  rdv_planifies:     number;
  emails_envoyes:    number;
  transferts_humain: number;
  created_at:        string;
}

export interface ConversationCRM {
  id:              string;
  bot_nom:         string;
  bot_type:        "whatsapp" | "vocal";
  canal:           string;
  statut:          "en_cours" | "terminee" | "abandonnee";
  human_handoff:   boolean;
  nb_messages:     number;
  dernier_message: string;
  created_at:      string;
  rapport:         RapportConversationCRM | null;
}

export interface ContactKPI {
  label_fr: string;
  label_en: string;
  icon:     string;
  valeur:   number;
}

export interface ContactKPIs {
  transversaux: {
    _conversations:  number;
    _emails:         number;
    _transferts:     number;
    _derniere_inter: string | null;
  };
  features:         Record<string, ContactKPI>;
  score:            number;
  nb_conversations: number;
}

export interface SignalGroupe {
  feature_slug: string;
  type:         string;
  valeur:       string;
  poids:        number;
  detected_at:  string;
}

export interface ContactAnalyse {
  total_signaux: number;
  par_type: {
    interets:      SignalGroupe[];
    preferences:   SignalGroupe[];
    budgets:       SignalGroupe[];
    comportements: SignalGroupe[];
  };
  top_features: { slug: string; poids_total: number }[];
}

export interface ContactAnalyseResponse {
  contact_id: string;
  kpis:       ContactKPIs;
  analyse:    ContactAnalyse;
}

export interface ContactFilters {
  statut?:    ContactStatut | "";
  source?:    ContactSource | "";
  tag?:       string;
  search?:    string;
  ordering?:  string;
  page?:      number;
  page_size?: number;
}

export interface ConversationCRMFilters {
  statut?:     string;
  date_debut?: string;
  date_fin?:   string;
  page?:       number;
  page_size?:  number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOSSIERS — exactement les 5 valeurs connues des composants existants
// ─────────────────────────────────────────────────────────────────────────────

export type DossierStatut =
  | "ouvert"
  | "en_traitement"
  | "en_attente_documents"
  | "cloture"
  | "rejete";

export interface Dossier {
  id:              string;
  contact:         string;
  contact_nom?:    string;
  contact_phone?:  string;
  agence:          string;
  agence_nom?:     string;
  feature:         string;
  titre:           string;
  statut:          DossierStatut;
  description:     string;
  reference:       string;
  type_procedure?: string;
  notes?:          string;
  metadata:        Record<string, unknown>;
  created_at:      string;
  updated_at:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INSCRIPTIONS — exactement les 5 valeurs connues des composants existants
// ─────────────────────────────────────────────────────────────────────────────

export type InscriptionStatut =
  | "en_attente"
  | "documents_manquants"
  | "en_cours"
  | "acceptee"
  | "refusee";

export interface Inscription {
  id:                  string;
  contact:             string;
  contact_nom?:        string;
  contact_phone?:      string;
  agence:              string;
  filiere:             string;
  niveau:              string;
  annee_scolaire:      string;
  statut:              InscriptionStatut;
  documents_requis:    string[];
  documents_fournis:   string[];
  documents_manquants: string[];
  notes:               string;
  metadata:            Record<string, unknown>;
  created_at:          string;
  updated_at:          string;
}