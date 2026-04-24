// src/app/pme/dashboard/_components/RecentConversations.tsx
"use client";
import { MessageSquare, Phone, ChevronRight } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { Conversation } from "@/types/api";

interface Props {
  conversations: Conversation[];
  onSelect: (conv: Conversation) => void;
  labels: {
    title: string;
    empty: string;
    channelWhatsapp: string;
    channelVoice: string;
  };
}

export function RecentConversations({ conversations, onSelect, labels }: Props) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-sm font-bold text-[var(--text)]">{labels.title}</h2>
      </div>
      {conversations.length === 0 ? (
        <EmptyState message={labels.empty} icon={MessageSquare} />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[var(--bg)] transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] flex-shrink-0">
                {conv.bot_type === "whatsapp"
                  ? <MessageSquare className="w-4 h-4" />
                  : <Phone className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {conv.client_nom || conv.client_telephone}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">{conv.dernier_message}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <Badge variant={conv.bot_type === "whatsapp" ? "green" : "violet"}>
                  {conv.bot_type === "whatsapp" ? labels.channelWhatsapp : labels.channelVoice}
                </Badge>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {formatDateTime(conv.dernier_message_at)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}