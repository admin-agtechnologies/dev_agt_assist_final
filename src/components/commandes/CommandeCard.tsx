// src/components/commandes/CommandeCard.tsx
"use client";
import { User, Phone, ShoppingBag } from "lucide-react";
import { CommandeStatusBadge } from "./CommandeStatusBadge";
import type { Commande } from "@/types/api/commande.types";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  commande: Commande;
  locale: Locale;
  onClick?: () => void;
}

export function CommandeCard({ commande, locale, onClick }: Props) {
  const total = `${commande.montant_total.toLocaleString()} ${commande.devise}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <ShoppingBag size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {commande.contact_nom}
          </p>
          <CommandeStatusBadge statut={commande.statut} locale={locale} />
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {commande.contact_phone}
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag size={11} />
            {commande.lignes.length} article{commande.lignes.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-bold text-[var(--text)]">{total}</p>
          {commande.est_paye && (
            <span className="text-xs text-green-600 font-semibold">✓ Payé</span>
          )}
        </div>
      </div>
    </button>
  );
}