// src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx
// B5 S39 — Rewrite complet : suppression endpoint S1 mort (menu-categories/)
// Utilise catalogueProduitRepository S3 + groupement par categorie_nom
// Dead code supprimé : MenuCategoriePanel, MenuPlatGrid, menu.repository.ts
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, UtensilsCrossed, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { catalogueProduitRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY = {
  nom:          "",
  description:  "",
  prix:         "",
  categorie_nom: "",
  image_url:    "",
  allergenes:   "",
};

/** Groupe les items par categorie_nom pour l'affichage */
function groupByCategory(items: CatalogueItemKB[]): Record<string, CatalogueItemKB[]> {
  return items.reduce<Record<string, CatalogueItemKB[]>>((acc, item) => {
    const cat = item.categorie_nom ?? "Sans catégorie";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

export function MenuTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<CatalogueItemKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    catalogueProduitRepository.getList()
      .then((list) => {
        setItems(list);
        // Ouvrir toutes les catégories par défaut
        const cats = groupByCategory(list);
        setOpenCats(Object.keys(cats).reduce((a, k) => ({ ...a, [k]: true }), {}));
      })
      .catch(() => toast.error("Erreur chargement du menu"))
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
    disponible:    true,
    ordre:         items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const c = await catalogueProduitRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setOpenCats((o) => ({ ...o, [c.categorie_nom ?? "Plats"]: true }));
      setShowAdd(false); setForm(EMPTY);
      toast.success("Plat ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim() || !form.prix) return;
    try {
      const u = await catalogueProduitRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success("Plat mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await catalogueProduitRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Plat supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
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

  const grouped = groupByCategory(items);
  const totalItems = items.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {totalItems} plat{totalItems !== 1 ? "s" : ""}
          {Object.keys(grouped).length > 0 && ` · ${Object.keys(grouped).length} catégorie${Object.keys(grouped).length > 1 ? "s" : ""}`}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un plat
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <PlatForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme}
          label="Nouveau plat" items={items} />
      )}

      {/* État vide */}
      {totalItems === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun plat. Commencez par en ajouter un.</p>
        </div>
      )}

      {/* Catégories groupées */}
      {Object.entries(grouped).map(([catNom, catItems]) => (
        <div key={catNom} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {/* En-tête catégorie */}
          <button type="button"
            onClick={() => toggleCat(catNom)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--text)]">{catNom}</span>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">
                {catItems.length}
              </span>
            </div>
            {openCats[catNom]
              ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>

          {/* Items de la catégorie */}
          {openCats[catNom] && (
            <div className="divide-y divide-[var(--border)]">
              {catItems.map((item) => editId === item.id ? (
                <div key={item.id} className="p-4">
                  <PlatForm form={form} set={set}
                    onSave={() => handleUpdate(item.id)}
                    onCancel={() => setEditId(null)}
                    saving={saving} theme={theme} label="Modifier le plat" items={items} />
                </div>
              ) : (
                <div key={item.id} className={cn(
                  "flex items-center gap-4 px-5 py-3 hover:bg-[var(--bg)] transition-colors",
                  !item.disponible && "opacity-60",
                )}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text)] text-sm truncate">{item.nom}</span>
                      {item.allergenes && item.allergenes.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">
                          {item.allergenes.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: theme.primary }}>
                    {item.prix != null ? `${Number(item.prix).toLocaleString("fr-FR")} XAF` : "Sur devis"}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                      className={cn("text-[var(--text-muted)]", item.disponible && "text-green-500 hover:text-green-600")}>
                      {item.disponible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)]">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500">
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

function PlatForm({ form, set, onSave, onCancel, saving, theme, label, items }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
  items: CatalogueItemKB[];
}) {
  // Suggestions de catégories existantes
  const cats = [...new Set(items.map((i) => i.categorie_nom).filter(Boolean))] as string[];

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Nom du plat *">
          <input className="input-base" value={form.nom} onChange={set("nom")}
            placeholder="Ex : Ndolé aux crevettes" autoFocus />
        </Row>
        <Row label="Catégorie *">
          <input className="input-base" list="cats-list" value={form.categorie_nom}
            onChange={set("categorie_nom")} placeholder="Ex : Plats traditionnels" />
          <datalist id="cats-list">
            {cats.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Row>
      </div>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2} value={form.description}
          onChange={set("description")} placeholder="Ingrédients, accompagnements…" />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Prix (XAF) *">
          <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")} />
        </Row>
        <Row label="Allergènes (séparés par virgule)">
          <input className="input-base" value={form.allergenes} onChange={set("allergenes")}
            placeholder="Gluten, Arachides…" />
        </Row>
      </div>
      <Row label="Image URL">
        <input className="input-base" value={form.image_url} onChange={set("image_url")} placeholder="https://…" />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.nom.trim() || !form.prix || !form.categorie_nom.trim()}
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

// END OF FILE: src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx