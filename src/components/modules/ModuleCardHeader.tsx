// src/components/modules/ModuleCardHeader.tsx
// S30 (Gabriel) — Extrait de ModuleCard pour modularisation.
// Header de la carte : icône dynamique, nom + badge "Recommandé",
// étoile favoris (désactivée si module actif), badge de statut.
"use client";
import * as LucideIcons from "lucide-react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketModule } from "@/repositories/features.repository";
import type { Locale } from "@/contexts/LanguageContext";

// ── DynamicIcon ───────────────────────────────────────────────────────────────

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const pascal = name
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  const Icon = icons[pascal] ?? LucideIcons.Zap;
  return <Icon className={className} />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  m:            MarketModule;
  displayName:  string;
  isDesired:    boolean;
  primaryColor: string;
  locale:       Locale;
  onToggleDesired: (e: React.MouseEvent) => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ModuleCardHeader({
  m,
  displayName,
  isDesired,
  primaryColor,
  locale,
  onToggleDesired,
}: Props) {
  const statusBadge = {
    active:           { text: locale === "fr" ? "Actif"      : "Active",     cls: "bg-green-100 text-green-700" },
    available:        { text: locale === "fr" ? "Disponible" : "Available",  cls: "bg-blue-100 text-blue-700" },
    upgrade_required: { text: locale === "fr" ? "Upgrade"    : "Upgrade",    cls: "bg-orange-100 text-orange-700" },
  }[m.status];

  // Étoile favoris : toujours visible, mais désactivée (indicateur seul) si module actif
  const starDisabled = m.is_active;
  const starTitle = starDisabled
    ? (locale === "fr" ? "Module déjà actif" : "Module already active")
    : isDesired
      ? (locale === "fr" ? "Retirer des favoris" : "Remove from favorites")
      : (locale === "fr" ? "Ajouter aux favoris" : "Add to favorites");

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <DynamicIcon name={m.icone} className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-[var(--text)] truncate">{displayName}</p>
          {m.is_native_sector && m.status !== "active" && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              <Star className="w-2.5 h-2.5" />
              {locale === "fr" ? "Recommandé" : "Recommended"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={starDisabled ? undefined : onToggleDesired}
          disabled={starDisabled}
          title={starTitle}
          aria-label={starTitle}
          className={cn(
            "p-1 rounded-lg transition-colors",
            starDisabled
              ? "cursor-default opacity-60"
              : "hover:bg-[var(--bg)]",
          )}
        >
          <Star
            className={cn(
              "w-4 h-4 transition-colors",
              isDesired
                ? "fill-yellow-400 text-yellow-400"
                : starDisabled
                  ? "text-[var(--text-muted)]"
                  : "text-[var(--text-muted)] hover:text-yellow-400",
            )}
          />
        </button>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", statusBadge.cls)}>
          {statusBadge.text}
        </span>
      </div>
    </div>
  );
}