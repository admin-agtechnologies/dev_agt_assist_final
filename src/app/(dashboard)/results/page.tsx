// src/app/(dashboard)/results/page.tsx
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useLanguage }       from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { botsRepository }    from "@/repositories/bots.repository";
import { PageHeader }        from "@/components/ui/PageHeader";
import { KnowledgeTabs, type KnowledgeTab } from "@/app/(dashboard)/knowledge/_components/KnowledgeTabs";
import type { Bot }          from "@/types/api";

import { TAB_CONFIG, TAB_ORDER, type TabId } from "./_config/results-tab-config";
import { ResultsTabContent }                 from "./_components/ResultsTabContent";
import { BotFilterDropdown }                 from "./_components/BotFilterDropdown";

export default function ResultsPage() {
  const { locale }   = useLanguage();
  const { features } = useActiveFeatures();

  const [activeTab,   setActiveTab]   = useState<TabId>("chatbot_whatsapp");
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [bots,        setBots]        = useState<Bot[]>([]);

  // Charger la liste des bots WhatsApp pour le filtre
  useEffect(() => {
    botsRepository.getList()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { results: Bot[] }).results ?? [];
        setBots(list.filter((b) => b.bot_type === "whatsapp"));
      })
      .catch(() => {});
  }, []);

  const isFeatureActive = useCallback(
    (slug: string) => features.some((f) => f.slug === slug && f.is_active),
    [features],
  );

  // Tabs visibles selon les features actives du tenant
  const visibleTabs = useMemo<KnowledgeTab[]>(() =>
    TAB_ORDER
      .filter((id) => {
        const feature = TAB_CONFIG[id].feature;
        return !feature || isFeatureActive(feature);
      })
      .map((id) => ({
        id,
        label: TAB_CONFIG[id].label[locale],
       icon:  TAB_CONFIG[id].icon as import("lucide-react").LucideIcon,
      })),
    [isFeatureActive, locale],
  );

  const safeTab = (
    visibleTabs.find((t) => t.id === activeTab)
      ? activeTab
      : (visibleTabs[0]?.id ?? "chatbot_whatsapp")
  ) as TabId;

  return (
    <div className="space-y-6">

      {/* ── En-tête + filtre bot ── */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={locale === "fr" ? "Résultats du bot" : "Bot results"}
          subtitle={locale === "fr"
            ? "Tout ce que votre bot a créé pour vous"
            : "Everything your bot has created for you"}
        />
        <div className="pt-1 flex-shrink-0">
          <BotFilterDropdown
            bots={bots}
            selectedBotId={selectedBot}
            onChange={setSelectedBot}
            locale={locale}
          />
        </div>
      </div>

      {/* ── Badge filtre actif ── */}
      {selectedBot && bots.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{locale === "fr" ? "Filtré par bot :" : "Filtered by bot:"}</span>
          <span className="font-medium text-[var(--text)]">
            {bots.find((b) => b.id === selectedBot)?.nom}
          </span>
          <button
            type="button"
            onClick={() => setSelectedBot(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text)] underline"
          >
            {locale === "fr" ? "Effacer" : "Clear"}
          </button>
        </div>
      )}

      {/* ── Navigation tabs ── */}
      <KnowledgeTabs
        tabs={visibleTabs}
        activeTab={safeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      {/* ── Contenu — délégué à ResultsTabContent ── */}
      <ResultsTabContent tabId={safeTab} botId={selectedBot} />

    </div>
  );
}