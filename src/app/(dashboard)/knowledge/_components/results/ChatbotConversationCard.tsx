"use client";
// src/app/(dashboard)/knowledge/_components/results/ChatbotConversationCard.tsx
// Card conversation pour les sessions de test — branché sur AIConversation.
// S59 — migration Conversation → AIConversation (apps.agent).

import {
  MessageSquare, ArrowLeftRight, CalendarDays,
  Mail, BookOpen, Zap, User, ChevronRight,
} from "lucide-react";
import { useLanguage }    from "@/contexts/LanguageContext";
import { formatDateTime } from "@/lib/utils";
import type { AIConversation, AIActionDeclenchee } from "@/types/api/agent.types";

interface Props {
  conv:    AIConversation;
  onClick: (conv: AIConversation) => void;
}

// ── Icône par slug d'action ────────────────────────────────────────────────────
const ACTION_ICON: Record<string, React.ElementType> = {
  transfer_to_human:  ArrowLeftRight,
  create_reservation: CalendarDays,
  send_email:         Mail,
  send_reminder:      Mail,
  search_faq:         BookOpen,
};

function ActionChip({ action }: { action: AIActionDeclenchee }) {
  const Icon = ACTION_ICON[action.action_slug] ?? Zap;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[10px] text-[var(--text-muted)]">
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[120px]">{action.action_slug}</span>
    </span>
  );
}

// ── Badge statut ──────────────────────────────────────────────────────────────
const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  terminee:   { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
  transferee: { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  active:     { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
};

const STATUT_LABELS: Record<string, { fr: string; en: string }> = {
  active:     { fr: "Active",     en: "Active"     },
  terminee:   { fr: "Terminée",   en: "Ended"      },
  transferee: { fr: "Transférée", en: "Transferred" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getContactNom(conv: AIConversation): string {
  const ctx     = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact = ctx.contact as Record<string, string> | undefined;
  return contact?.nom ?? (conv.contact as { nom?: string } | null)?.nom ?? "Client";
}

function getContactPhone(conv: AIConversation): string | undefined {
  const ctx     = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact = ctx.contact as Record<string, string> | undefined;
  return contact?.phone;
}

function getSummary(conv: AIConversation): string | undefined {
  const ctx = (conv.contexte ?? {}) as Record<string, unknown>;
  return ctx.summary as string | undefined;
}

function getNbMessages(conv: AIConversation): number {
  return (conv.messages ?? []).filter(
    (m) => m.role === "user" || m.role === "assistant",
  ).length;
}

function hasRdvAction(conv: AIConversation): boolean {
  return (conv.actions_declenchees ?? []).some(
    (a) => a.action_slug.includes("reservation") || a.action_slug === "create_reservation",
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function ChatbotConversationCard({ conv, onClick }: Props) {
  const { locale, dictionary: d } = useLanguage();
  const tc = d.knowledge.chatbot;

  const actions    = (conv.actions_declenchees ?? []).filter((a) => a.statut === "succes");
  const isTransfer = conv.statut === "transferee";
  const statutVars = STATUT_VARS[conv.statut] ?? { bg: "var(--bg)", text: "var(--text-muted)" };
  const statutLabel = STATUT_LABELS[conv.statut]?.[locale] ?? conv.statut;
  const nom   = getContactNom(conv);
  const phone = getContactPhone(conv);

  return (
    <button
      type="button"
      onClick={() => onClick(conv)}
      className="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,211,102,0.12)" }}
        >
          <User className="w-4 h-4" style={{ color: "#25D366" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {nom}{phone ? ` · ${phone}` : ""}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
            {formatDateTime(conv.created_at)}
            {" · "}
            <MessageSquare className="w-3 h-3 inline-block" />
            {getNbMessages(conv)} msg
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: statutVars.bg, color: statutVars.text }}
          >
            {statutLabel}
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Résumé contexte */}
      {getSummary(conv) && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {getSummary(conv)}
          </p>
        </div>
      )}

      {/* Badges actions */}
      {(hasRdvAction(conv) || isTransfer || actions.length > 0) && (
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {hasRdvAction(conv) && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: "var(--status-success-bg)", color: "var(--status-success-text)" }}
            >
              <CalendarDays className="w-3 h-3" />{tc.rdvPlanifie}
            </span>
          )}
          {isTransfer && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: "var(--status-warning-bg)", color: "var(--status-warning-text)" }}
            >
              <ArrowLeftRight className="w-3 h-3" />{tc.transfertHumain}
            </span>
          )}
          {actions.slice(0, 3).map((a) => (
            <ActionChip key={a.id} action={a} />
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