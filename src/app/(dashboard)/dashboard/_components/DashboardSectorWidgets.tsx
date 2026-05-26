"use client";
// src/app/(dashboard)/dashboard/_components/DashboardSectorWidgets.tsx
// Widgets sectoriels data-driven — affichés selon features_actives de l'entreprise.
// Pattern open/closed : SECTOR_WIDGETS dict extensible, aucun switch dans le composant.
// S56 — création initiale.

import Link from "next/link";
import {
  UtensilsCrossed, Bed, CalendarDays, ShoppingCart,
  Users, HelpCircle, ArrowLeftRight, ArrowRight,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import type { EntrepriseStats } from "@/types/api/stats.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WidgetDef {
  /** Feature slug requis pour afficher ce widget */
  featureSlug: string;
  icon:        React.ElementType;
  labelFr:     string;
  labelEn:     string;
  /** Valeur extraite des stats */
  getValue:    (stats: EntrepriseStats) => string | number;
  hintFr:      string;
  hintEn:      string;
  href:        string;
}

// ── Registre widgets (open/closed) ────────────────────────────────────────────
// Ajouter un widget = ajouter 1 entrée ici. Zéro autre fichier.

const WIDGET_DEFS: WidgetDef[] = [
  {
    featureSlug: "reservation_table",
    icon:        UtensilsCrossed,
    labelFr:     "Réservations tables",
    labelEn:     "Table reservations",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "conversations cette semaine",
    hintEn:      "conversations this week",
    href:        "/results",
  },
  {
    featureSlug: "reservation_chambre",
    icon:        Bed,
    labelFr:     "Réservations chambres",
    labelEn:     "Room reservations",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "conversations cette semaine",
    hintEn:      "conversations this week",
    href:        "/results",
  },
  {
    featureSlug: "prise_rdv",
    icon:        CalendarDays,
    labelFr:     "Rendez-vous",
    labelEn:     "Appointments",
    getValue:    (s) => s.rdv_semaine,
    hintFr:      "RDV cette semaine",
    hintEn:      "appointments this week",
    href:        "/results",
  },
  {
    featureSlug: "commande_paiement",
    icon:        ShoppingCart,
    labelFr:     "Commandes",
    labelEn:     "Orders",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "conversations cette semaine",
    hintEn:      "conversations this week",
    href:        "/results",
  },
  {
    featureSlug: "menu_digital",
    icon:        ShoppingCart,
    labelFr:     "Commandes menu",
    labelEn:     "Menu orders",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "conversations cette semaine",
    hintEn:      "conversations this week",
    href:        "/results",
  },
  {
    featureSlug: "gestion_crm",
    icon:        Users,
    labelFr:     "Nouveaux contacts",
    labelEn:     "New contacts",
    getValue:    (s) => s.nouveaux_contacts_semaine,
    hintFr:      "contacts cette semaine",
    hintEn:      "contacts this week",
    href:        "/contacts",
  },
  {
    featureSlug: "faq",
    icon:        HelpCircle,
    labelFr:     "FAQ consultée",
    labelEn:     "FAQ consulted",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "sessions cette semaine",
    hintEn:      "sessions this week",
    href:        "/statistiques",
  },
  {
    featureSlug: "transfert_humain",
    icon:        ArrowLeftRight,
    labelFr:     "Transferts humain",
    labelEn:     "Human handoffs",
    getValue:    (s) => s.conversations_semaine,
    hintFr:      "conversations cette semaine",
    hintEn:      "conversations this week",
    href:        "/results",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface DashboardSectorWidgetsProps {
  stats:           EntrepriseStats | null;
  featuresActives: string[];
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function DashboardSectorWidgets({
  stats,
  featuresActives,
}: DashboardSectorWidgetsProps) {
  const { theme }   = useSector();
  const { locale }  = useLanguage();

  // Filtrer les widgets dont la feature est active — max 4 pour ne pas surcharger
  const activeSet  = new Set(featuresActives);
  const widgets    = WIDGET_DEFS
    .filter((w) => activeSet.has(w.featureSlug))
    .slice(0, 4);

  if (!widgets.length || !stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((w) => {
        const Icon  = w.icon;
        const label = locale === "fr" ? w.labelFr : w.labelEn;
        const hint  = locale === "fr" ? w.hintFr  : w.hintEn;
        const value = w.getValue(stats);

        return (
          <Link key={w.featureSlug} href={w.href}
            className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
              hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
              transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${theme?.accent ?? "var(--color-accent)"}18`,
                  color:       theme?.accent ?? "var(--color-accent)",
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0
                group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-black text-[var(--text)] mb-0.5">{value}</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight">{hint}</p>
            <p className="text-xs font-semibold text-[var(--text)] mt-2 truncate">{label}</p>
          </Link>
        );
      })}
    </div>
  );
}