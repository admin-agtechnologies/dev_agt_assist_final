"use client";
// src/app/(dashboard)/results/_components/ConversationsResultTab.tsx
// Tab Conversations live dans /results — branché sur AIConversation(mode='live').
// Toujours visible — pas de dépendance à une feature active.
// Filtre par bot_id si sélectionné dans le dropdown, sinon toutes convs du tenant.
// S59.

import { useState, useMemo }       from "react";
import { useLanguage }             from "@/contexts/LanguageContext";
import { agentRepository }         from "@/repositories/agent.repository";
import { ResultListTab }           from "./ResultListTab";
import { ChatbotConversationCard } from "@/app/(dashboard)/knowledge/_components/results/ChatbotConversationCard";
import { ConversationModal }       from "@/components/shared/ConversationModal";
import type { AIConversation }     from "@/types/api/agent.types";
import type { PaginatedResponse }  from "@/types/api";

interface Props {
  botId: string | null;
}

export function ConversationsResultTab({ botId }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const [selected, setSelected] = useState<AIConversation | null>(null);

  const fetcher = useMemo(
    () =>
      (params: { page: number; page_size: number }): Promise<PaginatedResponse<AIConversation>> =>
        agentRepository.listConversations({
          mode: "live",
          ...(botId ? { bot_id: botId } : {}),
          ...params,
        }) as Promise<PaginatedResponse<AIConversation>>,
    [botId],
  );

  return (
    <>
      <ResultListTab<AIConversation>
        key={`conversations:${botId ?? "all"}`}
        cacheKey={`conversations:${botId ?? "all"}`}
        fetcher={fetcher}
        renderCard={(conv) => (
          <ChatbotConversationCard conv={conv} onClick={setSelected} />
        )}
        emptyMessage={t.emptyDefault}
        emptyHint={t.emptyDefaultHint}
      />

      {selected && (
       <ConversationModal
          conversation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}