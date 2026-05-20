// src/app/(dashboard)/knowledge/_components/tabs/ConciergerieKbTab.tsx
// B5 S39 — Migration S2→S3 : ServiceConciergerie local → CatalogueItemKB
// nom_fr → nom · description_fr → description · is_available → disponible
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Bell, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { useSector }  from "@/hooks/useSector";
import { useToast }   from "@/components/ui/Toast";
import { api }        from "@/lib/api-client";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueItemKB } from "@/types/api/catalogue.types";

const EMPTY = { nom: "", nom_en: "", description: "", prix: "" };
const ENDPOINT = "/api/v1/knowledge/catalogue-services/";

export function ConciergerieKbTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<CatalogueItemKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    api.get<CatalogueItemKB[] | { results: CatalogueItemKB[] }>(
      `${ENDPOINT}?feature=conciergerie`
    )
      .then((data) => setItems(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => toast.error("Erreur chargement des services"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom:          f.nom.trim(),
    description:  f.description.trim() || undefined,
    prix:         f.prix ? Number(f.prix) : null,
    disponible:   true,
    feature:      "conciergerie",
    ordre:        items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom.trim()) return;
    try {
      const created = await api.post<CatalogueItemKB>(ENDPOINT, toPayload(form));
      setItems((p) => [...p, created]);
      setShowAdd(false); setForm(EMPTY);
      toast.success("Service ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    try {
      const updated = await api.patch<CatalogueItemKB>(`${ENDPOINT}${id}/`, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? updated : x));
      setEditId(null);
      toast.success("Service mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await api.delete(`${ENDPOINT}${id}/`);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Service supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
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
      nom_en:      "",
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
          {items.length} service{items.length !== 1 ? "s" : ""} de conciergerie
        </p>
        {!showAdd && !editId && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un service
          </button>
        )}
      </div>

      {showAdd && (
        <ServiceForm form={form} set={set} onSave={handleCreate}
          onCancel={() => setShowAdd(false)} saving={saving} theme={theme} label="Nouveau service" />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Bell className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun service. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => editId === item.id ? (
            <ServiceForm key={item.id} form={form} set={set}
              onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
              saving={saving} theme={theme} label="Modifier le service" />
          ) : (
            <div key={item.id} className={cn(
              "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:shadow-sm transition-all",
              !item.disponible && "opacity-60",
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <span className="font-semibold text-[var(--text)] truncate">{item.nom}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{item.description}</p>
                )}
                <p className="text-sm font-bold mt-1.5" style={{ color: theme.primary }}>
                  {item.prix != null ? `${Number(item.prix).toLocaleString("fr-FR")} XAF` : "Sur devis"}
                </p>
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

function ServiceForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label="Nom du service *">
        <input className="input-base" value={form.nom} onChange={set("nom")}
          placeholder="Ex : Transfert aéroport, Room service…" autoFocus />
      </Row>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2} value={form.description}
          onChange={set("description")} placeholder="Conditions, horaires, inclus…" />
      </Row>
      <Row label="Prix (XAF)">
        <input className="input-base" type="number" min="0" value={form.prix}
          onChange={set("prix")} placeholder="Laisser vide = sur devis" />
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

// END OF FILE: src/app/(dashboard)/knowledge/_components/tabs/ConciergerieKbTab.tsx