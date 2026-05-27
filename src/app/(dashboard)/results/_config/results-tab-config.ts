// src/app/(dashboard)/results/_config/results-tab-config.ts
// Registre central des tabs résultats.
// Labels et icons importés depuis features-master-config (source de vérité unique).
// S54 — 22 features alignées avec feature-tab-manifest.ts (/bots).

import { FEATURES_MASTER, FEATURES_ORDER, type FeatureSlug } from "@/config/features-master-config";
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

import { ReservationResultCard }         from "../_components/ReservationResultCard";
import { CommandeResultCard }            from "../_components/CommandeResultCard";
import { InscriptionResultCard }         from "../_components/InscriptionResultCard";
import { DossierResultCard }             from "../_components/DossierResultCard";
import { ContactResultCard }             from "../_components/ContactResultCard";
import { TransfertHumainResultCard }     from "../_components/TransfertHumainResultCard";
import { DemandeConciergericResultCard } from "../_components/DemandeConciergericResultCard";
import { EmailResultCard }               from "../_components/EmailResultCard";
import { ConsultationFAQResultCard }     from "../_components/ConsultationFAQResultCard";
import { MessageSquare } from "lucide-react";

// Re-export TabId depuis FeatureSlug pour cohérence
export type TabId = FeatureSlug | "conversations";

type FetchParams = { page: number; page_size: number; bot_id?: string };

export interface ResultTabDef {
 icon: React.ElementType;
  label:         { fr: string; en: string };
  feature?:      string;
  special?:      "chatbot";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher?:      (p: FetchParams) => Promise<PaginatedResponse<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultCard?:   React.ComponentType<{ item: any }>;
  emptyMessage?: { fr: string; en: string };
  emptyHint?:    { fr: string; en: string };
}

// ── Registre ──────────────────────────────────────────────────────────────────

const m = (slug: FeatureSlug) => FEATURES_MASTER.find((f) => f.slug === slug)!;

