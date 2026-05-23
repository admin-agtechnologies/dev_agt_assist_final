// src/app/(dashboard)/bots/_components/feature-tab-manifest.ts
// Registre data-driven des tabs feature pour /bots.
// Labels et icons importés depuis features-master-config (source de vérité unique).
// S54 — alignement complet avec /results : 22 features.

import { FEATURES_MASTER_MAP } from "@/config/features-master-config";
import type { FeatureTabDef }  from "./bots.types";

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

import { ReservationResultCard }         from "@/app/(dashboard)/results/_components/ReservationResultCard";
import { CommandeResultCard }            from "@/app/(dashboard)/results/_components/CommandeResultCard";
import { InscriptionResultCard }         from "@/app/(dashboard)/results/_components/InscriptionResultCard";
import { DossierResultCard }             from "@/app/(dashboard)/results/_components/DossierResultCard";
import { ContactResultCard }             from "@/app/(dashboard)/results/_components/ContactResultCard";
import { TransfertHumainResultCard }     from "@/app/(dashboard)/results/_components/TransfertHumainResultCard";
import { DemandeConciergericResultCard } from "@/app/(dashboard)/results/_components/DemandeConciergericResultCard";
import { EmailResultCard }               from "@/app/(dashboard)/results/_components/EmailResultCard";
import { ConsultationFAQResultCard }     from "@/app/(dashboard)/results/_components/ConsultationFAQResultCard";

// Helper pour récupérer label + icon depuis le master
const m = (slug: string) => FEATURES_MASTER_MAP.get(slug)!;

