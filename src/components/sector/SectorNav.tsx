// src/components/sector/SectorNav.tsx
"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Calendar, ShoppingCart, UtensilsCrossed, Hotel, Bus,
  Users, Briefcase, ClipboardList, Building2, Star,
  Layers, BookOpen, MessageSquare,
} from "lucide-react";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useSector } from "@/hooks/useSector";
import { useLanguage } from "@/hooks/useLanguage";
import { getFeatureLabel } from "@/lib/sector-labels";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";

// ── Mapping slug → icône + route ─────────────────────────────────────────────
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

// ── ModuleCard ────────────────────────────────────────────────────────────────
interface ModuleCardProps {
  href: string;
  label: string;
  pageTitle: string;
  Icon: LucideIcon;
  primaryColor: string;
  accentColor: string;
}

function ModuleCard({
  href, label, pageTitle, Icon, primaryColor, accentColor,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Icon size={20} style={{ color: primaryColor }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {pageTitle}
        </p>
      </div>
      <div
        className="h-0.5 w-8 rounded-full transition-all group-hover:w-full"
        style={{ backgroundColor: accentColor }}
      />
    </Link>
  );
}

// ── SectorNav principal ───────────────────────────────────────────────────────
export function SectorNav() {
  const { features, isLoading } = useActiveFeatures();
  const { theme } = useSector();
  const { lang } = useLanguage();
  const common = lang === "fr" ? commonFr : commonEn;

  // Dédupliquer les routes
  const seen = new Set<string>();
  const modules = features
    .filter((f) => f.is_active && FEATURE_ROUTES[f.slug])
    .filter((f) => {
      const route = FEATURE_ROUTES[f.slug];
      if (seen.has(route)) return false;
      seen.add(route);
      return true;
    })
    .map((f) => ({
      href:      FEATURE_ROUTES[f.slug],
      label:     getFeatureLabel(f.slug, lang).nav,
      pageTitle: getFeatureLabel(f.slug, lang).pageTitle,
      Icon:      FEATURE_ICONS[f.slug] ?? Layers,
    }));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">
        {common.noData}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {modules.map((mod) => (
        <ModuleCard
          key={mod.href}
          href={mod.href}
          label={mod.label}
          pageTitle={mod.pageTitle}
          Icon={mod.Icon}
          primaryColor={theme.primary}
          accentColor={theme.accent}
        />
      ))}
    </div>
  );
}