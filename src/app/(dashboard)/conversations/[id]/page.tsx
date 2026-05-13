// src/app/(dashboard)/conversations/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { useConversation } from "@/hooks/useConversation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MessageBubble } from "@/components/conversations/MessageBubble";
import { StatusMessage } from "@/components/conversations/StatusMessage";
import { ConversationStatus } from "@/components/conversations/ConversationStatus";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { dictionary: d, locale } = useLanguage();
  const { theme } = useSector();

  const conversationId = typeof params.id === "string" ? params.id : null;
  const { conversation, isLoading, error } = useConversation(conversationId);

  const c = d.common;
  const cv = d.conversations;

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
        <StatusMessage content={error ?? cv.detail.noMessages} />
      </div>
    );
  }

  const contactNom = conversation.contact?.nom ?? "—";
  const messagesCount = conversation.messages.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={`${cv.detail.title} — ${contactNom}`}
        backLabel={c.back}
        onBack={() => router.push("/conversations")}
        badge={
          <ConversationStatus
            statut={conversation.statut}
            labels={cv.statuses}
            size="sm"
          />
        }
      />

      {/* Métadonnées */}
      <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-[var(--text-muted)]">{cv.table.canal}</p>
          <p className="font-medium text-[var(--text)]">{conversation.canal}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">{cv.table.messages}</p>
          <p className="font-medium text-[var(--text)]">{messagesCount}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">{cv.table.contact}</p>
          <p className="font-medium text-[var(--text)]">
            {conversation.contact?.phone ?? "—"}
          </p>
        </div>
      </div>

      {/* Transfert humain */}
      {conversation.statut === "transferee" && (
        <StatusMessage content={cv.detail.humanHandoff} />
      )}

      {/* Messages */}
      <div className="card p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: theme.primary }}
        >
          {cv.detail.messages}
        </p>

        <div className="flex flex-col gap-3">
          {conversation.messages.length === 0 ? (
            <StatusMessage content={cv.detail.noMessages} />
          ) : (
            conversation.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.contenu}
              />
            ))
          )}

          {conversation.statut === "active" && (
            <StatusMessage
              content={cv.statuses.active}
              isAnimated
            />
          )}
        </div>
      </div>

      {/* Actions déclenchées */}
      {(conversation.actions_declenchees ?? []).length > 0 && (
        <div className="card p-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: theme.primary }}
          >
            {cv.detail.actions}
          </p>
          <div className="flex flex-col gap-2">
            {(conversation.actions_declenchees ?? []).map((action, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text)]">{action.action_slug}</span>
                <span className={`badge ${
                  action.statut === "succes"
                    ? "bg-green-100 text-green-700"
                    : action.statut === "echec"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {action.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}