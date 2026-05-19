// src/app/(dashboard)/knowledge/_components/tabs/CitoyensTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Landmark, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, FileText, Clock, MapPin,
} from "lucide-react";
import { useSector }                from "@/hooks/useSector";
import { useToast }                 from "@/components/ui/Toast";
import { serviceCitoyenRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton }    from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type {
  ServiceCitoyen, EtapeProcedure, CategorieServiceCitoyen,
} from "@/types/api/p5.types";

const CATEGORIES: Record<CategorieServiceCitoyen, { label: string; color: string }> = {
  etat_civil: { label: "État civil",             color: "bg-blue-100 text-blue-700 border-blue-200" },
  permis:     { label: "Permis & autorisations", color: "bg-amber-100 text-amber-700 border-amber-200" },
  fiscal:     { label: "Fiscal & taxes",         color: "bg-rose-100 text-rose-700 border-rose-200" },
  social:     { label: "Action sociale",         color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  justice:    { label: "Justice",                color: "bg-violet-100 text-violet-700 border-violet-200" },
  autre:      { label: "Autre",                  color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const EMPTY = {
  nom_fr: "", description_fr: "",
  categorie:            "autre" as CategorieServiceCitoyen,
  documents_requis:     "",
  duree_traitement:     "",
  frais:                "",
  lieu:                 "",
  etapes_procedure:     "",  // une étape par ligne
  horaires_service:     "",  // texte libre ex: "Lun-Ven 8h-17h"
  delai_relance_jours:  "7",
};
type FormState = typeof EMPTY;

// ── Helpers ──────────────────────────────────────────────────────────────────

const parseDocs  = (s: string): string[] =>
  s.split(",").map((d) => d.trim()).filter(Boolean);

const docsToStr  = (docs: string[]): string => docs.join(", ");

const parseEtapes = (s: string): EtapeProcedure[] =>
  s.split("\n").map((e, i) => e.trim()).filter(Boolean).map((etape, i) => ({ ordre: i + 1, etape }));

const etapesToStr = (etapes: EtapeProcedure[]): string =>
  (etapes ?? []).map((e) => e.etape).join("\n");

const parseHoraires = (s: string): Record<string, string> => {
  if (!s.trim()) return {};
  try   { return JSON.parse(s); }
  catch { return { general: s.trim() }; }
};

const horairesToStr = (h: Record<string, string> | undefined): string => {
  if (!h || Object.keys(h).length === 0) return "";
  return h.general ?? JSON.stringify(h);
};

// ── Composant principal ───────────────────────────────────────────────────────

export function CitoyensTab() {
  const { theme }  = useSector();
  const toast      = useToast();
  const [items,   setItems]   = useState<ServiceCitoyen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    serviceCitoyenRepository.getList()
      .then(setItems)
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const onChange = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toPayload = (f: FormState) => ({
    nom_fr:              f.nom_fr.trim(),
    description_fr:      f.description_fr.trim() || undefined,
    categorie:           f.categorie,
    documents_requis:    parseDocs(f.documents_requis),
    duree_traitement:    f.duree_traitement.trim() || undefined,
    frais:               f.frais ? Number(f.frais) : null,
    lieu:                f.lieu.trim() || undefined,
    is_available:        true,
    ordre:               0,
    etapes_procedure:    parseEtapes(f.etapes_procedure),
    horaires_service:    parseHoraires(f.horaires_service),
    delai_relance_jours: Number(f.delai_relance_jours) || 7,
  });

  const fillForm = (item: ServiceCitoyen): FormState => ({
    nom_fr:              item.nom_fr,
    description_fr:      item.description_fr ?? "",
    categorie:           item.categorie,
    documents_requis:    docsToStr(item.documents_requis ?? []),
    duree_traitement:    item.duree_traitement ?? "",
    frais:               item.frais !== null ? String(item.frais) : "",
    lieu:                item.lieu ?? "",
    etapes_procedure:    etapesToStr(item.etapes_procedure ?? []),
    horaires_service:    horairesToStr(item.horaires_service),
    delai_relance_jours: String(item.delai_relance_jours ?? 7),
  });

  const handleAdd = () => startSave(async () => {
    try {
      const created = await serviceCitoyenRepository.create(toPayload(form));
      setItems((p) => [...p, created]); setShowAdd(false); setForm(EMPTY);
      toast.success("Service ajouté");
    } catch { toast.error("Erreur lors de l'ajout"); }
  });

  const handleUpdate = () => {
    if (!editId) return;
    startSave(async () => {
      try {
        const updated = await serviceCitoyenRepository.update(editId, toPayload(form));
        setItems((p) => p.map((i) => (i.id === editId ? updated : i)));
        setEditId(null); setForm(EMPTY);
        toast.success("Service mis à jour");
      } catch { toast.error("Erreur lors de la mise à jour"); }
    });
  };

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await serviceCitoyenRepository.delete(id);
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success("Service supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  });

  const handleToggle = (item: ServiceCitoyen) => startSave(async () => {
    try {
      const u = await serviceCitoyenRepository.update(item.id, { is_available: !item.is_available });
      setItems((p) => p.map((i) => (i.id === item.id ? u : i)));
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
        {!showAdd && !editId && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un service
          </button>
        )}
      </div>

      {showAdd && (
        <ServiceForm form={form} onChange={onChange}
          onSave={handleAdd} onCancel={() => { setShowAdd(false); setForm(EMPTY); }}
          saving={saving} theme={theme} />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Landmark className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun service configuré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId === item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ServiceForm form={form} onChange={onChange}
                onSave={handleUpdate}
                onCancel={() => { setEditId(null); setForm(EMPTY); }}
                saving={saving} theme={theme} isEdit />
            </div>
          ) : (
            <ServiceCard key={item.id} item={item} theme={theme} saving={saving}
              onToggle={() => handleToggle(item)}
              onEdit={() => { setEditId(item.id); setForm(fillForm(item)); setShowAdd(false); }}
              onDelete={() => handleDelete(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ServiceCard({ item, theme, saving, onToggle, onEdit, onDelete }: {
  item: ServiceCitoyen;
  theme: { primary: string };
  saving: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const etapes   = item.etapes_procedure ?? [];
  const horaires = item.horaires_service;
  const horairesLabel = horaires?.general ?? (Object.keys(horaires ?? {}).length > 0 ? "Voir horaires" : null);

  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-2 hover:shadow-md transition-all",
      !item.is_available && "opacity-60"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0",
          CATEGORIES[item.categorie]?.color,
        )}>
          {CATEGORIES[item.categorie]?.label}
        </span>
      </div>

      {item.description_fr && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
        {item.frais !== null && (
          <span className="font-bold" style={{ color: theme.primary }}>
            {Number(item.frais).toLocaleString("fr-FR")} XAF
          </span>
        )}
        {item.duree_traitement && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{item.duree_traitement}
          </span>
        )}
        {item.lieu && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />{item.lieu}
          </span>
        )}
      </div>

      {/* Étapes + Horaires */}
      <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
        {etapes.length > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {etapes.length} étape{etapes.length > 1 ? "s" : ""}
          </span>
        )}
        {horairesLabel && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{horairesLabel}
          </span>
        )}
        {item.delai_relance_jours && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)]">
            Relance : {item.delai_relance_jours}j
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <button type="button" onClick={onToggle} disabled={saving}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)]">
          {item.is_available
            ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" />Dispo</>
            : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" />Indispo</>}
        </button>
        <div className="flex gap-1">
          <button type="button" onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)]">
            <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
          <button type="button" onClick={onDelete} disabled={saving}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function ServiceForm({ form, onChange, onSave, onCancel, saving, theme, isEdit = false }: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; isEdit?: boolean;
}) {
  const inp = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(k, e.target.value);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">
        {isEdit ? "Modifier le service" : "Nouveau service"}
      </p>

      <Row label="Nom du service *">
        <input className="input-base" value={form.nom_fr} onChange={inp("nom_fr")} autoFocus />
      </Row>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2}
          value={form.description_fr} onChange={inp("description_fr")} />
      </Row>
      <Row label="Catégorie">
        <select className="input-base" value={form.categorie} onChange={inp("categorie")}>
          {Object.entries(CATEGORIES).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </Row>
      <Row label="Documents requis (séparés par virgule)">
        <input className="input-base" placeholder="CNI, Acte de naissance"
          value={form.documents_requis} onChange={inp("documents_requis")} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Durée de traitement">
          <input className="input-base" placeholder="3 jours ouvrables"
            value={form.duree_traitement} onChange={inp("duree_traitement")} />
        </Row>
        <Row label="Frais (XAF)">
          <input className="input-base" type="number" min="0"
            value={form.frais} onChange={inp("frais")} />
        </Row>
      </div>
      <Row label="Lieu / Bureau">
        <input className="input-base" placeholder="Guichet 3, Bâtiment A"
          value={form.lieu} onChange={inp("lieu")} />
      </Row>
      <Row label="Étapes de la démarche (une par ligne)">
        <textarea className="input-base resize-none" rows={3}
          placeholder={"Se présenter au guichet 3\nFournir les documents requis\nPayer les frais"}
          value={form.etapes_procedure} onChange={inp("etapes_procedure")} />
      </Row>
      <Row label="Horaires du service (ex: Lun-Ven 8h-17h)">
        <input className="input-base" placeholder="Lun-Ven 8h-17h, Sam 8h-12h"
          value={form.horaires_service} onChange={inp("horaires_service")} />
      </Row>
      <Row label="Délai de relance (jours)">
        <input className="input-base w-24" type="number" min="1"
          value={form.delai_relance_jours} onChange={inp("delai_relance_jours")} />
      </Row>

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
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}