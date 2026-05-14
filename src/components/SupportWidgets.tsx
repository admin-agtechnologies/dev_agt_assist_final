// src/components/SupportWidgets.tsx
// Widget support AGT Platform :
//   1. Chatbot plateforme (DeepSeek) — ouverture via CustomEvent "agt:open-chat"
//   2. Bouton AGT-BOT WhatsApp (lien vers le bot WhatsApp AGT)
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

// ── Rendu d'un message avec liens navigables ──────────────────────────────────
// Format attendu depuis le backend : [[/path|Label]]
function MessageBubble({ text, isBot, primary }: { text: string; isBot: boolean; primary: string }) {
  if (!isBot) {
    return <span>{text}</span>;
  }

  // Découpe le texte sur le pattern [[/path|Label]]
  const parts = text.split(/(\[\[\/[^\]|]+\|[^\]]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[(\/.+?)\|(.+?)\]\]$/);
        if (match) {
          return (
            <Link
              key={i}
              href={match[1]}
              className="underline font-semibold hover:opacity-80 transition-opacity"
              style={{ color: primary }}
            >
              {match[2]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Widget Chatbot plateforme ─────────────────────────────────────────────────
function ChatbotWidget() {
  const { dictionary: d, locale } = useLanguage();
  const { theme } = useSector();
  const t = d.support;

  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "bot", text: t.chatWelcome },
  ]);
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // Ouvrir via CustomEvent global
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("agt:open-chat", handler);
    return () => window.removeEventListener("agt:open-chat", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const newHistory: HistoryEntry[] = [...history, { role: "user", content: text }];

    try {
      const data = await api.post<{ reply: string }>("/api/v1/platform/chat/", { message: text, history: newHistory.slice(-10), locale });

      const reply = data.reply || (locale === "fr" ? "Une erreur s'est produite. Réessayez." : "An error occurred. Please try again.");
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", text: reply };
      setMessages(prev => [...prev, botMsg]);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: locale === "fr" ? "Une erreur s'est produite. Réessayez." : "An error occurred. Please try again.",
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Panel chat */}
      {open && (
        <div className="w-80 rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{t.chatTitle ?? "Support AGT"}</p>
               <p className="text-[10px] opacity-80">{locale === "fr" ? "En ligne" : "Online"}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn("max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed", msg.role === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-[var(--bg)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]"
                  )}
                  style={msg.role === "user" ? { backgroundColor: theme.primary } : {}}
                >
                  <MessageBubble text={msg.text} isBot={msg.role === "bot"} primary={theme.primary} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: theme.primary, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--border)] flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.chatPlaceholder ?? "Votre question…"}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:brightness-90"
              style={{ backgroundColor: theme.primary }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: theme.primary }}
        aria-label={t.chatTitle ?? "Support AGT"}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}

// ── Widget AGT-BOT WhatsApp ───────────────────────────────────────────────────
function AgtBotWidget() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.support;
  const whatsappUrl = "https://wa.me/237600000000?text=Bonjour%20AGT%20Technologies%20!";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#128C7E] transition-all hover:scale-105 active:scale-95"
      title={t.agtBotTitle}
      aria-label={t.agtBotTitle}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

// ── Composant global ──────────────────────────────────────────────────────────
export function SupportWidgets() {
  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-center gap-3">
      <ChatbotWidget />
      <AgtBotWidget />
    </div>
  );
}