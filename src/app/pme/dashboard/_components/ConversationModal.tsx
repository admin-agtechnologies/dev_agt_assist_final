// src/app/pme/dashboard/_components/ConversationModal.tsx
"use client";
import { createPortal } from "react-dom";
import { X, User, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { Conversation } from "@/types/api";

interface Props {
  conv: Conversation;
  onClose: () => void;
  labels: {
    historyTitle: string;
    channelWhatsapp: string;
    channelVoice: string;
    summary: string;
    keyPoints: string;
    actionTitle: string;
    actionNoAction: string;
    appointmentConfirmed: string;
    handoffRequired: string;
    appointments: string;
  };
}

export function ConversationModal({ conv, onClose, labels }: Props) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[85vh] animate-zoom-in">

        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text)] truncate">
              {conv.client_nom || conv.client_telephone}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={conv.bot_type === "whatsapp" ? "green" : "violet"}>
                {conv.bot_type === "whatsapp" ? labels.channelWhatsapp : labels.channelVoice}
              </Badge>
              <span className="text-[10px] text-[var(--text-muted)]">
                {formatDateTime(conv.dernier_message_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] hover:opacity-70 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
            {labels.historyTitle}
          </p>
          {conv.rapport ? (
            <div className="space-y-3">
              {conv.rapport.resume && (
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text)] mb-1">{labels.summary}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{conv.rapport.resume}</p>
                </div>
              )}
              {conv.rapport.points_cles?.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text)] mb-2">{labels.keyPoints}</p>
                  <ul className="space-y-1">
                    {conv.rapport.points_cles.map((pt, i) => (
                      <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                        <span className="text-[#25D366] mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              {conv.nb_messages} messages
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border)] bg-[var(--bg)] rounded-b-3xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
            {labels.actionTitle}
          </p>
          {conv.rendez_vous ? (
            <div className="flex items-center gap-2 text-sm text-[#25D366] font-semibold">
              <CalendarDays className="w-4 h-4" />
              <span>{labels.appointments} — {labels.appointmentConfirmed}</span>
            </div>
          ) : conv.human_handoff ? (
            <p className="text-sm text-amber-600 font-semibold">⚠️ {labels.handoffRequired}</p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">{labels.actionNoAction}</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}