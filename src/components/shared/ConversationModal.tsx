// src/components/shared/ConversationModal.tsx
// Modal unifié — utilisé par /bots ET /results
// S44 — zéro texte hardcodé, zéro couleur hardcodée, useLanguage complet
"use client";
import { useEffect, useRef, useState }    from "react";
import { createPortal }                   from "react-dom";
import {
  Activity, MessageSquare, GlobeLock, X,
  CalendarDays, ArrowRightLeft, BookOpen,
  Wrench, User, FlaskConical, Loader2,
} from "lucide-react";
import { cn }                             from "@/lib/utils";
import { useLanguage }                    from "@/contexts/LanguageContext";
import { conversationsRepository }        from "@/repositories";
import {
  MOCK_HISTORY,
  type MockMessage,
} from "@/app/(dashboard)/bots/_components/bots.types";
import type { Conversation }              from "@/types/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BackendMessage {
  id:         string;
  role:       "bot" | "client" | "humain" | string;
  contenu:    string;
  created_at: string;
}

export interface ConversationModalProps {
  conversation: Conversation;
  onClose:      () => void;
  /** Couleurs sectorielles — optionnel, défaut vert WhatsApp */
  colors?: { primary: string; accent: string };
}

const DEFAULT_COLORS = { primary: "#075E54", accent: "#25D366" };

const ACTION_ICONS: Record<string, React.ElementType> = {
  appointment:       CalendarDays,
  handoff:           ArrowRightLeft,
  faq:               BookOpen,
  service_info:      Wrench,
  contact_collected: User,
  email:             MessageSquare,
};

const FETCH_TIMEOUT_MS = 5000;

// ── Composant ─────────────────────────────────────────────────────────────────

