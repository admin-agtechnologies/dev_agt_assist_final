// src/app/(dashboard)/bots/_components/tabs/bot-config.constants.ts
// Constantes métier de BotConfigTab — séparées pour maintenance et i18n future.
import { Bot, CalendarDays, ShoppingBag, Users, Landmark, Coins, Sparkles } from "lucide-react";

export const FEATURE_GROUPS: Array<{
  key: string; icon: React.ElementType; label: string; slugs: string[];
}> = [
  { key: "core",      icon: Bot,          label: "Core",               slugs: ["chatbot_whatsapp", "faq", "suivi_commande", "transfert_humain", "communication"] },
  { key: "rdv",       icon: CalendarDays, label: "Réservations",       slugs: ["prise_rdv", "reservation_table", "reservation_chambre", "reservation_billet", "conciergerie"] },
  { key: "catalogue", icon: ShoppingBag,  label: "Catalogue & Ventes", slugs: ["menu_digital", "catalogue_produits", "catalogue_services", "catalogue_trajets", "commande_paiement", "paiement_en_ligne"] },
  { key: "crm",       icon: Users,        label: "CRM & Prospection",  slugs: ["gestion_crm", "capture_prospect", "emails_rappel"] },
  { key: "public",    icon: Landmark,     label: "Public & Éducation", slugs: ["inscription_admission", "orientation_patient", "orientation_citoyens", "multi_agences"] },
  { key: "finance",   icon: Coins,        label: "Finance",            slugs: ["catalogue_produits_financiers", "simulation_credit", "suivi_dossier", "collecte_documents"] },
  { key: "custom",    icon: Sparkles,     label: "Custom",             slugs: ["dashboard", "agent_vocal"] },
];

export const SECTIONS_KB = [
  { key: "profil",   label: "Profil entreprise", sub: "identité, description, slogan" },
  { key: "services", label: "Services proposés", sub: "catalogue actif" },
  { key: "faq",      label: "FAQ",               sub: "questions fréquentes" },
  { key: "agences",  label: "Infos agences",     sub: "adresses, contacts, horaires" },
];

export const TON_OPTIONS = [
  { value: "formel",      label: "Formel" },
  { value: "semi_formel", label: "Semi-formel" },
  { value: "decontracte", label: "Décontracté" },
];

export const LANGUES_OPTIONS = [
  { value: "fr",  label: "Français" },
  { value: "en",  label: "English" },
  { value: "es",  label: "Español" },
  { value: "ar",  label: "العربية" },
  { value: "pt",  label: "Português" },
  { value: "de",  label: "Deutsch" },
];

export const INPUT_CLASS =
  "w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none";