// src/app/pme/bots/_components/ConversationReportModal.tsx
"use client";
import { useState } from "react";
import {
  Activity, MessageSquare, GlobeLock, X,
  CalendarDays, ArrowRightLeft, BookOpen, Wrench, User, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Conversation } from "@/types/api";
import { MOCK_HISTORY } from "./bots.types";

// ── Props ─────────────────────────────────────────────────────────────────────
interface ConversationReportModalProps {
  conversation: Conversation;
  onClose: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
}

// ─────────────────────────────────────────────────────────────────────────────

export function ConversationReportModal({ conversation, onClose, d, colors }: ConversationReportModalProps) {
  const t = d.bots;
  const report = conversation.rapport;
  const [showChat, setShowChat] = useState(false);

  const ACTION_ICONS: Record<string, React.ElementType> = {
    appointment:       CalendarDays,
    handoff:           ArrowRightLeft,
    faq:               BookOpen,
    service_info:      Wrench,
    contact_collected: User,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={cn(
        "relative bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] transition-all duration-500 ease-in-out overflow-hidden",
        showChat ? "max-w-5xl w-full" : "max-w-lg w-full",
      )}>

        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-card)] z-20">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${colors.primary}18` }}>
            <Activity className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text)] truncate">
              {t.reportTitle} : {conversation.client_nom || "Client"}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
              {conversation.bot_type === "whatsapp" ? "Canal WhatsApp" : "Canal Vocal"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                showChat
                  ? "bg-[#075E54] text-white"
                  : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]",
              )}>
              {showChat ? <GlobeLock className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              <span>{showChat ? "Masquer chat" : "Voir chat"}</span>
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Panneau rapport ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-[var(--border)]">
            {report ? (
              <>
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    {t.reportSummary}
                  </p>
                  <div className="bg-[var(--bg)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text)] border border-[var(--border)]">
                    {report.resume}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <div className={cn("p-4 rounded-2xl border",
                    report.rdv_planifies > 0
                      ? "bg-[#25D366]/5 border-[#25D366]/20"
                      : "bg-[var(--bg)] border-[var(--border)]")}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      {t.reportAppointment}
                    </p>
                    <p className="text-sm font-bold">
                      {report.rdv_planifies > 0 ? "✅ Planifié" : t.reportNoAppointment}
                    </p>
                  </div>
                  <div className={cn("p-4 rounded-2xl border",
                    report.transferts_humain > 0
                      ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                      : "bg-[var(--bg)] border-[var(--border)]")}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      {t.reportHandoff}
                    </p>
                    <p className="text-sm font-bold">
                      {report.transferts_humain > 0 ? "⚠️ Transféré" : t.reportNoHandoff}
                    </p>
                  </div>
                </section>

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

                {report.actions?.length > 0 && (
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                      {t.reportActions}
                    </p>
                    <div className="space-y-2">
                      {report.actions.map((action, i) => {
                        const Icon = ACTION_ICONS[action.type] ?? Activity;
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <Icon className="w-4 h-4 text-[#075E54]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{action.label}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{action.detail}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <FlaskConical className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm italic">Analyse en cours ou indisponible...</p>
              </div>
            )}
          </div>

          {/* ── Panneau chat coulissant ── */}
          <div className={cn(
            "bg-[var(--bg)] transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
            showChat ? "w-[400px] opacity-100" : "w-0 opacity-0",
          )}>
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Discussion WhatsApp
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(MOCK_HISTORY[conversation.id] ?? MOCK_HISTORY.default).map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm",
                    msg.role === "client"
                      ? "bg-[#25D366] text-white rounded-br-none"
                      : "bg-white text-[var(--text)] border border-[var(--border)] rounded-bl-none",
                  )}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={cn("text-[9px] mt-1 opacity-70", msg.role === "client" ? "text-right" : "")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div className="py-4 text-center">
                <span className="text-[9px] px-2 py-1 bg-[var(--border)] rounded-full text-[var(--text-muted)] font-bold uppercase">
                  Fin de discussion
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}