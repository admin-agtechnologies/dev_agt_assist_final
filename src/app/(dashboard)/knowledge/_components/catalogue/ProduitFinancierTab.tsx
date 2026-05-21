// src/app/(dashboard)/knowledge/_components/catalogue/ProduitFinancierTab.tsx
// S46 — hover lift + hover:-translate-y-0.5 + empty state sectoriel + i18n complet
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Landmark, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useToast }    from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { produitFinancierRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProduitFinancierKB } from "@/types/api/catalogue.types";

const EMPTY = { nom: "", description: "", prix: "" };

export function ProduitFinancierTab() {
  const { theme }         = useSector();
  const toast             = useToast();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.produitFinancier;

  const [items,   setItems]   = useState<ProduitFinancierKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    produitFinancierRepository.getList()
      .then(setItems)
      .catch(() => toast.error(t.errorLoad))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:         f.nom.trim(),
    description: f.description.trim() || undefined,
    prix:        f.prix ? Number(f.prix) : null,
    disponible:  true,
    ordre:       items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const c = await produitFinancierRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setShowAdd(false); setForm(EMPTY);
      toast.success(t.createSuccess);
    } catch { toast.error(t.createError); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const u = await produitFinancierRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success(t.updateSuccess);
    } catch { toast.error(t.updateError); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await produitFinancierRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(t.deleteSuccess);
    } catch { toast.error(t.deleteError); }
  });

  const handleToggle = (item: ProduitFinancierKB) => startSave(async () => {
    try {
      const u = await produitFinancierRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error(t.updateError); }
  });

  const startEdit = (item: ProduitFinancierKB) => {
    setEditId(item.id); setShowAdd(false);
    setForm({
      nom:         item.nom,
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
          {items.length} produit{items.length !== 1 ? "s" : ""} financier{items.length !== 1 ? "s" : ""}
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {t.addBtn}
          </button>
        )}
      </div>

      {showAdd && (
        <FinancierForm form={form} set={set} theme={theme} t={t} d={d}
          onSave={handleCreate} onCancel={() => setShowAdd(false)}
          saving={saving} label={t.newTitle} />
      )}

      {/* Empty state sectoriel */}
      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${theme.primary} 10%, transparent)` }}>
            <Landmark className="w-7 h-7" style={{ color: theme.primary }} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => editId === item.id ? (
            <FinancierForm key={item.id} form={form} set={set} theme={theme} t={t} d={d}
              onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
              saving={saving} label={t.editTitle} />
          ) : (
            <div key={item.id} className={cn(
              "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4",
              "flex items-center gap-4",
              "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
              !item.disponible && "opacity-60",
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <span className="font-semibold text-[var(--text)] truncate">{item.nom}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.details_financiers && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {item.details_financiers.taux_annuel_min != null && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg)] rounded text-[var(--text-muted)]">
                        {t.taux} : {item.details_financiers.taux_annuel_min}%
                        {item.details_financiers.taux_annuel_max
                          ? ` – ${item.details_financiers.taux_annuel_max}%`
                          : ""}
                      </span>
                    )}
                    {item.details_financiers.montant_min != null && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg)] rounded text-[var(--text-muted)]">
                        {t.montantMin} : {Number(item.details_financiers.montant_min).toLocaleString("fr-FR")} XAF
                      </span>
                    )}
                  </div>
                )}
                {item.prix != null && (
                  <p className="text-sm font-bold mt-1.5" style={{ color: theme.primary }}>
                    {Number(item.prix).toLocaleString("fr-FR")} XAF
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                  className="transition-colors"
                  style={{ color: item.disponible ? "var(--status-success-text)" : "var(--text-muted)" }}>
                  {item.disponible
                    ? <ToggleRight className="w-5 h-5" />
                    : <ToggleLeft  className="w-5 h-5" />}
                </button>
                <button type="button" onClick={() => startEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]
                    hover:text-[var(--text)] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-[var(--status-danger-bg)]
                    text-[var(--text-muted)] hover:text-[var(--status-danger-text)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function FinancierForm({ form, set, onSave, onCancel, saving, theme, t, d, label }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string };
  t: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d: any; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label={t.nomLabel}>
        <input className="input-base" value={form.nom} onChange={set("nom")}
          placeholder={t.nomPH} autoFocus />
      </Row>
      <Row label={t.descriptionLabel}>
        <textarea className="input-base resize-none" rows={3} value={form.description}
          onChange={set("description")} placeholder={t.descriptionPH} />
      </Row>
      <Row label={t.prixLabel}>
        <input className="input-base" type="number" min="0" value={form.prix}
          onChange={set("prix")} placeholder={t.prixPH} />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {d.common.cancel}
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom.trim()}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {d.common.save}
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