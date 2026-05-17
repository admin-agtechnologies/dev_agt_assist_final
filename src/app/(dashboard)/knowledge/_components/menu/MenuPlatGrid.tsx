// src/app/(dashboard)/knowledge/_components/menu/MenuPlatGrid.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, UtensilsCrossed, Loader2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useSector }      from "@/hooks/useSector";
import { useToast }       from "@/components/ui/Toast";
import { menuRepository } from "@/repositories/menu.repository";
import { cn }             from "@/lib/utils";
import type { MenuPlat, MenuCategorie, CreateMenuPlatPayload } from "@/types/api/menu.types";

interface Props {
  categorie: MenuCategorie;
  onPlatCreated: (plat: MenuPlat) => void;
  onPlatUpdated: (plat: MenuPlat) => void;
  onPlatDeleted: (id: string) => void;
  t: Record<string, string>;
}

const EMPTY_FORM = { nom_fr: "", nom_en: "", description_fr: "", prix: "", image_url: "" };

export function MenuPlatGrid({ categorie, onPlatCreated, onPlatUpdated, onPlatDeleted, t }: Props) {
  const { theme } = useSector();
  const toast     = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  startSave]  = useTransition();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim() || !form.prix) return;
    try {
      const payload: CreateMenuPlatPayload = {
        categorie:      categorie.id,
        nom_fr:         form.nom_fr.trim(),
        nom_en:         form.nom_en.trim() || undefined,
        description_fr: form.description_fr.trim() || undefined,
        prix:           Number(form.prix),
        image_url:      form.image_url.trim() || undefined,
        is_available:   true,
        ordre:          categorie.plats.length,
      };
      const created = await menuRepository.createPlat(payload);
      onPlatCreated(created);
      setForm(EMPTY_FORM);
      setShowAdd(false);
      toast.success(t.platCreated);
    } catch { toast.error(t.errorSave); }
  });

  const handleUpdate = (plat: MenuPlat) => startSave(async () => {
    if (!form.nom_fr.trim() || !form.prix) return;
    try {
      const updated = await menuRepository.updatePlat(plat.id, {
        nom_fr: form.nom_fr.trim(), nom_en: form.nom_en.trim() || undefined,
        description_fr: form.description_fr.trim() || undefined,
        prix: Number(form.prix), image_url: form.image_url.trim() || undefined,
      });
      onPlatUpdated(updated);
      setEditId(null);
      toast.success(t.platUpdated);
    } catch { toast.error(t.errorSave); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try { await menuRepository.deletePlat(id); onPlatDeleted(id); toast.success(t.platDeleted); }
    catch { toast.error(t.errorDelete); }
  });

  const handleToggle = (plat: MenuPlat) => startSave(async () => {
    try {
      const updated = await menuRepository.updatePlat(plat.id, { is_available: !plat.is_available });
      onPlatUpdated(updated);
    } catch { toast.error(t.errorSave); }
  });

  const startEdit = (plat: MenuPlat) => {
    setEditId(plat.id);
    setForm({ nom_fr: plat.nom_fr, nom_en: plat.nom_en, description_fr: plat.description_fr, prix: String(plat.prix), image_url: plat.image_url });
  };

  return (
    <div className="space-y-4">
      {/* Header catégorie sélectionnée */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text)]">{categorie.nom_fr}</h3>
          <p className="text-xs text-[var(--text-muted)]">{categorie.plats.length} plat{categorie.plats.length !== 1 ? "s" : ""}</p>
        </div>
        {!showAdd && (
          <button type="button" onClick={() => { setShowAdd(true); setEditId(null); }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {t.addPlat}
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <PlatForm form={form} set={set} onSave={handleCreate}
          onCancel={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
          saving={saving} t={t} theme={theme} />
      )}

      {/* Grille des plats */}
      {categorie.plats.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t.emptyPlats}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categorie.plats.map((plat) =>
            editId === plat.id ? (
              <div key={plat.id} className="sm:col-span-2 xl:col-span-3">
                <PlatForm form={form} set={set} onSave={() => handleUpdate(plat)}
                  onCancel={() => setEditId(null)}
                  saving={saving} t={t} theme={theme} />
              </div>
            ) : (
              <PlatCard key={plat.id} plat={plat} theme={theme} t={t}
                onEdit={() => startEdit(plat)}
                onDelete={() => handleDelete(plat.id)}
                onToggle={() => handleToggle(plat)}
                saving={saving} />
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Plat Card ────────────────────────────────────────────────────────────────

function PlatCard({ plat, theme, t, onEdit, onDelete, onToggle, saving }: {
  plat: MenuPlat; theme: { primary: string };
  t: Record<string, string>;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
  saving: boolean;
}) {
  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden",
      "flex flex-col transition-all hover:shadow-md hover:border-[var(--text-muted)]",
      !plat.is_available && "opacity-60",
    )}>
      {/* Image / Placeholder */}
      <div className="h-28 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.primary}44)` }}>
        {plat.image_url ? (
          <img src={plat.image_url} alt={plat.nom_fr}
            className="w-full h-full object-cover" />
        ) : (
          <UtensilsCrossed className="w-8 h-8 opacity-40" style={{ color: theme.primary }} />
        )}
        {/* Badge disponibilité */}
        <button type="button" onClick={onToggle} disabled={saving}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm bg-white/80 dark:bg-black/40 transition-all">
          {plat.is_available
            ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" /> {t.disponible}</>
            : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {t.indisponible}</>}
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-sm text-[var(--text)] leading-tight">{plat.nom_fr}</p>
          {plat.description_fr && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{plat.description_fr}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-sm font-bold" style={{ color: theme.primary }}>
            {Number(plat.prix).toLocaleString("fr-FR")} XAF
          </span>
          <div className="flex gap-1">
            <button type="button" onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors">
              <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <button type="button" onClick={onDelete} disabled={saving}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire plat ──────────────────────────────────────────────────────────

function PlatForm({ form, set, onSave, onCancel, saving, t, theme }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; t: Record<string, string>; theme: { primary: string };
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Row label={t.platNomFr + " *"}>
          <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
        </Row>
        <Row label={t.platNomEn}>
          <input className="input-base" value={form.nom_en} onChange={set("nom_en")} />
        </Row>
      </div>
      <Row label={t.platDescFr}>
        <textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")} />
      </Row>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Row label={t.platPrix + " *"}>
          <input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")} />
        </Row>
        <Row label={t.platImageUrl}>
          <input className="input-base" type="url" placeholder="https://..." value={form.image_url} onChange={set("image_url")} />
        </Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {t.cancel}
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom_fr.trim() || !form.prix}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t.save}
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