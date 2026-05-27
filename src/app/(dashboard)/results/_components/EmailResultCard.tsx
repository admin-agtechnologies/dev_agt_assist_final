// src/app/(dashboard)/results/_components/EmailResultCard.tsx
"use client";

import { Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useLanguage }                         from "@/contexts/LanguageContext";
import { formatDateTime }                      from "@/lib/utils";
import type { EmailLogResult }                 from "@/types/api/results.types";

const STATUT_VARS: Record<string, { bg: string; text: string; Icon: typeof Mail }> = {
  envoye:     { bg: "var(--status-success-bg)", text: "var(--status-success-text)", Icon: CheckCircle2 },
  echec:      { bg: "var(--status-danger-bg)",  text: "var(--status-danger-text)",  Icon: XCircle      },
  en_attente: { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)", Icon: Clock        },
};

interface Props { item: EmailLogResult }

export function EmailResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const cfg   = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)", Icon: Mail };
  const label = t.emailStatuses[item.statut as keyof typeof t.emailStatuses] ?? item.statut;
  const { Icon } = cfg;

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
            <Mail className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.sujet}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {item.destinataire}
            </p>
          </div>
        </div>

        {/* Badge statut avec icône */}
        <span
          className="flex items-center gap-1.5 text-[11px] font-semibold
            px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{ background: cfg.bg, color: cfg.text }}
        >
          <Icon className="w-3 h-3" />
          {label}
        </span>
      </div>

      {/* ── Footer ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]
        flex flex-wrap items-center gap-2">
        {item.source_type && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--border)]"
            style={{ background: "var(--bg)", color: "var(--text-muted)" }}
          >
            {t.emailSources[item.source_type as keyof typeof t.emailSources] ?? item.source_type}
          </span>
        )}
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {formatDateTime(item.created_at)}
        </span>
      </div>

      {/* ── Message d'erreur ── */}
      {item.erreur && (
        <p
          className="mt-2 text-[11px] line-clamp-1 font-medium"
          style={{ color: "var(--status-danger-text)" }}
        >
          {item.erreur}
        </p>
      )}
    </div>
  );
}