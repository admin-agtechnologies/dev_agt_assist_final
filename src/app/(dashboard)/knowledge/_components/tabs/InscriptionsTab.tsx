// src/app/(dashboard)/knowledge/_components/tabs/InscriptionsTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, GraduationCap, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, Calendar, ListOrdered, FileCheck,
} from "lucide-react";
import { useSector }           from "@/hooks/useSector";
import { useToast }            from "@/components/ui/Toast";
import { programmeRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProgrammeAdmission, NiveauAdmission } from "@/types/api/p5.types";

// Sync avec backend NIVEAU_CHOICES — 9 valeurs actives + 2 legacy
const NIVEAUX: Record<NiveauAdmission, string> = {
  primaire:      "Primaire",
  college:       "Collège",
  lycee:         "Lycée",
  bts_dut:       "BTS / DUT",
  licence:       "Licence / Bachelor",
  master:        "Master",
  doctorat:      "Doctorat",
  formation_pro: "Formation pro",
  autre:         "Autre",
  // Legacy (conservés en BD, non proposés à la création)
  secondaire:    "Secondaire",
  superieur:     "Supérieur",
};

// Valeurs proposées dans le select (hors legacy)
const NIVEAUX_SELECT: NiveauAdmission[] = [
  "primaire", "college", "lycee", "bts_dut",
  "licence", "master", "doctorat", "formation_pro", "autre",
];

const EMPTY = {
  nom_fr: "", description_fr: "", niveau: "licence" as NiveauAdmission,
  duree: "", frais_inscription: "", conditions_admission: "",
  date_ouverture: "", date_fermeture: "",
  frais_scolarite_annuels: "", places_disponibles: "",
  documents_requis: "",    // "CNI, Relevé de notes" → split par virgule
  etapes_inscription: "", // une étape par ligne → string[]
};

const parseDocs   = (s: string) => s.split(",").map((d) => d.trim()).filter(Boolean);
const docsToStr   = (docs: string[]) => (docs ?? []).join(", ");
const parseEtapes = (s: string) => s.split("\n").map((e) => e.trim()).filter(Boolean);
const etapesToStr = (arr: string[]) => (arr ?? []).join("\n");

