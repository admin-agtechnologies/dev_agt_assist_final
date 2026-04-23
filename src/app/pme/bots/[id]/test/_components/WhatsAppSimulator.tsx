// src/app/pme/bots/[id]/test/_components/WhatsAppSimulator.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Send, MessageSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Bot as BotType, Tenant, RendezVous, Service } from "@/types/api";
import {
  getMockResponse, DAYS_FR, MONTHS_FR,
  type ChatMessage, type ClientReport, type SectorTheme,
} from "./test.types";

interface WhatsAppSimulatorProps {
  bot: BotType;
  tenant: Tenant | null;
  theme: SectorTheme;
  d: ReturnType<typeof useLanguage>["dictionary"];
  appointments: RendezVous[];
  services: Service[];
  clientReport: ClientReport;
  onMockAppointment: (apt: { date: Date; serviceId: string }) => void;
  onReportUpdate: (patch: Partial<ClientReport>) => void;
  onHumanTransfer: (reason: string) => void;
}

export function WhatsAppSimulator({
  bot, tenant, theme, d,
  appointments, services, clientReport,
  onMockAppointment, onReportUpdate, onHumanTransfer,
}: WhatsAppSimulatorProps) {
  const t = d.bots;
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "init", role: "bot", content: bot.message_accueil,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput]       = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingApt, setPendingApt] = useState<{ date: Date; serviceId: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: `c-${Date.now()}`, role: "client", content, time: now }]);
    setInput("");
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 600));

    if (pendingApt && /oui|confirme|ok|parfait|d'accord|yes/i.test(content)) {
      const svc       = services.find(s => s.id === pendingApt.serviceId);
      const dateLabel = `${DAYS_FR[pendingApt.date.getDay() === 0 ? 6 : pendingApt.date.getDay() - 1]} ${pendingApt.date.getDate()} ${MONTHS_FR[pendingApt.date.getMonth()]} à ${String(pendingApt.date.getHours()).padStart(2,"0")}h${String(pendingApt.date.getMinutes()).padStart(2,"0")}`;
      const confirmMsg = `✅ RDV confirmé ! Le **${dateLabel}**${svc ? ` pour "${svc.nom}"` : ""}. Vous recevrez un rappel. Y a-t-il autre chose ?`;
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`, role: "bot", content: confirmMsg,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }]);
      onMockAppointment(pendingApt);
      setPendingApt(null);
      setIsTyping(false);
      return;
    }

    try {
      const history = messages.filter(m => m.id !== "init").map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chatbot/test/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
        },
        body: JSON.stringify({ bot_id: bot.id, message: content, history }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      if (data.intention)    onReportUpdate({ intention: data.intention, status: "active" });
      if (data.human_handoff) onHumanTransfer("Le bot a détecté une demande de transfert humain.");
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`, role: "bot", content: data.reply,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      const response = getMockResponse(content, appointments, services, 30, clientReport);
      if (response.reportPatch)    onReportUpdate(response.reportPatch);
      if (response.triggerTransfer) onHumanTransfer(response.triggerTransfer);
      if (response.mockApt)         setPendingApt(response.mockApt);
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`, role: "bot", content: response.text,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        mockApt: response.mockApt,
      }]);
    }
    setIsTyping(false);
  };

  const formatContent = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>,
    );

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center gap-3", theme.header)}>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{bot.nom}</p>
          <p className="text-[10px] text-white/70 flex items-center gap-1">
            <MessageSquare className="w-2.5 h-2.5" />
            {tenant?.name ?? "Assistant"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span className="text-[10px] text-white/80 font-semibold">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-3 space-y-2"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.primary}08 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}>
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm leading-relaxed",
                msg.role === "bot"
                  ? "bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-sm"
                  : "text-white rounded-tr-sm",
              )}
              style={msg.role === "client" ? { backgroundColor: theme.primary } : {}}
            >
              <p className="whitespace-pre-line" style={{ color: msg.role === "bot" ? "var(--text)" : "white" }}>
                {formatContent(msg.content)}
              </p>
              {msg.mockApt && (
                <div className="mt-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Créneau affiché dans l&apos;agenda →
                </div>
              )}
              <p className={cn("text-[10px] mt-0.5 text-right",
                msg.role === "bot" ? "text-[var(--text-muted)]" : "text-white/70")}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: theme.primary, animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested replies */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
        {["Je veux un RDV", "Vos services ?", "Vos horaires ?", "Parler à quelqu'un"].map(s => (
          <button key={s} onClick={() => sendMessage(s)} disabled={isTyping}
            className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] flex gap-2 items-end bg-[var(--bg)]">
        <input className="flex-1 input-base py-2 text-sm"
          placeholder={t.testWhatsappPlaceholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={isTyping} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
          style={{ backgroundColor: theme.primary }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}