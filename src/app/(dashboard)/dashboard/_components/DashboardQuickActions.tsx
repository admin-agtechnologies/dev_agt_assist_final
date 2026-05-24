"use client";
// src/app/(dashboard)/dashboard/_components/DashboardQuickActions.tsx
// Bannière actions rapides — chips dynamiques selon features actives.
// S63 — création.

import Link from "next/link";
import {
  CalendarDays, ShoppingCart, Users, UtensilsCrossed,
  Bed, Bus, BookOpen, FileText, HelpCircle,
  ArrowLeftRight, Bell, Briefcase, MessageSquare,
  Building2, Landmark, ArrowRight,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn }          from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Map feature → action rapide ───────────────────────────────────────────────

interface QuickAction {
  featureSlug: string;
  icon:        LucideIcon;
  labelFr:     string;
  labelEn:     string;
  href:        string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { featureSlug: "reservation_table",           icon: UtensilsCrossed, labelFr: "Réservations",    labelEn: "Reservations",    href: "/modules/reservations" },
  { featureSlug: "reservation_chambre",         icon: Bed,             labelFr: "Chambres",         labelEn: "Rooms",           href: "/modules/reservations" },
  { featureSlug: "reservation_billet",          icon: Bus,             labelFr: "Billets",          labelEn: "Tickets",         href: "/modules/reservations" },
  { featureSlug: "prise_rdv",                   icon: CalendarDays,    labelFr: "Agenda",           labelEn: "Agenda",          href: "/modules/reservations" },
  { featureSlug: "commande_paiement",           icon: ShoppingCart,    labelFr: "Commandes",        labelEn: "Orders",          href: "/modules/commandes" },
  { featureSlug: "menu_digital",                icon: UtensilsCrossed, labelFr: "Menu",             labelEn: "Menu",            href: "/modules/catalogue" },
  { featureSlug: "catalogue_produits",          icon: ShoppingCart,    labelFr: "Produits",         labelEn: "Products",        href: "/modules/catalogue" },
  { featureSlug: "catalogue_services",          icon: Briefcase,       labelFr: "Services",         labelEn: "Services",        href: "/modules/catalogue" },
  { featureSlug: "catalogue_trajets",           icon: Bus,             labelFr: "Trajets",          labelEn: "Routes",          href: "/modules/catalogue" },
  { featureSlug: "catalogue_produits_financiers",icon: Briefcase,      labelFr: "Produits financiers","labelEn": "Financial products", href: "/modules/catalogue" },
  { featureSlug: "gestion_crm",                 icon: Users,           labelFr: "Clients",          labelEn: "Clients",         href: "/contacts" },
  { featureSlug: "capture_prospect",            icon: Users,           labelFr: "Prospects",        labelEn: "Prospects",       href: "/contacts" },
  { featureSlug: "inscription_admission",       icon: BookOpen,        labelFr: "Inscriptions",     labelEn: "Admissions",      href: "/modules/inscriptions" },
  { featureSlug: "suivi_dossier",               icon: FileText,        labelFr: "Dossiers",         labelEn: "Files",           href: "/modules/dossiers" },
  { featureSlug: "collecte_documents",          icon: FileText,        labelFr: "Documents",        labelEn: "Documents",       href: "/modules/dossiers" },
  { featureSlug: "orientation_patient",         icon: Users,           labelFr: "Orientations",     labelEn: "Orientations",    href: "/modules/dossiers" },
  { featureSlug: "orientation_citoyens",        icon: Landmark,        labelFr: "Citoyens",         labelEn: "Citizens",        href: "/modules/dossiers" },
  { featureSlug: "conciergerie",                icon: Bell,            labelFr: "Conciergerie",     labelEn: "Concierge",       href: "/modules/commandes" },
  { featureSlug: "transfert_humain",            icon: ArrowLeftRight,  labelFr: "Transferts",       labelEn: "Handoffs",        href: "/conversations" },
  { featureSlug: "faq",                         icon: HelpCircle,      labelFr: "FAQ",              labelEn: "FAQ",             href: "/knowledge" },
  { featureSlug: "emails_rappel",               icon: MessageSquare,   labelFr: "Emails",           labelEn: "Emails",          href: "/statistiques" },
  { featureSlug: "communication",               icon: MessageSquare,   labelFr: "Communication",    labelEn: "Communication",   href: "/statistiques" },
  { featureSlug: "multi_agences",               icon: Building2,       labelFr: "Agences",          labelEn: "Branches",        href: "/modules/agences" },
  { featureSlug: "simulation_credit",           icon: Briefcase,       labelFr: "Simulations",      labelEn: "Simulations",     href: "/statistiques" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  featuresActives: string[];
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function DashboardQuickActions({ featuresActives }: Props) {
  const { theme }   = useSector();
  const { locale }  = useLanguage();
  const primary     = theme?.primary ?? "var(--color-primary)";

  const activeSet = new Set(featuresActives);

  // Dédoublonner par href — garder la première feature de chaque route
  const seenHrefs = new Set<string>();
  const actions = QUICK_ACTIONS
    .filter((a) => activeSet.has(a.featureSlug))
    .filter((a) => {
      if (seenHrefs.has(a.href)) return false;
      seenHrefs.add(a.href);
      return true;
    })
    .slice(0, 8); // max 8 chips

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mr-1 whitespace-nowrap">
        {locale === "fr" ? "Accès rapide" : "Quick access"}
      </span>
      {actions.map((action) => {
        const Icon  = action.icon;
        const label = locale === "fr" ? action.labelFr : action.labelEn;
        return (
          <Link
            key={action.featureSlug}
            href={action.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
              "border border-[var(--border)] bg-[var(--bg-card)]",
              "hover:border-[var(--text-muted)] hover:text-[var(--text)]",
              "text-[var(--text-muted)] transition-all duration-150",
            )}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} />
            {label}
          </Link>
        );
      })}
      <Link
        href="/modules"
        className="flex items-center gap-1 text-[10px] font-bold transition-colors hover:opacity-75 ml-1"
        style={{ color: primary }}
      >
        {locale === "fr" ? "Tout voir" : "See all"}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}