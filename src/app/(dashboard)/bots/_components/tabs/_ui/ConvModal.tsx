"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/ConvModal.tsx
// Modal inline de détail conversation (AIConversation).
// Extrait de ConversationsTab pour respecter la limite de 200 lignes.
// S59.

import { X, Phone, User, Clock } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AIConversation, AIMessage } from "@/types/api/agent.types";

interface Props {
  conv:    AIConversation;
  onClose: () => void;
  colors:  { primary: string };
}

function getContactNom(conv: AIConversation): string {
  const ctx     = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact = ctx.contact as Record<string, string> | undefined;
  return contact?.nom ?? (conv.contact as { nom?: string } | null)?.nom ?? "Client";
}

export function ConvModal({ conv, onClose, colors }: Props) {
  const { dictionary: d } = useLanguage();
  const t        = d.bots;
  const messages = conv.messages ?? [];
  const ctx      = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact  = ctx.contact as Record<string, string> | undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: colors.primary }}
            >
              {getContactNom(conv).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{getContactNom(conv)}</p>
              <p className="text-[10px] text-[var(--text-muted)] capitalize">
                {conv.canal} · {conv.statut}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Données contexte */}
        {contact && (contact.phone || contact.email) && (
          <div className="px-5 py-3 border-b border-[var(--border)] flex gap-4">
            {contact.phone && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Phone className="w-3 h-3" />{contact.phone}
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <User className="w-3 h-3" />{contact.email}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-6">
              {t.testSessionsEmpty}
            </p>
          ) : (
            messages
              .filter((m: AIMessage) => m.role === "user" || m.role === "assistant")
              .map((m: AIMessage) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed",
                      m.role === "user"
                        ? "text-white rounded-tr-sm"
                        : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm",
                    )}
                    style={m.role === "user" ? { backgroundColor: colors.primary } : {}}
                  >
                    {m.contenu}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            {formatDateTime(conv.updated_at)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {messages.filter((m: AIMessage) => m.role === "user" || m.role === "assistant").length} messages
          </span>
        </div>
      </div>
    </div>
  );
}