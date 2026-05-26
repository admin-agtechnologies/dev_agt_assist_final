// src/app/(dashboard)/bots/[id]/test/_components/action-helpers.ts
// Helpers partagés : icônes, labels, résumés, type de modal par action slug.
// Importé par ConversationPanel.tsx et WhatsAppSimulator.tsx.

import {
  MessageCircle, CalendarCheck, CalendarSearch,
  UtensilsCrossed, ShoppingCart, Package, Bus,
  ClipboardList, Mail, Search, UserCheck,
  PhoneForwarded, CreditCard, Building2,
  Stethoscope, GraduationCap, FileText,
  Wallet, ArrowRightLeft, Calculator,
  PiggyBank, Wrench, Megaphone, HelpCircle,
  Network, BookOpen, FolderOpen, Receipt, Users,
  Truck, MapPin, DollarSign, CheckSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ActionMeta {
  icon: LucideIcon;
  label: string;
}

export type ModalType =
  | "reservation"
  | "faq"
  | "email"
  | "commande"
  | "inscription_dossier"
  | "finance"
  | "consultation";

// ── ACTION_META map ───────────────────────────────────────────────────────────

export const ACTION_META: Record<string, ActionMeta> = {
  // Système
  init_conversation:             { icon: MessageCircle,  label: "Conversation initialisée" },
  update_context:                { icon: UserCheck,      label: "Contexte mis à jour" },
  create_contact:                { icon: ClipboardList,  label: "Contact collecté" },
  transfer_to_human:             { icon: PhoneForwarded, label: "Transfert humain" },
  // Email & communication
  send_email:                    { icon: Mail,           label: "Email envoyé" },
  send_reminder:                 { icon: Mail,           label: "Rappel envoyé" },
  send_communication:            { icon: Megaphone,      label: "Communication envoyée" },
  // FAQ
  search_faq:                    { icon: MessageCircle,  label: "FAQ consultée" },
  // Réservations
  create_reservation:            { icon: CalendarCheck,  label: "Réservation créée" },
  check_disponibilite:           { icon: CalendarSearch, label: "Disponibilité vérifiée" },
  get_room_types:                { icon: Building2,      label: "Chambres consultées" },
  create_demande_conciergerie:   { icon: Building2,      label: "Conciergerie demandée" },
  get_services_conciergerie:     { icon: Building2,      label: "Services conciergerie" },
  // Catalogue & menu
  get_menu:                      { icon: UtensilsCrossed, label: "Menu consulté" },
  list_catalogue_items:          { icon: Package,        label: "Catalogue consulté" },
  get_item_detail:               { icon: Package,        label: "Article consulté" },
  get_catalogue:                 { icon: Package,        label: "Catalogue consulté" },
  get_catalogue_sectoriel:       { icon: Package,        label: "Catalogue sectoriel" },
  get_trajets:                   { icon: Bus,            label: "Trajets consultés" },
  get_services:                  { icon: Wrench,         label: "Services consultés" },
  // Commandes
  create_commande:               { icon: ShoppingCart,   label: "Commande créée" },
  get_commande_statut:           { icon: Search,         label: "Commande consultée" },
  get_order_status:              { icon: Truck,          label: "Statut commande" },
  suivi_commande:                { icon: Search,         label: "Commande suivie" },
  initiate_payment:              { icon: CreditCard,     label: "Paiement initié" },
  // CRM & prospects
  capture_prospect:              { icon: ClipboardList,  label: "Prospect capturé" },
  convert_prospect:              { icon: UserCheck,      label: "Prospect converti" },
  gestion_crm:                   { icon: Users,          label: "CRM mis à jour" },
  create_relance:                { icon: Receipt,        label: "Relance créée" },
  // Santé
  get_specialites:               { icon: Stethoscope,    label: "Spécialités consultées" },
  get_specialite_par_symptomes:  { icon: Stethoscope,    label: "Orientation patient" },
  orientation_patient:           { icon: Stethoscope,    label: "Patient orienté" },
  // Éducation & inscriptions
  get_programmes:                { icon: BookOpen,       label: "Programmes consultés" },
  create_inscription:            { icon: GraduationCap,  label: "Inscription créée" },
  get_inscription_statut:        { icon: GraduationCap,  label: "Inscription consultée" },
  // Dossiers citoyens
  get_services_publics:          { icon: Network,        label: "Services publics" },
  create_dossier:                { icon: FileText,       label: "Dossier créé" },
  get_dossier_statut:            { icon: FolderOpen,     label: "Dossier consulté" },
  // Agences
  get_agences:                   { icon: MapPin,         label: "Agences consultées" },
  // Finance / banking
  simulate_credit:               { icon: Calculator,     label: "Crédit simulé" },
  create_dossier_banking:        { icon: FileText,       label: "Dossier bancaire créé" },
  get_dossier_statut_banking:    { icon: FolderOpen,     label: "Dossier bancaire consulté" },
  list_documents_requis:         { icon: CheckSquare,    label: "Documents requis" },
  confirmer_document:            { icon: CheckSquare,    label: "Document confirmé" },
  get_solde:                     { icon: Wallet,         label: "Solde consulté" },
  create_virement:               { icon: ArrowRightLeft, label: "Virement initié" },
  get_produits_financiers:       { icon: PiggyBank,      label: "Produits financiers" },
  // Annonces
  get_annonces:                  { icon: Megaphone,      label: "Annonces consultées" },
  create_annonce:                { icon: Megaphone,      label: "Annonce créée" },
  // Défaut
  _default:                      { icon: HelpCircle,     label: "Action déclenchée" },
};

export function getActionMeta(slug: string): ActionMeta {
  return ACTION_META[slug] ?? ACTION_META._default;
}

// ── getModalType ─────────────────────────────────────────────────────────────

export function getModalType(slug: string): ModalType {
  if (["search_faq"].includes(slug))
    return "faq";

  if (["create_reservation", "check_disponibilite",
       "create_demande_conciergerie"].includes(slug))
    return "reservation";

  if (["send_email", "send_reminder"].includes(slug))
    return "email";

  if (["create_commande", "get_commande_statut",
       "suivi_commande", "get_order_status"].includes(slug))
    return "commande";

  if (["create_inscription", "get_inscription_statut",
       "create_dossier", "get_dossier_statut",
       "create_dossier_banking", "get_dossier_statut_banking"].includes(slug))
    return "inscription_dossier";

  if (["simulate_credit", "list_documents_requis",
       "confirmer_document", "get_solde",
       "create_virement", "get_produits_financiers"].includes(slug))
    return "finance";

  return "consultation";
}

// ── summarizePayload ──────────────────────────────────────────────────────────
// Résumé court affiché sous le label dans la timeline — lisible métier.

export function summarizePayload(
  slug: string,
  response: Record<string, unknown> | undefined,
): string | null {
  if (!response) return null;
  const s = (v: unknown) => (v != null && v !== "" ? String(v) : null);

  switch (slug) {
    case "create_reservation":
    case "check_disponibilite":
      return [s(response.ressource_nom), s(response.heure_debut)]
        .filter(Boolean).join(" · ");
    case "create_demande_conciergerie":
      return s(response.service_libre) ?? s(response.type_service);
    case "search_faq": {
      const results = response.results as Array<{ question?: string }> | undefined;
      if (results?.length) return `"${results[0].question?.slice(0, 50)}"`;
      return s(response.question)?.slice(0, 50) ?? null;
    }
    case "send_email":
    case "send_reminder":
      return [s(response.to), s(response.subject)?.slice(0, 40)]
        .filter(Boolean).join(" — ");
    case "create_commande":
      return `${response.nb_items ?? "?"} article(s) · ${s(response.montant_total) ?? "?"} XAF`;
    case "get_commande_statut":
    case "suivi_commande":
    case "get_order_status":
      return s(response.statut) ?? s(response.statut_commande);
    case "create_inscription":
      return [s(response.programme_nom), s(response.statut)].filter(Boolean).join(" · ");
    case "get_inscription_statut":
      return [s(response.reference), s(response.statut)].filter(Boolean).join(" · ");
    case "create_dossier":
    case "create_dossier_banking":
      return [s(response.reference), s(response.type_demande)].filter(Boolean).join(" · ");
    case "get_dossier_statut":
    case "get_dossier_statut_banking":
      return [s(response.reference), s(response.statut)].filter(Boolean).join(" · ");
    case "simulate_credit":
      return `${s(response.mensualite) ?? "?"} XAF/mois · ${s(response.duree_mois) ?? "?"} mois`;
    case "get_solde":
      return `${s(response.solde) ?? "?"} XAF`;
    case "create_virement":
      return `${s(response.montant) ?? "?"} XAF → ${s(response.beneficiaire) ?? "?"}`;
    case "capture_prospect":
    case "create_contact":
      return [s(response.nom), s(response.phone)].filter(Boolean).join(" · ");
    case "get_menu":
      return `${response.nb_categories ?? response.count ?? "?"} catégorie(s)`;
    case "get_trajets":
      return [s(response.ville_depart), s(response.ville_arrivee)]
        .filter(Boolean).join(" → ");
    case "list_documents_requis":
      return `${(response.documents as unknown[])?.length ?? "?"} document(s) requis`;
    case "confirmer_document":
      return s(response.document_type) ?? s(response.nom);
    default:
      return null;
  }
}