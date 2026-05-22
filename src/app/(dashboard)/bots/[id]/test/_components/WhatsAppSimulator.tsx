"use client";
// src/app/(dashboard)/bots/[id]/test/_components/WhatsAppSimulator.tsx
// S50 : cartes inline réservation/email + tooltip vocal + suggestions dynamiques secteur

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot as BotIcon, Send, User, MessageSquare, Loader2, Mic, CalendarCheck, Mail, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { agentRepository } from "@/repositories/agent.repository";
import type { AIConversation, AIMessage, AIActionDeclenchee } from "@/types/api/agent.types";
import { ModalVideoDemo, ModalEmail, ModalReservation } from "./ActionModals";

// ── Suggestions par secteur ───────────────────────────────────────────────────

const SECTOR_SUGGESTIONS: Record<string, string[]> = {
  hotel:      ["Réserver une chambre", "Nos tarifs ?", "Disponibilités", "Parler à quelqu'un"],
  restaurant: ["Voir le menu", "Réserver une table", "Vos horaires ?", "Livraison ?"],
  sante:      ["Prendre un RDV", "Nos spécialités", "Urgences ?", "Parler à quelqu'un"],
  banque:     ["Simuler un crédit", "Ouvrir un compte", "Nos produits", "Contacter un conseiller"],
  education:  ["Nos programmes", "Inscription", "Frais de scolarité", "Parler à quelqu'un"],
  ecommerce:  ["Voir le catalogue", "Suivre ma commande", "Retours ?", "Promotions"],
  transport:  ["Voir les trajets", "Réserver un billet", "Horaires", "Bagages ?"],
  pme:        ["Nos services", "Prendre un RDV", "Tarifs ?", "Contact"],
  public:     ["Services disponibles", "Déposer un dossier", "Suivi dossier", "Parler à quelqu'un"],
  _default:   ["Je veux un RDV", "Vos services ?", "Vos horaires ?", "Parler à quelqu'un"],
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
  isTyping?: boolean;
  actionCard?: "reservation" | "email";
  actionData?: AIActionDeclenchee;
}

interface Props {
  botNom: string;
  sectorSlug?: string;
  sectorNom?: string;
  onConversationUpdate: (conv: AIConversation) => void;
}

// ── Carte réservation inline ──────────────────────────────────────────────────

function CardReservation({ action, onClick }: { action: AIActionDeclenchee; onClick: () => void }) {
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 overflow-hidden max-w-[76%] self-start ml-10">
      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-200 dark:border-emerald-700">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-800 dark:text-emerald-200">
            <CalendarCheck className="w-3.5 h-3.5" />
            {r.ressource_nom ? `RDV — ${r.ressource_nom}` : "RDV planifié"}
          </div>
          <div className="text-[9px] text-emerald-700/70 mt-0.5 uppercase tracking-wider">Action exécutée</div>
        </div>
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-500 text-[11px]">✓</span>
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.contact_nom && <p className="text-[11px] text-[var(--text)]">👤 {r.contact_nom}</p>}
        {r.contact_phone && <p className="text-[11px] text-[var(--text)]">📞 {r.contact_phone}</p>}
        {r.heure_debut && <p className="text-[11px] text-[var(--text)]">🕐 {r.heure_debut}</p>}
        {r.agence_nom && <p className="text-[11px] text-[var(--text)]">📍 {r.agence_nom}</p>}
        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          Mode test — aucun RDV réel.
        </div>
      </div>
      <button onClick={onClick} className="w-full text-left px-3 pb-2 flex items-center gap-1 text-[10px] text-emerald-600 hover:underline">
        <Eye className="w-2.5 h-2.5" /> Voir le détail
      </button>
    </div>
  );
}

// ── Carte email inline ────────────────────────────────────────────────────────

