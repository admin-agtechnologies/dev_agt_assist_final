// src/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab.tsx
"use client";

import { useState, useEffect, useCallback }   from "react";
import { MessageSquare, Loader2, X, User, Bot } from "lucide-react";
import { createPortal }                        from "react-dom";
import { conversationsRepository }             from "@/repositories/conversations.repository";
import { KnowledgeCardSkeleton }               from "../KnowledgeSkeleton";
import { ChatbotConversationCard }             from "../results/ChatbotConversationCard";
import { formatDateTime }                      from "@/lib/utils";
import type { Conversation }                   from "@/types/api";

const PAGE_SIZE = 20;

// ── Modal rapport + conversation ──────────────────────────────────────────────
function ConversationDetailModal({
  conv,
  onClose,
}: {
  conv: Conversation;
  onClose: () => void;
}) {
  const [messages, setMessages]     = useState<{ role: string; contenu: string; created_at?: string }[]>([]);
  const [showChat, setShowChat]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const handleShowChat = () => {
    if (messages.length > 0) { setShowChat(true); return; }
    setLoadingMsg(true);
    conversationsRepository
      .getMessages(conv.id)
      .then((data) => {
        setMessages(data as { role: string; contenu: string; created_at?: string }[]);
        setShowChat(true);
      })
      .finally(() => setLoadingMsg(false));
  };

  const rapport = conv.rapport;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center
      bg-black/50 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative bg-[var(--bg-card)] rounded-3xl w-full shadow-2xl
        border border-[var(--border)] flex overflow-hidden
        transition-all duration-300
        ${showChat ? "max-w-3xl" : "max-w-lg"}
        max-h-[85vh]`}>

        {/* ── Panneau rapport ── */}
        <div className="flex flex-col flex-shrink-0 w-full sm:w-80 max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center
              justify-center text-[#25D366] flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--text)] truncate">
                {conv.client_nom || conv.client_telephone}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full
                  bg-[#25D366]/10 text-[#25D366]">
                  Canal WhatsApp
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {formatDateTime(conv.created_at)}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg)] hover:opacity-70 flex
                items-center justify-center text-[var(--text-muted)] flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corps rapport */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Rapport de conversation
            </p>

            {rapport?.resume && (
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text)] mb-1">Résumé</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{rapport.resume}</p>
              </div>
            )}

            {rapport && (rapport.rdv_planifies > 0 || conv.human_handoff) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                    RDV planifié
                  </p>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {rapport.rdv_planifies > 0 ? `${rapport.rdv_planifies} RDV` : "Aucun RDV"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                    Transfert humain
                  </p>
                  <p className={`text-sm font-semibold ${conv.human_handoff ? "text-amber-600" : "text-[var(--text)]"}`}>
                    {conv.human_handoff ? "⚠️ Transféré" : "Pas de transfert"}
                  </p>
                </div>
              </div>
            )}

            {rapport?.points_cles && rapport.points_cles.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text)] mb-2">Points clés</p>
                <ul className="space-y-1">
                  {rapport.points_cles.map((pt, i) => (
                    <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                      <span className="text-[#25D366] mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rapport?.actions && rapport.actions.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text)] mb-2">Actions effectuées</p>
                <div className="space-y-1.5">
                  {rapport.actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 flex items-center
                        justify-center flex-shrink-0">
                        <MessageSquare className="w-3 h-3 text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text)]">{a.label}</p>
                        {a.detail && <p className="text-[10px] text-[var(--text-muted)]">{a.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer — bouton voir conversation */}
          <div className="p-4 border-t border-[var(--border)]">
            <button
              onClick={handleShowChat}
              disabled={loadingMsg}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                text-sm font-medium bg-[var(--accent)]/10 text-[var(--accent)]
                hover:bg-[var(--accent)]/20 disabled:opacity-50 transition-colors"
            >
              {loadingMsg
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <MessageSquare className="w-4 h-4" />}
              {showChat ? "Masquer le chat" : "Voir la conversation"}
            </button>
          </div>
        </div>

        {/* ── Panneau messages ── */}
        {showChat && (
          <div className="flex-1 border-l border-[var(--border)] flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[var(--border)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Discussion WhatsApp
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-8">
                  Aucun message enregistré
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}>
                    {msg.role !== "client" && (
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center
                        justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Bot className="w-3 h-3 text-[var(--accent)]" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm
                      ${msg.role === "client"
                        ? "bg-[#25D366] text-white rounded-br-sm"
                        : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-bl-sm"
                      }`}>
                      {msg.contenu}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-[var(--border)]">
              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Fin de discussion
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ── Tab principal ─────────────────────────────────────────────────────────────
export function ChatbotResultTab() {
  const [items,    setItems]    = useState<Conversation[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    conversationsRepository
      .getList({ page: 1, page_size: PAGE_SIZE })
      .then((res) => { setItems(res.results); setTotal(res.count); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleLoadMore = useCallback(() => {
    const next = page + 1;
    setLoadMore(true);
    conversationsRepository
      .getList({ page: next, page_size: PAGE_SIZE })
      .then((res) => { setItems((p) => [...p, ...res.results]); setPage(next); })
      .finally(() => setLoadMore(false));
  }, [page]);

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-muted)]">
          {total} conversation{total !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <MessageSquare className="w-8 h-8 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucune conversation enregistrée</p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs opacity-70">
            Les conversations WhatsApp traitées par le bot apparaîtront ici.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((conv) => (
          <ChatbotConversationCard key={conv.id} conv={conv} onClick={setSelected} />
        ))}
      </div>

      {items.length < total && (
        <div className="flex justify-center pt-4">
          <button type="button" onClick={handleLoadMore} disabled={loadMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              border border-[var(--border)] text-[var(--text-muted)]
              hover:bg-[var(--bg-card)] disabled:opacity-50 transition-colors">
            {loadMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadMore ? "Chargement…" : `Voir plus (${total - items.length} restantes)`}
          </button>
        </div>
      )}

      {selected && (
        <ConversationDetailModal conv={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}