export const TAB_CONFIG: Record<TabId, ResultTabDef> = {
  conversations: {
  icon:    MessageSquare,  // import à ajouter
  label:   { fr: "Conversations", en: "Conversations" },
  special: "conversations" as never,
},

  chatbot_whatsapp: {
    icon:    m("chatbot_whatsapp").icon,
    label:   m("chatbot_whatsapp").label,
    special: "chatbot",
  },

  faq: {
    icon:         m("faq").icon,
    label:        m("faq").label,
    feature:      "faq",
    fetcher:      (p) => consultationsFAQResultRepository.getList(p),
    ResultCard:   ConsultationFAQResultCard,
    emptyMessage: { fr: "Aucune consultation FAQ.", en: "No FAQ consultations." },
    emptyHint:    { fr: "Ajoutez des questions dans la KB et testez votre bot.", en: "Add questions to the KB and test your bot." },
  },

  gestion_crm: {
    icon:         m("gestion_crm").icon,
    label:        m("gestion_crm").label,
    fetcher:      (p) => contactsResultRepository.getList(p),
    ResultCard:   ContactResultCard,
    emptyMessage: { fr: "Aucun client enregistré.", en: "No clients recorded." },
    emptyHint:    { fr: "Les clients créés par le bot apparaîtront ici.", en: "Clients created by the bot will appear here." },
  },

  capture_prospect: {
    icon:         m("capture_prospect").icon,
    label:        m("capture_prospect").label,
    feature:      "capture_prospect",
    fetcher:      (p) => contactsResultRepository.getList({ ...p, statut: "prospect" }),
    ResultCard:   ContactResultCard,
    emptyMessage: { fr: "Aucun prospect capturé.", en: "No leads captured." },
    emptyHint:    { fr: "Les prospects capturés par le bot apparaîtront ici.", en: "Leads captured by the bot will appear here." },
  },

  transfert_humain: {
    icon:         m("transfert_humain").icon,
    label:        m("transfert_humain").label,
    feature:      "transfert_humain",
    fetcher:      (p) => transfertsResultRepository.getList(p),
    ResultCard:   TransfertHumainResultCard,
    emptyMessage: { fr: "Aucun transfert humain.", en: "No human handoffs." },
    emptyHint:    { fr: "Les transferts déclenchés par le bot apparaîtront ici.", en: "Handoffs triggered by the bot will appear here." },
  },

  prise_rdv: {
    icon:         m("prise_rdv").icon,
    label:        m("prise_rdv").label,
    feature:      "prise_rdv",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyMessage: { fr: "Aucun rendez-vous créé.", en: "No appointments created." },
    emptyHint:    { fr: "Les RDV planifiés par le bot apparaîtront ici.", en: "Appointments scheduled by the bot will appear here." },
  },

  reservation_table: {
    icon:         m("reservation_table").icon,
    label:        m("reservation_table").label,
    feature:      "reservation_table",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de table.", en: "No table reservations." },
    emptyHint:    { fr: "Les réservations créées par le bot apparaîtront ici.", en: "Reservations created by the bot will appear here." },
  },

  reservation_chambre: {
    icon:         m("reservation_chambre").icon,
    label:        m("reservation_chambre").label,
    feature:      "reservation_chambre",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de chambre.", en: "No room reservations." },
    emptyHint:    { fr: "Les réservations créées par le bot apparaîtront ici.", en: "Reservations created by the bot will appear here." },
  },

  reservation_billet: {
    icon:         m("reservation_billet").icon,
    label:        m("reservation_billet").label,
    feature:      "reservation_billet",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyMessage: { fr: "Aucun billet réservé.", en: "No tickets booked." },
    emptyHint:    { fr: "Les billets réservés par le bot apparaîtront ici.", en: "Tickets reserved by the bot will appear here." },
  },

  orientation_patient: {
    icon:         m("orientation_patient").icon,
    label:        m("orientation_patient").label,
    feature:      "orientation_patient",
    fetcher:      (p) => reservationsResultRepository.getList(p),
    ResultCard:   ReservationResultCard,
    emptyMessage: { fr: "Aucune orientation patient.", en: "No patient orientations." },
    emptyHint:    { fr: "Les orientations créées par le bot apparaîtront ici.", en: "Orientations created by the bot will appear here." },
  },

  menu_digital: {
    icon:         m("menu_digital").icon,
    label:        m("menu_digital").label,
    feature:      "menu_digital",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucune commande menu.", en: "No menu orders." },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  catalogue_produits: {
    icon:         m("catalogue_produits").icon,
    label:        m("catalogue_produits").label,
    feature:      "catalogue_produits",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucune commande produit.", en: "No product orders." },
    emptyHint:    { fr: "Les ventes créées par le bot apparaîtront ici.", en: "Sales created by the bot will appear here." },
  },

  catalogue_services: {
    icon:         m("catalogue_services").icon,
    label:        m("catalogue_services").label,
    feature:      "catalogue_services",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucun service commandé.", en: "No service orders." },
    emptyHint:    { fr: "Les services commandés par le bot apparaîtront ici.", en: "Service orders created by the bot will appear here." },
  },

  catalogue_trajets: {
    icon:         m("catalogue_trajets").icon,
    label:        m("catalogue_trajets").label,
    feature:      "catalogue_trajets",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucun trajet commandé.", en: "No routes ordered." },
    emptyHint:    { fr: "Les trajets commandés par le bot apparaîtront ici.", en: "Routes ordered by the bot will appear here." },
  },

  commande_paiement: {
    icon:         m("commande_paiement").icon,
    label:        m("commande_paiement").label,
    feature:      "commande_paiement",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucune commande.", en: "No orders." },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  suivi_commande: {
    icon:         m("suivi_commande").icon,
    label:        m("suivi_commande").label,
    feature:      "suivi_commande",
    fetcher:      (p) => commandesResultRepository.getList(p),
    ResultCard:   CommandeResultCard,
    emptyMessage: { fr: "Aucune commande à suivre.", en: "No orders to track." },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  conciergerie: {
    icon:         m("conciergerie").icon,
    label:        m("conciergerie").label,
    feature:      "conciergerie",
    fetcher:      (p) => conciergerieResultRepository.getList(p),
    ResultCard:   DemandeConciergericResultCard,
    emptyMessage: { fr: "Aucune demande conciergerie.", en: "No concierge requests." },
    emptyHint:    { fr: "Les demandes créées par le bot apparaîtront ici.", en: "Requests created by the bot will appear here." },
  },

  inscription_admission: {
    icon:         m("inscription_admission").icon,
    label:        m("inscription_admission").label,
    feature:      "inscription_admission",
    fetcher:      (p) => inscriptionsResultRepository.getList(p),
    ResultCard:   InscriptionResultCard,
    emptyMessage: { fr: "Aucune inscription.", en: "No admissions." },
    emptyHint:    { fr: "Les inscriptions créées par le bot apparaîtront ici.", en: "Admissions created by the bot will appear here." },
  },

  orientation_citoyens: {
    icon:         m("orientation_citoyens").icon,
    label:        m("orientation_citoyens").label,
    feature:      "orientation_citoyens",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyMessage: { fr: "Aucune orientation citoyen.", en: "No citizen orientations." },
    emptyHint:    { fr: "Les orientations créées par le bot apparaîtront ici.", en: "Orientations created by the bot will appear here." },
  },

  suivi_dossier: {
    icon:         m("suivi_dossier").icon,
    label:        m("suivi_dossier").label,
    feature:      "suivi_dossier",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyMessage: { fr: "Aucun dossier ouvert.", en: "No files opened." },
    emptyHint:    { fr: "Les dossiers créés par le bot apparaîtront ici.", en: "Case files created by the bot will appear here." },
  },

  collecte_documents: {
    icon:         m("collecte_documents").icon,
    label:        m("collecte_documents").label,
    feature:      "collecte_documents",
    fetcher:      (p) => dossiersResultRepository.getList(p),
    ResultCard:   DossierResultCard,
    emptyMessage: { fr: "Aucun document collecté.", en: "No documents collected." },
    emptyHint:    { fr: "Les documents collectés par le bot apparaîtront ici.", en: "Documents collected by the bot will appear here." },
  },

  emails_rappel: {
    icon:         m("emails_rappel").icon,
    label:        m("emails_rappel").label,
    feature:      "emails_rappel",
    fetcher:      (p) => emailLogsResultRepository.getList(p),
    ResultCard:   EmailResultCard,
    emptyMessage: { fr: "Aucun email envoyé.", en: "No emails sent." },
    emptyHint:    { fr: "Les emails envoyés par le bot apparaîtront ici.", en: "Emails sent by the bot will appear here." },
  },
};

/** Ordre d'affichage canonique — depuis le master */
export const TAB_ORDER: TabId[] = ["conversations", ...FEATURES_ORDER as TabId[]];