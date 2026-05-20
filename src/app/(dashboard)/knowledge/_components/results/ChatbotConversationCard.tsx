// src/app/(dashboard)/knowledge/_components/results/ChatbotConversationCard.tsx
"use client";

import {
  MessageSquare, ArrowLeftRight, CalendarDays,
  Mail, BookOpen, Zap, User, ChevronRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Conversation } from "@/types/api";

interface Props {
  conv:    Conversation;
  onClick: (conv: Conversation) => void;
}

// ── Icône par type d'action bot ───────────────────────────────────────────────
const ACTION_ICON: Record<string, React.ElementType> = {
  transfert_humain: ArrowLeftRight,
  rdv:              CalendarDays,
  email:            Mail,
  faq:              BookOpen,
};

function ActionChip({ type, label }: { type: string; label: string }) {
  const Icon = ACTION_ICON[type] ?? Zap;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      bg-[var(--bg)] border border-[var(--border)] text-[10px] text-[var(--text-muted)]">
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[120px]">{label}</span>
    </span>
  );
}

// ── Badge statut ──────────────────────────────────────────────────────────────
const STATUT_STYLE: Record<string, string> = {
  terminee:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  transferee: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  en_cours:   "bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400",
};
const STATUT_LABEL: Record<string, string> = {
  terminee:   "Terminée",
  transferee: "Transférée",
  en_cours:   "En cours",
};

// ── Composant principal ───────────────────────────────────────────────────────
export function ChatbotConversationCard({ conv, onClick }: Props) {
  const rapport  = conv.rapport;
  const actions  = rapport?.actions ?? [];
  const hasRdv   = (rapport?.rdv_planifies ?? 0) > 0;
  const hasXfer  = conv.human_handoff;

  return (
    <button
      type="button"
      onClick={() => onClick(conv)}
      className="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]
        hover:border-[var(--accent)] hover:shadow-sm transition-all duration-150 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-[#25D366]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {conv.client_nom || conv.client_telephone}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {formatDateTime(conv.created_at)}
            {" · "}
            <MessageSquare className="w-3 h-3 inline-block mr-0.5" />
            {conv.nb_messages} msg
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
            ${STATUT_STYLE[conv.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
            {STATUT_LABEL[conv.statut] ?? conv.statut}
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Résumé */}
      {rapport?.resume && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {rapport.resume}
          </p>
        </div>
      )}

      {/* Badges RDV / Transfert + Actions */}
      {(hasRdv || hasXfer || actions.length > 0) && (
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {hasRdv && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
              text-[10px] font-medium">
              <CalendarDays className="w-3 h-3" /> RDV planifié
            </span>
          )}
          {hasXfer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
              text-[10px] font-medium">
              <ArrowLeftRight className="w-3 h-3" /> Transfert humain
            </span>
          )}
          {actions.slice(0, 3).map((a, i) => (
            <ActionChip key={i} type={a.type} label={a.label} />
          ))}
          {actions.length > 3 && (
            <span className="text-[10px] text-[var(--text-muted)] self-center">
              +{actions.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}