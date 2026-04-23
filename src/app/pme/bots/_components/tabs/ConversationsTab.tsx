// src/app/pme/bots/_components/tabs/ConversationsTab.tsx
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [convPage, setConvPage]       = useState(1);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalPages = Math.ceil(conversations.length / PAGE);
  const pagedConvs = conversations.slice((convPage - 1) * PAGE, convPage * PAGE);

  return (
    <div className="grid grid-cols-1 gap-4">
      {pagedConvs.length === 0 ? (
        <EmptyState message={t.conversationsEmpty} icon={MessageSquare} />
      ) : (
        pagedConvs.map(conv => (
          <div
            key={conv.id}
            onClick={() => setSelectedConv(conv)}
            className="group relative flex items-center gap-5 p-5 rounded-[2rem] bg-white border border-[var(--border)] cursor-pointer hover:border-[#075E54] hover:shadow-2xl hover:shadow-[#075E54]/5 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#075E54] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--bg)] to-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-black text-xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
              {conv.client_nom?.charAt(0) || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-base font-black text-[var(--text)] truncate group-hover:text-[#075E54] transition-colors">
                  {conv.client_nom || "Client anonyme"}
                </p>
                <Badge variant={conv.bot_type === "whatsapp" ? "green" : "violet"}
                  className="rounded-lg text-[9px] uppercase tracking-tighter">
                  {conv.bot_type === "whatsapp" ? "WhatsApp" : "Vocal"}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{conv.dernier_message}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatDateTime(conv.dernier_message_at)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-[var(--text)]">
                {conv.nb_messages} {t.conversationMessages}
              </p>
              {conv.human_handoff && (
                <p className="text-[10px] text-amber-500 font-semibold mt-1">Transfert humain</p>
              )}
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={convPage <= 1} onClick={() => setConvPage(p => p - 1)}
            className="p-2 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[var(--text-muted)]">{convPage} / {totalPages}</span>
          <button disabled={convPage >= totalPages} onClick={() => setConvPage(p => p + 1)}
            className="p-2 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Portal rapport */}
      {mounted && selectedConv && createPortal(
        <ConversationReportModal
          conversation={selectedConv}
          onClose={() => setSelectedConv(null)}
          d={d}
          colors={colors}
        />,
        document.body,
      )}
    </div>
  );
}