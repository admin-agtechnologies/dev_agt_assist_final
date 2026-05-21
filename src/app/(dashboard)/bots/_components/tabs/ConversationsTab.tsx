// src/app/(dashboard)/bots/_components/tabs/ConversationsTab.tsx
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Conversation } from "@/types/api";
import { ConversationReportModal } from "../ConversationReportModal";

const PAGE = 5;

interface ConversationsTabProps {
  conversations: Conversation[];
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
}

export function ConversationsTab({ conversations, d, colors }: ConversationsTabProps) {
  const t = d.bots;
  const [convPage, setConvPage]         = useState(1);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalPages = Math.ceil(conversations.length / PAGE);
  const pagedConvs = conversations.slice((convPage - 1) * PAGE, convPage * PAGE);

  return (
    <div className="space-y-3">
      {pagedConvs.length === 0 ? (
        <EmptyState message={t.conversationsEmpty} icon={MessageSquare} />
      ) : (
        pagedConvs.map((conv, idx) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConv(conv)}
            className="group relative flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] cursor-pointer transition-all duration-300 overflow-hidden hover:border-transparent hover:shadow-xl"
            style={{
              background: "var(--bg-card)",
              // @ts-ignore
              "--hover-shadow": `0 8px 32px ${colors.primary}15`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${colors.primary}20`;
              (e.currentTarget as HTMLElement).style.borderColor = `${colors.primary}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.borderColor = "";
            }}
          >
            {/* Barre latérale colorée au hover */}
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: colors.primary }}
            />

            {/* Avatar initiale */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}cc, ${colors.primary}88)`,
              }}
            >
              {conv.client_nom?.charAt(0)?.toUpperCase() || "C"}
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-black text-[var(--text)] truncate transition-colors duration-200 group-hover:text-[var(--text)]">
                  {conv.client_nom || "Client anonyme"}
                </p>
                <Badge
                  variant={conv.bot_type === "whatsapp" ? "green" : "violet"}
                  className="rounded-lg text-[9px] uppercase tracking-tighter flex-shrink-0"
                >
                  {conv.bot_type === "whatsapp" ? "WhatsApp" : "Vocal"}
                </Badge>
                {conv.human_handoff && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    Transfert
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate leading-relaxed">
                {conv.dernier_message || "—"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                {formatDateTime(conv.dernier_message_at)}
              </p>
            </div>

            {/* Méta droite */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div
                className="px-2.5 py-1 rounded-xl text-xs font-black"
                style={{
                  background: `${colors.primary}15`,
                  color: colors.primary,
                }}
              >
                {conv.nb_messages} msg
              </div>
              <ArrowRight
                className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
          </div>
        ))
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            disabled={convPage <= 1}
            onClick={() => setConvPage((p) => p - 1)}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] disabled:opacity-30 hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--text)]" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setConvPage(p)}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-black transition-all duration-200",
                  p === convPage
                    ? "text-white scale-110"
                    : "text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]",
                )}
                style={p === convPage ? { background: colors.primary } : {}}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={convPage >= totalPages}
            onClick={() => setConvPage((p) => p + 1)}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] disabled:opacity-30 hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 text-[var(--text)]" />
          </button>
        </div>
      )}

      {/* Portal rapport */}
      {mounted && selectedConv &&
        createPortal(
          <ConversationReportModal
            conversation={selectedConv}
            onClose={() => setSelectedConv(null)}
            colors={colors}
          />,
          document.body,
        )}
    </div>
  );
}