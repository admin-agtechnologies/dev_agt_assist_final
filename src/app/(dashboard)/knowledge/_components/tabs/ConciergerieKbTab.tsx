// src/app/(dashboard)/knowledge/_components/tabs/ConciergerieKbTab.tsx
// S71 — Redesign grid cards image hero + ImagePreviewModal (BUG 2 & 3)
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Bell,
  Pencil, Trash2, Check, X, Eye,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { api }         from "@/lib/api-client";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { resolveImage }          from "@/lib/image-placeholder";
import { ImagePreviewModal }     from "../ImagePreviewModal";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY    = { nom: "", description: "", prix: "", image_url: "" };
const ENDPOINT = "/api/v1/knowledge/catalogue-services/";

export function ConciergerieKbTab() {
  const { theme }         = useSector();
  const { locale }        = useLanguage();
  const toast             = useToast();

  const [items,      setItems]      = useState<CatalogueItemKB[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     startSave]     = useTransition();
  const [previewSrc, setPreviewSrc] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    api.get<CatalogueItemKB[] | { results: CatalogueItemKB[] }>(
      `${ENDPOINT}?feature=conciergerie`
    )
      .then((data) => setItems(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => toast.error(locale === "fr" ? "Erreur chargement des services" : "Loading error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:         f.nom.trim(),
    description: f.description.trim() || undefined,
    prix:        f.prix ? Number(f.prix) : null,
    image_url:   f.image_url.trim() || "",
    disponible:  true,
    feature:     "conciergerie",
    ordre:       items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const created = await api.post<CatalogueItemKB>(ENDPOINT, toPayload(form));
      setItems((p) => [...p, created]); setShowAdd(false); setForm(EMPTY);
      toast.success(locale === "fr" ? "Service ajouté" : "Service added");
    } catch { toast.error(locale === "fr" ? "Erreur lors de l'ajout" : "Error adding"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    try {
      const updated = await api.patch<CatalogueItemKB>(`${ENDPOINT}${id}/`, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? updated : x)); setEditId(null);
      toast.success(locale === "fr" ? "Service mis à jour" : "Service updated");
    } catch { toast.error(locale === "fr" ? "Erreur mise à jour" : "Error updating"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await api.delete(`${ENDPOINT}${id}/`);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(locale === "fr" ? "Service supprimé" : "Service deleted");
    } catch { toast.error(locale === "fr" ? "Erreur suppression" : "Error deleting"); }
  });

  const handleToggle = (item: CatalogueItemKB) => startSave(async () => {
    try {
      const u = await api.patch<CatalogueItemKB>(`${ENDPOINT}${item.id}/`, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueItemKB) => {
    setEditId(item.id); setShowAdd(false);
    setForm({
      nom:         item.nom,
      description: item.description ?? "",
      prix:        item.prix != null ? String(item.prix) : "",
      image_url:   item.image_url   ?? "",
    });
  };

  if (loading) return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Preview modal */}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc.src}
          alt={previewSrc.alt}
          onClose={() => setPreviewSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} {locale === "fr"
            ? `service${items.length !== 1 ? "s" : ""} de conciergerie`
            : `concierge service${items.length !== 1 ? "s" : ""}`}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" />
            {locale === "fr" ? "Ajouter un service" : "Add service"}
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <ServiceForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme}
          label={locale === "fr" ? "Nouveau service" : "New service"} locale={locale} />
      )}

      {/* État vide */}
      {items.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
            <Bell className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)] px-4">
            {locale === "fr" ? "Aucun service. Commencez par en ajouter un." : "No services yet."}
          </p>
        </div>
      )}

      {/* Grid cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            if (editId === item.id) return (
              <div key={item.id} className="col-span-2 xl:col-span-3">
                <ServiceForm form={form} set={set}
                  onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                  saving={saving} theme={theme}
                  label={locale === "fr" ? "Modifier le service" : "Edit service"} locale={locale} />
              </div>
            );

            const imgSrc = resolveImage(item.image_url, "service", item.nom);

            return (
              <div key={item.id}
                className={cn(
                  "group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden",
                  "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 self-start",
                  !item.disponible && "opacity-60",
                )}>

                {/* Image hero */}
                <div className="relative h-40 overflow-hidden bg-[var(--bg)]">
                  <img
                    src={imgSrc}
                    alt={item.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button type="button"
                      onClick={() => setPreviewSrc({ src: imgSrc, alt: item.nom })}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center
                        transition-colors shadow-md">
                      <Eye className="w-4 h-4 text-gray-800" />
                    </button>
                    <button type="button" onClick={() => startEdit(item)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center
                        transition-colors shadow-md">
                      <Pencil className="w-4 h-4 text-gray-800" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                      className="w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center
                        transition-colors shadow-md">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Badge toggle */}
                  <div className="absolute top-2 left-2">
                    <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                        bg-white/90 backdrop-blur-sm shadow-sm"
                      style={{ color: item.disponible ? "var(--status-success-text)" : "var(--text-muted)" }}>
                      {item.disponible
                        ? <><ToggleRight className="w-3 h-3" />{locale === "fr" ? "Actif" : "Active"}</>
                        : <><ToggleLeft  className="w-3 h-3" />{locale === "fr" ? "Inactif" : "Inactive"}</>}
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-3 space-y-1">
                  <p className="font-semibold text-sm text-[var(--text)] line-clamp-1">{item.nom}</p>
                  {item.description && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                  )}
                  <span className="text-sm font-bold pt-1 block" style={{ color: theme.primary }}>
                    {item.prix != null
                      ? `${Number(item.prix).toLocaleString("fr-FR")} XAF`
                      : (locale === "fr" ? "Sur devis" : "On quote")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function ServiceForm({ form, set, onSave, onCancel, saving, theme, label, locale }: {
  form:     Record<string, string>;
  set:      (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave:   () => void;
  onCancel: () => void;
  saving:   boolean;
  theme:    { primary: string };
  label:    string;
  locale:   string;
}) {
  const imgPreview = resolveImage(form.image_url?.trim() || "", "service", form.nom);
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label={locale === "fr" ? "Nom du service *" : "Service name *"}>
        <input className="input-base" value={form.nom} onChange={set("nom")}
          placeholder={locale === "fr" ? "Ex : Transfert aéroport, Room service…" : "Ex: Airport transfer, Room service…"}
          autoFocus />
      </Row>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2}
          value={form.description} onChange={set("description")}
          placeholder={locale === "fr" ? "Conditions, horaires, inclus…" : "Conditions, hours, included…"} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label={locale === "fr" ? "Prix (XAF)" : "Price (XAF)"}>
          <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")}
            placeholder={locale === "fr" ? "Laisser vide = sur devis" : "Empty = on quote"} />
        </Row>
        <Row label="Image URL">
          <div className="flex items-center gap-2">
            <input className="input-base flex-1" value={form.image_url} onChange={set("image_url")}
              placeholder="https://…" />
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[var(--border)]">
              <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.nom.trim()}
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
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}