export const FEATURE_TAB_MANIFEST: FeatureTabDef[] = [

  // ── Sessions test (chatbot WhatsApp) ─────────────────────────────────────────
  {
    slug:  "chatbot_whatsapp",
    label: m("chatbot_whatsapp").label,
    icon:  m("chatbot_whatsapp").icon,
    special: "chatbot",
    emptyMessage: { fr: "Aucune session de test.", en: "No test sessions." },
    emptyHint:    { fr: "Utilisez l'interface de test pour démarrer.", en: "Use the test interface to start." },
  } as never,

  // ── FAQ ───────────────────────────────────────────────────────────────────────
  {
    slug:       "faq",
    label:      m("faq").label,
    icon:       m("faq").icon,
    fetcher:    (p) => consultationsFAQResultRepository.getList(p) as never,
    ResultCard: ConsultationFAQResultCard,
    emptyMessage: { fr: "Aucune consultation FAQ.", en: "No FAQ consultations." },
    emptyHint:    { fr: "Ajoutez des questions dans la KB et testez votre bot.", en: "Add questions to the KB and test your bot." },
  },

  // ── Clients (gestion_crm — base feature, toujours visible) ───────────────────
  {
    slug:       "gestion_crm",
    label:      m("gestion_crm").label,
    icon:       m("gestion_crm").icon,
    fetcher:    (p) => contactsResultRepository.getList(p) as never,
    ResultCard: ContactResultCard,
    emptyMessage: { fr: "Aucun client enregistré.", en: "No clients recorded." },
    emptyHint:    { fr: "Les clients créés par le bot apparaîtront ici.", en: "Clients created by the bot will appear here." },
  },

  // ── Prospection ───────────────────────────────────────────────────────────────
  {
    slug:       "capture_prospect",
    label:      m("capture_prospect").label,
    icon:       m("capture_prospect").icon,
    fetcher:    (p) => contactsResultRepository.getList({ ...p, statut: "prospect" }) as never,
    ResultCard: ContactResultCard,
    emptyMessage: { fr: "Aucun prospect capturé.", en: "No leads captured." },
    emptyHint:    { fr: "Les prospects capturés par le bot apparaîtront ici.", en: "Leads captured by the bot will appear here." },
  },

  // ── Transferts humains ────────────────────────────────────────────────────────
  {
    slug:       "transfert_humain",
    label:      m("transfert_humain").label,
    icon:       m("transfert_humain").icon,
    fetcher:    (p) => transfertsResultRepository.getList(p) as never,
    ResultCard: TransfertHumainResultCard,
    emptyMessage: { fr: "Aucun transfert humain.", en: "No human handoffs." },
    emptyHint:    { fr: "Les transferts déclenchés par le bot apparaîtront ici.", en: "Handoffs triggered by the bot will appear here." },
  },

  // ── Réservations ──────────────────────────────────────────────────────────────
  {
    slug:       "prise_rdv",
    label:      m("prise_rdv").label,
    icon:       m("prise_rdv").icon,
    fetcher:    (p) => reservationsResultRepository.getList({ ...p, feature_slug: "prise_rdv" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucun rendez-vous créé.", en: "No appointments created." },
    emptyHint:    { fr: "Configurez les ressources dans la KB et testez votre bot.", en: "Set up resources in the KB and test your bot." },
  },
  {
    slug:       "reservation_table",
    label:      m("reservation_table").label,
    icon:       m("reservation_table").icon,
    fetcher:    (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_table" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de table.", en: "No table reservations." },
    emptyHint:    { fr: "Configurez vos tables dans la KB et testez votre bot.", en: "Set up your tables in the KB and test your bot." },
  },
  {
    slug:       "reservation_chambre",
    label:      m("reservation_chambre").label,
    icon:       m("reservation_chambre").icon,
    fetcher:    (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_chambre" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de chambre.", en: "No room reservations." },
    emptyHint:    { fr: "Configurez vos chambres dans la KB et testez votre bot.", en: "Set up your rooms in the KB and test your bot." },
  },
  {
    slug:       "reservation_billet",
    label:      m("reservation_billet").label,
    icon:       m("reservation_billet").icon,
    fetcher:    (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_billet" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucun billet réservé.", en: "No tickets booked." },
    emptyHint:    { fr: "Configurez vos trajets dans la KB et testez votre bot.", en: "Set up your routes in the KB and test your bot." },
  },
  {
    slug:       "orientation_patient",
    label:      m("orientation_patient").label,
    icon:       m("orientation_patient").icon,
    fetcher:    (p) => reservationsResultRepository.getList({ ...p, feature_slug: "orientation_patient" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune orientation patient.", en: "No patient orientations." },
    emptyHint:    { fr: "Configurez vos spécialités dans la KB et testez votre bot.", en: "Set up your specialties in the KB and test your bot." },
  },

  // ── Commandes & Catalogue ──────────────────────────────────────────────────────
  {
    slug:       "menu_digital",
    label:      m("menu_digital").label,
    icon:       m("menu_digital").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "menu_digital" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande menu.", en: "No menu orders." },
    emptyHint:    { fr: "Configurez votre menu dans la KB et testez votre bot.", en: "Set up your menu in the KB and test your bot." },
  },
  {
    slug:       "catalogue_produits",
    label:      m("catalogue_produits").label,
    icon:       m("catalogue_produits").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_produits" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande produit.", en: "No product orders." },
    emptyHint:    { fr: "Configurez votre catalogue dans la KB et testez votre bot.", en: "Set up your catalog in the KB and test your bot." },
  },
  {
    slug:       "catalogue_services",
    label:      m("catalogue_services").label,
    icon:       m("catalogue_services").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_services" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucun service commandé.", en: "No service orders." },
    emptyHint:    { fr: "Configurez vos services dans la KB et testez votre bot.", en: "Set up your services in the KB and test your bot." },
  },
  {
    slug:       "catalogue_trajets",
    label:      m("catalogue_trajets").label,
    icon:       m("catalogue_trajets").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_trajets" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucun trajet commandé.", en: "No routes ordered." },
    emptyHint:    { fr: "Configurez vos trajets dans la KB et testez votre bot.", en: "Set up your routes in the KB and test your bot." },
  },
  {
    slug:       "commande_paiement",
    label:      m("commande_paiement").label,
    icon:       m("commande_paiement").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "commande_paiement" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande.", en: "No orders." },
    emptyHint:    { fr: "Testez votre bot pour créer des commandes.", en: "Test your bot to create orders." },
  },
  {
    slug:       "suivi_commande",
    label:      m("suivi_commande").label,
    icon:       m("suivi_commande").icon,
    fetcher:    (p) => commandesResultRepository.getList({ ...p, feature_slug: "suivi_commande" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande à suivre.", en: "No orders to track." },
    emptyHint:    { fr: "Les commandes créées par le bot apparaîtront ici.", en: "Orders created by the bot will appear here." },
  },

  // ── Conciergerie ──────────────────────────────────────────────────────────────
  {
    slug:       "conciergerie",
    label:      m("conciergerie").label,
    icon:       m("conciergerie").icon,
    fetcher:    (p) => conciergerieResultRepository.getList(p) as never,
    ResultCard: DemandeConciergericResultCard,
    emptyMessage: { fr: "Aucune demande de conciergerie.", en: "No concierge requests." },
    emptyHint:    { fr: "Configurez vos services et testez votre bot.", en: "Set up your services and test your bot." },
  },

  // ── Inscriptions ──────────────────────────────────────────────────────────────
  {
    slug:       "inscription_admission",
    label:      m("inscription_admission").label,
    icon:       m("inscription_admission").icon,
    fetcher:    (p) => inscriptionsResultRepository.getList(p) as never,
    ResultCard: InscriptionResultCard,
    emptyMessage: { fr: "Aucune inscription créée.", en: "No admissions created." },
    emptyHint:    { fr: "Configurez les programmes dans la KB et testez votre bot.", en: "Set up programs in the KB and test your bot." },
  },

  // ── Dossiers ──────────────────────────────────────────────────────────────────
  {
    slug:       "orientation_citoyens",
    label:      m("orientation_citoyens").label,
    icon:       m("orientation_citoyens").icon,
    fetcher:    (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun dossier citoyen.", en: "No citizen files." },
    emptyHint:    { fr: "Configurez les services dans la KB et testez votre bot.", en: "Set up services in the KB and test your bot." },
  },
  {
    slug:       "suivi_dossier",
    label:      m("suivi_dossier").label,
    icon:       m("suivi_dossier").icon,
    fetcher:    (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun dossier ouvert.", en: "No files opened." },
    emptyHint:    { fr: "Testez votre bot pour ouvrir des dossiers.", en: "Test your bot to open files." },
  },
  {
    slug:       "collecte_documents",
    label:      m("collecte_documents").label,
    icon:       m("collecte_documents").icon,
    fetcher:    (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun document collecté.", en: "No documents collected." },
    emptyHint:    { fr: "Testez votre bot pour collecter des documents.", en: "Test your bot to collect documents." },
  },

  // ── Emails ────────────────────────────────────────────────────────────────────
  {
    slug:       "emails_rappel",
    label:      m("emails_rappel").label,
    icon:       m("emails_rappel").icon,
    fetcher:    (p) => emailLogsResultRepository.getList(p) as never,
    ResultCard: EmailResultCard,
    emptyMessage: { fr: "Aucun email envoyé.", en: "No emails sent." },
    emptyHint:    { fr: "Les emails envoyés par le bot apparaîtront ici.", en: "Emails sent by the bot will appear here." },
  },
];

/** Lookup rapide slug → def */
export const FEATURE_TAB_MAP = new Map<string, FeatureTabDef>(
  FEATURE_TAB_MANIFEST.map((d) => [d.slug, d]),
);