// src/app/(dashboard)/results/_config/results-tab-config.ts
// Registre central des tabs résultats.
// Ajouter une feature = ajouter une entrée ici. Zéro changement ailleurs.
// Pattern : même logique que FEATURE_TAB_MAP dans bots/_components/feature-tab-manifest.ts

import {
  MessageSquare, HelpCircle, Calendar, UtensilsCrossed,
  Package, Ticket, Stethoscope, ShoppingBag, Layers,
  Bell, GraduationCap, Landmark, FolderOpen, FileText,
  Users, Target, ArrowLeftRight, Mail,
  type LucideIcon,
} from "lucide-react";
import type { PaginatedResponse } from "@/types/api";

import {
  reservationsResultRepository,
  commandesResultRepository,
  inscriptionsResultRepository,
  dossiersResultRepository,
  contactsResultRepository,
  transfertsResultRepository,
  conciergerieResultRepository,
  emailLogsResultRepository,
  consultationsFAQResultRepository,
} from "@/repositories/results.repository";

import { ReservationResultCard }       from "../_components/ReservationResultCard";
import { CommandeResultCard }          from "../_components/CommandeResultCard";
import { InscriptionResultCard }       from "../_components/InscriptionResultCard";
import { DossierResultCard }           from "../_components/DossierResultCard";
import { ContactResultCard }           from "../_components/ContactResultCard";
import { TransfertHumainResultCard }   from "../_components/TransfertHumainResultCard";
import { DemandeConciergericResultCard } from "../_components/DemandeConciergericResultCard";
 import { EmailResultCard }               from "../_components/EmailResultCard";
import { ConsultationFAQResultCard }   from "../_components/ConsultationFAQResultCard";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TabId =
  | "chatbot_whatsapp"
  | "faq"
  | "prise_rdv"
  | "reservation_table"
  | "reservation_chambre"
  | "reservation_billet"
  | "orientation_patient"
  | "menu_digital"
  | "catalogue_produits"
  | "suivi_commande"
  | "conciergerie"
  | "inscription_admission"
  | "orientation_citoyens"
  | "suivi_dossier"
  | "collecte_documents"
  | "gestion_crm"
  | "capture_prospect"
  | "transfert_humain"
  | "emails_envoyes";

type FetchParams = { page: number; page_size: number; bot_id?: string };

export interface ResultTabDef {
  icon:         LucideIcon;
  label:        { fr: string; en: string };
  /** Slug de la feature requise pour afficher ce tab. Absent = toujours visible. */
  feature?:     string;
  /** Cas spécial — tab sans ResultListTab standard */
  special?:     "chatbot";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher?:     (p: FetchParams) => Promise<PaginatedResponse<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultCard?:  React.ComponentType<{ item: any }>;
  emptyIcon?:   LucideIcon;
  emptyMessage?: { fr: string; en: string };
  emptyHint?:    { fr: string; en: string };
}

// ── Registre ──────────────────────────────────────────────────────────────────

