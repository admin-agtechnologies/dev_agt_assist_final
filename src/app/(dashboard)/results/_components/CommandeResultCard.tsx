// src/app/(dashboard)/results/_components/CommandeResultCard.tsx
"use client";

import { ShoppingBag, CheckCircle2, Circle } from "lucide-react";
import { useLanguage }                        from "@/contexts/LanguageContext";
import { formatDateTime }                     from "@/lib/utils";
import type { CommandeResult }                from "@/types/api/results.types";

// Mapping statut → variables CSS sémantiques
const STATUT_VARS: Record<string, { bg: string; text: string }> = {
  confirmee:      { bg: "var(--status-success-bg)",  text: "var(--status-success-text)"  },
  livree:         { bg: "var(--status-success-bg)",  text: "var(--status-success-text)"  },
  en_attente:     { bg: "var(--status-warning-bg)",  text: "var(--status-warning-text)"  },
  en_preparation: { bg: "var(--status-info-bg)",     text: "var(--status-info-text)"     },
  prete:          { bg: "var(--status-purple-bg)",   text: "var(--status-purple-text)"   },
  annulee:        { bg: "var(--status-danger-bg)",   text: "var(--status-danger-text)"   },
};

interface Props { item: CommandeResult }

export function CommandeResultCard({ item }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.results;
  const tc = d.commandes;

  const vars    = STATUT_VARS[item.statut] ?? { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)" };
  const label   = tc.statuses[item.statut as keyof typeof tc.statuses] ?? item.statut;
  const montant = new Intl.NumberFormat("fr-FR").format(Number(item.montant_total));

  return (
    <div className="group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4
      hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30
      transition-all duration-200 cursor-default">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icône sectorielle */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-transform duration-200 group-hover:scale-110"
            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
          >
            <ShoppingBag className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">
              {item.contact_nom}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {item.contact_phone}
            </p>
          </div>
        </div>

        {/* Badge statut */}
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{ background: vars.bg, color: vars.text }}
        >
          {label}
        </span>
      </div>

      {/* ── Séparateur ── */}
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
        {/* Montant */}
        <p className="text-base font-black text-[var(--text)]">
          {montant}{" "}
          <span className="text-xs font-normal text-[var(--text-muted)]">{item.devise}</span>
        </p>

        {/* Paiement */}
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg"
          style={{
            background: item.est_paye ? "var(--status-success-bg)" : "var(--status-neutral-bg)",
            color:      item.est_paye ? "var(--status-success-text)" : "var(--status-neutral-text)",
          }}
        >
          {item.est_paye
            ? <><CheckCircle2 className="w-3.5 h-3.5" />{t.paid}</>
            : <><Circle className="w-3.5 h-3.5" />{t.unpaid}</>
          }
        </div>
      </div>

      {/* ── Date ── */}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        {formatDateTime(item.created_at)}
      </p>
    </div>
  );
}