// src/components/shared/ConversationModal.tsx
// Modal unifié — utilisé par /bots ET /results ET /bots/[id]/test
// S68 — Migration complète vers AIConversation (nouveau système agent)
//       Suppression MOCK_HISTORY — données réelles uniquement
//       Bilan construit depuis actions_declenchees + contexte
"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal }                from "react-dom";
import {
  Activity, MessageSquare, GlobeLock, X,
  CalendarDays, ArrowRightLeft, BookOpen,
  Wrench, User, Loader2, CheckCircle2,
  XCircle, Clock, Zap,
} from "lucide-react";
import { cn }                          from "@/lib/utils";
import { useLanguage }                 from "@/contexts/LanguageContext";
import { agentRepository }             from "@/repositories/agent.repository";
import type { AIConversation, AIMessage, AIActionDeclenchee } from "@/types/api/agent.types";
// ── Types ────────────────────────────────────────────────────────────────────

export interface ConversationModalProps {
  conversation: AIConversation;
  onClose:      () => void;
  colors?:      { primary: string; accent: string };
}

interface ActionLog {
  id:               string;
  action_slug:      string;
  action_nom:       string;
  statut:           "succes" | "echec" | "validation_error" | "timeout" | string;
  duree_ms:         number;
  payload_envoye:   Record<string, unknown>;
  response_recue:   Record<string, unknown>;
  created_at:       string;
}

const DEFAULT_COLORS = { primary: "#075E54", accent: "#25D366" };

const ACTION_ICONS: Record<string, React.ElementType> = {
  get_menu:             BookOpen,
  create_commande:      Wrench,
  prise_rdv:            CalendarDays,
  create_reservation:   CalendarDays,
  transfer_to_human:    ArrowRightLeft,
  capture_prospect:     User,
  search_faq:           MessageSquare,
};

// ── Composant ────────────────────────────────────────────────────────────────

