// src/app/(dashboard)/results/_components/InscriptionResultCard.tsx
"use client";

import { GraduationCap } from "lucide-react";
import { useLanguage }    from "@/contexts/LanguageContext";
import { formatDateTime } from "@/lib/utils";
import type { InscriptionResult } from "@/types/api/results.types";

const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  soumise:       { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
  en_etude:      { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  acceptee:      { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
  refusee:       { bg: "var(--status-danger-bg)",  text: "var(--status-danger-text)"  },
  liste_attente: { bg: "var(--status-purple-bg)",  text: "var(--status-purple-text)"  },
};

interface Props { item: InscriptionResult }

export function InscriptionResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const statuses = d.inscriptions.detail.statuses;

  const vars  = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label = statuses[item.statut as keyof typeof statuses] ?? item.statut;

  return (
    <div className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
      hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
      transition-all duration-200 cursor-default">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-transform duration-200 group-hover:scale-110"
            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
          >
            <GraduationCap className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom || item.contact}
            </p>
            {/* Infos filière — wrap sur mobile */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
              <span className="text-[11px] text-[var(--text-muted)]">{item.filiere}</span>
              <span className="text-[var(--border)]">·</span>
              <span className="text-[11px] text-[var(--text-muted)]">{item.niveau}</span>
              <span className="text-[var(--border)]">·</span>
              <span className="text-[11px] text-[var(--text-muted)]">{item.annee_scolaire}</span>
            </div>
          </div>
        </div>

        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{ background: vars.bg, color: vars.text }}
        >
          {label}
        </span>
      </div>

      {/* ── Date ── */}
      <p className="mt-3 pt-3 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
        {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}