// src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx
// B5 S39 — Migration S2→S3 : CatalogueTrajet → CatalogueItemKB
// S2 avait depart_fr/destination_fr/horaires_depart séparés.
// S3 : nom = "Douala → Yaoundé" · description = horaires/durée · prix = tarif · disponible
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, MapPin, ArrowRight, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { catalogueTrajetRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }     from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY = { depart: "", destination: "", description: "", prix: "" };

/** Encode départ/destination en nom S3 */
const toNom = (depart: string, dest: string) => `${depart.trim()} → ${dest.trim()}`;

/** Parse nom S3 "A → B" → { depart, destination } */
function parseNom(nom: string): { depart: string; destination: string } {
  const parts = nom.split(" → ");
  return parts.length >= 2
    ? { depart: parts[0].trim(), destination: parts.slice(1).join(" → ").trim() }
    : { depart: nom, destination: "" };
}

export function CatalogueTrajetTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<CatalogueItemKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    catalogueTrajetRepository.getList()
      .then(setItems)
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:         toNom(f.depart, f.destination),
    description: f.description.trim() || undefined,
    prix:        f.prix ? Number(f.prix) : null,
    disponible:  true,
    ordre:       items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.depart.trim() || !form.destination.trim() || !form.prix) return;
    try {
      const c = await catalogueTrajetRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setShowAdd(false); setForm(EMPTY);
      toast.success("Trajet ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.depart.trim() || !form.destination.trim() || !form.prix) return;
    try {
      const u = await catalogueTrajetRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success("Trajet mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await catalogueTrajetRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Trajet supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  });

  const handleToggle = (item: CatalogueItemKB) => startSave(async () => {
    try {
      const u = await catalogueTrajetRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueItemKB) => {
    setEditId(item.id); setShowAdd(false);
    const { depart, destination } = parseNom(item.nom);
    setForm({
      depart, destination,
      description: item.description ?? "",
      prix:        item.prix != null ? String(item.prix) : "",
    });
  };

  if (loading) return (
    <div className="space-y-3">{[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} trajet{items.length !== 1 ? "s" : ""}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un trajet
          </button>
        )}
      </div>

      {showAdd && (
        <TrajetForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme} label="Nouveau trajet" />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <MapPin className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun trajet. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const { depart, destination } = parseNom(item.nom);
            return editId === item.id ? (
              <TrajetForm key={item.id} form={form} set={set}
                onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                saving={saving} theme={theme} label="Modifier le trajet" />
            ) : (
              <div key={item.id} className={cn(
                "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:shadow-sm transition-all",
                !item.disponible && "opacity-60",
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                    <span className="truncate">{depart}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{destination}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{item.description}</p>
                  )}
                  <div className="mt-1.5">
                    <span className="text-sm font-bold" style={{ color: theme.primary }}>
                      {item.prix != null ? `${Number(item.prix).toLocaleString("fr-FR")} XAF` : "Sur devis"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                    className={cn("text-[var(--text-muted)]", item.disponible && "text-green-500 hover:text-green-600")}>
                    {item.disponible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button type="button" onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrajetForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Départ *">
          <input className="input-base" value={form.depart} onChange={set("depart")} placeholder="Ex : Douala" autoFocus />
        </Row>
        <Row label="Destination *">
          <input className="input-base" value={form.destination} onChange={set("destination")} placeholder="Ex : Yaoundé" />
        </Row>
      </div>
      <Row label="Horaires / Durée">
        <input className="input-base" value={form.description} onChange={set("description")}
          placeholder="Ex : 06:00, 09:00, 14:00 · Durée ~4h" />
      </Row>
      <Row label="Tarif (XAF) *">
        <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")} />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.depart.trim() || !form.destination.trim() || !form.prix}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Enregistrer
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">{label}</label>
      {children}
    </div>
  );
}

// END OF FILE: src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx