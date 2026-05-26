"use client";
// src/app/(dashboard)/bots/[id]/test/_components/WhatsAppSimulator.tsx
// Simulateur WhatsApp — envoi de messages, rendu du fil de conversation.
// S65 — suggestions features actives · charger session passée · strings i18n.
// S66 — botId transmis à agentRepository.sendMessage() pour fix persistance.
// S69 — formatMsgDate() date+heure · cartes pour tous slugs d'écriture
//        · ActionBadge pour slugs de lecture · CardTransfert cliquable.

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Bot as BotIcon, Send, User, MessageSquare,
  Loader2, Mic, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { agentRepository } from "@/repositories/agent.repository";
import type { ActiveFeature } from "@/repositories/features.repository";
import type { AIConversation, AIMessage, AIActionDeclenchee } from "@/types/api/agent.types";
import {
  CardReservation, CardEmail, CardCommande,
  CardInscription, CardFinance, CardTransfert,
  ActionBadge,
} from "./_ui/ActionCards";
import { ModalEmail, ModalReservation, ModalCommande, ModalFinance, ModalInscriptionDossier } from "./modals/ActionModals";
import { ModalVideoDemo } from "./modals/SystemModals";

// ── Slugs par type de rendu ───────────────────────────────────────────────────

const SLUGS_RESERVATION = new Set([
  "create_reservation", "check_disponibilite", "create_demande_conciergerie",
  "create_rdv", "book_room", "book_table", "book_ticket",
  "resa_table", "resa_billet",
]);
const SLUGS_EMAIL     = new Set(["send_email", "send_reminder", "send_email_rappel"]);
const SLUGS_COMMANDE  = new Set(["create_commande", "commande_pay"]);
const SLUGS_INSCR     = new Set(["create_inscription"]);
const SLUGS_FINANCE   = new Set(["simulate_credit"]);
const SLUGS_TRANSFERT = new Set(["transfer_to_human", "create_transfert"]);

// ── Suggestions de base par secteur ──────────────────────────────────────────

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

function buildSuggestions(
  sectorSlug: string | undefined,
  activeFeatures: ActiveFeature[],
): string[] {
  const FEATURE_SUGGESTIONS: Record<string, string> = {
    prise_rdv:             "Prendre un RDV",
    reservation_chambre:   "Réserver une chambre",
    reservation_table:     "Réserver une table",
    reservation_billet:    "Réserver un billet",
    menu_digital:          "Voir le menu",
    catalogue_produits:    "Voir le catalogue",
    faq:                   "Une question ?",
    simulation_credit:     "Simuler un crédit",
    inscription_admission: "S'inscrire",
    suivi_commande:        "Suivre ma commande",
    orientation_patient:   "Orientation médicale",
    orientation_citoyens:  "Services disponibles",
    transfert_humain:      "Parler à quelqu'un",
  };

  const featureSuggs = activeFeatures
    .filter((f) => f.is_active && FEATURE_SUGGESTIONS[f.slug])
    .map((f) => FEATURE_SUGGESTIONS[f.slug]!)
    .slice(0, 3);

  if (featureSuggs.length >= 3) {
    const hasHuman = featureSuggs.some((s) => s.includes("quelqu'un"));
    return hasHuman ? featureSuggs.slice(0, 4) : [...featureSuggs.slice(0, 3), "Parler à quelqu'un"];
  }

  const base   = SECTOR_SUGGESTIONS[sectorSlug ?? "_default"] ?? SECTOR_SUGGESTIONS._default;
  const merged = [...new Set([...featureSuggs, ...base])];
  return merged.slice(0, 4);
}

// ── Helper date ───────────────────────────────────────────────────────────────

function formatMsgDate(isoDate: string | undefined): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";
  const now   = new Date();
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return heure;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Hier ${heure}`;
  const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${dateStr} ${heure}`;
}

// ── Helper — détermine le type de rendu d'une action ─────────────────────────

type CardType = "reservation" | "email" | "commande" | "inscription" | "finance" | "transfert" | "badge" | null;

function getActionCardType(slug: string, statut: string): CardType {
  if (statut !== "succes") return null;
  if (SLUGS_RESERVATION.has(slug)) return "reservation";
  if (SLUGS_EMAIL.has(slug))       return "email";
  if (SLUGS_COMMANDE.has(slug))    return "commande";
  if (SLUGS_INSCR.has(slug))       return "inscription";
  if (SLUGS_FINANCE.has(slug))     return "finance";
  if (SLUGS_TRANSFERT.has(slug))   return "transfert";
  // Toute action réussie non listée ci-dessus → badge si elle a une entrée dans BADGE_META
  return "badge";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id:          string;
  role:        "user" | "assistant" | "status";
  content:     string;
  created_at?: string;
  isTyping?:   boolean;
  cardType?:   CardType;
  actionData?: AIActionDeclenchee;
}

