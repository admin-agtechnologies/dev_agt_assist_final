// src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx
// S46 — Redesign complet UX menu
//   - Fix URL bug : menuRepository (/menu-items/ → MenuDigitalViewSet)
//   - UX : pills catégories scrollables + grille cards plats
//   - Nouvelle catégorie : input inline dans les pills
//   - Supprimer catégorie : confirmation inline
//   - Ajouter plat : formulaire au-dessus de la grille
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, UtensilsCrossed, Check, X, Tag,
} from "lucide-react";
import { useSector }         from "@/hooks/useSector";
import { useToast }          from "@/components/ui/Toast";
import { useLanguage }       from "@/contexts/LanguageContext";
import { menuRepository }    from "@/repositories/catalogue.repository";
import { MenuDishCard }      from "./MenuDishCard";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { resolveImage }          from "@/lib/image-placeholder";
import { cn }                    from "@/lib/utils";
import type { CatalogueItemKB }  from "@/types/api/catalogue.types";

const EMPTY = {
  nom: "", description: "", prix: "",
  categorie_nom: "", image_url: "", allergenes: "",
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
  const { theme }   = useSector();
  const { locale }  = useLanguage();
  const toast       = useToast();

  const [items,       setItems]       = useState<CatalogueItemKB[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeCat,   setActiveCat]   = useState<string | null>(null);
  const [addingCat,   setAddingCat]   = useState(false);
  const [newCatName,  setNewCatName]  = useState("");
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [showForm,    setShowForm]    = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      startSave]      = useTransition();

  useEffect(() => {
    menuRepository.getList()
      .then((list) => {
        setItems(list);
        const cats = Object.keys(groupByCategory(list));
        if (cats.length > 0) setActiveCat(cats[0]);
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
    categorie_nom: f.categorie_nom.trim() || activeCat || "Plats",
    image_url: f.image_url.trim() || "",
    allergenes:    f.allergenes.trim()
      ? f.allergenes.split(",").map((a) => a.trim()).filter(Boolean)
      : undefined,
    disponible: true,
    ordre:      items.length,
  });

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const c = await menuRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setActiveCat(c.categorie_nom ?? activeCat);
      closeForm();
      toast.success(locale === "fr" ? "Plat ajouté" : "Dish added");
    } catch { toast.error(locale === "fr" ? "Erreur lors de l'ajout" : "Error adding"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const u = await menuRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      closeForm();
      toast.success(locale === "fr" ? "Plat mis à jour" : "Dish updated");
    } catch { toast.error(locale === "fr" ? "Erreur lors de la mise à jour" : "Error updating"); }
  });

  const handleDeleteDish = (id: string) => startSave(async () => {
    try {
      await menuRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(locale === "fr" ? "Plat supprimé" : "Dish deleted");
    } catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: CatalogueItemKB) => startSave(async () => {
    try {
      const u = await menuRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  const handleDeleteCategory = (catName: string) => startSave(async () => {
    const catItems = grouped[catName] ?? [];
    try {
      await Promise.all(catItems.map((i) => menuRepository.delete(i.id)));
      setItems((p) => p.filter((x) => x.categorie_nom !== catName));
      const remaining = Object.keys(grouped).filter((k) => k !== catName);
      setActiveCat(remaining[0] ?? null);
      setDeletingCat(null);
      toast.success(locale === "fr" ? "Catégorie supprimée" : "Category deleted");
    } catch { toast.error("Erreur"); }
  });

  const confirmNewCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    setActiveCat(name);
    setAddingCat(false); setNewCatName("");
    setShowForm(true); setEditId(null);
    setForm({ ...EMPTY, categorie_nom: name });
  };

  const startEdit = (item: CatalogueItemKB) => {
    setEditId(item.id); setShowForm(true);
    setForm({
      nom:           item.nom,
      description:   item.description ?? "",
      prix:          item.prix != null ? String(item.prix) : "",
      categorie_nom: item.categorie_nom ?? "",
      image_url:     item.image_url ?? "",
      allergenes:    item.allergenes?.join(", ") ?? "",
    });
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="flex gap-2 animate-pulse">
        {[80, 110, 90, 120].map((w, i) => (
          <div key={i} className="h-8 rounded-full bg-[var(--border)]" style={{ width: w }} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <KnowledgeCardSkeleton key={i} />)}
      </div>
    </div>
  );

  const grouped      = groupByCategory(items);
  const categories   = Object.keys(grouped);
  const allCats      = activeCat && !categories.includes(activeCat)
    ? [...categories, activeCat]
    : categories;
  const activeDishes = activeCat ? (grouped[activeCat] ?? []) : [];

  return (
    <div className="space-y-5">

      {/* ── Pills catégories ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {allCats.map((cat) => {
          const count     = grouped[cat]?.length ?? 0;
          const isActive  = cat === activeCat;
          const isPending = !grouped[cat];

          return (
            <div key={cat} className="group/pill relative">
              <button
                type="button"
                onClick={() => { setActiveCat(cat); closeForm(); }}
                className={cn(
                  "flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-full text-sm font-medium",
                  "transition-all duration-150",
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]",
                  !isActive && "hover:text-[var(--text)] hover:border-[var(--text-muted)]",
                )}
                style={isActive ? { backgroundColor: theme.primary } : undefined}
              >
                <span>{cat}</span>
                <span className={cn(
                  "text-[10px] font-bold min-w-[16px] text-center px-1 rounded-full",
                  isActive ? "bg-white/25 text-white" : "bg-[var(--bg)] text-[var(--text-muted)]",
                )}>
                  {isPending ? "…" : count}
                </span>
              </button>

              {!isPending && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeletingCat(cat); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2
                    w-4 h-4 rounded-full flex items-center justify-center
                    opacity-0 group-hover/pill:opacity-100 transition-opacity
                    hover:bg-red-100 dark:hover:bg-red-900/30
                    text-[var(--text-muted)] hover:text-red-500">
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {addingCat ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 bg-[var(--bg-card)]"
            style={{ borderColor: theme.primary }}>
            <input
              autoFocus
              className="text-sm bg-transparent outline-none w-36 text-[var(--text)]"
              placeholder={locale === "fr" ? "Nom de la catégorie…" : "Category name…"}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmNewCategory();
                if (e.key === "Escape") { setAddingCat(false); setNewCatName(""); }
              }}
            />
            <button type="button" onClick={confirmNewCategory}
              disabled={!newCatName.trim()}
              className="flex-shrink-0 disabled:opacity-40" style={{ color: theme.primary }}>
              <Check className="w-4 h-4" />
            </button>
            <button type="button"
              onClick={() => { setAddingCat(false); setNewCatName(""); }}
              className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setAddingCat(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
              border border-dashed border-[var(--border)] text-[var(--text-muted)]
              hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
              transition-colors duration-150">
            <Plus className="w-3.5 h-3.5" />
            {locale === "fr" ? "Nouvelle catégorie" : "New category"}
          </button>
        )}

        {items.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] hidden sm:inline">
            {items.length} plat{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Confirmation suppression catégorie ── */}
      {deletingCat && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl
          border bg-[var(--bg-card)]"
          style={{ borderColor: "var(--status-danger-bg)" }}>
          <p className="text-sm text-[var(--text)]">
            {locale === "fr"
              ? `Supprimer "${deletingCat}" et ses ${grouped[deletingCat]?.length ?? 0} plat(s) ?`
              : `Delete "${deletingCat}" and its ${grouped[deletingCat]?.length ?? 0} dish(es)?`}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button type="button" onClick={() => setDeletingCat(null)}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
              {locale === "fr" ? "Annuler" : "Cancel"}
            </button>
            <button type="button"
              onClick={() => handleDeleteCategory(deletingCat)} disabled={saving}
              className="px-3 py-1.5 text-sm rounded-lg font-medium
                hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (locale === "fr" ? "Supprimer" : "Delete")}
            </button>
          </div>
        </div>
      )}

      {/* ── État vide ── */}
      {allCats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${theme.primary} 12%, transparent)` }}>
            <UtensilsCrossed className="w-7 h-7" style={{ color: theme.primary }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--text)]">
              {locale === "fr" ? "Aucune catégorie de menu." : "No menu categories yet."}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr" ? "Créez une catégorie pour commencer." : "Create a category to get started."}
            </p>
          </div>
        </div>
      )}

      {/* ── Contenu catégorie active ── */}
      {activeCat !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
              <span className="font-semibold text-sm text-[var(--text)]">{activeCat}</span>
              {activeDishes.length > 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  {activeDishes.length} plat{activeDishes.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {!showForm && (
              <button type="button"
                onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY, categorie_nom: activeCat }); }}
                className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm">
                <Plus className="w-4 h-4" />
                {locale === "fr" ? "Ajouter un plat" : "Add a dish"}
              </button>
            )}
          </div>

          {showForm && (
            <PlatForm
              form={form} set={set}
              onSave={editId ? () => handleUpdate(editId) : handleCreate}
              onCancel={closeForm}
              saving={saving} theme={theme} locale={locale}
              label={editId
                ? (locale === "fr" ? "Modifier le plat" : "Edit dish")
                : (locale === "fr" ? `Nouveau plat — ${activeCat}` : `New dish — ${activeCat}`)}
            />
          )}

          {activeDishes.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-12 gap-3
              bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
              <UtensilsCrossed className="w-7 h-7 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">
                {locale === "fr" ? "Aucun plat — commencez par en ajouter un." : "No dishes yet."}
              </p>
            </div>
          )}

          {activeDishes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeDishes.map((item) => (
                <MenuDishCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  saving={saving}
                  locale={locale}
                  onToggle={() => handleToggle(item)}
                  onEdit={() => startEdit(item)}
                  onDelete={() => handleDeleteDish(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlatForm({ form, set, onSave, onCancel, saving, theme, label, locale }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string; locale: string;
}) {
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
        <Row label={locale === "fr" ? "Prix (XAF) *" : "Price (XAF) *"}>
          <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")} />
        </Row>
      </div>
      <Row label={locale === "fr" ? "Description" : "Description"}>
        <textarea className="input-base resize-none" rows={2} value={form.description}
          onChange={set("description")}
          placeholder={locale === "fr" ? "Ingrédients, accompagnements…" : "Ingredients, sides…"} />
      </Row>
      <Row label={locale === "fr" ? "Allergènes (virgule)" : "Allergens (comma)"}>
        <input className="input-base" value={form.allergenes} onChange={set("allergenes")}
          placeholder={locale === "fr" ? "Gluten, Arachides…" : "Gluten, Peanuts…"} />
      </Row>
      <Row label="Image URL">
        <div className="flex items-center gap-3">
          <input className="input-base flex-1" value={form.image_url}
            onChange={set("image_url")} placeholder="https://…" />
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-[var(--border)]">
            <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          {locale === "fr" ? "Laissez vide pour une image automatique" : "Leave empty for auto image"}
        </p>
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.nom.trim() || !form.prix}
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