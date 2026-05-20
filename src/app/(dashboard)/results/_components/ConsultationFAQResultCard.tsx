// src/app/(dashboard)/results/_components/ConsultationFAQResultCard.tsx
"use client";

import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime }                  from "@/lib/utils";
import type { ConsultationFAQResult }      from "@/types/api/results.types";

interface Props { item: ConsultationFAQResult }

export function ConsultationFAQResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
          justify-center flex-shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] line-clamp-2">
            {item.question_posee}
          </p>
          {item.question_matchee_texte && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
              → {item.question_matchee_texte}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {item.a_trouve_reponse
            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
            : <XCircle className="w-4 h-4 text-red-400" />}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <span>{item.contact_nom}</span>
        <span>·</span>
        <span>{formatDateTime(item.created_at)}</span>
        {item.score_match != null && (
          <><span>·</span><span>Score {Math.round(item.score_match * 100)}%</span></>
        )}
      </div>
    </div>
  );
}