interface Props {
  botId:          string;
  botNom:         string;
  sectorSlug?:    string;
  sectorNom?:     string;
  activeFeatures: ActiveFeature[];
  initialSession?: AIConversation | null;
  onConversationUpdate: (conv: AIConversation) => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function WhatsAppSimulator({
  botId,
  botNom: _botNom,
  sectorSlug,
  sectorNom,
  activeFeatures,
  initialSession,
  onConversationUpdate,
}: Props) {
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const toast = useToast();

  const [messages,       setMessages]    = useState<DisplayMessage[]>([]);
  const [input,          setInput]       = useState("");
  const [isSending,      setIsSending]   = useState(false);
  const [showVideoModal, setShowVideo]   = useState(false);
  const [sessionLoaded,  setSessionLoaded] = useState(false);

  // Modals par type de carte
  const [activeRes,    setActiveRes]    = useState<AIActionDeclenchee | null>(null);
  const [activeEmail,  setActiveEmail]  = useState<AIActionDeclenchee | null>(null);
  const [activeCom,    setActiveCom]    = useState<AIActionDeclenchee | null>(null);
  const [activeInscr,  setActiveInscr]  = useState<AIActionDeclenchee | null>(null);
  const [activeFin,    setActiveFin]    = useState<AIActionDeclenchee | null>(null);
  const [activeTrans,  setActiveTrans]  = useState<AIActionDeclenchee | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const shownIdsRef       = useRef<Set<string>>(new Set());
  const bottomRef         = useRef<HTMLDivElement>(null);

  const suggestions = buildSuggestions(sectorSlug, activeFeatures);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Helper — fabrique un DisplayMessage depuis une action ─────────────────

  function makeActionMsg(action: AIActionDeclenchee): DisplayMessage | null {
    const cardType = getActionCardType(action.action_slug, action.statut);
    if (!cardType) return null;
    return {
      id:        `card-${action.id}`,
      role:      "assistant",
      content:   "",
      cardType,
      actionData: action,
    };
  }

  // ── Charger une session passée ────────────────────────────────────────────

  useEffect(() => {
    if (!initialSession) return;
    conversationIdRef.current = initialSession.id;
    onConversationUpdate(initialSession);

    const loaded: DisplayMessage[] = [];
    for (const m of initialSession.messages ?? []) {
      if (m.role === "status") {
        loaded.push({ id: m.id, role: "status", content: m.contenu });
      } else if (m.role === "user" || m.role === "assistant") {
        loaded.push({ id: m.id, role: m.role, content: m.contenu, created_at: m.created_at });
      }
      shownIdsRef.current.add(m.id);
    }
    for (const action of initialSession.actions_declenchees ?? []) {
      const cardId = `card-${action.id}`;
      if (shownIdsRef.current.has(cardId)) continue;
      const msg = makeActionMsg(action);
      if (msg) {
        shownIdsRef.current.add(cardId);
        loaded.push(msg);
      }
    }
    setMessages(loaded);
    setSessionLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession?.id]);

  // ── Injection des nouveaux messages IA ───────────────────────────────────

  const injectAIMessages = useCallback((
    aiMessages: AIMessage[],
    actions: AIActionDeclenchee[],
  ) => {
    const toAdd: DisplayMessage[] = [];

    for (const m of aiMessages) {
      if (shownIdsRef.current.has(m.id)) continue;
      shownIdsRef.current.add(m.id);
      if (m.role === "user") continue;
      toAdd.push({ id: m.id, role: m.role as "assistant" | "status", content: m.contenu, created_at: m.created_at });
    }

    for (const action of actions) {
      const cardId = `card-${action.id}`;
      if (shownIdsRef.current.has(cardId)) continue;
      const msg = makeActionMsg(action);
      if (msg) {
        shownIdsRef.current.add(cardId);
        toAdd.push(msg);
      }
    }

    setMessages(prev => [...prev.filter(m => m.id !== "typing"), ...toAdd]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Envoi de message ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;
    setInput("");
    setIsSending(true);

    const userMsgId = crypto.randomUUID();
    shownIdsRef.current.add(userMsgId);
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", content, created_at: new Date().toISOString() },
      { id: "typing", role: "assistant", content: "", isTyping: true },
    ]);

    try {
      const res = await agentRepository.sendMessage({
        conversation_id: conversationIdRef.current ?? undefined,
        bot_id:          botId,
        message:         content,
        canal:           "whatsapp",
        mode:            "test",
      });
      conversationIdRef.current = res.conversation_id;
      const conv = await agentRepository.getConversation(res.conversation_id);
      onConversationUpdate(conv);
      injectAIMessages(conv.messages, conv.actions_declenchees);

      if (conv.statut === "transferee") {
        const tid = `transfer-${Date.now()}`;
        shownIdsRef.current.add(tid);
        setMessages(prev => [
          ...prev,
          { id: tid, role: "status", content: t.testSessionTransferred },
        ]);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      toast.error(t.testSendError);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, botId, onConversationUpdate, injectAIMessages, t, toast]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {sessionLoaded && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg)] border-b border-[var(--border)]">
          <Info className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          <p className="text-[11px] text-[var(--text-muted)]">{t.testSessionContinueHint}</p>
        </div>
      )}

