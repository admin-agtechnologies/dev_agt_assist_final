// src/app/(dashboard)/knowledge/page.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Building2, MapPin, HelpCircle, UtensilsCrossed,
  BedDouble, Package, GraduationCap, Stethoscope, Landmark,
  CalendarClock, LayoutGrid, Target, Ticket,
  Megaphone, Calculator, FolderOpen, FileText,
  Briefcase, Bus, CreditCard, Bell,
  type LucideIcon,
} from "lucide-react";
import { PageHeader }          from "@/components/ui/PageHeader";
import { useLanguage }         from "@/contexts/LanguageContext";
import { useActiveFeatures }   from "@/hooks/useFeatures";
import { KnowledgeTabs, type KnowledgeTab } from "./_components/KnowledgeTabs";

// ── Tabs existants ────────────────────────────────────────────────────────────
import { EntrepriseTab }       from "./_components/tabs/EntrepriseTab";
import { AgencesTab }          from "./_components/tabs/AgencesTab";
import { FaqTab }              from "./_components/tabs/FaqTab";
import { MenuTab }             from "./_components/tabs/MenuTab";
import { ChambresTab }         from "./_components/tabs/ChambresTab";
import { InscriptionsTab }     from "./_components/tabs/InscriptionsTab";
import { MedicalTab }          from "./_components/tabs/MedicalTab";
import { CitoyensTab }         from "./_components/tabs/CitoyensTab";

// ── Catalogue — 4 tabs séparés ────────────────────────────────────────────────
import { CatalogueProduitTab }  from "./_components/catalogue/CatalogueProduitTab";
import { CatalogueServiceTab }  from "./_components/catalogue/CatalogueServiceTab";
import { CatalogueTrajetTab }   from "./_components/catalogue/CatalogueTrajetTab";
import { ProduitFinancierTab }  from "./_components/catalogue/ProduitFinancierTab";

// ── B5 S35 — tabs avec modèle ─────────────────────────────────────────────────
import { RessourceKbTab }      from "./_components/tabs/RessourceKbTab";
import { CaptureProspectTab }  from "./_components/tabs/CaptureProspectTab";

// ── B5 S35 — nouveaux tabs (remplacent ComingSoonKbTab) ───────────────────────
import { ConciergerieKbTab }       from "./_components/tabs/ConciergerieKbTab";
import { CommunicationKbTab }      from "./_components/tabs/CommunicationKbTab";
import { SimulationCreditKbTab }   from "./_components/tabs/SimulationCreditKbTab";
import { SuiviDossierKbTab }       from "./_components/tabs/SuiviDossierKbTab";
import { CollecteDocumentsKbTab }  from "./_components/tabs/CollecteDocumentsKbTab";

type TabId =
  | "entreprise" | "agences" | "faq"
  | "menu" | "chambres"
  | "catalogue_produits" | "catalogue_services" | "catalogue_trajets" | "catalogue_produits_financiers"
  | "inscriptions" | "medical" | "citoyens"
  | "disponibilites" | "tables" | "billets" | "capture_prospect"
  | "conciergerie" | "communication"
  | "simulation_credit" | "suivi_dossier" | "collecte_documents";

interface TabDef {
  id:       TabId;
  icon:     LucideIcon;
  always?:  boolean;
  feature?: string;
}

const ALL_TABS: TabDef[] = [
  // ── Toujours visibles ─────────────────────────────────────────────────────
  { id: "entreprise",                    icon: Building2,       always: true },
  { id: "agences",                       icon: MapPin,          always: true },
  // ── Existants ─────────────────────────────────────────────────────────────
  { id: "faq",                           icon: HelpCircle,      feature: "faq" },
  { id: "menu",                          icon: UtensilsCrossed, feature: "menu_digital" },
  { id: "chambres",                      icon: BedDouble,       feature: "reservation_chambre" },
  // ── Catalogue — 4 tabs indépendants ───────────────────────────────────────
  { id: "catalogue_produits",            icon: Package,         feature: "catalogue_produits" },
  { id: "catalogue_services",            icon: Briefcase,       feature: "catalogue_services" },
  { id: "catalogue_trajets",             icon: Bus,             feature: "catalogue_trajets" },
  { id: "catalogue_produits_financiers", icon: CreditCard,      feature: "catalogue_produits_financiers" },
  // ── Sectoriels ────────────────────────────────────────────────────────────
  { id: "inscriptions",                  icon: GraduationCap,   feature: "inscription_admission" },
  { id: "medical",                       icon: Stethoscope,     feature: "orientation_patient" },
  { id: "citoyens",                      icon: Landmark,        feature: "orientation_citoyens" },
  // ── B5 S35 — tabs avec modèle ─────────────────────────────────────────────
  { id: "disponibilites",                icon: CalendarClock,   feature: "prise_rdv" },
  { id: "tables",                        icon: LayoutGrid,      feature: "reservation_table" },
  { id: "billets",                       icon: Ticket,          feature: "reservation_billet" },
  { id: "capture_prospect",              icon: Target,          feature: "capture_prospect" },
  // ── B5 S35 — tabs informatifs ─────────────────────────────────────────────
  { id: "conciergerie",                  icon: Bell,            feature: "conciergerie" },
  { id: "communication",                 icon: Megaphone,       feature: "communication" },
  { id: "simulation_credit",             icon: Calculator,      feature: "simulation_credit" },
  { id: "suivi_dossier",                 icon: FolderOpen,      feature: "suivi_dossier" },
  { id: "collecte_documents",            icon: FileText,        feature: "collecte_documents" },
];

