// src/app/(dashboard)/results/_components/ConsultationFAQResultCard.tsx
"use client";

import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage }                      from "@/contexts/LanguageContext";
import { formatDateTime }                   from "@/lib/utils";
import type { ConsultationFAQResult }       from "@/types/api/results.types";

interface Props { item: ConsultationFAQResult }

export function ConsultationFAQResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  return (
    <div className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
      hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
      transition-all duration-200 cursor-default">

      <div className="flex items-start gap-3">
        {/* Icône */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
            transition-transform duration-200 group-hover:scale-110"
          style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        >
          <BookOpen className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] line-clamp-2 leading-snug">
            {item.question_posee}
          </p>
          {item.question_matchee_texte && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
              → {item.question_matchee_texte}
            </p>
          )}
        </div>

        {/* Indicateur réponse */}
        <div
          className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold
            px-2 py-1 rounded-lg"
          style={{
            background: item.a_trouve_reponse ? "var(--status-success-bg)" : "var(--status-danger-bg)",
            color:      item.a_trouve_reponse ? "var(--status-success-text)" : "var(--status-danger-text)",
          }}
        >
          {item.a_trouve_reponse
            ? <><CheckCircle2 className="w-3 h-3" />{t.faqAnswered}</>
            : <><XCircle className="w-3 h-3" />{t.faqUnanswered}</>
          }
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]
        flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-muted)]">
        <span>{item.contact_nom}</span>
        <span>·</span>
        <span>{formatDateTime(item.created_at)}</span>
        {item.score_match != null && (
          <>
            <span>·</span>
            <span
              className="font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              {t.score} {Math.round(item.score_match * 100)}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}