export function ConversationModal({
  conversation: initialConv,
  onClose,
  colors: colorsProp,
}: ConversationModalProps) {
  const { dictionary: d } = useLanguage();
  const t      = d.bots;
  const colors = { ...DEFAULT_COLORS, ...colorsProp };

  const [showChat,      setShowChat]      = useState(false);
  const [conv,          setConv]          = useState<AIConversation>(initialConv);
  const [loading,       setLoading]       = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Charger la conversation complète (messages + actions_declenchees) au mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    agentRepository
      .getConversation(initialConv.id)
      .then((data) => setConv(data))
      .catch(() => {/* garde initialConv */})
      .finally(() => setLoading(false));
  }, [initialConv.id]);

  if (!mounted) return null;

  // ── Données dérivées ────────────────────────────────────────────────────
  const messages = (conv.messages ?? []).filter(
    (m: AIMessage) => m.role === "user" || m.role === "assistant",
  );

  const actionLogs: AIActionDeclenchee[] = (
    (conv as AIConversation & { actions_declenchees?: AIActionDeclenchee[] })
      .actions_declenchees ?? []
  ).filter((a) => !["init_conversation", "update_context"].includes(a.action_slug));

  const ctx     = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact = ctx.contact as Record<string, string> | undefined;
  const summary = (ctx.summary as string) || null;
  const clientNom = contact?.nom
    ?? (conv.contact as { nom?: string } | null)?.nom
    ?? "Client";

  const nbMessages  = messages.length;
  const nbActions   = actionLogs.filter((a) => a.statut === "succes").length;
  const nbEchecs    = actionLogs.filter((a) => a.statut !== "succes").length;
  const isTransfere = conv.statut === "transferee";
  const isWhatsapp  = conv.canal === "whatsapp";

  // ── Modal ───────────────────────────────────────────────────────────────
  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={cn(
        "relative rounded-3xl shadow-2xl border border-[var(--border)]",
        "flex flex-col max-h-[90vh] transition-all duration-500 ease-in-out overflow-hidden",
        showChat ? "max-w-5xl w-full" : "max-w-lg w-full",
      )} style={{ background: "var(--bg-card)" }}>

        {/* Header */}
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
              {t.reportTitle} : {clientNom}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
              {isWhatsapp ? t.modalChannelWhatsapp : t.modalChannelVocal}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                !showChat && "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
              style={{
                background: showChat ? colors.primary : "var(--bg)",
                color:      showChat ? "#fff" : undefined,
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

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Panneau bilan */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 border-r border-[var(--border)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
                <Loader2 className="w-8 h-8 animate-spin opacity-40" />
                <p className="text-sm italic">Chargement du bilan…</p>
              </div>
            ) : (
              <>
                {/* KPIs */}
                <section className="grid grid-cols-3 gap-3">
                  <KpiCard
                    label="Messages"
                    value={nbMessages}
                    icon={<MessageSquare className="w-4 h-4" />}
                    color={colors.primary}
                  />
                  <KpiCard
                    label="Actions"
                    value={nbActions}
                    icon={<Zap className="w-4 h-4" />}
                    color="#25D366"
                  />
                  <KpiCard
                    label={isTransfere ? "Transféré" : "Erreurs"}
                    value={isTransfere ? 1 : nbEchecs}
                    icon={<ArrowRightLeft className="w-4 h-4" />}
                    color={isTransfere || nbEchecs > 0 ? "#F59E0B" : "#6B7280"}
                  />
                </section>

                {/* Résumé contexte */}
                {summary && (
                  <section>
                    <SectionTitle>{t.reportSummary}</SectionTitle>
                    <div
                      className="rounded-2xl p-4 text-sm leading-relaxed text-[var(--text)] border border-[var(--border)]"
                      style={{ background: "var(--bg)" }}
                    >
                      {summary}
                    </div>
                  </section>
                )}

                {/* Actions déclenchées */}
                {actionLogs.length > 0 && (
                  <section>
                    <SectionTitle>{t.reportActions}</SectionTitle>
                    <div className="space-y-2">
                      {actionLogs.map((log) => {
                        const Icon = ACTION_ICONS[log.action_slug] ?? Activity;
                        const ok   = log.statut === "succes";
                        return (
                          <div
                            key={log.id}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)]"
                            style={{ background: "var(--bg)" }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-[var(--border)] flex-shrink-0"
                              style={{ background: "var(--bg-card)" }}
                            >
                              <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[var(--text)]">
                                {log.action_nom || log.action_slug}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)]">
                                {log.duree_ms} ms · {formatTime(log.created_at)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {ok
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                : <XCircle     className="w-4 h-4 text-red-400" />
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Statut conversation */}
                <section>
                  <SectionTitle>Statut</SectionTitle>
                  <div className="flex items-center gap-2">
                    <StatusBadge statut={conv.statut} />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatDate(conv.created_at)}
                    </span>
                  </div>
                </section>

                {/* État vide */}
                {!summary && actionLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)] gap-3">
                    <Clock className="w-10 h-10 opacity-20" />
                    <p className="text-sm italic">{t.modalAnalysisPending}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Panneau chat coulissant */}
          <div
            className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
              showChat ? "w-[400px] opacity-100" : "w-0 opacity-0",
            )}
            style={{ background: "var(--bg)" }}
          >
            <div
              className="p-4 border-b border-[var(--border)] flex-shrink-0"
              style={{ background: "var(--bg-card)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                {isWhatsapp ? t.modalDiscussionWhatsapp : t.modalDiscussionVocal}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-xs italic">{t.modalLoadingChat}</p>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                  <p className="text-xs italic">Aucun message.</p>
                </div>
              )}

              {messages.map((msg: AIMessage) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm",
                      msg.role === "user"
                        ? "text-white rounded-br-none"
                        : "text-[var(--text)] border border-[var(--border)] rounded-bl-none",
                    )}
                    style={{
                      background: msg.role === "user"
                        ? "#005C4B"
                        : "var(--bg-card)",
                    }}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.contenu}</p>
                    <p className={cn(
                      "text-[9px] mt-1 opacity-60",
                      msg.role === "user"
                        ? "text-right text-white"
                        : "text-[var(--text-muted)]",
                    )}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {!loading && messages.length > 0 && conv.statut !== "active" && (
                <div className="py-4 text-center">
                  <span
                    className="text-[9px] px-2 py-1 rounded-full font-bold uppercase text-[var(--text-muted)]"
                    style={{ background: "var(--border)" }}
                  >
                    {t.modalEndDiscussion}
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

// ── Sous-composants ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
      {children}
    </p>
  );
}

function KpiCard({
  label, value, icon, color,
}: {
  label: string;
  value: number;
  icon:  React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="p-3 rounded-2xl border border-[var(--border)] flex flex-col gap-1"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-[var(--text)]">{value}</p>
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: "Active",    cls: "bg-emerald-500/10 text-emerald-600" },
    terminee:  { label: "Terminée",  cls: "bg-[var(--border)] text-[var(--text-muted)]" },
    transferee:{ label: "Transférée",cls: "bg-amber-500/10 text-amber-600" },
    abandonnee:{ label: "Abandonnée",cls: "bg-red-500/10 text-red-500" },
  };
  const s = map[statut] ?? { label: statut, cls: "bg-[var(--border)] text-[var(--text-muted)]" };
  return (
    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full", s.cls)}>
      {s.label}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return ""; }
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return ""; }
}