// src/app/(dashboard)/conversations/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { useConversation } from "@/hooks/useConversation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MessageBubble } from "@/components/conversations/MessageBubble";
import { StatusMessage } from "@/components/conversations/StatusMessage";
import { ConversationStatus } from "@/components/conversations/ConversationStatus";
import { conversations as convFr } from "@/dictionaries/fr/conversations.fr";
import { conversations as convEn } from "@/dictionaries/en/conversations.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import type { ChatMessage } from "@/types/api";
import { conversationsRepository } from "@/repositories/conversations.repository";
import { useState, useEffect } from "react";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { theme } = useSector();

  const d = lang === "fr" ? convFr : convEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const conversationId = typeof params.id === "string" ? params.id : null;
  const { conversation, isLoading, error } = useConversation(conversationId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Charger les messages une fois la conversation disponible
  useEffect(() => {
    if (!conversationId) return;
    conversationsRepository
      .getMessages(conversationId)
      .then((data) => setMessages(data as ChatMessage[]))
      .catch(() => setMessages([]));
  }, [conversationId, conversation?.dernier_message_at]);

  if (isLoading && !conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <StatusMessage content={c.loading} isAnimated />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <StatusMessage content={error ?? d.detail.noMessages} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={`${d.detail.title} — ${conversation.client_nom}`}
        backLabel={c.back}
        onBack={() => router.push("/conversations")}
        badge={
          <ConversationStatus
            statut={conversation.statut}
            labels={d.statuses}
            size="sm"
          />
        }
      />

      {/* Métadonnées */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400">{d.table.bot}</p>
          <p className="font-medium text-gray-900">{conversation.bot_nom}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{d.table.messages}</p>
          <p className="font-medium text-gray-900">{conversation.nb_messages}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{d.table.date}</p>
          <p className="font-medium text-gray-900">
            {new Date(conversation.created_at).toLocaleDateString(
              lang === "fr" ? "fr-FR" : "en-US",
            )}
          </p>
        </div>
      </div>

      {/* Transfert humain */}
      {conversation.human_handoff && (
        <StatusMessage content={d.detail.humanHandoff} />
      )}

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: theme.primary }}
        >
          {d.detail.messages}
        </p>

        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <StatusMessage content={d.detail.noMessages} />
          ) : (
            messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                content={msg.content}
              />
            ))
          )}

          {/* Indicateur polling si conversation en cours */}
          {conversation.statut === "en_cours" && (
            <StatusMessage
              content={d.statuses.en_cours}
              isAnimated
            />
          )}
        </div>
      </div>

      {/* Rapport */}
      {conversation.rapport && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: theme.primary }}
          >
            {d.detail.rapport}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {conversation.rapport.resume}
          </p>
        </div>
      )}
    </div>
  );
}