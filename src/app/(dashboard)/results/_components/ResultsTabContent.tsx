"use client";
// src/app/(dashboard)/results/_components/ResultsTabContent.tsx
// Lookup dans TAB_CONFIG → rend ResultListTab ou ChatbotResultTab.
// Zéro logique de routing inline dans la page.

import { useMemo }           from "react";
import { useLanguage }       from "@/contexts/LanguageContext";
import { ResultListTab }     from "./ResultListTab";
 import { ChatbotResultTab }  from "@/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab";
import { TAB_CONFIG, type TabId } from "../_config/results-tab-config";
import { ConversationsResultTab } from "./ConversationsResultTab";

interface Props {
  tabId:  TabId;
  botId:  string | null;
}

export function ResultsTabContent({ tabId, botId }: Props) {
  const { locale } = useLanguage();
  const def = TAB_CONFIG[tabId];

  // Fetcher memoïsé — injecte bot_id uniquement si sélectionné
  const fetcher = useMemo(() => {
    if (!def?.fetcher) return undefined;
    return (params: { page: number; page_size: number }) =>
      def.fetcher!({ ...params, ...(botId ? { bot_id: botId } : {}) });
  }, [def, botId]);

  // Cas spécial : chatbot WhatsApp
  if (def?.special === "chatbot") {
    return <ChatbotResultTab />;
  }
  if (def?.special === "conversations") {
    return <ConversationsResultTab botId={botId} />;
  }

  // Cas standard : ResultListTab avec la card et le fetcher du registre
  if (!def?.fetcher || !def?.ResultCard) return null;

  const Card = def.ResultCard!;
  return (
    <ResultListTab
      key={`${tabId}-${botId ?? "all"}`}
      cacheKey={`${tabId}:${botId ?? "all"}`}
      fetcher={fetcher!}
      renderCard={(item) => <Card item={item} />}
      emptyMessage={def.emptyMessage?.[locale] ?? ""}
      emptyHint={def.emptyHint?.[locale] ?? ""}
    />
  );
}