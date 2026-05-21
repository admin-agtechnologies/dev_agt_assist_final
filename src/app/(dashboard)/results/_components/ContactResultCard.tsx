// src/app/(dashboard)/results/_components/ContactResultCard.tsx
"use client";

import { User, Phone, Mail, Tag } from "lucide-react";
import { useLanguage }             from "@/contexts/LanguageContext";
import { formatDateTime }          from "@/lib/utils";
import type { Contact }            from "@/types/api/crm.types";

const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  prospect: { bg: "var(--status-info-bg)",    text: "var(--status-info-text)"    },
  contact:  { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)" },
  client:   { bg: "var(--status-success-bg)", text: "var(--status-success-text)" },
};

interface Props { item: Contact }

export function ContactResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;

  const vars  = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label = t.contactStatuses[item.statut as keyof typeof t.contactStatuses] ?? item.statut;

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
            <User className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.nom_complet || item.nom}
            </p>
            {/* Contacts inline — responsive wrap sur mobile */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Phone className="w-3 h-3" />{item.phone}
              </span>
              {item.email && (
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 truncate max-w-[140px]">
                  <Mail className="w-3 h-3" />{item.email}
                </span>
              )}
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

      {/* ── Tags ── */}
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-1.5">
          {item.tags.slice(0, 5).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                text-[10px] font-medium border border-[var(--border)]"
              style={{ background: "var(--bg)", color: "var(--text-muted)" }}
            >
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        {item.source} · {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}