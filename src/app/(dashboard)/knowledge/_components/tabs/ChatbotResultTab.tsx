"use client";
// src/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab.tsx
// Tab sessions de test — branché sur AIConversation(mode='test').
// S59 — migration conversationsRepository → agentRepository.
// Réutilise ResultListTab (générique) + ChatbotConversationCard (migré).

import { useState }                  from "react";
import { useLanguage }                from "@/contexts/LanguageContext";
import { agentRepository }            from "@/repositories/agent.repository";
import { ResultListTab }              from "@/app/(dashboard)/results/_components/ResultListTab";
import { ChatbotConversationCard }    from "../results/ChatbotConversationCard";
import { ConversationModal }          from "@/components/shared/ConversationModal";
import type { AIConversation }        from "@/types/api/agent.types";
import type { PaginatedResponse }     from "@/types/api";

// ── Fetcher wrappé ─────────────────────────────────────────────────────────────
// ResultListTab attend Promise<PaginatedResponse<T>> avec T extends { id: string }.
// listConversations retourne PaginatedResponse<AIConversation> — compatible.
function fetchTestSessions(
  params: { page: number; page_size: number },
): Promise<PaginatedResponse<AIConversation>> {
  return agentRepository.listConversations({
    mode: "test",
    ...params,
  }) as Promise<PaginatedResponse<AIConversation>>;
}

// ── Composant ─────────────────────────────────────────────────────────────────
export function ChatbotResultTab() {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const [selected, setSelected] = useState<AIConversation | null>(null);

  return (
    <>
      <ResultListTab<AIConversation>
        cacheKey="chatbot_whatsapp:test"
        fetcher={fetchTestSessions}
        renderCard={(conv) => (
          <ChatbotConversationCard conv={conv} onClick={setSelected} />
        )}
        emptyMessage={t.emptyDefault}
        emptyHint={t.emptyDefaultHint}
      />

      {selected && (
        <ConversationModal
          conversation={selected as never}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}