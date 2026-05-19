// src/app/(dashboard)/knowledge/_components/tabs/ConciergerieKbTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Bell, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X } from "lucide-react";
import { useSector }  from "@/hooks/useSector";
import { useToast }   from "@/components/ui/Toast";
import { api }        from "@/lib/api-client";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";

// ── Types locaux ──────────────────────────────────────────────────────────────

interface ServiceConciergerie {
  id:              string;
  nom_fr:          string;
  nom_en?:         string;
  description_fr?: string;
  prix:            number | null;
  is_available:    boolean;
  ordre:           number;
}

const EMPTY = { nom_fr: "", nom_en: "", description_fr: "", prix: "" };

// ── Composant ─────────────────────────────────────────────────────────────────

export function ConciergerieKbTab() {
  const { theme } = useSector();
  const toast     = useToast();

  const [items,   setItems]   = useState<ServiceConciergerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  // Endpoint catalogue services de conciergerie
  const ENDPOINT = "/api/v1/knowledge/catalogue-services/?feature=conciergerie";

  useEffect(() => {
    api.get<ServiceConciergerie[] | { results: ServiceConciergerie[] }>(ENDPOINT)
      .then((data) => {
        setItems(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(() => toast.error("Erreur chargement des services"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr:         f.nom_fr.trim(),
    nom_en:         f.nom_en.trim() || undefined,
    description_fr: f.description_fr.trim() || undefined,
    prix:           f.prix ? Number(f.prix) : null,
    is_available:   true,
    feature:        "conciergerie",
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const created = await api.post<ServiceConciergerie>(
        "/api/v1/knowledge/catalogue-services/", toPayload(form)
      );
      setItems((p) => [...p, created]);
      setShowAdd(false); setForm(EMPTY);
      toast.success("Service ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    try {
      const updated = await api.patch<ServiceConciergerie>(
        `/api/v1/knowledge/catalogue-services/${id}/`, toPayload(form)
      );
      setItems((p) => p.map((x) => x.id === id ? updated : x));
      setEditId(null);
      toast.success("Service mis à jour");
    } catch { toast.error("Erreur"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await api.delete(`/api/v1/knowledge/catalogue-services/${id}/`);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Service supprimé");
    } catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: ServiceConciergerie) => startSave(async () => {
    try {
      const u = await api.patch<ServiceConciergerie>(
        `/api/v1/knowledge/catalogue-services/${item.id}/`,
        { is_available: !item.is_available }
      );
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error("Erreur"); }
  });

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} service{items.length !== 1 ? "s" : ""}
        </p>
        {!showAdd && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un service
          </button>
        )}
      </div>

      {showAdd && (
        <ServiceForm form={form} set={set}
          onSave={handleCreate} onCancel={() => setShowAdd(false)}
          saving={saving} theme={theme} label="Nouveau service" />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Bell className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun service de conciergerie configuré.</p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">
            Ajoutez les services que votre bot peut proposer : room service, transfert, spa, etc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId === item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ServiceForm form={form} set={set}
                onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                saving={saving} theme={theme} label="Modifier le service" />
            </div>
          ) : (
            <div key={item.id} className={cn(
              "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-2 hover:shadow-md transition-all",
              !item.is_available && "opacity-60"
            )}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
                <button type="button" onClick={() => handleToggle(item)} disabled={saving}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)] flex-shrink-0">
                  {item.is_available
                    ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" />Actif</>
                    : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" />Inactif</>}
                </button>
              </div>
              {item.description_fr && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>
              )}
              {item.prix !== null && (
                <span className="text-xs font-bold" style={{ color: theme.primary }}>
                  {Number(item.prix).toLocaleString("fr-FR")} XAF
                </span>
              )}
              <div className="flex justify-end gap-1 mt-auto pt-1">
                <button type="button"
                  onClick={() => {
                    setEditId(item.id); setShowAdd(false);
                    setForm({
                      nom_fr: item.nom_fr, nom_en: item.nom_en ?? "",
                      description_fr: item.description_fr ?? "",
                      prix: item.prix != null ? String(item.prix) : "",
                    });
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg)]">
                  <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
  form: typeof EMPTY;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label="Nom du service *">
        <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
      </Row>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2}
          value={form.description_fr} onChange={set("description_fr")} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Prix (XAF)">
          <input className="input-base" type="number" min="0"
            value={form.prix} onChange={set("prix")} />
        </Row>
        <Row label="Nom EN (optionnel)">
          <input className="input-base" value={form.nom_en} onChange={set("nom_en")} />
        </Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom_fr.trim()}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Enregistrer
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