"use client";
// src/app/(dashboard)/bots/[id]/test/_components/WhatsAppSimulator.tsx
// Simulateur WhatsApp — agent IA /api/v1/agent/conversations/message/

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot as BotIcon, Send, User, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { agentRepository } from "@/repositories/agent.repository";
import type { AIConversation, AIMessage } from "@/types/api/agent.types";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
  isTyping?: boolean;
}

interface Props {
  botNom: string;
  onConversationUpdate: (conv: AIConversation) => void;
}

const SUGGESTIONS = ["Je veux un RDV", "Vos services ?", "Vos horaires ?", "Parler à quelqu'un"];

export function WhatsAppSimulator({ botNom: _botNom, onConversationUpdate }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  const shownIdsRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const injectAIMessages = useCallback((aiMessages: AIMessage[]) => {
    const toAdd: DisplayMessage[] = [];
    for (const m of aiMessages) {
      if (shownIdsRef.current.has(m.id)) continue;
      shownIdsRef.current.add(m.id);
      if (m.role === "user") continue;
      toAdd.push({ id: m.id, role: m.role, content: m.contenu });
    }
    setMessages(prev => [...prev.filter(m => m.id !== "typing"), ...toAdd]);
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;

    setInput("");
    setIsSending(true);

    const userMsgId = crypto.randomUUID();
    shownIdsRef.current.add(userMsgId);
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", content },
      { id: "typing", role: "assistant", content: "", isTyping: true },
    ]);

    try {
      const res = await agentRepository.sendMessage({
        conversation_id: conversationIdRef.current ?? undefined,
        message: content,
        canal: "whatsapp",
        mode: "test",
      });
      conversationIdRef.current = res.conversation_id;

      // GET complet pour récupérer les messages status (feedbacks d'action)
      const conv = await agentRepository.getConversation(res.conversation_id);
      onConversationUpdate(conv);
      injectAIMessages(conv.messages);

      // Alerte transfert humain
      if (conv.statut === "transferee") {
        const transferId = `transfer-${Date.now()}`;
        shownIdsRef.current.add(transferId);
        setMessages(prev => [
          ...prev,
          {
            id: transferId,
            role: "status",
            content: "🔄 Conversation transférée à un agent humain.",
          },
        ]);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      toast.error(t.testSendError);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, onConversationUpdate, injectAIMessages, t.testSendError, toast]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[580px]">

        {/* Placeholder vide */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#25D366]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">
              {t.testSubtitle}
            </p>
          </div>
        )}

        {/* Bulles */}
        {messages.map(msg => {
          // Messages status → ligne centrée en italique
          if (msg.role === "status") {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-[var(--text-muted)] italic bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isUser ? "bg-[#6C3CE1]/10" : "bg-[#25D366]/10",
              )}>
                {isUser
                  ? <User className="w-4 h-4 text-[#6C3CE1]" />
                  : <BotIcon className="w-4 h-4 text-[#25D366]" />}
              </div>

              {/* Bulle */}
              <div className={cn(
                "flex flex-col max-w-[75%]",
                isUser ? "items-end" : "items-start",
              )}>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isUser
                    ? "bg-[#6C3CE1] text-white rounded-tr-sm"
                    : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm",
                )}>
                  {msg.isTyping ? (
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (visible uniquement avant le 1er message) */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              disabled={isSending}
              className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t.testWhatsappPlaceholder}
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 disabled:opacity-50 min-h-[42px] max-h-[120px]"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {isSending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}