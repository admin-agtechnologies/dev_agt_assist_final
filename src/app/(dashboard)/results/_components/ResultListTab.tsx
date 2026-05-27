// src/app/(dashboard)/results/_components/ResultListTab.tsx
"use client";

import { useState, useEffect, useCallback }  from "react";
import { Loader2, type LucideIcon }          from "lucide-react";
import { useLanguage }                        from "@/contexts/LanguageContext";
import { ResultsEmptyState }                  from "./ResultsEmptyState";
import type { PaginatedResponse }             from "@/types/api";

const PAGE_SIZE = 20;

interface Props<T> {
  fetcher:       (params: { page: number; page_size: number }) => Promise<PaginatedResponse<T>>;
  renderCard:    (item: T) => React.ReactNode;
  emptyIcon?:    LucideIcon;
  emptyMessage?: string;
  emptyHint?:    string;
  cacheKey:      string;
}

export function ResultListTab<T extends { id: string }>({
  fetcher,
  renderCard,
  emptyIcon,
  emptyMessage,
  emptyHint,
  cacheKey,
}: Props<T>) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const [items,    setItems]    = useState<T[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [loadMore, setLoadMore] = useState(false);

  const fetchPage = useCallback(
    async (p: number, append = false) => {
      const res = await fetcher({ page: p, page_size: PAGE_SIZE });
      setTotal(res.count);
      setItems((prev) => append ? [...prev, ...res.results] : res.results);
    },
    [fetcher],
  );

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(1);
    fetchPage(1).finally(() => setLoading(false));
  }, [cacheKey]); // eslint-disable-line

  const handleLoadMore = () => {
    const next = page + 1;
    setLoadMore(true);
    fetchPage(next, true)
      .then(() => setPage(next))
      .finally(() => setLoadMore(false));
  };

  // ── Skeleton loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-[var(--border)] animate-pulse"
            style={{
              background: "var(--bg-card)",
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  const remaining = total - items.length;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Compteur ── */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            {total}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {total <= 1 ? t.resultCount_one.replace("{{count}}", String(total))
                        : t.resultCount_other.replace("{{count}}", String(total))}
          </span>
        </div>
      )}

      {/* ── État vide ── */}
      {items.length === 0 && (
        <ResultsEmptyState
          icon={emptyIcon}
          message={emptyMessage}
          hint={emptyHint}
        />
      )}

      {/* ── Liste avec stagger ── */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
          >
            {renderCard(item)}
          </div>
        ))}
      </div>

      {/* ── Load more ── */}
      {remaining > 0 && (
        <div className="flex justify-center pt-2">
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
              : t.loadMore.replace("{{count}}", String(remaining))
            }
          </button>
        </div>
      )}
    </div>
  );
}