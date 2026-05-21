// src/app/(dashboard)/knowledge/_components/tabs/ChatbotResultTab.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageSquare, Loader2 }            from "lucide-react";
import { useLanguage }                        from "@/contexts/LanguageContext";
import { conversationsRepository }            from "@/repositories/conversations.repository";
import { KnowledgeCardSkeleton }              from "../KnowledgeSkeleton";
import { ChatbotConversationCard }            from "../results/ChatbotConversationCard";
import { ConversationModal }                  from "@/components/shared/ConversationModal";
import type { Conversation }                  from "@/types/api";

const PAGE_SIZE = 20;

export function ChatbotResultTab() {
  const { dictionary: d } = useLanguage();
  const t = d.results;

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
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
      </div>
    );
  }

  const remaining = total - items.length;

  return (
    <>
      {/* ── Compteur ── */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color:      "var(--color-primary)",
            }}
          >
            {total}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {total <= 1
              ? t.resultCount_one.replace("{{count}}", String(total))
              : t.resultCount_other.replace("{{count}}", String(total))}
          </span>
        </div>
      )}

      {/* ── État vide ── */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)] animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
              <MessageSquare className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: "var(--color-primary)" }} />
          </div>
          <div className="space-y-1.5 max-w-xs px-4">
            <p className="text-sm font-semibold text-[var(--text)]">
              {t.emptyDefault}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed opacity-80">
              {t.emptyDefaultHint}
            </p>
          </div>
        </div>
      )}

      {/* ── Liste ── */}
      <div className="space-y-3">
        {items.map((conv, idx) => (
          <div
            key={conv.id}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
          >
            <ChatbotConversationCard conv={conv} onClick={setSelected} />
          </div>
        ))}
      </div>

      {/* ── Load more ── */}
      {remaining > 0 && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              border border-[var(--border)] text-[var(--text-muted)]
              hover:text-[var(--text)] hover:border-[var(--color-primary)]
              hover:shadow-sm disabled:opacity-50 transition-all duration-200"
          >
            {loadMore
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t.loading}</>
              : t.loadMore.replace("{{count}}", String(remaining))}
          </button>
        </div>
      )}

      {/* ── Modal conversation ── */}
      {selected && (
        <ConversationModal
          conversation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}