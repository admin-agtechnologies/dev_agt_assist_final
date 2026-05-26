// src/config/features-master-config.ts
// Source de vérité unique — labels, icons, ordre des 22 features.
// Importé par feature-tab-manifest.ts (/bots) ET results-tab-config.ts (/results).
// S54 — décision Gabriel : cohérence totale entre les deux pages.

import {
  MessageSquare, HelpCircle, Users, Target, ArrowLeftRight,
  CalendarDays, UtensilsCrossed, Bed, Ticket, Stethoscope,
  ShoppingBag, Package, Wrench, Bus, CreditCard,
  Bell, GraduationCap, FolderOpen, FileText, Landmark,
  Mail, type LucideIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type FeatureSlug =
  | "chatbot_whatsapp"
  | "faq"
  | "gestion_crm"
  | "capture_prospect"
  | "transfert_humain"
  | "prise_rdv"
  | "reservation_table"
  | "reservation_chambre"
  | "reservation_billet"
  | "orientation_patient"
  | "menu_digital"
  | "catalogue_produits"
  | "catalogue_services"
  | "catalogue_trajets"
  | "commande_paiement"
  | "suivi_commande"
  | "conciergerie"
  | "inscription_admission"
  | "orientation_citoyens"
  | "suivi_dossier"
  | "collecte_documents"
  | "emails_rappel";

export interface FeatureMeta {
  slug:    FeatureSlug;
  label:   { fr: string; en: string };
  icon:    LucideIcon;
  /** Slug de la TenantFeature requise. Absent = toujours visible (base feature). */
  feature?: string;
}

// ── Registre ordonné ──────────────────────────────────────────────────────────

export const FEATURES_MASTER: FeatureMeta[] = [
  { slug: "chatbot_whatsapp",     label: { fr: "Sessions test",      en: "Test sessions"      }, icon: MessageSquare  },
  { slug: "faq",                  label: { fr: "FAQ",                en: "FAQ"                }, icon: HelpCircle,    feature: "faq"                  },
  { slug: "gestion_crm",          label: { fr: "Clients",            en: "Clients"            }, icon: Users          },
  { slug: "capture_prospect",     label: { fr: "Prospection",        en: "Lead capture"       }, icon: Target,        feature: "capture_prospect"     },
  { slug: "transfert_humain",     label: { fr: "Transferts",         en: "Handoffs"           }, icon: ArrowLeftRight, feature: "transfert_humain"    },
  { slug: "prise_rdv",            label: { fr: "Agenda",             en: "Agenda"             }, icon: CalendarDays,  feature: "prise_rdv"            },
  { slug: "reservation_table",    label: { fr: "Tables",             en: "Tables"             }, icon: UtensilsCrossed, feature: "reservation_table"  },
  { slug: "reservation_chambre",  label: { fr: "Chambres",           en: "Rooms"              }, icon: Bed,           feature: "reservation_chambre"  },
  { slug: "reservation_billet",   label: { fr: "Billets",            en: "Tickets"            }, icon: Ticket,        feature: "reservation_billet"   },
  { slug: "orientation_patient",  label: { fr: "Orientations",       en: "Orientations"       }, icon: Stethoscope,   feature: "orientation_patient"  },
  { slug: "menu_digital",         label: { fr: "Commandes menu",     en: "Menu orders"        }, icon: UtensilsCrossed, feature: "menu_digital"       },
  { slug: "catalogue_produits",   label: { fr: "Produits",           en: "Products"           }, icon: Package,       feature: "catalogue_produits"   },
  { slug: "catalogue_services",   label: { fr: "Services",           en: "Services"           }, icon: Wrench,        feature: "catalogue_services"   },
  { slug: "catalogue_trajets",    label: { fr: "Trajets",            en: "Routes"             }, icon: Bus,           feature: "catalogue_trajets"    },
  { slug: "commande_paiement",    label: { fr: "Commandes",          en: "Orders"             }, icon: CreditCard,    feature: "commande_paiement"    },
  { slug: "suivi_commande",       label: { fr: "Suivi commandes",    en: "Order tracking"     }, icon: ShoppingBag,   feature: "suivi_commande"       },
  { slug: "conciergerie",         label: { fr: "Conciergerie",       en: "Concierge"          }, icon: Bell,          feature: "conciergerie"         },
  { slug: "inscription_admission",label: { fr: "Inscriptions",       en: "Admissions"         }, icon: GraduationCap, feature: "inscription_admission" },
  { slug: "orientation_citoyens", label: { fr: "Citoyens",           en: "Citizens"           }, icon: Landmark,      feature: "orientation_citoyens" },
  { slug: "suivi_dossier",        label: { fr: "Suivi dossier",      en: "Case tracking"      }, icon: FolderOpen,    feature: "suivi_dossier"        },
  { slug: "collecte_documents",   label: { fr: "Documents",          en: "Documents"          }, icon: FileText,      feature: "collecte_documents"   },
  { slug: "emails_rappel",        label: { fr: "Emails",             en: "Emails"             }, icon: Mail,          feature: "emails_rappel"        },
];

/** Lookup rapide slug → meta */
export const FEATURES_MASTER_MAP = new Map<string, FeatureMeta>(
  FEATURES_MASTER.map((f) => [f.slug, f]),
);

/** Ordre canonique des slugs */
export const FEATURES_ORDER = FEATURES_MASTER.map((f) => f.slug);