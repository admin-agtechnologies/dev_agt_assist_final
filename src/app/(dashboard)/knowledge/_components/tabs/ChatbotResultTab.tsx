// src/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab.tsx
"use client";

import { useState, useCallback, useEffect }  from "react";
import { MessageSquare, Loader2 }             from "lucide-react";
import { conversationsRepository }            from "@/repositories/conversations.repository";
import { KnowledgeCardSkeleton }              from "../KnowledgeSkeleton";
import { ChatbotConversationCard }            from "../results/ChatbotConversationCard";
import { ConversationModal }                  from "@/components/shared/ConversationModal";
import type { Conversation }                  from "@/types/api";

const PAGE_SIZE = 20;

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
    return <div className="space-y-3">{[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>;
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
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              border border-[var(--border)] text-[var(--text-muted)]
              hover:bg-[var(--bg-card)] disabled:opacity-50 transition-colors"
          >
            {loadMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadMore ? "Chargement…" : `Voir plus (${total - items.length} restantes)`}
          </button>
        </div>
      )}

      {/* Modal unifié — même design que /bots */}
      {selected && (
        <ConversationModal
          conversation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}