export function InscriptionsTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<ProgrammeAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    programmeRepository.getList()
      .then(setItems)
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr:               f.nom_fr.trim(),
    description_fr:       f.description_fr.trim() || undefined,
    niveau:               f.niveau,
    duree:                f.duree.trim() || undefined,
    frais_inscription:    f.frais_inscription ? Number(f.frais_inscription) : null,
    conditions_admission: f.conditions_admission.trim() || undefined,
    date_ouverture:       f.date_ouverture || null,
    date_fermeture:       f.date_fermeture || null,
    is_available:         true,
    ordre:                items.length,
    frais_scolarite_annuels: f.frais_scolarite_annuels ? Number(f.frais_scolarite_annuels) : null,
    places_disponibles:   f.places_disponibles ? Number(f.places_disponibles) : null,
    documents_requis:     parseDocs(f.documents_requis),
    etapes_inscription:   parseEtapes(f.etapes_inscription),
  });

  const fillForm = (item: ProgrammeAdmission): typeof EMPTY => ({
    nom_fr:               item.nom_fr,
    description_fr:       item.description_fr ?? "",
    niveau:               item.niveau,
    duree:                item.duree ?? "",
    frais_inscription:    item.frais_inscription != null ? String(item.frais_inscription) : "",
    conditions_admission: item.conditions_admission ?? "",
    date_ouverture:       item.date_ouverture ?? "",
    date_fermeture:       item.date_fermeture ?? "",
    frais_scolarite_annuels: item.frais_scolarite_annuels != null ? String(item.frais_scolarite_annuels) : "",
    places_disponibles:   item.places_disponibles != null ? String(item.places_disponibles) : "",
    documents_requis:     docsToStr(item.documents_requis ?? []),
    etapes_inscription:   etapesToStr(item.etapes_inscription ?? []),
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const c = await programmeRepository.create(toPayload(form));
      setItems((p) => [...p, c]); setShowAdd(false); setForm(EMPTY);
      toast.success("Programme ajouté");
    } catch { toast.error("Erreur"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const u = await programmeRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x)); setEditId(null);
      toast.success("Programme mis à jour");
    } catch { toast.error("Erreur"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await programmeRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Programme supprimé");
    } catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: ProgrammeAdmission) => startSave(async () => {
    try {
      const u = await programmeRepository.update(item.id, { is_available: !item.is_available });
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
          {items.length} programme{items.length !== 1 ? "s" : ""}
        </p>
        {!showAdd && (
          <button type="button"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Ajouter un programme
          </button>
        )}
      </div>

      {showAdd && (
        <ProgrammeForm form={form} set={set}
          onSave={handleCreate} onCancel={() => setShowAdd(false)}
          saving={saving} theme={theme} label="Nouveau programme" />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <GraduationCap className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">Aucun programme configuré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId === item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ProgrammeForm form={form} set={set}
                onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                saving={saving} theme={theme} label="Modifier le programme" />
            </div>
          ) : (
            <ProgrammeCard key={item.id} item={item} theme={theme} saving={saving}
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

function ProgrammeCard({ item, theme, saving, onToggle, onEdit, onDelete }: {
  item: ProgrammeAdmission;
  theme: { primary: string };
  saving: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const docs   = item.documents_requis   ?? [];
  const etapes = item.etapes_inscription ?? [];
  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3 hover:shadow-md transition-all",
      !item.is_available && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
            {NIVEAUX[item.niveau] ?? item.niveau}
          </span>
        </div>
        <button type="button" onClick={onToggle} disabled={saving}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)] flex-shrink-0">
          {item.is_available
            ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" />Ouvert</>
            : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" />Fermé</>}
        </button>
      </div>

      {item.description_fr && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>
      )}

      {/* Infos financières & places */}
      <div className="grid grid-cols-2 gap-1 text-xs text-[var(--text-muted)]">
        {item.duree && (
          <span>Durée : <strong className="text-[var(--text)]">{item.duree}</strong></span>
        )}
        <span>
          {item.frais_inscription != null
            ? <strong className="text-[var(--text)]">{Number(item.frais_inscription).toLocaleString("fr-FR")} XAF</strong>
            : <span className="text-green-600 font-medium">Gratuit</span>}
        </span>
        {item.places_disponibles != null && (
          <span>Places : <strong className="text-[var(--text)]">{item.places_disponibles}</strong></span>
        )}
        {item.frais_scolarite_annuels != null && (
          <span>Scolarité : <strong className="text-[var(--text)]">{Number(item.frais_scolarite_annuels).toLocaleString("fr-FR")} XAF/an</strong></span>
        )}
      </div>

      {/* Documents requis — chips */}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <FileCheck className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          {docs.slice(0, 3).map((doc) => (
            <span key={doc}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
              {doc}
            </span>
          ))}
          {docs.length > 3 && (
            <span className="text-[10px] text-[var(--text-muted)]">+{docs.length - 3}</span>
          )}
        </div>
      )}

      {/* Étapes */}
      {etapes.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <ListOrdered className="w-3 h-3" />
          {etapes.length} étape{etapes.length > 1 ? "s" : ""}
        </div>
      )}

      {/* Dates */}
      {(item.date_ouverture || item.date_fermeture) && (
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Calendar className="w-3 h-3" />
          {item.date_ouverture && <span>Ouverture : {item.date_ouverture}</span>}
          {item.date_fermeture && <span>— Clôture : {item.date_fermeture}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-1 mt-auto pt-1">
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
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────

function ProgrammeForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form: typeof EMPTY;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string }; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>

      <Row label="Nom du programme *">
        <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
      </Row>
      <Row label="Description">
        <textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")} />
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label="Niveau *">
          <select className="input-base" value={form.niveau} onChange={set("niveau")}>
            {NIVEAUX_SELECT.map((v) => (
              <option key={v} value={v}>{NIVEAUX[v]}</option>
            ))}
          </select>
        </Row>
        <Row label="Durée">
          <input className="input-base" placeholder="2 ans" value={form.duree} onChange={set("duree")} />
        </Row>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Row label="Frais d'inscription (XAF)">
          <input className="input-base" type="number" min="0" value={form.frais_inscription} onChange={set("frais_inscription")} />
        </Row>
        <Row label="Frais scolarité annuels (XAF)">
          <input className="input-base" type="number" min="0" value={form.frais_scolarite_annuels} onChange={set("frais_scolarite_annuels")} />
        </Row>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Row label="Places disponibles">
          <input className="input-base" type="number" min="0" value={form.places_disponibles} onChange={set("places_disponibles")} />
        </Row>
        <Row label="Conditions d'admission">
          <input className="input-base" value={form.conditions_admission} onChange={set("conditions_admission")} />
        </Row>
      </div>

      <Row label="Documents requis (séparés par virgule)">
        <input className="input-base"
          placeholder="CNI, Relevé de notes, Photo d'identité"
          value={form.documents_requis} onChange={set("documents_requis")} />
      </Row>

      <Row label="Étapes d'inscription (une par ligne)">
        <textarea className="input-base resize-none" rows={3}
          placeholder={"Retirer le dossier au secrétariat\nRemplir et déposer le dossier\nPasser l'entretien"}
          value={form.etapes_inscription} onChange={set("etapes_inscription")} />
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label="Ouverture des inscriptions">
          <input className="input-base" type="date" value={form.date_ouverture} onChange={set("date_ouverture")} />
        </Row>
        <Row label="Clôture des inscriptions">
          <input className="input-base" type="date" value={form.date_fermeture} onChange={set("date_fermeture")} />
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
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}