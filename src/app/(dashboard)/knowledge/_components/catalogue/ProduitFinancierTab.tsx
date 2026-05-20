// src/app/(dashboard)/knowledge/_components/catalogue/ProduitFinancierTab.tsx
// B5 S39 — Migration S2→S3 : ProduitFinancier → ProduitFinancierKB
// Champs : nom_fr→nom · description_fr→description · is_available→disponible
// type_produit/taux/montant → encodés dans description (details_financiers à enrichir via itération B5)
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Landmark, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { produitFinancierRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProduitFinancierKB } from "@/types/api/catalogue.types";

const EMPTY = {
  nom:         "",
  description: "",
  prix:        "",
};

export function ProduitFinancierTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<ProduitFinancierKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    produitFinancierRepository.getList()
      .then(setItems)
      .catch(() => toast.error("Erreur chargement"))
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
      toast.success("Produit financier ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const u = await produitFinancierRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success("Produit financier mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await produitFinancierRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Produit financier supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  });

  const handleToggle = (item: ProduitFinancierKB) => startSave(async () => {
    try {
      const u = await produitFinancierRepository.update(item.id, { disponible: !item.disponible });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
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
            <Plus className="w-4 h-4" /> Ajouter un produit
          </button>
        )}
      </div>

      {showAdd && (
        <FinancierForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme} label="Nouveau produit financier" />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Landmark className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun produit financier. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => editId === item.id ? (
            <FinancierForm key={item.id} form={form} set={set}
              onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
              saving={saving} theme={theme} label="Modifier le produit financier" />
          ) : (
            <div key={item.id} className={cn(
              "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:shadow-sm transition-all",
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
                        Taux : {item.details_financiers.taux_annuel_min}%
                        {item.details_financiers.taux_annuel_max
                          ? ` – ${item.details_financiers.taux_annuel_max}%`
                          : ""}
                      </span>
                    )}
                    {item.details_financiers.montant_min != null && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg)] rounded text-[var(--text-muted)]">
                        Min : {Number(item.details_financiers.montant_min).toLocaleString("fr-FR")} XAF
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
          ))}
        </div>
      )}
    </div>
  );
}

function FinancierForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label="Nom du produit *">
        <input className="input-base" value={form.nom} onChange={set("nom")}
          placeholder="Ex : Compte épargne, Crédit logement…" autoFocus />
      </Row>
      <Row label="Description (conditions, taux, durée…)">
        <textarea className="input-base resize-none" rows={3} value={form.description}
          onChange={set("description")}
          placeholder="Ex : Taux 8% · Durée 5-15 ans · Apport 20% minimum · Délai traitement : 15 jours" />
      </Row>
      <Row label="Montant / Prix indicatif (XAF)">
        <input className="input-base" type="number" min="0" value={form.prix}
          onChange={set("prix")} placeholder="Laisser vide si variable" />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom.trim()}
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

// END OF FILE: src/app/(dashboard)/knowledge/_components/catalogue/ProduitFinancierTab.tsx