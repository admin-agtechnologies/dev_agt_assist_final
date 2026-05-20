// src/app/(dashboard)/results/_components/ResultListTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, type LucideIcon }         from "lucide-react";
import { ResultsEmptyState }                from "./ResultsEmptyState";
import type { PaginatedResponse }           from "@/types/api";

const PAGE_SIZE = 20;

interface Props<T> {
  // Fonction de fetch — reçoit {page, page_size, ...filters}
  fetcher:      (params: { page: number; page_size: number }) => Promise<PaginatedResponse<T>>;
  renderCard:   (item: T) => React.ReactNode;
  emptyIcon?:   LucideIcon;
  emptyMessage?: string;
  emptyHint?:   string;
  // Clé unique pour reset quand le tab change
  cacheKey:     string;
}

export function ResultListTab<T extends { id: string }>({
  fetcher,
  renderCard,
  emptyIcon,
  emptyMessage,
  emptyHint,
  cacheKey,
}: Props<T>) {
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

  // Reset + reload on cacheKey change
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg-card)]
            border border-[var(--border)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compteur */}
      <p className="text-sm text-[var(--text-muted)]">
        {total} résultat{total !== 1 ? "s" : ""}
      </p>

      {/* Vide */}
      {items.length === 0 && (
        <ResultsEmptyState
          icon={emptyIcon}
          message={emptyMessage}
          hint={emptyHint}
        />
      )}

      {/* Liste */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>{renderCard(item)}</div>
        ))}
      </div>

      {/* Load more */}
      {items.length < total && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              border border-[var(--border)] text-[var(--text-muted)]
              hover:bg-[var(--bg-card)] disabled:opacity-50 transition-colors"
          >
            {loadMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadMore ? "Chargement…" : `Voir plus (${total - items.length} restants)`}
          </button>
        </div>
      )}
    </div>
  );
}