      {/* ── Fil de messages ── */}
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
          // ── Status ──
          if (msg.role === "status") return (
            <div key={msg.id} className="flex justify-center">
              <span className="text-xs text-[var(--text-muted)] italic bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-pulse flex-shrink-0" />
                {msg.content}
              </span>
            </div>
          );

          // ── Cartes cliquables ──
          if (msg.cardType && msg.actionData) {
            const a = msg.actionData;
            switch (msg.cardType) {
              case "reservation": return <CardReservation key={msg.id} action={a} onClick={() => setActiveRes(a)}    />;
              case "email":       return <CardEmail       key={msg.id} action={a} onClick={() => setActiveEmail(a)}  />;
              case "commande":    return <CardCommande    key={msg.id} action={a} onClick={() => setActiveCom(a)}    />;
              case "inscription": return <CardInscription key={msg.id} action={a} onClick={() => setActiveInscr(a)} />;
              case "finance":     return <CardFinance     key={msg.id} action={a} onClick={() => setActiveFin(a)}    />;
              case "transfert":   return <CardTransfert   key={msg.id} action={a} onClick={() => setActiveTrans(a)}  />;
              case "badge":       return <ActionBadge     key={msg.id} action={a} />;
              default: return null;
            }
          }

          // ── Bulle texte ──
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isUser ? "bg-[#6C3CE1]/10" : "bg-[#25D366]/10",
              )}>
                {isUser
                  ? <User    className="w-4 h-4 text-[#6C3CE1]" />
                  : <BotIcon className="w-4 h-4 text-[#25D366]" />}
              </div>
              <div className={cn("flex flex-col max-w-[75%]", isUser ? "items-end" : "items-start")}>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isUser
                    ? "bg-[#6C3CE1] text-white rounded-tr-sm"
                    : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm",
                )}>
                  {msg.isTyping ? (
                    <div className="flex gap-1 items-center h-4">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.created_at && (
                        <span className="text-[9px] text-[var(--text-muted)] mt-0.5 block opacity-70">
                          {formatMsgDate(msg.created_at)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      <div className="px-4 py-2 flex items-center gap-1.5 flex-wrap border-t border-[var(--border)]">
        <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">Suggestions :</span>
        {suggestions.map(s => (
          <button key={s} onClick={() => void sendMessage(s)} disabled={isSending}
            className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40">
            {s}
          </button>
        ))}
      </div>

      {/* ── Zone de saisie ── */}
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
          <div className="relative group flex-shrink-0">
            <button className="w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg p-3 whitespace-nowrap z-10 text-center">
              <p className="text-[10px] text-[var(--text-muted)] mb-1.5">{t.testVoiceComingSoon}</p>
              <button onClick={() => setShowVideo(true)}
                className="text-[11px] bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 mx-auto hover:opacity-90">
                ▶ {t.testVoiceSeeDemo}
              </button>
            </div>
          </div>
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <ModalVideoDemo          open={showVideoModal} onClose={() => setShowVideo(false)}   secteurNom={sectorNom} />
      <ModalReservation        open={!!activeRes}    onClose={() => setActiveRes(null)}    action={activeRes} />
      <ModalEmail              open={!!activeEmail}  onClose={() => setActiveEmail(null)}  action={activeEmail} />
      <ModalCommande           open={!!activeCom}    onClose={() => setActiveCom(null)}    action={activeCom} />
      <ModalInscriptionDossier open={!!activeInscr}  onClose={() => setActiveInscr(null)}  action={activeInscr} />
      <ModalFinance            open={!!activeFin}    onClose={() => setActiveFin(null)}    action={activeFin} />
      {/* CardTransfert — modal générique via ModalReservation en fallback */}
      <ModalReservation        open={!!activeTrans}  onClose={() => setActiveTrans(null)}  action={activeTrans} />
    </div>
  );
}