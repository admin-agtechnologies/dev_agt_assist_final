// src/components/catalogue/CatalogueCard.tsx
"use client";
import { BookOpen, Layers } from "lucide-react";
import type { Catalogue } from "@/types/api/catalogue.types";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  catalogue: Catalogue;
  locale: Locale;
  onClick?: () => void;
}

export function CatalogueCard({ catalogue, locale, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <BookOpen size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {catalogue.nom}
          </p>
          {!catalogue.is_active && (
            <span className="text-xs text-[var(--text-muted)] italic flex-shrink-0">
              {locale === "fr" ? "Inactif" : "Inactive"}
            </span>
          )}
        </div>
        {catalogue.description && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {catalogue.description}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] mt-1.5">
          <Layers size={11} />
          {catalogue.categories_count} {locale === "fr" ? "catégorie" : "categor"}{catalogue.categories_count > 1 ? "s" : (locale === "en" ? "y" : "")}
        </span>
      </div>
    </button>
  );
}