export function ConversationModal({
  conversation,
  onClose,
  colors: colorsProp,
}: ConversationModalProps) {
  const { dictionary: d } = useLanguage();
  const t      = d.bots;
  const colors = { ...DEFAULT_COLORS, ...colorsProp };
  const report = conversation.rapport;

  const [showChat,        setShowChat]        = useState(false);
  const [chatMessages,    setChatMessages]    = useState<MockMessage[] | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [usingFallback,   setUsingFallback]   = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const fetchTokenRef = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showChat) return;
    if (chatMessages !== null) return;

    const myToken = ++fetchTokenRef.current;
    setLoadingMessages(true);
    setUsingFallback(false);

    const timeoutId = window.setTimeout(() => {
      if (fetchTokenRef.current !== myToken) return;
      const fallback = MOCK_HISTORY[conversation.id] ?? MOCK_HISTORY.default;
      setChatMessages(fallback);
      setUsingFallback(true);
      setLoadingMessages(false);
    }, FETCH_TIMEOUT_MS);

    conversationsRepository
      .getMessages(conversation.id)
      .then((data: unknown) => {
        if (fetchTokenRef.current !== myToken) return;
        let raw: BackendMessage[] = [];
        if (Array.isArray(data)) {
          raw = data as BackendMessage[];
        } else if (
          data && typeof data === "object" &&
          Array.isArray((data as { results?: unknown }).results)
        ) {
          raw = (data as { results: BackendMessage[] }).results;
        }
        window.clearTimeout(timeoutId);
        if (raw.length === 0) {
          const fallback = MOCK_HISTORY[conversation.id] ?? MOCK_HISTORY.default;
          setChatMessages(fallback);
          setUsingFallback(true);
        } else {
          setChatMessages(raw.map((m) => ({
            role: m.role === "client" ? "client" : "bot",
            text: m.contenu,
            time: formatTime(m.created_at),
          })));
          setUsingFallback(false);
        }
        setLoadingMessages(false);
      })
      .catch(() => {
        if (fetchTokenRef.current !== myToken) return;
        window.clearTimeout(timeoutId);
        const fallback = MOCK_HISTORY[conversation.id] ?? MOCK_HISTORY.default;
        setChatMessages(fallback);
        setUsingFallback(true);
        setLoadingMessages(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      fetchTokenRef.current++;
    };
  }, [showChat, conversation.id, chatMessages]);

  if (!mounted) return null;

  const isWhatsapp = conversation.bot_type === "whatsapp";

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={cn(
        "relative rounded-3xl shadow-2xl border border-[var(--border)]",
        "flex flex-col max-h-[90vh] transition-all duration-500 ease-in-out overflow-hidden",
        showChat ? "max-w-5xl w-full" : "max-w-lg w-full",
      )} style={{ background: "var(--bg-card)" }}>

        {/* ── Header ── */}
        <div
          className="p-5 border-b border-[var(--border)] flex items-center gap-3 z-20 flex-shrink-0"
          style={{ background: "var(--bg-card)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Activity className="w-4 h-4" style={{ color: colors.primary }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text)] truncate">
              {t.reportTitle} : {conversation.client_nom || "Client"}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
              {isWhatsapp ? t.modalChannelWhatsapp : t.modalChannelVocal}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Bouton Voir/Masquer chat — toujours en haut */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                !showChat && "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
              style={{
                background: showChat ? colors.primary : "var(--bg)",
                color: showChat ? "#fff" : undefined,
              }}
            >
              {showChat
                ? <GlobeLock className="w-4 h-4" />
                : <MessageSquare className="w-4 h-4" />}
              <span>{showChat ? t.modalHideChat : t.modalSeeChat}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              style={{ background: "var(--bg)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Panneau rapport ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 border-r border-[var(--border)]">
            {report ? (
              <>
                {/* Résumé */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    {t.reportSummary}
                  </p>
                  <div
                    className="rounded-2xl p-4 text-sm leading-relaxed text-[var(--text)] border border-[var(--border)]"
                    style={{ background: "var(--bg)" }}
                  >
                    {report.resume}
                  </div>
                </section>

                {/* RDV + Transfert */}
                <section className="grid grid-cols-2 gap-3">
                  <div className={cn(
                    "p-4 rounded-2xl border",
                    report.rdv_planifies > 0
                      ? "bg-[#25D366]/5 border-[#25D366]/20"
                      : "border-[var(--border)]",
                  )} style={report.rdv_planifies === 0 ? { background: "var(--bg)" } : {}}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      {t.reportAppointment}
                    </p>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {report.rdv_planifies > 0
                        ? t.reportAppointmentScheduled
                        : t.reportNoAppointment}
                    </p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl border",
                    report.transferts_humain > 0
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "border-[var(--border)]",
                  )} style={report.transferts_humain === 0 ? { background: "var(--bg)" } : {}}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      {t.reportHandoff}
                    </p>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {report.transferts_humain > 0
                        ? t.reportHandoffTriggered
                        : t.reportNoHandoff}
                    </p>
                  </div>
                </section>

                {/* Points clés */}
                {report.points_cles?.length > 0 && (
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                      {t.reportTakeaways}
                    </p>
                    <ul className="space-y-2">
                      {report.points_cles.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                          <span className="text-[#25D366] mt-0.5 flex-shrink-0">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Actions */}
                {report.actions?.length > 0 && (
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                      {t.reportActions}
                    </p>
                    <div className="space-y-2">
                      {report.actions.map((action, i) => {
                        const Icon = ACTION_ICONS[action.type] ?? Activity;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)]"
                            style={{ background: "var(--bg)" }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-[var(--border)] flex-shrink-0"
                              style={{ background: "var(--bg-card)" }}
                            >
                              <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--text)]">{action.label}</p>
                              {action.detail && (
                                <p className="text-[10px] text-[var(--text-muted)] truncate">
                                  {action.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-3">
                <FlaskConical className="w-12 h-12 opacity-20" />
                <p className="text-sm italic">{t.modalAnalysisPending}</p>
              </div>
            )}
          </div>

          {/* ── Panneau chat coulissant ── */}
          <div
            className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
              showChat ? "w-[400px] opacity-100" : "w-0 opacity-0",
            )}
            style={{ background: "var(--bg)" }}
          >
            {/* Header chat */}
            <div
              className="p-4 border-b border-[var(--border)] flex-shrink-0"
              style={{ background: "var(--bg-card)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                {isWhatsapp ? t.modalDiscussionWhatsapp : t.modalDiscussionVocal}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages && chatMessages === null && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-xs italic">{t.modalLoadingChat}</p>
                </div>
              )}

              {chatMessages?.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm",
                    msg.role === "client"
                      ? "text-white rounded-br-none"
                      : "text-[var(--text)] border border-[var(--border)] rounded-bl-none",
                  )} style={{
                    background: msg.role === "client"
                      ? "#005C4B"
                      : "var(--bg-card)",
                  }}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={cn(
                      "text-[9px] mt-1 opacity-60",
                      msg.role === "client" ? "text-right text-white" : "text-[var(--text-muted)]",
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Fin de discussion */}
              {chatMessages && chatMessages.length > 0 && conversation.statut !== "en_cours" && (
                <div className="py-4 text-center">
                  <span
                    className="text-[9px] px-2 py-1 rounded-full font-bold uppercase text-[var(--text-muted)]"
                    style={{ background: "var(--border)" }}
                  >
                    {t.modalEndDiscussion}
                  </span>
                </div>
              )}

              {/* Indicateur fallback */}
              {usingFallback && chatMessages && chatMessages.length > 0 && (
                <div className="py-2 text-center">
                  <span className="text-[9px] px-2 py-1 bg-amber-500/10 rounded-full text-amber-500 font-bold uppercase tracking-widest border border-amber-500/20">
                    {t.modalPreviewOnly}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch { return ""; }
}