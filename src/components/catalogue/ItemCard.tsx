// src/components/catalogue/ItemCard.tsx
"use client";
import type { ItemCatalogue } from "@/types/api/catalogue.types";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  item: ItemCatalogue;
  locale: Locale;
}

function formatPrix(item: ItemCatalogue, locale: Locale): string {
  if (item.est_gratuit) return locale === "fr" ? "Gratuit" : "Free";
  if (item.est_sur_devis) return locale === "fr" ? "Sur devis" : "On request";
  if (item.prix == null) return "—";
  return `${item.prix.toLocaleString()} ${item.devise}`;
}

export function ItemCard({ item, locale }: Props) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2.5 px-1 border-b border-[var(--border)] last:border-0 ${!item.disponible ? "opacity-50" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text)] truncate">{item.nom}</p>
        {item.description && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{item.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!item.disponible && (
          <span className="text-xs text-[var(--text-muted)] italic">
            {locale === "fr" ? "Indisponible" : "Unavailable"}
          </span>
        )}
        <span className="text-sm font-semibold text-[var(--primary)]">
          {formatPrix(item, locale)}
        </span>
      </div>
    </div>
  );
}