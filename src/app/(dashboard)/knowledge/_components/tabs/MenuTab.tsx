// src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx
// S45 — Fix filtre feature_slug="menu_digital" via api.get avec params
// + images placeholder Unsplash
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, UtensilsCrossed, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { api }         from "@/lib/api-client";
import { catalogueProduitRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { resolveImage }               from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const BASE  = "/api/v1/knowledge/catalogue-produits/";
const EMPTY = {
  nom:           "",
  description:   "",
  prix:          "",
  categorie_nom: "",
  image_url:     "",
  allergenes:    "",
};

function groupByCategory(items: CatalogueItemKB[]): Record<string, CatalogueItemKB[]> {
  return items.reduce<Record<string, CatalogueItemKB[]>>((acc, item) => {
    const cat = item.categorie_nom ?? "Sans catégorie";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

export function MenuTab() {
  const { theme }         = useSector();
  const { locale }        = useLanguage();
  const toast             = useToast();
  const [items,    setItems]    = useState<CatalogueItemKB[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   startSave]   = useTransition();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // ✅ Fix S45 : filtre feature_slug via api.get direct (getList() n'accepte pas de params)
    api.get<{ results: CatalogueItemKB[] } | CatalogueItemKB[]>(
      `${BASE}?feature_slug=menu_digital`
    )
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setItems(list);
        const cats = groupByCategory(list);
        setOpenCats(Object.keys(cats).reduce((a, k) => ({ ...a, [k]: true }), {}));
      })
      .catch(() => toast.error(locale === "fr" ? "Erreur chargement du menu" : "Error loading menu"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:           f.nom.trim(),
    description:   f.description.trim() || undefined,
    prix:          f.prix ? Number(f.prix) : null,
    categorie_nom: f.categorie_nom.trim() || "Plats",
    image_url:     f.image_url.trim() || undefined,
    allergenes:    f.allergenes.trim()
      ? f.allergenes.split(",").map((a) => a.trim()).filter(Boolean)
      : undefined,
    disponible:   true,
    ordre:        items.length,
    feature_slug: "menu_digital",
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const c = await catalogueProduitRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setOpenCats((o) => ({ ...o, [c.categorie_nom ?? "Plats"]: true }));
      setShowAdd(false); setForm(EMPTY);
      toast.success(locale === "fr" ? "Plat ajouté" : "Dish added");
    } catch { toast.error(locale === "fr" ? "Erreur lors de l'ajout" : "Error adding"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const u = await catalogueProduitRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success(locale === "fr" ? "Plat mis à jour" : "Dish updated");
    } catch { toast.error(locale === "fr" ? "Erreur lors de la mise à jour" : "Error updating"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await catalogueProduitRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(locale === "fr" ? "Plat supprimé" : "Dish deleted");
    } catch { toast.error(locale === "fr" ? "Erreur lors de la suppression" : "Error deleting"); }
  });

  const handleToggle = (item: CatalogueItemKB) => startSave(async () => {
    try {
      const u = await catalogueProduitRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueItemKB) => {
    setEditId(item.id); setShowAdd(false);
    setForm({
      nom:           item.nom,
      description:   item.description ?? "",
      prix:          item.prix != null ? String(item.prix) : "",
      categorie_nom: item.categorie_nom ?? "",
      image_url:     item.image_url ?? "",
      allergenes:    item.allergenes?.join(", ") ?? "",
    });
  };

  const toggleCat = (cat: string) =>
    setOpenCats((o) => ({ ...o, [cat]: !o[cat] }));

  if (loading) return (
    <div className="space-y-3">{[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}</div>
  );

  const grouped    = groupByCategory(items);
  const totalItems = items.length;
  const totalCats  = Object.keys(grouped).length;

  const addLabel  = locale === "fr" ? "Ajouter un plat" : "Add a dish";
  const emptyText = locale === "fr"
    ? "Aucun plat. Commencez par en ajouter un."
    : "No dishes yet. Add one to get started.";
  const countText = locale === "fr"
    ? `${totalItems} plat${totalItems !== 1 ? "s" : ""}${totalCats > 0 ? ` · ${totalCats} catégorie${totalCats > 1 ? "s" : ""}` : ""}`
    : `${totalItems} dish${totalItems !== 1 ? "es" : ""}${totalCats > 0 ? ` · ${totalCats} categor${totalCats > 1 ? "ies" : "y"}` : ""}`;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{countText}</p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {addLabel}
          </button>
        )}
      </div>

      {/* ── Formulaire ajout ── */}
      {showAdd && (
        <PlatForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme}
          label={locale === "fr" ? "Nouveau plat" : "New dish"}
          items={items} locale={locale} />
      )}

      {/* ── État vide ── */}
      {totalItems === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)] animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
              <UtensilsCrossed className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: "var(--color-primary)" }} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)] px-4">{emptyText}</p>
        </div>
      )}

      {/* ── Catégories groupées ── */}
      {Object.entries(grouped).map(([catNom, catItems]) => (
        <div key={catNom}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden
            hover:shadow-sm transition-shadow duration-200">

          {/* En-tête catégorie */}
          <button type="button" onClick={() => toggleCat(catNom)}
            className="w-full flex items-center justify-between px-5 py-3
              border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--text)]">{catNom}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color:      "var(--color-primary)",
                }}
              >
                {catItems.length}
              </span>
            </div>
            {openCats[catNom]
              ? <ChevronDown  className="w-4 h-4 text-[var(--text-muted)]" />
              : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>

          {/* Items */}
          {openCats[catNom] && (
            <div className="divide-y divide-[var(--border)]">
              {catItems.map((item) => editId === item.id ? (
                <div key={item.id} className="p-4">
                  <PlatForm form={form} set={set}
                    onSave={() => handleUpdate(item.id)}
                    onCancel={() => setEditId(null)}
                    saving={saving} theme={theme}
                    label={locale === "fr" ? "Modifier le plat" : "Edit dish"}
                    items={items} locale={locale} />
                </div>
              ) : (
                <div key={item.id}
                  className={cn(
                    "group flex items-center gap-4 px-5 py-3",
                    "hover:bg-[var(--bg)] transition-colors duration-150",
                    !item.disponible && "opacity-50",
                  )}>

                  {/* Image plat */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
                    ring-1 ring-[var(--border)] group-hover:ring-[var(--color-primary)]
                    transition-all duration-200">
                    <img
                      src={resolveImage(item.image_url, "plat", item.nom)}
                      alt={item.nom}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--text)] text-sm truncate">
                        {item.nom}
                      </span>
                      {item.allergenes && item.allergenes.length > 0 && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "var(--status-warning-bg)",
                            color:      "var(--status-warning-text)",
                          }}
                        >
                          {item.allergenes.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Prix */}
                  <span className="text-sm font-bold flex-shrink-0"
                    style={{ color: theme.primary }}>
                    {item.prix != null
                      ? `${Number(item.prix).toLocaleString("fr-FR")} XAF`
                      : (locale === "fr" ? "Sur devis" : "On quote")}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
                      style={{ color: item.disponible ? "var(--status-success-text)" : "var(--text-muted)" }}>
                      {item.disponible
                        ? <ToggleRight className="w-5 h-5" />
                        : <ToggleLeft  className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)]
                        text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                      className="p-1.5 rounded-lg text-[var(--text-muted)]
                        hover:text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)]
                        transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function PlatForm({ form, set, onSave, onCancel, saving, theme, label, items, locale }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
  items: CatalogueItemKB[]; locale: string;
}) {
  const cats = [...new Set(items.map((i) => i.categorie_nom).filter(Boolean))] as string[];
  const imgPreview = resolveImage(form.image_url?.trim() || "", "plat", form.nom);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-4"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label={locale === "fr" ? "Nom du plat *" : "Dish name *"}>
          <input className="input-base" value={form.nom} onChange={set("nom")}
            placeholder={locale === "fr" ? "Ex : Ndolé aux crevettes" : "Ex: Grilled chicken"}
            autoFocus />
        </Row>
        <Row label={locale === "fr" ? "Catégorie *" : "Category *"}>
          <input className="input-base" list="cats-list" value={form.categorie_nom}
            onChange={set("categorie_nom")}
            placeholder={locale === "fr" ? "Ex : Plats traditionnels" : "Ex: Main dishes"} />
          <datalist id="cats-list">
            {cats.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Row>
      </div>

      <Row label={locale === "fr" ? "Description" : "Description"}>
        <textarea className="input-base resize-none" rows={2} value={form.description}
          onChange={set("description")}
          placeholder={locale === "fr" ? "Ingrédients, accompagnements…" : "Ingredients, sides…"} />
      </Row>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label={locale === "fr" ? "Prix (XAF) *" : "Price (XAF) *"}>
          <input className="input-base" type="number" min="0"
            value={form.prix} onChange={set("prix")} />
        </Row>
        <Row label={locale === "fr" ? "Allergènes (virgule)" : "Allergens (comma)"}>
          <input className="input-base" value={form.allergenes} onChange={set("allergenes")}
            placeholder={locale === "fr" ? "Gluten, Arachides…" : "Gluten, Peanuts…"} />
        </Row>
      </div>

      {/* Image URL + preview */}
      <Row label="Image URL">
        <div className="flex items-center gap-3">
          <input className="input-base flex-1" value={form.image_url}
            onChange={set("image_url")} placeholder="https://…" />
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
            ring-1 ring-[var(--border)]">
            <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          {locale === "fr"
            ? "Laissez vide pour utiliser une image automatique"
            : "Leave empty to use an automatic image"}
        </p>
      </Row>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.nom.trim() || !form.prix || !form.categorie_nom.trim()}
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