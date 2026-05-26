// src/app/(dashboard)/knowledge/_components/KnowledgeSkeleton.tsx
// S46 — Ajout ChambreCardSkeleton (zone image) + MenuDishSkeleton + améliorations visuelles
"use client";

/** Skeleton générique — formulaire carte (EntrepriseTab, etc.) */
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

/** Skeleton card avec zone image en haut (ChambreCard, MenuDishCard) */
export function ImageCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden animate-pulse">
      {/* Zone image */}
      <div className="h-40 bg-[var(--border)]" />
      {/* Contenu */}
      <div className="p-4 space-y-3">
        <div className="h-3.5 w-3/4 bg-[var(--border)] rounded-full" />
        <div className="h-3 w-1/2 bg-[var(--border)] rounded-full" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-[var(--border)] rounded-full" />
          <div className="h-5 w-20 bg-[var(--border)] rounded-full" />
          <div className="h-5 w-12 bg-[var(--border)] rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Alias sémantique pour les chambres */
export function ChambreCardSkeleton() {
  return <ImageCardSkeleton />;
}

/** Skeleton vue split liste / panel agences */
export function AgenceListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-16 bg-[var(--border)] rounded" />
          <div className="h-7 w-28 bg-[var(--border)] rounded-lg" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]" />
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

/** Skeleton FAQ — lignes accordion */
export function FaqSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
            flex items-center gap-3">
          <div className="h-6 w-16 bg-[var(--border)] rounded-full flex-shrink-0" />
          <div className="flex-1 h-4 bg-[var(--border)] rounded-full" style={{ width: `${55 + (i * 11) % 35}%` }} />
          <div className="h-4 w-16 bg-[var(--border)] rounded-full flex-shrink-0" />
          <div className="h-4 w-4 bg-[var(--border)] rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton pills catégories + grille plats (MenuTab) */
export function MenuTabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Pills */}
      <div className="flex gap-2">
        {[80, 110, 90, 120, 95].map((w, i) => (
          <div key={i} className="h-8 rounded-full bg-[var(--border)]" style={{ width: w }} />
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <ImageCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

/** Skeleton conversations chatbot */
export function ConversationCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[var(--border)] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 bg-[var(--border)] rounded-full" />
          <div className="h-3 w-48 bg-[var(--border)] rounded-full" />
        </div>
        <div className="h-5 w-16 bg-[var(--border)] rounded-full flex-shrink-0" />
      </div>
      <div className="h-3 w-full bg-[var(--border)] rounded-full mb-2" />
      <div className="h-3 w-3/4 bg-[var(--border)] rounded-full" />
    </div>
  );
}