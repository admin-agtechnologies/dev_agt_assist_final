// src/app/(dashboard)/knowledge/_components/results/ChatbotConversationCard.tsx
// S46 — CSS vars sémantiques (remplace dark: hardcodés) + hover lift + i18n statuts
"use client";

import {
  MessageSquare, ArrowLeftRight, CalendarDays,
  Mail, BookOpen, Zap, User, ChevronRight,
} from "lucide-react";
import { useLanguage }    from "@/contexts/LanguageContext";
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

// ── Badge statut — CSS vars sémantiques (plus de dark: hardcodés) ────────────
const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  terminee:   { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
  transferee: { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  en_cours:   { bg: "var(--status-info-bg)",    text: "var(--status-info-text)" },
};

// ── Composant principal ───────────────────────────────────────────────────────
export function ChatbotConversationCard({ conv, onClick }: Props) {
  const { dictionary: d } = useLanguage();
  const tc                = d.knowledge.chatbot;
  const statuts           = tc.statuts as Record<string, string>;

  const rapport  = conv.rapport;
  const actions  = rapport?.actions ?? [];
  const hasRdv   = (rapport?.rdv_planifies ?? 0) > 0;
  const hasXfer  = conv.human_handoff;

  const statutVars = STATUT_VARS[conv.statut] ?? {
    bg:   "var(--bg)",
    text: "var(--text-muted)",
  };
  const statutLabel = statuts[conv.statut] ?? conv.statut;

  return (
    <button
      type="button"
      onClick={() => onClick(conv)}
      className="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]
        hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-0.5
        transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,211,102,0.12)" }}>
          <User className="w-4 h-4" style={{ color: "#25D366" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {conv.client_nom || conv.client_telephone}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
            {formatDateTime(conv.created_at)}
            {" · "}
            <MessageSquare className="w-3 h-3 inline-block" />
            {conv.nb_messages} msg
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: statutVars.bg, color: statutVars.text }}>
            {statutLabel}
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
              text-[10px] font-medium"
              style={{ background: "var(--status-success-bg)", color: "var(--status-success-text)" }}>
              <CalendarDays className="w-3 h-3" /> {tc.rdvPlanifie}
            </span>
          )}
          {hasXfer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              text-[10px] font-medium"
              style={{ background: "var(--status-warning-bg)", color: "var(--status-warning-text)" }}>
              <ArrowLeftRight className="w-3 h-3" /> {tc.transfertHumain}
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