// src/components/reservations/RessourceManager/index.tsx
"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, CalendarClock, ToggleLeft, ToggleRight,
  LayoutGrid, Bus, Stethoscope, Boxes, Users,
} from "lucide-react";
import { RessourceForm }     from "./RessourceForm";
import { DisponibiliteGrid } from "./DisponibiliteGrid";
import { cn } from "@/lib/utils";
import type {
  Ressource, CreateRessourcePayload, DisponibiliteRessource,
} from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

// ── Config visuelle par type ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  icon:      React.ElementType;
  color:     string;
  metaLabel: (m: Record<string, unknown>) => string | null;
}> = {
  table:     {
    icon:      LayoutGrid,
    color:     "from-amber-500/20 to-amber-500/40",
    metaLabel: (m) => [m.zone, m.numero ? `N°${String(m.numero)}` : null].filter(Boolean).join(" · ") || null,
  },
  trajet:    {
    icon:      Bus,
    color:     "from-blue-500/20 to-blue-500/40",
    metaLabel: (m) => (m.depart && m.destination) ? `${String(m.depart)} → ${String(m.destination)}` : null,
  },
  praticien: {
    icon:      Stethoscope,
    color:     "from-emerald-500/20 to-emerald-500/40",
    metaLabel: (m) => m.specialite ? String(m.specialite) : null,
  },
};

const FALLBACK_CONFIG = {
  icon:      Boxes,
  color:     "from-[var(--primary)]/20 to-[var(--primary)]/40",
  metaLabel: () => null,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface RessourceManagerProps {
  ressources:           Ressource[];
  featureSlug:          string;
  ressourceType:        string;
  locale:               Locale;
  onCreateRessource:    (payload: CreateRessourcePayload) => Promise<void>;
  onUpdateRessource:    (id: string, payload: Partial<CreateRessourcePayload>) => Promise<void>;
  onDeleteRessource:    (id: string) => Promise<void>;
  onToggleRessource:    (id: string, est_active: boolean) => Promise<void>;
  onLoadDisponibilites: (ressourceId: string) => Promise<DisponibiliteRessource[]>;
  onSaveDisponibilites: (
    ressourceId: string,
    disponibilites: Omit<DisponibiliteRessource, "id" | "est_active">[]
  ) => Promise<void>;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function RessourceManager({
  ressources, featureSlug, ressourceType, locale,
  onCreateRessource, onUpdateRessource, onDeleteRessource, onToggleRessource,
  onLoadDisponibilites, onSaveDisponibilites,
}: RessourceManagerProps) {
  const cfg  = TYPE_CONFIG[ressourceType] ?? FALLBACK_CONFIG;
  const Icon = cfg.icon;

  const [showAdd,    setShowAdd]    = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [dispoId,    setDispoId]    = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDeleteRessource(id); }
    finally { setDeletingId(null); }
  };

  // Ressource dont le panneau dispo est actuellement ouvert
  const dispoRessource = ressources.find((r) => r.id === dispoId) ?? null;

  const labelAdd = {
    table:     locale === "fr" ? "Ajouter une table"   : "Add table",
    trajet:    locale === "fr" ? "Ajouter un trajet"   : "Add route",
    praticien: locale === "fr" ? "Ajouter un médecin"  : "Add doctor",
  }[ressourceType] ?? (locale === "fr" ? "Ajouter une ressource" : "Add resource");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {ressources.length} ressource{ressources.length !== 1 ? "s" : ""}
        </p>
        {!showAdd && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {labelAdd}
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <RessourceForm
          mode="create"
          featureSlug={featureSlug}
          ressourceType={ressourceType}
          locale={locale}
          onSave={async (payload) => {
            await onCreateRessource(payload);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* État vide */}
      {ressources.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Icon className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {locale === "fr" ? "Aucune ressource configurée." : "No resources configured."}
          </p>
        </div>
      )}

      {/* Grid de cards — l'accordéon dispo est SORTI du grid (voir panneau ci-dessous) */}
      {ressources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ressources.map((r) => {
            const meta   = (r.metadata ?? {}) as Record<string, unknown>;
            const detail = cfg.metaLabel(meta);

            // Formulaire édition inline (pleine largeur)
            if (editId === r.id) return (
              <div key={r.id} className="sm:col-span-2 xl:col-span-3">
                <RessourceForm
                  mode="edit"
                  initialData={r}
                  featureSlug={featureSlug}
                  ressourceType={ressourceType}
                  locale={locale}
                  onSave={async (payload) => {
                    await onUpdateRessource(r.id, payload);
                    setEditId(null);
                  }}
                  onCancel={() => setEditId(null)}
                />
              </div>
            );

            return (
              <div key={r.id} className={cn(
                // Hauteur fixe : les cards ne s'étirent plus avec le grid
                "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col",
                "hover:shadow-md transition-all self-start",
                !r.est_active && "opacity-60",
              )}>
                {/* Header coloré */}
                <div className={`h-14 flex items-center px-4 gap-3 bg-gradient-to-r ${cfg.color}`}>
                  <Icon className="w-5 h-5 opacity-70 text-[var(--text)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text)] truncate">{r.nom}</p>
                    {detail && (
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{detail}</p>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Users className="w-3 h-3" />
                    <span>{r.capacite} place{r.capacite > 1 ? "s" : ""}</span>
                    {ressourceType === "trajet" && !!(meta.duree_estimee || meta.horaires_depart) && (
                      <span>
                        {meta.duree_estimee ? `· ${String(meta.duree_estimee)}` : ""}
                        {meta.horaires_depart
                          ? ` · ${String(meta.horaires_depart).split(",")[0].trim()}…`
                          : ""}
                      </span>
                    )}
                    {ressourceType === "praticien" && !!meta.duree_rdv && (
                      <span>· {String(meta.duree_rdv)} min / RDV</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <button type="button"
                      onClick={() => onToggleRessource(r.id, !r.est_active)}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)]">
                      {r.est_active
                        ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" />Actif</>
                        : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" />Inactif</>}
                    </button>
                    <div className="flex gap-1">
                      {/* Bouton CalendarClock — toggle panneau dispo SOUS le grid */}
                      <button type="button"
                        onClick={() => {
                          setDispoId((p) => p === r.id ? null : r.id);
                          setEditId(null);
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          dispoId === r.id
                            ? "bg-[var(--primary)] text-white"
                            : "hover:bg-[var(--bg)] text-[var(--text-muted)]",
                        )}>
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => { setEditId(r.id); setShowAdd(false); setDispoId(null); }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* ⚠️ Plus d'accordéon ici — déplacé sous le grid */}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Panneau disponibilités — EN DEHORS du grid, pleine largeur ── */}
      {dispoRessource && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {/* Header du panneau */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--text)]">
                {locale === "fr" ? "Disponibilités hebdomadaires" : "Weekly availability"}
                <span className="ml-2 text-[var(--text-muted)] font-normal">
                  — {dispoRessource.nom}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDispoId(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--bg)]"
            >
              {locale === "fr" ? "Fermer" : "Close"} ×
            </button>
          </div>

          {/* Grille dispo */}
          <div className="px-5 py-4">
            <DisponibiliteGrid
              ressource={dispoRessource}
              locale={locale}
              onLoad={() => onLoadDisponibilites(dispoRessource.id)}
              onSave={(dispo) => onSaveDisponibilites(dispoRessource.id, dispo)}
            />
          </div>
        </div>
      )}
    </div>
  );
}