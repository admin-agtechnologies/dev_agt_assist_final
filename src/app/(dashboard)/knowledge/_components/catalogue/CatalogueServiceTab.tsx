// src/app/(dashboard)/knowledge/_components/catalogue/CatalogueServiceTab.tsx
// S45 — UX WAOUH : hover lift + toggle CSS vars + image placeholder + empty state sectoriel
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Briefcase, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { catalogueServiceRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { resolveImage }               from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY = { nom: "", description: "", prix: "", image_url: "" };

export function CatalogueServiceTab() {
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
    catalogueServiceRepository.getList()
      .then(setItems)
      .catch(() => toast.error(locale === "fr" ? "Erreur chargement" : "Loading error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:         f.nom.trim(),
    description: f.description.trim() || undefined,
    prix:        f.prix ? Number(f.prix) : null,
    image_url:   f.image_url.trim() || undefined,
    disponible:  true,
    ordre:       items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const c = await catalogueServiceRepository.create(toPayload(form));
      setItems((p) => [...p, c]); setShowAdd(false); setForm(EMPTY);
      toast.success(locale === "fr" ? "Service ajouté" : "Service added");
    } catch { toast.error(locale === "fr" ? "Erreur lors de l'ajout" : "Error adding"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const u = await catalogueServiceRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x)); setEditId(null);
      toast.success(locale === "fr" ? "Service mis à jour" : "Service updated");
    } catch { toast.error(locale === "fr" ? "Erreur mise à jour" : "Error updating"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await catalogueServiceRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(locale === "fr" ? "Service supprimé" : "Service deleted");
    } catch { toast.error(locale === "fr" ? "Erreur suppression" : "Error deleting"); }
  });

  const handleToggle = (item: CatalogueItemKB) => startSave(async () => {
    try {
      const u = await catalogueServiceRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueItemKB) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ nom: item.nom, description: item.description ?? "", prix: item.prix != null ? String(item.prix) : "", image_url: item.image_url ?? "" });
  };

  if (loading) return (
    <div className="space-y-3">{[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} {locale === "fr" ? `service${items.length !== 1 ? "s" : ""}` : `service${items.length !== 1 ? "s" : ""}`}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {locale === "fr" ? "Ajouter un service" : "Add service"}
          </button>
        )}
      </div>

      {showAdd && (
        <ServiceForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme}
          label={locale === "fr" ? "Nouveau service" : "New service"} locale={locale} />
      )}

      {items.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)] animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
              <Briefcase className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: "var(--color-primary)" }} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)] px-4">
            {locale === "fr" ? "Aucun service. Commencez par en ajouter un." : "No services yet."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => editId === item.id ? (
          <ServiceForm key={item.id} form={form} set={set}
            onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
            saving={saving} theme={theme}
            label={locale === "fr" ? "Modifier le service" : "Edit service"} locale={locale} />
        ) : (
          <div key={item.id}
            className={cn(
              "group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4",
              "flex items-center gap-4",
              "hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30",
              "transition-all duration-200",
              !item.disponible && "opacity-60",
            )}>

            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0
              ring-1 ring-[var(--border)] group-hover:ring-[var(--color-primary)]/40 transition-all duration-200">
              <img src={resolveImage(item.image_url, "service", item.nom)}
                alt={item.nom} className="w-full h-full object-cover" loading="lazy" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-semibold text-[var(--text)] truncate block">{item.nom}</span>
              {item.description && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{item.description}</p>
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
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ form, set, onSave, onCancel, saving, theme, label, locale }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string; locale: string;
}) {
  const imgPreview = resolveImage(form.image_url?.trim() || "", "service", form.nom);
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label={locale === "fr" ? "Nom du service *" : "Service name *"}>
        <input className="input-base" value={form.nom} onChange={set("nom")} autoFocus />
      </Row>
      <Row label={locale === "fr" ? "Description (durée, conditions…)" : "Description (duration, conditions…)"}>
        <textarea className="input-base resize-none" rows={2} value={form.description} onChange={set("description")} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label={locale === "fr" ? "Prix (XAF)" : "Price (XAF)"}>
          <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")}
            placeholder={locale === "fr" ? "Vide = sur devis" : "Empty = on quote"} />
        </Row>
        <Row label="Image URL">
          <div className="flex items-center gap-2">
            <input className="input-base flex-1" value={form.image_url} onChange={set("image_url")} placeholder="https://…" />
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[var(--border)]">
              <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom.trim()}
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