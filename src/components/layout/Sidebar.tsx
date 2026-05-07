// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Calendar,
  ShoppingCart,
  UtensilsCrossed,
  Hotel,
  Bus,
  Users,
  Briefcase,
  ClipboardList,
  Building2,
  Star,
  Layers,
  BookOpen,
} from "lucide-react";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useSector } from "@/hooks/useSector";
import { useLanguage } from "@/hooks/useLanguage";
import { getFeatureLabel } from "@/lib/sector-labels";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";

// ── Icônes par feature slug ──────────────────────────────────────────────────
const FEATURE_ICONS: Record<string, LucideIcon> = {
  reservation_table:             UtensilsCrossed,
  reservation_chambre:           Hotel,
  reservation_billet:            Bus,
  prise_rdv:                     Calendar,
  menu_digital:                  UtensilsCrossed,
  catalogue_produits:            Layers,
  catalogue_services:            Briefcase,
  catalogue_trajets:             Bus,
  catalogue_produits_financiers: Briefcase,
  commande_paiement:             ShoppingCart,
  conciergerie:                  Star,
  suivi_commande:                ClipboardList,
  multi_agences:                 Building2,
  inscription_admission:         BookOpen,
  orientation_patient:           Users,
  orientation_citoyens:          ClipboardList,
  conversion_prospects:          Users,
  communication_etablissement:   MessageSquare,
};

// ── Route par feature slug ───────────────────────────────────────────────────
const FEATURE_ROUTES: Record<string, string> = {
  reservation_table:             "/modules/reservations",
  reservation_chambre:           "/modules/reservations",
  reservation_billet:            "/modules/reservations",
  prise_rdv:                     "/appointments",
  menu_digital:                  "/modules/catalogue",
  catalogue_produits:            "/modules/catalogue",
  catalogue_services:            "/modules/catalogue",
  catalogue_trajets:             "/modules/catalogue",
  catalogue_produits_financiers: "/modules/catalogue",
  commande_paiement:             "/modules/commandes",
  conciergerie:                  "/modules/commandes",
  suivi_commande:                "/modules/commandes",
  multi_agences:                 "/modules/agences",
  inscription_admission:         "/modules/inscriptions",
  orientation_patient:           "/modules/contacts",
  orientation_citoyens:          "/modules/dossiers",
  conversion_prospects:          "/modules/contacts",
  communication_etablissement:   "/modules/catalogue",
};

// ── NavItem ──────────────────────────────────────────────────────────────────
interface NavItemProps {
  href: string;
  label: string;
  Icon: LucideIcon;
  primaryColor: string;
}

function NavItem({ href, label, Icon, primaryColor }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")}
      style={isActive ? { backgroundColor: primaryColor } : undefined}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ── Sidebar principale ───────────────────────────────────────────────────────
export function Sidebar() {
  const { features, isLoading } = useActiveFeatures();
  const { theme } = useSector();
  const { lang } = useLanguage();
  const common = lang === "fr" ? commonFr : commonEn;
  const nav = common.nav;

  // Dédupliquer les routes (ex: reservation_table + reservation_chambre → même route)
  const seen = new Set<string>();
  const sectorItems = features
    .filter((f) => f.is_active && FEATURE_ROUTES[f.slug])
    .filter((f) => {
      const route = FEATURE_ROUTES[f.slug];
      if (seen.has(route)) return false;
      seen.add(route);
      return true;
    })
    .map((f) => ({
      href:  FEATURE_ROUTES[f.slug],
      label: getFeatureLabel(f.slug, lang).nav,
      Icon:  FEATURE_ICONS[f.slug] ?? Layers,
    }));

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-gray-200 bg-white">
      {/* Logo / marque */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: theme.primary }}
        >
          AGT Platform
        </span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Modules communs fixes */}
        <NavItem href="/dashboard"     label={nav.dashboard}  Icon={LayoutDashboard} primaryColor={theme.primary} />
        <NavItem href="/bots"          label={nav.bots}       Icon={Bot}             primaryColor={theme.primary} />
        <NavItem href="/conversations" label={nav.knowledge}  Icon={MessageSquare}   primaryColor={theme.primary} />

        {/* Modules sectoriels — dynamiques via features actives */}
        {!isLoading && sectorItems.length > 0 && (
          <div className="pt-3">
            <div className="h-px bg-gray-100 mb-3" />
            <div className="space-y-1">
              {sectorItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.Icon}
                  primaryColor={theme.primary}
                />
              ))}
            </div>
          </div>
        )}

        {/* Skeleton de chargement */}
        {isLoading && (
          <div className="pt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}
      </nav>

      {/* Bas de sidebar — liens permanents */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <NavItem href="/billing"  label={nav.billing}       Icon={CreditCard} primaryColor={theme.primary} />
        <NavItem href="/faq"      label={nav.faq}           Icon={HelpCircle} primaryColor={theme.primary} />
        <NavItem href="/settings" label={common.settings}   Icon={Settings}   primaryColor={theme.primary} />
      </div>
    </aside>
  );
}