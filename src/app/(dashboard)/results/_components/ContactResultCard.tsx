// src/app/(dashboard)/results/_components/ContactResultCard.tsx
"use client";

import { User, Phone, Mail, Tag } from "lucide-react";
import { formatDateTime }         from "@/lib/utils";
import type { Contact } from "@/types/api/crm.types";

const STATUT_STYLE: Record<string, string> = {
  prospect: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contact:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  client:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface Props { item: Contact }

export function ContactResultCard({ item }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <User className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.nom_complet || item.nom}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Phone className="w-3 h-3" />{item.phone}
              </span>
              {item.email && (
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" />{item.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
          ${STATUT_STYLE[item.statut] ?? "bg-[var(--bg)] text-[var(--text-muted)]"}`}>
          {item.statut}
        </span>
      </div>
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
        {item.tags.slice(0, 4).map((tag: string) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5
              rounded-full bg-[var(--bg)] border border-[var(--border)]
              text-[10px] text-[var(--text-muted)]">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        {item.source} · {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}