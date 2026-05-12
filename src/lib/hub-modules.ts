// src/lib/hub-modules.ts
// Registre central des modules Hub — pages dédiées sous /modules/[path]
// Ne contient PAS les modules standalone (Bots, Conversations, FAQ, etc.)

export type HubModuleType = "agent_reads" | "user_writes" | "collaborative";

export interface HubModule {
  slug: string;         // feature slug backend
  path: string;         // URL slug
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  iconName: string;     // lucide icon
  type: HubModuleType;
  apiEndpoint: string;  // graceful si 404 — empty state
  color: string;        // accent propre au module
}

export const HUB_MODULES: HubModule[] = [
  { slug:"reservation_table",        path:"reservation-table",  labelFr:"Réservations de tables",    labelEn:"Table reservations",    descFr:"Réservations collectées par votre assistant", descEn:"Reservations from your assistant", iconName:"UtensilsCrossed", type:"agent_reads",  apiEndpoint:"/api/v1/reservations/",            color:"#f59e0b" },
  { slug:"reservation_chambre",      path:"reservation-chambre",labelFr:"Réservations de chambres",  labelEn:"Room reservations",     descFr:"Hébergements réservés via l'assistant",       descEn:"Rooms booked via the assistant",   iconName:"BedDouble",      type:"agent_reads",  apiEndpoint:"/api/v1/reservations/",            color:"#8b5cf6" },
  { slug:"menu_digital",             path:"menu-digital",       labelFr:"Menu digital",              labelEn:"Digital menu",          descFr:"Votre menu partagé automatiquement",          descEn:"Your menu shared automatically",   iconName:"BookOpen",       type:"user_writes",  apiEndpoint:"/api/v1/knowledge/menu/",          color:"#10b981" },
  { slug:"commande_paiement",        path:"commande-paiement",  labelFr:"Commandes & Paiements",     labelEn:"Orders & Payments",     descFr:"Commandes reçues par votre assistant",        descEn:"Orders received by the assistant", iconName:"ShoppingCart",   type:"agent_reads",  apiEndpoint:"/api/v1/orders/",                  color:"#ef4444" },
  { slug:"prise_rendez_vous",        path:"prise-rdv",          labelFr:"Prise de rendez-vous",      labelEn:"Appointments",          descFr:"Agenda géré par votre assistant",             descEn:"Calendar managed by the assistant",iconName:"CalendarDays",   type:"agent_reads",  apiEndpoint:"/api/v1/appointments/",            color:"#3b82f6" },
  { slug:"catalogue_produits",       path:"catalogue-produits", labelFr:"Catalogue produits",        labelEn:"Product catalog",       descFr:"Vos produits présentés par l'assistant",      descEn:"Products presented by assistant",  iconName:"Package",        type:"user_writes",  apiEndpoint:"/api/v1/catalogue/produits/",      color:"#f97316" },
  { slug:"catalogue_services_tarifs",path:"catalogue-services", labelFr:"Services & Tarifs",         labelEn:"Services & Rates",      descFr:"Prestations et tarifs de votre catalogue",    descEn:"Your services and rates",          iconName:"Wrench",         type:"user_writes",  apiEndpoint:"/api/v1/services/",                color:"#6366f1" },
  { slug:"catalogue_trajets_tarifs", path:"catalogue-trajets",  labelFr:"Trajets & Tarifs",          labelEn:"Routes & Fares",        descFr:"Lignes et tarifs de transport",               descEn:"Transport routes and fares",       iconName:"Bus",            type:"user_writes",  apiEndpoint:"/api/v1/catalogue/trajets/",       color:"#0ea5e9" },
  { slug:"inscriptions_admissions",  path:"inscriptions",       labelFr:"Inscriptions & Admissions", labelEn:"Enrollments",           descFr:"Dossiers collectés par votre assistant",      descEn:"Enrollment files from assistant",  iconName:"GraduationCap",  type:"agent_reads",  apiEndpoint:"/api/v1/dossiers/",                color:"#d946ef" },
  { slug:"multi_agences",            path:"agences",            labelFr:"Multi-agences",             labelEn:"Multi-agencies",        descFr:"Vos agences et points de vente",              descEn:"Your agencies and points of sale", iconName:"Building2",      type:"user_writes",  apiEndpoint:"/api/v1/agences/",                 color:"#64748b" },
  { slug:"conciergerie_virtuelle",   path:"conciergerie",       labelFr:"Conciergerie virtuelle",    labelEn:"Virtual concierge",     descFr:"Services hôteliers gérés par l'assistant",   descEn:"Hotel services by the assistant",  iconName:"Sparkles",       type:"agent_reads",  apiEndpoint:"/api/v1/conciergerie/",            color:"#ec4899" },
  { slug:"communication_etablissement",path:"communication",    labelFr:"Communication",             labelEn:"Communication",         descFr:"Annonces et rappels envoyés",                 descEn:"Announcements and reminders",      iconName:"Bell",           type:"collaborative",apiEndpoint:"/api/v1/communications/",          color:"#f59e0b" },
  { slug:"conversion_prospects",     path:"prospects",          labelFr:"Prospects",                 labelEn:"Leads",                 descFr:"Prospects qualifiés par l'assistant",         descEn:"Leads qualified by the assistant", iconName:"Target",         type:"agent_reads",  apiEndpoint:"/api/v1/contacts/?type=prospect",  color:"#10b981" },
];

export const HUB_SLUGS          = new Set(HUB_MODULES.map((m) => m.slug));
export const getHubBySlug       = (s: string) => HUB_MODULES.find((m) => m.slug === s);
export const getHubByPath       = (p: string) => HUB_MODULES.find((m) => m.path === p);