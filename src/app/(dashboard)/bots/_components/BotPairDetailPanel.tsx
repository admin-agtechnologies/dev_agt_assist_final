"use client";
// src/app/(dashboard)/bots/_components/BotPairDetailPanel.tsx
// Panel détail bot — 4 tabs fixes + tabs dynamiques depuis FEATURE_TAB_MANIFEST.
// S54 : "Clients" retiré des tabs fixes → géré par feature gestion_crm (toujours visible).

import { useState, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, BarChart3, Settings, Phone } from "lucide-react";
import { Spinner }                 from "@/components/ui";
import { cn }                      from "@/lib/utils";
import { conversationsRepository } from "@/repositories";
import { useLanguage }             from "@/contexts/LanguageContext";
import { useSector }               from "@/hooks/useSector";
import type { Conversation }       from "@/types/api";

import { type BotPair, type DetailTab } from "./bots.types";
import { FEATURE_TAB_MAP }              from "./feature-tab-manifest";
import { ConversationsTab }             from "./tabs/ConversationsTab";
import { StatsTab }                     from "./tabs/StatsTab";
import { BotConfigTab }                 from "./tabs/BotConfigTab";
import { BotFeatureResultTab }          from "./tabs/BotFeatureResultTab";
import { WhatsAppPanel }                from "./whatsapp/WhatsAppPanel";

interface BotPairDetailPanelProps {
  pair:      BotPair;
  d:         ReturnType<typeof useLanguage>["dictionary"];
  colors:    { primary: string; accent: string };
  onRefresh: () => void;
}

interface TabDef {
  id:    DetailTab;
  label: string;
  icon:  React.ElementType;
}

export function BotPairDetailPanel({ pair, d, colors, onRefresh }: BotPairDetailPanelProps) {
  const { locale } = useLanguage();
  const { theme }  = useSector();
  const primary    = theme?.primary ?? colors.primary;

  const [activeTab,     setActiveTab]     = useState<DetailTab>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingData,   setLoadingData]   = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await conversationsRepository.getList({ bot: pair.waBot.id });
      setConversations(
        Array.isArray(res) ? res : (res as { results: Conversation[] }).results ?? [],
      );
    } catch {
      setConversations([]);
    } finally {
      setLoadingData(false);
    }
  }, [pair.waBot.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Tabs dynamiques depuis features_autorisées du bot ──────────────────────
  const featureTabs = useMemo<TabDef[]>(() => {
    const slugs: string[] = pair.waBot.features_autorisees_slugs ?? [];
    const seen = new Set<string>();
    const tabs: TabDef[] = [];
    for (const slug of slugs) {
      const def = FEATURE_TAB_MAP.get(slug);
      if (!def) continue;
      const key = `feature:${slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tabs.push({ id: key as DetailTab, label: def.label[locale], icon: def.icon });
    }
    return tabs;
  }, [pair.waBot.features_autorisees_slugs, locale]);

  // ── Tabs fixes : Conversations · Stats · Config · WhatsApp ─────────────────
  const fixedTabs: TabDef[] = [
    { id: "conversations", label: locale === "fr" ? "Conversations" : "Conversations", icon: MessageSquare },
    { id: "stats",         label: locale === "fr" ? "Stats"         : "Stats",         icon: BarChart3     },
    { id: "configuration", label: locale === "fr" ? "Config"        : "Config",        icon: Settings      },
    { id: "whatsapp",      label: "WhatsApp",                                           icon: Phone         },
  ];

  const allTabs = [...fixedTabs, ...featureTabs];
  const safeTab = allTabs.find((t) => t.id === activeTab) ? activeTab : "conversations";

  return (
    <div className="flex flex-col">

      {/* ── Barre d'onglets scrollable ── */}
      <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto scrollbar-hide border-b border-[var(--border)]">
        {allTabs.map((tab) => {
          const Icon     = tab.icon;
          const isActive = safeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium",
                "whitespace-nowrap transition-all duration-200 flex-shrink-0 border-b-2",
                isActive
                  ? "border-b-2 text-white"
                  : "border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]",
              )}
              style={isActive ? { backgroundColor: primary, borderColor: primary } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenu ── */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
        <div className="p-5">
          {loadingData && (safeTab === "conversations" || safeTab === "stats") ? (
            <div className="flex justify-center py-8">
              <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
            </div>
          ) : (
            <>
              {safeTab === "conversations" && (
                <ConversationsTab conversations={conversations} d={d} colors={colors} />
              )}
              {safeTab === "stats" && (
                <StatsTab conversations={conversations} d={d} />
              )}
              {safeTab === "configuration" && (
                <BotConfigTab pair={pair} onRefresh={onRefresh} />
              )}
              {safeTab === "whatsapp" && (
                <div className="max-w-2xl mx-auto">
                  <WhatsAppPanel
                    botId={pair.waBot.id}
                    isBotPublished={pair.waBot.statut === "actif"}
                  />
                </div>
              )}
              {/* ── Tabs dynamiques feature ── */}
              {safeTab.startsWith("feature:") && (() => {
                const slug = (safeTab as string).replace("feature:", "");
                const def  = FEATURE_TAB_MAP.get(slug);
                if (!def) return null;
                return <BotFeatureResultTab def={def} botId={pair.waBot.id} />;
              })()}
            </>
          )}
        </div>
      </div>

    </div>
  );
}