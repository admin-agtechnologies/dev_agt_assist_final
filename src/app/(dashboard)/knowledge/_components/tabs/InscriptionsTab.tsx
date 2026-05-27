// src/app/(dashboard)/knowledge/_components/tabs/InscriptionsTab.tsx
// S71 — ProgrammeCard sobre : accent fin + détails expandables + items-start grid
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, GraduationCap, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, Calendar, ListOrdered, FileCheck,
  Users, BadgePercent, ChevronDown, ChevronUp,
} from "lucide-react";
import { useSector }           from "@/hooks/useSector";
import { useToast }            from "@/components/ui/Toast";
import { useLanguage }         from "@/contexts/LanguageContext";
import { programmeRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProgrammeAdmission, NiveauAdmission } from "@/types/api/p5.types";

const NIVEAUX_SELECT: NiveauAdmission[] = [
  "primaire", "college", "lycee", "bts_dut",
  "licence", "master", "doctorat", "formation_pro", "autre",
];

const EMPTY = {
  nom_fr: "", description_fr: "", niveau: "licence" as NiveauAdmission,
  duree: "", frais_inscription: "", conditions_admission: "",
  date_ouverture: "", date_fermeture: "",
  frais_scolarite_annuels: "", places_disponibles: "",
  documents_requis: "",
  etapes_inscription: "",
};

const parseDocs   = (s: string) => s.split(",").map((d) => d.trim()).filter(Boolean);
const docsToStr   = (docs: string[]) => (docs ?? []).join(", ");
const parseEtapes = (s: string) => s.split("\n").map((e) => e.trim()).filter(Boolean);
const etapesToStr = (arr: string[]) => (arr ?? []).join("\n");