const TAB_LABELS: Record<TabId, { fr: string; en: string }> = {
  entreprise:                    { fr: "Entreprise",           en: "Company" },
  agences:                       { fr: "Agences & Horaires",   en: "Agencies & Hours" },
  faq:                           { fr: "FAQ",                  en: "FAQ" },
  menu:                          { fr: "Menu",                 en: "Menu" },
  chambres:                      { fr: "Chambres",             en: "Rooms" },
  catalogue_produits:            { fr: "Produits",             en: "Products" },
  catalogue_services:            { fr: "Services",             en: "Services" },
  catalogue_trajets:             { fr: "Trajets",              en: "Routes" },
  catalogue_produits_financiers: { fr: "Produits financiers",  en: "Financial products" },
  inscriptions:                  { fr: "Inscriptions",         en: "Admissions" },
  medical:                       { fr: "Services médicaux",    en: "Medical services" },
  citoyens:                      { fr: "Services publics",     en: "Public services" },
  disponibilites:                { fr: "Disponibilités",       en: "Availability" },
  tables:                        { fr: "Tables",               en: "Tables" },
  billets:                       { fr: "Billets",              en: "Tickets" },
  capture_prospect:              { fr: "Capture prospect",     en: "Lead capture" },
  conciergerie:                  { fr: "Conciergerie",         en: "Concierge" },
  communication:                 { fr: "Communication",        en: "Communication" },
  simulation_credit:             { fr: "Simulation crédit",    en: "Credit simulation" },
  suivi_dossier:                 { fr: "Suivi dossier",        en: "Case tracking" },
  collecte_documents:            { fr: "Collecte documents",   en: "Document collection" },
};

export default function KnowledgePage() {
  const { dictionary: d, locale } = useLanguage();
  const { features }              = useActiveFeatures();
  const [activeTab, setActiveTab] = useState<TabId>("entreprise");

  const isFeatureActive = useCallback(
    (slug: string) => features.some((f) => f.slug === slug && f.is_active),
    [features],
  );

  const visibleTabs = useMemo<KnowledgeTab[]>(() => {
    return ALL_TABS.filter((tab) => {
      if (tab.always)  return true;
      if (tab.feature) return isFeatureActive(tab.feature);
      return false;
    }).map(({ id, icon }) => ({
      id,
      label: TAB_LABELS[id][locale],
      icon,
    }));
  }, [isFeatureActive, locale]);

  const safeTab = (
    visibleTabs.find((t) => t.id === activeTab)
      ? activeTab
      : (visibleTabs[0]?.id ?? "entreprise")
  ) as TabId;

  return (
    <div className="space-y-6">
      <PageHeader
        title={d.common.nav.knowledge}
        subtitle={d.knowledge.pageSubtitle}
      />
      <KnowledgeTabs
        tabs={visibleTabs}
        activeTab={safeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />
      <div>
        {safeTab === "entreprise"                    && <EntrepriseTab />}
        {safeTab === "agences"                       && <AgencesTab />}
        {safeTab === "faq"                           && <FaqTab />}
        {safeTab === "menu"                          && <MenuTab />}
        {safeTab === "chambres"                      && <ChambresTab />}
        {/* Catalogue — 4 tabs indépendants */}
        {safeTab === "catalogue_produits"            && <CatalogueProduitTab />}
        {safeTab === "catalogue_services"            && <CatalogueServiceTab />}
        {safeTab === "catalogue_trajets"             && <CatalogueTrajetTab />}
        {safeTab === "catalogue_produits_financiers" && <ProduitFinancierTab />}
        {/* Sectoriels */}
        {safeTab === "inscriptions"                  && <InscriptionsTab />}
        {safeTab === "medical"                       && <MedicalTab />}
        {safeTab === "citoyens"                      && <CitoyensTab />}
        {/* B5 S35 — tabs avec modèle */}
        {safeTab === "disponibilites"   && <RessourceKbTab featureSlug="prise_rdv"          ressourceType="praticien" />}
        {safeTab === "tables"           && <RessourceKbTab featureSlug="reservation_table"  ressourceType="table" />}
        {safeTab === "billets"          && <RessourceKbTab featureSlug="reservation_billet" ressourceType="trajet" />}
        {safeTab === "capture_prospect" && <CaptureProspectTab />}
        {/* B5 S35 — tabs informatifs (remplacent ComingSoonKbTab) */}
        {safeTab === "conciergerie"       && <ConciergerieKbTab />}
        {safeTab === "communication"      && <CommunicationKbTab />}
        {safeTab === "simulation_credit"  && <SimulationCreditKbTab />}
        {safeTab === "suivi_dossier"      && <SuiviDossierKbTab />}
        {safeTab === "collecte_documents" && <CollecteDocumentsKbTab />}
      </div>
    </div>
  );
}