export const TAB_CONFIG: Record<TabId, ResultTabDef> = {

  chatbot_whatsapp: {
    icon:    MessageSquare,
    label:   { fr: "Chatbot WhatsApp", en: "WhatsApp Chatbot" },
    special: "chatbot",
  },

  faq: {
    icon:         HelpCircle,
    label:        { fr: "FAQ", en: "FAQ" },
    feature:      "faq",
    fetcher:      (p) => consultationsFAQResultRepository.getList(p),
    ResultCard:   ConsultationFAQResultCard,
    emptyIcon:    HelpCircle,
    emptyMessage: { fr: "Aucune consultation FAQ", en: "No FAQ consultations" },
    emptyHint:    { fr: "Les questions posées au bot apparaîtront ici.", en: "Questions asked to the bot will appear here." },
  },

  prise_rdv: {
    icon:         Calendar,
    label:        { fr: "Agenda", en: "Agenda" },
    feature:      "prise_rdv",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyIcon:    Calendar,
    emptyMessage: { fr: "Aucun RDV créé", en: "No appointments created" },
    emptyHint:    { fr: "Les RDV planifiés par le bot apparaîtront ici.", en: "Appointments scheduled by the bot will appear here." },
  },

  reservation_table: {
    icon:         UtensilsCrossed,
    label:        { fr: "Tables", en: "Tables" },
    feature:      "reservation_table",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyIcon:    UtensilsCrossed,
    emptyMessage: { fr: "Aucune réservation de table", en: "No table reservations" },
    emptyHint:    { fr: "Les réservations créées par le bot apparaîtront ici.", en: "Reservations created by the bot will appear here." },
  },

  reservation_chambre: {
    icon:         Layers,
    label:        { fr: "Chambres", en: "Rooms" },
    feature:      "reservation_chambre",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyIcon:    Layers,
    emptyMessage: { fr: "Aucune réservation de chambre", en: "No room reservations" },
    emptyHint:    { fr: "Les réservations créées par le bot apparaîtront ici.", en: "Reservations created by the bot will appear here." },
  },

  reservation_billet: {
    icon:         Ticket,
    label:        { fr: "Billets", en: "Tickets" },
    feature:      "reservation_billet",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyIcon:    Ticket,
    emptyMessage: { fr: "Aucun billet créé", en: "No tickets created" },
    emptyHint:    { fr: "Les billets réservés par le bot apparaîtront ici.", en: "Tickets reserved by the bot will appear here." },
  },

  orientation_patient: {
    icon:         Stethoscope,
    label:        { fr: "Orientation patient", en: "Patient orientation" },
    feature:      "orientation_patient",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyIcon:    Stethoscope,
    emptyMessage: { fr: "Aucune orientation patient", en: "No patient orientations" },
    emptyHint:    { fr: "Les orientations créées par le bot apparaîtront ici.", en: "Orientations created by the bot will appear here." },
  },

  menu_digital: {
    icon:         UtensilsCrossed,
    label:        { fr: "Commandes menu", en: "Menu orders" },
    feature:      "menu_digital",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyIcon:    UtensilsCrossed,
    emptyMessage: { fr: "Aucune commande menu", en: "No menu orders" },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  catalogue_produits: {
    icon:         Package,
    label:        { fr: "Produits", en: "Products" },
    feature:      "catalogue_produits",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyIcon:    Package,
    emptyMessage: { fr: "Aucune vente", en: "No sales" },
    emptyHint:    { fr: "Les ventes créées par le bot apparaîtront ici.", en: "Sales created by the bot will appear here." },
  },

  suivi_commande: {
    icon:         ShoppingBag,
    label:        { fr: "Commandes", en: "Orders" },
    feature:      "suivi_commande",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyIcon:    ShoppingBag,
    emptyMessage: { fr: "Aucune commande", en: "No orders" },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  conciergerie: {
    icon:         Bell,
    label:        { fr: "Conciergerie", en: "Concierge" },
    feature:      "conciergerie",
    fetcher:      (p) => conciergerieResultRepository.getList(p),
   ResultCard:     DemandeConciergericResultCard,
    emptyIcon:    Bell,
    emptyMessage: { fr: "Aucune demande conciergerie", en: "No concierge requests" },
    emptyHint:    { fr: "Les demandes créées par le bot apparaîtront ici.", en: "Requests created by the bot will appear here." },
  },

  inscription_admission: {
    icon:         GraduationCap,
    label:        { fr: "Inscriptions", en: "Admissions" },
    feature:      "inscription_admission",
    fetcher:      (p) => inscriptionsResultRepository.getList(p),
    ResultCard:   InscriptionResultCard,
    emptyIcon:    GraduationCap,
    emptyMessage: { fr: "Aucune inscription", en: "No admissions" },
    emptyHint:    { fr: "Les inscriptions créées par le bot apparaîtront ici.", en: "Admissions created by the bot will appear here." },
  },

  orientation_citoyens: {
    icon:         Landmark,
    label:        { fr: "Orientation citoyens", en: "Citizens" },
    feature:      "orientation_citoyens",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyIcon:    Landmark,
    emptyMessage: { fr: "Aucune orientation citoyens", en: "No citizen orientations" },
    emptyHint:    { fr: "Les orientations créées par le bot apparaîtront ici.", en: "Orientations created by the bot will appear here." },
  },

  suivi_dossier: {
    icon:         FolderOpen,
    label:        { fr: "Suivi dossier", en: "Case tracking" },
    feature:      "suivi_dossier",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyIcon:    FolderOpen,
    emptyMessage: { fr: "Aucun dossier", en: "No case files" },
    emptyHint:    { fr: "Les dossiers créés par le bot apparaîtront ici.", en: "Case files created by the bot will appear here." },
  },

  collecte_documents: {
    icon:         FileText,
    label:        { fr: "Collecte documents", en: "Documents" },
    feature:      "collecte_documents",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyIcon:    FileText,
    emptyMessage: { fr: "Aucun document collecté", en: "No documents collected" },
    emptyHint:    { fr: "Les documents collectés par le bot apparaîtront ici.", en: "Documents collected by the bot will appear here." },
  },

  gestion_crm: {
    icon:         Users,
    label:        { fr: "Gestion CRM", en: "CRM" },
    feature:      "gestion_crm",
    fetcher:      (p) => contactsResultRepository.getList(p),
    ResultCard:   ContactResultCard,
    emptyIcon:    Users,
    emptyMessage: { fr: "Aucun contact créé", en: "No contacts created" },
    emptyHint:    { fr: "Les contacts créés par le bot apparaîtront ici.", en: "Contacts created by the bot will appear here." },
  },

  capture_prospect: {
    icon:         Target,
    label:        { fr: "Capture prospect", en: "Lead capture" },
    feature:      "capture_prospect",
    fetcher:      (p) => contactsResultRepository.getList(p),
    ResultCard:   ContactResultCard,
    emptyIcon:    Target,
    emptyMessage: { fr: "Aucun prospect capturé", en: "No leads captured" },
    emptyHint:    { fr: "Les prospects capturés par le bot apparaîtront ici.", en: "Leads captured by the bot will appear here." },
  },

  transfert_humain: {
    icon:         ArrowLeftRight,
    label:        { fr: "Transferts humains", en: "Human handoff" },
    feature:      "transfert_humain",
    fetcher:      (p) => transfertsResultRepository.getList(p),
    ResultCard:   TransfertHumainResultCard,
    emptyIcon:    ArrowLeftRight,
    emptyMessage: { fr: "Aucun transfert humain", en: "No human handoffs" },
    emptyHint:    { fr: "Les transferts déclenchés par le bot apparaîtront ici.", en: "Handoffs triggered by the bot will appear here." },
  },

  emails_envoyes: {
    icon:         Mail,
    label:        { fr: "Emails envoyés", en: "Sent emails" },
    feature:      "emails_rappel",
    fetcher:      (p) => emailLogsResultRepository.getList(p),
    ResultCard:   EmailResultCard,
    emptyIcon:    Mail,
    emptyMessage: { fr: "Aucun email envoyé", en: "No emails sent" },
    emptyHint:    { fr: "Les emails envoyés par le bot apparaîtront ici.", en: "Emails sent by the bot will appear here." },
  },
};

/** Ordre d'affichage des tabs (clés de TAB_CONFIG dans l'ordre voulu) */
export const TAB_ORDER: TabId[] = [
  "chatbot_whatsapp",
  "faq",
  "prise_rdv",
  "reservation_table",
  "reservation_chambre",
  "reservation_billet",
  "orientation_patient",
  "menu_digital",
  "catalogue_produits",
  "suivi_commande",
  "conciergerie",
  "inscription_admission",
  "orientation_citoyens",
  "suivi_dossier",
  "collecte_documents",
  "gestion_crm",
  "capture_prospect",
  "transfert_humain",
  "emails_envoyes",
];