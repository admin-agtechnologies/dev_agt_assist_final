// src/types/api/commande.types.ts
export type CommandeStatut =
  | 'en_attente'
  | 'confirmee'
  | 'en_preparation'
  | 'prete'
  | 'livree'
  | 'annulee';

export interface LigneCommande {
  id: string;
  item_id: string;
  item_nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Commande {
  id: string;
  contact_nom: string;
  contact_phone: string;
  statut: CommandeStatut;
  montant_total: number;
  devise: string;
  est_paye: boolean;
  lignes: LigneCommande[];
  notes: string | null;
  agence_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommandeFilters {
  statut?: CommandeStatut;
  agence_id?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateCommandeStatutPayload {
  statut: CommandeStatut;
}

// ── Billing (conservé — utilisé par pages billing existantes) ─────────────────

export type SubscriptionStatus = 'actif' | 'suspendu' | 'expire' | 'en_attente';

export interface Plan {
  id: string;
  nom: string;
  slug: string;
  prix: number;
  devise: string;
  billing_cycle: string;
  limite_messages: number | null;
  limite_appels: number | null;
  limite_bots: number;
  limite_rdv: number | null;
  limite_emails: number | null;
  limite_agences: number;
  limite_services: number;
  is_active: boolean;
  highlight: boolean;
  features: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  entreprise: string;
  entreprise_name: string;
  plan: Plan;
  statut: SubscriptionStatus;
  billing_cycle: string;
  periode_debut: string;
  periode_fin: string;
  date_renouvellement: string | null;
  usage_messages: number;
  usage_appels: number;
  days_remaining: number;
  created_at: string;
  usage_rdv: number;
  usage_emails: number;
}

export interface Wallet {
  id: string;
  entreprise: string;
  entreprise_name: string;
  solde: number;
  frozen_balance: number;
  total_balance: number;
  devise: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet: string;
  type: string;
  type_display: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  montant: number;
  solde_apres: number | null;
  service_paiement: string | null;
  service_paiement_nom: string | null;
  reference: string;
  external_reference: string | null;
  label: string;
  created_at: string;
}

export interface CreateTransactionPayload {
  wallet: string;
  montant: number;
  type: string;
  label: string;
  service_paiement?: string | null;
}

export interface TenantStats {
  messages_aujourdhui: number;
  messages_semaine: number;
  appels_aujourdhui: number;
  rdv_aujourdhui: number;
  rdv_semaine: number;
  conversations_actives: number;
  email_rappels_semaine: number;
  email_rappels_envoyes: number;
  email_rappels_echoues: number;
}

export interface AdminStats {
  total_entreprises: number;
  entreprises_actives: number;
  total_bots: number;
  bots_actifs: number;
  total_conversations_aujourdhui: number;
  total_rdv_aujourdhui: number;
  mrr: number;
}