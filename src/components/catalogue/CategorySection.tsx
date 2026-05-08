// src/components/catalogue/CategorySection.tsx
"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ItemCard } from "./ItemCard";
import type { CategorieCatalogue } from "@/types/api/catalogue.types";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  categorie: CategorieCatalogue;
  locale: Locale;
}

export function CategorySection({ categorie, locale }: Props) {
  const [open, setOpen] = useState(true);

  if (!categorie.is_active) return null;

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors"
      >
        <h3 className="text-sm font-bold text-[var(--text)]">{categorie.nom}</h3>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="text-xs">{categorie.items.length}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {open && (
        <div className="px-5 py-1">
          {categorie.items.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-3 text-center italic">
              {locale === "fr" ? "Aucun item" : "No items"}
            </p>
          ) : (
            categorie.items.map((item) => (
              <ItemCard key={item.id} item={item} locale={locale} />
            ))
          )}
        </div>
      )}
    </div>
  );
}