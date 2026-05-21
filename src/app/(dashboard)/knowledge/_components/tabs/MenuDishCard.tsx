// src/app/(dashboard)/knowledge/_components/tabs/MenuDishCard.tsx
// S46 — Dish card pour le MenuTab redesign
// Hover: image scale + overlay actions + badge disponibilité
"use client";

import { ToggleLeft, ToggleRight, Pencil, Trash2, Loader2 } from "lucide-react";
import { resolveImage } from "@/lib/image-placeholder";
import { cn }           from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

interface Props {
  item:     CatalogueItemKB;
  theme:    { primary: string };
  saving:   boolean;
  locale:   string;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}

export function MenuDishCard({ item, theme, saving, locale, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className={cn(
      "group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      !item.disponible && "opacity-60",
    )}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={resolveImage(item.image_url, "plat", item.nom)}
          alt={item.nom}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay edit/delete au hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
          transition-opacity duration-200 flex items-center justify-center gap-3">
          <button type="button" onClick={onEdit}
            className="p-2.5 rounded-xl bg-white/90 text-gray-800
              hover:bg-white hover:scale-110 transition-all duration-150 shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} disabled={saving}
            className="p-2.5 rounded-xl bg-white/90 text-red-500
              hover:bg-white hover:scale-110 transition-all duration-150 shadow-sm disabled:opacity-50">
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Badge disponibilité */}
        <button type="button" onClick={onToggle} disabled={saving}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold backdrop-blur-sm bg-white/85 shadow-sm
            hover:bg-white transition-colors">
          {item.disponible
            ? <>
                <ToggleRight className="w-3 h-3" style={{ color: "var(--status-success-text)" }} />
                <span style={{ color: "var(--status-success-text)" }}>
                  {locale === "fr" ? "Dispo" : "Avail."}
                </span>
              </>
            : <>
                <ToggleLeft className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">
                  {locale === "fr" ? "Indispo" : "N/A"}
                </span>
              </>}
        </button>
      </div>

      {/* Contenu */}
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-[var(--text)] leading-tight line-clamp-1">
            {item.nom}
          </p>
          <span className="text-sm font-bold flex-shrink-0" style={{ color: theme.primary }}>
            {item.prix != null
              ? `${Number(item.prix).toLocaleString("fr-FR")} XAF`
              : (locale === "fr" ? "Sur devis" : "On quote")}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        {item.allergenes && item.allergenes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {item.allergenes.slice(0, 3).map((a) => (
              <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--status-warning-bg)",
                  color:      "var(--status-warning-text)",
                }}>
                {a}
              </span>
            ))}
            {item.allergenes.length > 3 && (
              <span className="text-[9px] text-[var(--text-muted)]">
                +{item.allergenes.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}