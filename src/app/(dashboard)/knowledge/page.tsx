// src/app/(dashboard)/knowledge/page.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Building2, MapPin, HelpCircle, UtensilsCrossed,
  BedDouble, Package, GraduationCap, Stethoscope, Landmark,
  type LucideIcon,
} from "lucide-react";
import { PageHeader }        from "@/components/ui/PageHeader";
import { useLanguage }       from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { KnowledgeTabs, type KnowledgeTab } from "./_components/KnowledgeTabs";
import { EntrepriseTab } from "./_components/tabs/EntrepriseTab";
import { AgencesTab }    from "./_components/tabs/AgencesTab";
import { FaqTab }        from "./_components/tabs/FaqTab";
import { MenuTab }       from "./_components/tabs/MenuTab";
import { ChambresTab }   from "./_components/tabs/ChambresTab";
import { CatalogueTab }  from "./_components/tabs/CatalogueTab";
import { InscriptionsTab }   from "./_components/tabs/InscriptionsTab";  // ++ P5
import { MedicalTab }        from "./_components/tabs/MedicalTab";        // ++ P5
import { CitoyensTab }       from "./_components/tabs/CitoyensTab";       // ++ P5
 

type TabId =
  | "entreprise" | "agences" | "faq"
  | "menu" | "chambres" | "catalogue"
  | "inscriptions" | "medical" | "citoyens";

interface TabDef {
  id: TabId;
  icon: LucideIcon;
  always?: boolean;
  feature?: string;
  features?: string[];
}

const ALL_TABS: TabDef[] = [
  { id: "entreprise",   icon: Building2,      always: true },
  { id: "agences",      icon: MapPin,          always: true },
  { id: "faq",          icon: HelpCircle,      feature: "faq" },
  { id: "menu",         icon: UtensilsCrossed, feature: "menu_digital" },
  { id: "chambres",     icon: BedDouble,       feature: "reservation_chambre" },
  {
    id: "catalogue", icon: Package,
    features: ["catalogue_produits","catalogue_services","catalogue_trajets","catalogue_produits_financiers"],
  },
  { id: "inscriptions", icon: GraduationCap,  feature: "inscription_admission" },
  { id: "medical",      icon: Stethoscope,    feature: "orientation_patient" },
  { id: "citoyens",     icon: Landmark,       feature: "orientation_citoyens" },
];

const TAB_LABELS: Record<TabId, { fr: string; en: string }> = {
  entreprise:   { fr: "Entreprise",         en: "Company" },
  agences:      { fr: "Agences & Horaires", en: "Agencies & Hours" },
  faq:          { fr: "FAQ",                en: "FAQ" },
  menu:         { fr: "Menu",               en: "Menu" },
  chambres:     { fr: "Chambres",           en: "Rooms" },
  catalogue:    { fr: "Catalogue",          en: "Catalogue" },
  inscriptions: { fr: "Inscriptions",       en: "Admissions" },
  medical:      { fr: "Services médicaux",  en: "Medical services" },
  citoyens:     { fr: "Services publics",   en: "Public services" },
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
      if (tab.always)   return true;
      if (tab.feature)  return isFeatureActive(tab.feature);
      if (tab.features) return tab.features.some((f) => isFeatureActive(f));
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
        {safeTab === "entreprise" && <EntrepriseTab />}
        {safeTab === "agences"    && <AgencesTab />}
        {safeTab === "faq"        && <FaqTab />}
        {safeTab === "menu"       && <MenuTab />}
        {safeTab === "chambres"   && <ChambresTab />}
        {safeTab === "catalogue"  && <CatalogueTab />}
        {/* P5 — Inscriptions / Medical / Citoyens */}
        {safeTab === "inscriptions" && <InscriptionsTab />}
        {safeTab === "medical"      && <MedicalTab />}
        {safeTab === "citoyens"     && <CitoyensTab />}
      </div>
    </div>
  );
}