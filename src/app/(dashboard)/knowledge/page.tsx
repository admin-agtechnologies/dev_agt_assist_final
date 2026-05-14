// src/app/(dashboard)/knowledge/page.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { PageHeader }        from "@/components/ui/PageHeader";
import { useLanguage }       from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { KnowledgeTabs, type KnowledgeTab } from "./_components/KnowledgeTabs";
import { EntrepriseTab } from "./_components/tabs/EntrepriseTab";
import { AgencesTab }    from "./_components/tabs/AgencesTab";
import { FaqTab }        from "./_components/tabs/FaqTab";

const ALL_TABS = [
  { id: "entreprise",   always: true },
  { id: "agences",      always: true },
  { id: "faq",          feature: "faq" },
  { id: "menu",         feature: "menu_digital" },
  { id: "chambres",     feature: "reservation_chambre" },
  { id: "catalogue",    features: ["catalogue_produits","catalogue_services","catalogue_trajets","catalogue_produits_financiers"] },
  { id: "inscriptions", feature: "inscription_admission" },
  { id: "medical",      feature: "orientation_patient" },
  { id: "citoyens",     feature: "orientation_citoyens" },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

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
      if ("always" in tab && tab.always) return true;
      if ("feature" in tab) return isFeatureActive(tab.feature);
      if ("features" in tab) return tab.features.some((f) => isFeatureActive(f));
      return false;
    }).map(({ id }) => ({ id, label: TAB_LABELS[id][locale] }));
  }, [isFeatureActive, locale]);

 const safeTab = (visibleTabs.find((t) => t.id === activeTab)
    ? activeTab
    : (visibleTabs[0]?.id ?? "entreprise")) as TabId;

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
        {/* Autres tabs — session suivante après audit backend catalogue */}
      </div>
    </div>
  );
}