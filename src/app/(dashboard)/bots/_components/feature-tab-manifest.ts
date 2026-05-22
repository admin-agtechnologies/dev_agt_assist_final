// src/app/(dashboard)/bots/_components/feature-tab-manifest.ts
// Registre data-driven des tabs feature.
// Ajouter une feature = ajouter une entrée ici. Zéro changement ailleurs.

import {
  CalendarDays, UtensilsCrossed, ShoppingBag, Bus,
  GraduationCap, Bed, Ticket, Wrench, Bell,
  FolderOpen, HelpCircle, Mail,
} from "lucide-react";

import {
  reservationsResultRepository,
  commandesResultRepository,
  inscriptionsResultRepository,
  dossiersResultRepository,
  conciergerieResultRepository,
  consultationsFAQResultRepository,
  emailLogsResultRepository,
} from "@/repositories/results.repository";

import { ReservationResultCard }        from "@/app/(dashboard)/results/_components/ReservationResultCard";
import { CommandeResultCard }           from "@/app/(dashboard)/results/_components/CommandeResultCard";
import { InscriptionResultCard }        from "@/app/(dashboard)/results/_components/InscriptionResultCard";
import { DossierResultCard }            from "@/app/(dashboard)/results/_components/DossierResultCard";
import { DemandeConciergericResultCard } from "@/app/(dashboard)/results/_components/DemandeConciergericResultCard";
import { ConsultationFAQResultCard }    from "@/app/(dashboard)/results/_components/ConsultationFAQResultCard";
import { EmailResultCard }              from "@/app/(dashboard)/results/_components/EmailResultCard";

import type { FeatureTabDef } from "./bots.types";

