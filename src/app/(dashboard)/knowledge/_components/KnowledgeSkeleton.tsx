// src/app/(dashboard)/knowledge/_components/KnowledgeSkeleton.tsx
"use client";

/** Skeleton générique pour une card formulaire (EntrepriseTab, etc.) */
export function KnowledgeCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 space-y-4 animate-pulse">
      <div className="h-3 w-28 bg-[var(--border)] rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-[var(--border)] rounded-xl" />
        <div className="h-10 bg-[var(--border)] rounded-xl" />
      </div>
      <div className="h-10 bg-[var(--border)] rounded-xl" />
      <div className="h-10 w-2/3 bg-[var(--border)] rounded-xl" />
    </div>
  );
}

/** Skeleton pour la vue split liste / panel agences */
export function AgenceListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-16 bg-[var(--border)] rounded" />
          <div className="h-7 w-28 bg-[var(--border)] rounded-lg" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]"
          />
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden animate-pulse">
        <div className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)]" />
        <div className="p-5 space-y-3">
          <div className="h-3 w-32 bg-[var(--border)] rounded" />
          <div className="h-10 bg-[var(--border)] rounded-xl" />
          <div className="h-10 bg-[var(--border)] rounded-xl" />
          <div className="h-10 w-2/3 bg-[var(--border)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton pour la liste FAQ */
export function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 space-y-2"
        >
          <div className="h-4 w-3/4 bg-[var(--border)] rounded" />
          <div className="h-3 w-1/2 bg-[var(--border)] rounded" />
        </div>
      ))}
    </div>
  );
}