export function InscriptionsTab() {
  const { theme }         = useSector();
  const toast             = useToast();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.inscriptions;

  const [items,   setItems]   = useState<ProgrammeAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    programmeRepository.getList()
      .then(setItems)
      .catch(() => toast.error(t.errorLoad))
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
      toast.success(t.createSuccess);
    } catch { toast.error(t.createError); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const u = await programmeRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x)); setEditId(null);
      toast.success(t.updateSuccess);
    } catch { toast.error(t.updateError); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await programmeRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(t.deleteSuccess);
    } catch { toast.error(t.deleteError); }
  });

  const handleToggle = (item: ProgrammeAdmission) => startSave(async () => {
    try {
      const u = await programmeRepository.update(item.id, { is_available: !item.is_available });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error(t.updateError); }
  });

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
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
            <Plus className="w-4 h-4" /> {t.addBtn}
          </button>
        )}
      </div>

      {showAdd && (
        <ProgrammeForm form={form} set={set} theme={theme} t={t} d={d}
          onSave={handleCreate} onCancel={() => setShowAdd(false)}
          saving={saving} label={t.newTitle}
          niveauxSelect={NIVEAUX_SELECT} />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${theme.primary} 10%, transparent)` }}>
            <GraduationCap className="w-7 h-7" style={{ color: theme.primary }} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {items.map((item) => editId === item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ProgrammeForm form={form} set={set} theme={theme} t={t} d={d}
                onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                saving={saving} label={t.editTitle}
                niveauxSelect={NIVEAUX_SELECT} />
            </div>
          ) : (
            <ProgrammeCard key={item.id} item={item} theme={theme} t={t} saving={saving}
              onToggle={() => handleToggle(item)}
              onEdit={() => { setEditId(item.id); setForm(fillForm(item)); setShowAdd(false); }}
              onDelete={() => handleDelete(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProgrammeCard — sobre + expandable ───────────────────────────────────────

function ProgrammeCard({ item, theme, t, saving, onToggle, onEdit, onDelete }: {
  item:     ProgrammeAdmission;
  theme:    { primary: string };
  t:        Record<string, string | Record<string, string>>;
  saving:   boolean;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const niveaux           = d.knowledge.inscriptions.niveaux as Record<string, string>;
  const docs              = item.documents_requis   ?? [];
  const etapes            = item.etapes_inscription ?? [];
  const [expanded, setExpanded] = useState(false);

  const hasDetails = docs.length > 0 || etapes.length > 0
    || !!item.date_ouverture || !!item.date_fermeture
    || item.places_disponibles != null || !!item.conditions_admission
    || item.frais_scolarite_annuels != null;

  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden",
      "hover:shadow-md transition-shadow duration-200",
      !item.is_available && "opacity-60",
    )}>
      {/* Barre accent fine */}
      <div className="h-1 w-full" style={{ backgroundColor: theme.primary }} />

      {/* Corps principal */}
      <div className="p-4 space-y-3">

        {/* Nom + toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[var(--text)] leading-tight line-clamp-2">
              {item.nom_fr}
            </p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `color-mix(in srgb, ${theme.primary} 12%, transparent)`,
                color: theme.primary,
              }}>
              {niveaux[item.niveau] ?? item.niveau}
            </span>
          </div>

          {/* Toggle switch */}
          <button type="button" onClick={onToggle} disabled={saving}
            className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <span
              className="relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: item.is_available ? theme.primary : "var(--border)" }}
            >
              <span className={cn(
                "inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm",
                "transform transition-transform duration-200",
                item.is_available ? "translate-x-[18px]" : "translate-x-[3px]",
              )} />
            </span>
            <span className="text-[10px] font-semibold"
              style={{ color: item.is_available ? theme.primary : "var(--text-muted)" }}>
              {item.is_available
                ? <>{String(t.ouvert)}</>
                : <>{String(t.ferme)}</>}
            </span>
          </button>
        </div>

        {/* Infos clés condensées */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--text-muted)]">
          {item.duree && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.duree}
            </span>
          )}
          {item.frais_inscription != null ? (
            <span className="flex items-center gap-1 font-semibold"
              style={{ color: theme.primary }}>
              <BadgePercent className="w-3 h-3" />
              {Number(item.frais_inscription).toLocaleString("fr-FR")} XAF
            </span>
          ) : (
            <span className="font-semibold"
              style={{ color: "var(--status-success-text)" }}>
              {String(t.gratuit)}
            </span>
          )}
        </div>

        {/* Actions + bouton détails */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1">
            <button type="button" onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors
                text-[var(--text-muted)] hover:text-[var(--text)]">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onDelete} disabled={saving}
              className="p-1.5 rounded-lg transition-colors
                text-[var(--text-muted)] hover:text-[var(--status-danger-text)]
                hover:bg-[var(--status-danger-bg)]">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {hasDetails && (
            <button type="button"
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg
                hover:bg-[var(--bg)] transition-colors"
              style={{ color: "var(--text-muted)" }}>
              {expanded
                ? <><ChevronUp className="w-3 h-3" /> Moins</>
                : <><ChevronDown className="w-3 h-3" /> Détails</>}
            </button>
          )}
        </div>
      </div>

      {/* Panneau détails expandable */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-[var(--border)] pt-3">

          {item.places_disponibles != null && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)]">Places :</span>
              <span className="font-semibold text-[var(--text)]">{item.places_disponibles}</span>
            </div>
          )}

          {item.frais_scolarite_annuels != null && (
            <div className="flex items-center gap-2 text-xs">
              <BadgePercent className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)]">Scolarité :</span>
              <span className="font-semibold text-[var(--text)]">
                {Number(item.frais_scolarite_annuels).toLocaleString("fr-FR")} XAF/an
              </span>
            </div>
          )}

          {(item.date_ouverture || item.date_fermeture) && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {item.date_ouverture && <span>Ouv. {item.date_ouverture}</span>}
              {item.date_ouverture && item.date_fermeture && <span>→</span>}
              {item.date_fermeture && <span>Clôt. {item.date_fermeture}</span>}
            </div>
          )}

          {docs.length > 0 && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]
                uppercase tracking-wide font-medium">
                <FileCheck className="w-3 h-3" /> Documents requis
              </p>
              <div className="flex flex-wrap gap-1">
                {docs.map((doc) => (
                  <span key={doc}
                    className="text-[10px] px-1.5 py-0.5 rounded-full
                      bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {etapes.length > 0 && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]
                uppercase tracking-wide font-medium">
                <ListOrdered className="w-3 h-3" />
                {etapes.length} {etapes.length > 1 ? String(t.etapePlural) : String(t.etapeSingular)}
              </p>
              <ol className="space-y-1 pl-1">
                {etapes.slice(0, 4).map((e, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center
                      justify-center text-[8px] font-bold text-white mt-0.5"
                      style={{ backgroundColor: theme.primary }}>
                      {i + 1}
                    </span>
                    <span className="line-clamp-1">{e}</span>
                  </li>
                ))}
                {etapes.length > 4 && (
                  <li className="text-[10px] text-[var(--text-muted)] pl-5">
                    +{etapes.length - 4} étape{etapes.length - 4 > 1 ? "s" : ""}
                  </li>
                )}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProgrammeForm (inchangé) ──────────────────────────────────────────────────

function ProgrammeForm({ form, set, onSave, onCancel, saving, theme, t, d, label, niveauxSelect }: {
  form: typeof EMPTY;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string };
  t: Record<string, string | Record<string, string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d: any; label: string;
  niveauxSelect: NiveauAdmission[];
}) {
  const niveaux = (t.niveaux ?? {}) as Record<string, string>;
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label={String(t.nomLabel)}>
        <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
      </Row>
      <Row label={String(t.descriptionLabel)}>
        <textarea className="input-base resize-none" rows={2}
          value={form.description_fr} onChange={set("description_fr")} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label={String(t.niveauLabel)}>
          <select className="input-base" value={form.niveau} onChange={set("niveau")}>
            {niveauxSelect.map((v) => (
              <option key={v} value={v}>{niveaux[v] ?? v}</option>
            ))}
          </select>
        </Row>
        <Row label={String(t.dureeLabel)}>
          <input className="input-base" placeholder={String(t.dureePlh)}
            value={form.duree} onChange={set("duree")} />
        </Row>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Row label={String(t.fraisInscLabel)}>
          <input className="input-base" type="number" min="0"
            value={form.frais_inscription} onChange={set("frais_inscription")} />
        </Row>
        <Row label={String(t.fraisScolariteLabel)}>
          <input className="input-base" type="number" min="0"
            value={form.frais_scolarite_annuels} onChange={set("frais_scolarite_annuels")} />
        </Row>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Row label={String(t.placesLabel)}>
          <input className="input-base" type="number" min="0"
            value={form.places_disponibles} onChange={set("places_disponibles")} />
        </Row>
        <Row label={String(t.conditionsLabel)}>
          <input className="input-base"
            value={form.conditions_admission} onChange={set("conditions_admission")} />
        </Row>
      </div>
      <Row label={String(t.documentsLabel)}>
        <input className="input-base" placeholder={String(t.documentsPlh)}
          value={form.documents_requis} onChange={set("documents_requis")} />
      </Row>
      <Row label={String(t.etapesLabel)}>
        <textarea className="input-base resize-none" rows={3}
          placeholder={String(t.etapesPlh)}
          value={form.etapes_inscription} onChange={set("etapes_inscription")} />
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label={String(t.ouvertureLabel)}>
          <input className="input-base" type="date"
            value={form.date_ouverture} onChange={set("date_ouverture")} />
        </Row>
        <Row label={String(t.clotureLabel)}>
          <input className="input-base" type="date"
            value={form.date_fermeture} onChange={set("date_fermeture")} />
        </Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {d.common.cancel}
        </button>
        <button type="button" onClick={onSave}
          disabled={saving || !form.nom_fr.trim()}
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