function CardEmail({ action, onClick }: { action: AIActionDeclenchee; onClick: () => void }) {
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  return (
    <button onClick={onClick} className="rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 max-w-[76%] self-start ml-10 text-left hover:opacity-90 transition-opacity overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-800 dark:text-blue-200">
          <Mail className="w-3.5 h-3.5" />
          {(r.subject ?? "Email de confirmation").slice(0, 35)}
        </div>
        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">ENVOYÉ</span>
      </div>
      {r.to && (
        <p className="text-[10px] text-blue-700/70 dark:text-blue-300/70 px-3 pb-1">
          À : {r.to}{r.subject ? ` — "${r.subject.slice(0, 30)}"` : ""}
        </p>
      )}
      <p className="px-3 pb-2.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
        <Eye className="w-2.5 h-2.5" /> Voir le contenu de l&apos;email
      </p>
    </button>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function WhatsAppSimulator({ botNom: _botNom, sectorSlug, sectorNom, onConversationUpdate }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  const [messages, setMessages]       = useState<DisplayMessage[]>([]);
  const [input, setInput]             = useState("");
  const [isSending, setIsSending]     = useState(false);
  const [showVideoModal, setShowVideo] = useState(false);
  const [activeRes, setActiveRes]     = useState<AIActionDeclenchee | null>(null);
  const [activeEmail, setActiveEmail] = useState<AIActionDeclenchee | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const shownIdsRef       = useRef<Set<string>>(new Set());
  const bottomRef         = useRef<HTMLDivElement>(null);

  const suggestions = SECTOR_SUGGESTIONS[sectorSlug ?? "_default"] ?? SECTOR_SUGGESTIONS._default;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const injectAIMessages = useCallback((aiMessages: AIMessage[], actions: AIActionDeclenchee[]) => {
    const toAdd: DisplayMessage[] = [];
    for (const m of aiMessages) {
      if (shownIdsRef.current.has(m.id)) continue;
      shownIdsRef.current.add(m.id);
      if (m.role === "user") continue;
      toAdd.push({ id: m.id, role: m.role, content: m.contenu });
    }
    for (const action of actions) {
      const cardId = `card-${action.id}`;
      if (shownIdsRef.current.has(cardId) || action.statut !== "succes") continue;
      const slug = action.action_slug;
      if (["create_reservation", "check_disponibilite", "create_demande_conciergerie"].includes(slug)) {
        shownIdsRef.current.add(cardId);
        toAdd.push({ id: cardId, role: "assistant", content: "", actionCard: "reservation", actionData: action });
      } else if (["send_email", "send_reminder"].includes(slug)) {
        shownIdsRef.current.add(cardId);
        toAdd.push({ id: cardId, role: "assistant", content: "", actionCard: "email", actionData: action });
      }
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
    setMessages(prev => [...prev, { id: userMsgId, role: "user", content }, { id: "typing", role: "assistant", content: "", isTyping: true }]);
    try {
      const res = await agentRepository.sendMessage({ conversation_id: conversationIdRef.current ?? undefined, message: content, canal: "whatsapp", mode: "test" });
      conversationIdRef.current = res.conversation_id;
      const conv = await agentRepository.getConversation(res.conversation_id);
      onConversationUpdate(conv);
      injectAIMessages(conv.messages, conv.actions_declenchees);
      if (conv.statut === "transferee") {
        const tid = `transfer-${Date.now()}`;
        shownIdsRef.current.add(tid);
        setMessages(prev => [...prev, { id: tid, role: "status", content: "🔄 Conversation transférée à un agent humain." }]);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      toast.error(t.testSendError);
    } finally { setIsSending(false); }
  }, [input, isSending, onConversationUpdate, injectAIMessages, t.testSendError, toast]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[580px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#25D366]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">{t.testSubtitle}</p>
          </div>
        )}
        {messages.map(msg => {
          if (msg.role === "status") return (
            <div key={msg.id} className="flex justify-center">
              <span className="text-xs text-[var(--text-muted)] italic bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">{msg.content}</span>
            </div>
          );
          if (msg.actionCard === "reservation" && msg.actionData) return (
            <CardReservation key={msg.id} action={msg.actionData} onClick={() => setActiveRes(msg.actionData!)} />
          );
          if (msg.actionCard === "email" && msg.actionData) return (
            <CardEmail key={msg.id} action={msg.actionData} onClick={() => setActiveEmail(msg.actionData!)} />
          );
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", isUser ? "bg-[#6C3CE1]/10" : "bg-[#25D366]/10")}>
                {isUser ? <User className="w-4 h-4 text-[#6C3CE1]" /> : <BotIcon className="w-4 h-4 text-[#25D366]" />}
              </div>
              <div className={cn("flex flex-col max-w-[75%]", isUser ? "items-end" : "items-start")}>
                <div className={cn("px-4 py-2.5 rounded-2xl text-sm leading-relaxed", isUser ? "bg-[#6C3CE1] text-white rounded-tr-sm" : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm")}>
                  {msg.isTyping ? (
                    <div className="flex gap-1 items-center h-4">
                      {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                    </div>
                  ) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">Suggestions :</span>
          {suggestions.map(s => (
            <button key={s} onClick={() => void sendMessage(s)} disabled={isSending}
              className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={t.testWhatsappPlaceholder} rows={1} disabled={isSending}
            className="flex-1 resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 disabled:opacity-50 min-h-[42px] max-h-[120px]" />
          <div className="relative group flex-shrink-0">
            <button className="w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg p-3 whitespace-nowrap z-10 text-center">
              <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Fonctionnalité bientôt disponible</p>
              <button onClick={() => setShowVideo(true)} className="text-[11px] bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 mx-auto hover:opacity-90">
                ▶ Voir la démo
              </button>
            </div>
          </div>
          <button onClick={() => void sendMessage()} disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <ModalVideoDemo open={showVideoModal} onClose={() => setShowVideo(false)} secteurNom={sectorNom} />
      <ModalReservation open={!!activeRes} onClose={() => setActiveRes(null)} action={activeRes} />
      <ModalEmail open={!!activeEmail} onClose={() => setActiveEmail(null)} action={activeEmail} />
    </div>
  );
}