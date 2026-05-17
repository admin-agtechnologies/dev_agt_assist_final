// src/app/(dashboard)/knowledge/_components/menu/MenuCategoriePanel.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, Tag } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { menuRepository } from "@/repositories/menu.repository";
import { cn }          from "@/lib/utils";
import type { MenuCategorie, CreateMenuCategoriePayload } from "@/types/api/menu.types";

interface Props {
  categories:   MenuCategorie[];
  selectedId:   string | null;
  onSelect:     (id: string) => void;
  onCreated:    (cat: MenuCategorie) => void;
  onUpdated:    (cat: MenuCategorie) => void;
  onDeleted:    (id: string) => void;
  t:            Record<string, string>;
}

export function MenuCategoriePanel({
  categories, selectedId, onSelect, onCreated, onUpdated, onDeleted, t,
}: Props) {
  const { theme } = useSector();
  const toast     = useToast();

  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [nomFr,   setNomFr]   = useState("");
  const [nomEn,   setNomEn]   = useState("");
  const [saving,  startSave]  = useTransition();
  const [deleting,startDel]   = useTransition();

  const startAdd = () => { setAdding(true); setNomFr(""); setNomEn(""); };
  const startEdit = (cat: MenuCategorie) => {
    setEditId(cat.id); setNomFr(cat.nom_fr); setNomEn(cat.nom_en);
  };
  const cancel = () => { setAdding(false); setEditId(null); };

  const handleCreate = () => startSave(async () => {
    if (!nomFr.trim()) return;
    try {
      const payload: CreateMenuCategoriePayload = {
        nom_fr: nomFr.trim(),
        nom_en: nomEn.trim() || undefined,
        ordre:  categories.length,
      };
      const created = await menuRepository.createCategorie(payload);
      onCreated(created);
      setAdding(false);
      toast.success(t.categorieCreated);
    } catch { toast.error(t.errorSave); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!nomFr.trim()) return;
    try {
      const updated = await menuRepository.updateCategorie(id, {
        nom_fr: nomFr.trim(), nom_en: nomEn.trim() || undefined,
      });
      onUpdated(updated);
      setEditId(null);
      toast.success(t.categorieUpdated);
    } catch { toast.error(t.errorSave); }
  });

  const handleDelete = (id: string) => startDel(async () => {
    try {
      await menuRepository.deleteCategorie(id);
      onDeleted(id);
      toast.success(t.categorieDeleted);
    } catch { toast.error(t.errorDelete); }
  });

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-muted)]">
          {categories.length} {categories.length !== 1 ? t.categoriesPlural : t.categoriesSingular}
        </span>
        {!adding && (
          <button type="button" onClick={startAdd}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="w-3 h-3" /> {t.addCategorie}
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {adding && (
        <InlineForm
          nomFr={nomFr} nomEn={nomEn}
          onNomFr={setNomFr} onNomEn={setNomEn}
          onSave={handleCreate} onCancel={cancel}
          saving={saving} t={t}
        />
      )}

      {/* Liste catégories */}
      {categories.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2
          rounded-xl border border-dashed border-[var(--border)] text-center">
          <Tag className="w-6 h-6 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t.emptyCategories}</p>
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat.id}>
            {editId === cat.id ? (
              <InlineForm
                nomFr={nomFr} nomEn={nomEn}
                onNomFr={setNomFr} onNomEn={setNomEn}
                onSave={() => handleUpdate(cat.id)} onCancel={cancel}
                saving={saving} t={t}
              />
            ) : (
              <button type="button" onClick={() => onSelect(cat.id)}
                className={cn(
                  "w-full group flex items-center justify-between px-4 py-3",
                  "rounded-xl border transition-all duration-150 text-left",
                  cat.id === selectedId
                    ? "shadow-sm text-white"
                    : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)]",
                )}
                style={cat.id === selectedId ? {
                  backgroundColor: theme.primary, borderColor: theme.primary,
                } : undefined}
              >
                <span className="text-sm font-medium truncate">{cat.nom_fr}</span>
                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                    className="p-1 rounded-lg hover:bg-black/10">
                    <Pencil className="w-3 h-3" />
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                    className="p-1 rounded-lg hover:bg-black/10">
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </span>
                </span>
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function InlineForm({ nomFr, nomEn, onNomFr, onNomEn, onSave, onCancel, saving, t }: {
  nomFr: string; nomEn: string;
  onNomFr: (v: string) => void; onNomEn: (v: string) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; t: Record<string, string>;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 space-y-2">
      <input className="input-base text-sm" placeholder={t.categorieNomFr}
        value={nomFr} onChange={(e) => onNomFr(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSave()} autoFocus />
      <input className="input-base text-sm" placeholder={t.categorieNomEn}
        value={nomEn} onChange={(e) => onNomEn(e.target.value)} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg)]">
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
        <button type="button" onClick={onSave} disabled={saving || !nomFr.trim()}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {t.save}
        </button>
      </div>
    </div>
  );
}