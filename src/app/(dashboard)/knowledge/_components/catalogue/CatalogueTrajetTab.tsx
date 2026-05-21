// src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx
// S45 — UX WAOUH : hover lift + toggle CSS vars + empty state sectoriel
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, MapPin, ArrowRight, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { catalogueTrajetRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }     from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY = { depart: "", destination: "", description: "", prix: "" };

const toNom  = (d: string, dest: string) => `${d.trim()} → ${dest.trim()}`;
function parseNom(nom: string) {
  const parts = nom.split(" → ");
  return parts.length >= 2
    ? { depart: parts[0].trim(), destination: parts.slice(1).join(" → ").trim() }
    : { depart: nom, destination: "" };
}

export function CatalogueTrajetTab() {
  const { theme }         = useSector();
  const { locale }        = useLanguage();
  const toast             = useToast();
  const [items,   setItems]   = useState<CatalogueItemKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    catalogueTrajetRepository.getList()
      .then(setItems)
      .catch(() => toast.error(locale === "fr" ? "Erreur chargement" : "Loading error"))
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
      setItems((p) => [...p, c]); setShowAdd(false); setForm(EMPTY);
      toast.success(locale === "fr" ? "Trajet ajouté" : "Route added");
    } catch { toast.error(locale === "fr" ? "Erreur lors de l'ajout" : "Error adding"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.depart.trim() || !form.destination.trim() || !form.prix) return;
    try {
      const u = await catalogueTrajetRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x)); setEditId(null);
      toast.success(locale === "fr" ? "Trajet mis à jour" : "Route updated");
    } catch { toast.error(locale === "fr" ? "Erreur mise à jour" : "Error updating"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await catalogueTrajetRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(locale === "fr" ? "Trajet supprimé" : "Route deleted");
    } catch { toast.error(locale === "fr" ? "Erreur suppression" : "Error deleting"); }
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
    setForm({ depart, destination, description: item.description ?? "", prix: item.prix != null ? String(item.prix) : "" });
  };

  if (loading) return (
    <div className="space-y-3">{[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} {locale === "fr" ? `trajet${items.length !== 1 ? "s" : ""}` : `route${items.length !== 1 ? "s" : ""}`}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {locale === "fr" ? "Ajouter un trajet" : "Add route"}
          </button>
        )}
      </div>

      {showAdd && (
        <TrajetForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme}
          label={locale === "fr" ? "Nouveau trajet" : "New route"} locale={locale} />
      )}

      {items.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)] animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
              <MapPin className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: "var(--color-primary)" }} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)] px-4">
            {locale === "fr" ? "Aucun trajet configuré." : "No routes yet."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const { depart, destination } = parseNom(item.nom);
          return editId === item.id ? (
            <TrajetForm key={item.id} form={form} set={set}
              onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
              saving={saving} theme={theme}
              label={locale === "fr" ? "Modifier le trajet" : "Edit route"} locale={locale} />
          ) : (
            <div key={item.id}
              className={cn(
                "group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4",
                "flex items-center gap-4",
                "hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30",
                "transition-all duration-200",
                !item.disponible && "opacity-60",
              )}>

              {/* Icône trajet */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                transition-transform duration-200 group-hover:scale-110"
                style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
                <MapPin className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)] text-sm flex-wrap">
                  <span className="truncate">{depart}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">{destination}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{item.description}</p>
                )}
                <span className="text-sm font-bold mt-1 block" style={{ color: theme.primary }}>
                  {item.prix != null ? `${Number(item.prix).toLocaleString("fr-FR")} XAF` : (locale === "fr" ? "Sur devis" : "On quote")}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: item.disponible ? "var(--status-success-text)" : "var(--text-muted)" }}>
                  {item.disponible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button type="button" onClick={() => startEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrajetForm({ form, set, onSave, onCancel, saving, theme, label, locale }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string; locale: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label={locale === "fr" ? "Départ *" : "From *"}>
          <input className="input-base" value={form.depart} onChange={set("depart")} placeholder="Ex : Douala" autoFocus />
        </Row>
        <Row label={locale === "fr" ? "Destination *" : "To *"}>
          <input className="input-base" value={form.destination} onChange={set("destination")} placeholder="Ex : Yaoundé" />
        </Row>
      </div>
      <Row label={locale === "fr" ? "Horaires / Durée" : "Schedule / Duration"}>
        <input className="input-base" value={form.description} onChange={set("description")}
          placeholder={locale === "fr" ? "Ex : 06:00, 09:00 · Durée ~4h" : "Ex: 06:00, 09:00 · ~4h"} />
      </Row>
      <Row label={locale === "fr" ? "Tarif (XAF) *" : "Fare (XAF) *"}>
        <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")} />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.depart.trim() || !form.destination.trim() || !form.prix}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {locale === "fr" ? "Enregistrer" : "Save"}
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