// src/app/(dashboard)/results/_components/EmailResultCard.tsx
"use client";

import { Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDateTime }                     from "@/lib/utils";
import type { EmailLogResult }                from "@/types/api/results.types";

const STATUT_CONFIG = {
  envoye:     { style: "text-green-600",  Icon: CheckCircle2, label: "Envoyé"     },
  echec:      { style: "text-red-500",    Icon: XCircle,      label: "Échec"      },
  en_attente: { style: "text-yellow-600", Icon: Clock,        label: "En attente" },
};

const SOURCE_LABEL: Record<string, string> = {
  rappel: "Rappel", dossier: "Dossier", commande: "Commande",
  reservation: "Réservation", inscription: "Inscription",
};

interface Props { item: EmailLogResult }

export function EmailResultCard({ item }: Props) {
  const cfg = STATUT_CONFIG[item.statut as keyof typeof STATUT_CONFIG]
    ?? { style: "text-[var(--text-muted)]", Icon: Mail, label: item.statut };
  const { Icon, style, label } = cfg;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center
            justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">{item.sujet}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{item.destinataire}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-medium flex-shrink-0 ${style}`}>
          <Icon className="w-3.5 h-3.5" />{label}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        {item.source_type && (
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)]">
            {SOURCE_LABEL[item.source_type] ?? item.source_type}
          </span>
        )}
        <span>{formatDateTime(item.created_at)}</span>
      </div>

      {item.erreur && (
        <p className="mt-2 text-[11px] text-red-500 line-clamp-1">{item.erreur}</p>
      )}
    </div>
  );
}