export const FEATURE_TAB_MANIFEST: FeatureTabDef[] = [

  // ── Réservations ────────────────────────────────────────────────────────────
  {
    slug: "prise_rdv",
    label: { fr: "Agenda", en: "Agenda" },
    icon: CalendarDays,
    fetcher: (p) => reservationsResultRepository.getList({ ...p, feature_slug: "prise_rdv" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucun rendez-vous créé par ce bot.", en: "No appointments created by this bot." },
    emptyHint:    { fr: "Configurez les ressources dans la KB et testez votre bot.", en: "Set up resources in the KB and test your bot." },
  },
  {
    slug: "reservation_table",
    label: { fr: "Tables", en: "Tables" },
    icon: UtensilsCrossed,
    fetcher: (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_table" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de table.", en: "No table reservations." },
    emptyHint:    { fr: "Configurez vos tables dans la KB et testez votre bot.", en: "Set up your tables in the KB and test your bot." },
  },
  {
    slug: "reservation_chambre",
    label: { fr: "Chambres", en: "Rooms" },
    icon: Bed,
    fetcher: (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_chambre" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune réservation de chambre.", en: "No room reservations." },
    emptyHint:    { fr: "Configurez vos chambres dans la KB et testez votre bot.", en: "Set up your rooms in the KB and test your bot." },
  },
  {
    slug: "reservation_billet",
    label: { fr: "Billets", en: "Tickets" },
    icon: Ticket,
    fetcher: (p) => reservationsResultRepository.getList({ ...p, feature_slug: "reservation_billet" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucun billet réservé.", en: "No tickets booked." },
    emptyHint:    { fr: "Configurez vos trajets dans la KB et testez votre bot.", en: "Set up your routes in the KB and test your bot." },
  },
  {
    slug: "orientation_patient",
    label: { fr: "Orientations", en: "Orientations" },
    icon: CalendarDays,
    fetcher: (p) => reservationsResultRepository.getList({ ...p, feature_slug: "orientation_patient" }) as never,
    ResultCard: ReservationResultCard,
    emptyMessage: { fr: "Aucune orientation patient.", en: "No patient orientations." },
    emptyHint:    { fr: "Configurez vos spécialités dans la KB et testez votre bot.", en: "Set up your specialties in the KB and test your bot." },
  },

  // ── Commandes ────────────────────────────────────────────────────────────────
  {
    slug: "menu_digital",
    label: { fr: "Commandes", en: "Orders" },
    icon: UtensilsCrossed,
    fetcher: (p) => commandesResultRepository.getList({ ...p, feature_slug: "menu_digital" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande menu.", en: "No menu orders." },
    emptyHint:    { fr: "Configurez votre menu dans la KB et testez votre bot.", en: "Set up your menu in the KB and test your bot." },
  },
  {
    slug: "catalogue_produits",
    label: { fr: "Produits", en: "Products" },
    icon: ShoppingBag,
    fetcher: (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_produits" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande produit.", en: "No product orders." },
    emptyHint:    { fr: "Configurez votre catalogue dans la KB et testez votre bot.", en: "Set up your catalog in the KB and test your bot." },
  },
  {
    slug: "catalogue_services",
    label: { fr: "Services", en: "Services" },
    icon: Wrench,
    fetcher: (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_services" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucun service commandé.", en: "No service orders." },
    emptyHint:    { fr: "Configurez vos services dans la KB et testez votre bot.", en: "Set up your services in the KB and test your bot." },
  },
  {
    slug: "catalogue_trajets",
    label: { fr: "Trajets", en: "Routes" },
    icon: Bus,
    fetcher: (p) => commandesResultRepository.getList({ ...p, feature_slug: "catalogue_trajets" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucun trajet commandé.", en: "No routes ordered." },
    emptyHint:    { fr: "Configurez vos trajets dans la KB et testez votre bot.", en: "Set up your routes in the KB and test your bot." },
  },
  {
    slug: "commande_paiement",
    label: { fr: "Commandes", en: "Orders" },
    icon: ShoppingBag,
    fetcher: (p) => commandesResultRepository.getList({ ...p, feature_slug: "commande_paiement" }) as never,
    ResultCard: CommandeResultCard,
    emptyMessage: { fr: "Aucune commande.", en: "No orders." },
    emptyHint:    { fr: "Testez votre bot pour créer des commandes.", en: "Test your bot to create orders." },
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  {
    slug: "faq",
    label: { fr: "FAQ", en: "FAQ" },
    icon: HelpCircle,
    fetcher: (p) => consultationsFAQResultRepository.getList(p) as never,
    ResultCard: ConsultationFAQResultCard,
    emptyMessage: { fr: "Aucune consultation FAQ.", en: "No FAQ consultations." },
    emptyHint:    { fr: "Ajoutez des questions dans la KB et testez votre bot.", en: "Add questions in the KB and test your bot." },
  },

  // ── Inscriptions ─────────────────────────────────────────────────────────────
  {
    slug: "inscription_admission",
    label: { fr: "Inscriptions", en: "Admissions" },
    icon: GraduationCap,
    fetcher: (p) => inscriptionsResultRepository.getList(p) as never,
    ResultCard: InscriptionResultCard,
    emptyMessage: { fr: "Aucune inscription créée.", en: "No admissions created." },
    emptyHint:    { fr: "Configurez les programmes dans la KB et testez votre bot.", en: "Set up programs in the KB and test your bot." },
  },

  // ── Dossiers ─────────────────────────────────────────────────────────────────
  {
    slug: "orientation_citoyens",
    label: { fr: "Dossiers", en: "Files" },
    icon: FolderOpen,
    fetcher: (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun dossier citoyen ouvert.", en: "No citizen files opened." },
    emptyHint:    { fr: "Configurez les services dans la KB et testez votre bot.", en: "Set up services in the KB and test your bot." },
  },
  {
    slug: "suivi_dossier",
    label: { fr: "Dossiers", en: "Files" },
    icon: FolderOpen,
    fetcher: (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun dossier ouvert.", en: "No files opened." },
    emptyHint:    { fr: "Testez votre bot pour ouvrir des dossiers.", en: "Test your bot to open files." },
  },
  {
    slug: "collecte_documents",
    label: { fr: "Dossiers", en: "Files" },
    icon: FolderOpen,
    fetcher: (p) => dossiersResultRepository.getList(p) as never,
    ResultCard: DossierResultCard,
    emptyMessage: { fr: "Aucun dossier créé.", en: "No files created." },
    emptyHint:    { fr: "Testez votre bot pour collecter des documents.", en: "Test your bot to collect documents." },
  },

  // ── Conciergerie ─────────────────────────────────────────────────────────────
  {
    slug: "conciergerie",
    label: { fr: "Conciergerie", en: "Concierge" },
    icon: Bell,
    fetcher: (p) => conciergerieResultRepository.getList(p) as never,
    ResultCard: DemandeConciergericResultCard,
    emptyMessage: { fr: "Aucune demande de conciergerie.", en: "No concierge requests." },
    emptyHint:    { fr: "Configurez vos services et testez votre bot.", en: "Set up your services and test your bot." },
  },

  // ── Emails ───────────────────────────────────────────────────────────────────
  {
    slug: "emails_rappel",
    label: { fr: "Emails", en: "Emails" },
    icon: Mail,
    fetcher: (p) => emailLogsResultRepository.getList(p) as never,
    ResultCard: EmailResultCard,
    emptyMessage: { fr: "Aucun email envoyé par ce bot.", en: "No emails sent by this bot." },
    emptyHint:    { fr: "Les emails envoyés par le bot apparaîtront ici.", en: "Emails sent by the bot will appear here." },
  },
];

/** Lookup rapide slug → def */
export const FEATURE_TAB_MAP = new Map<string, FeatureTabDef>(
  FEATURE_TAB_MANIFEST.map((d) => [d.slug, d]),
);