// src/app/(dashboard)/knowledge/_components/tabs/MedicalTab.tsx
// S46 — hover lift + empty state sectoriel + CSS vars + i18n complet
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Stethoscope, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, Users, Phone,
} from "lucide-react";
import { useSector }            from "@/hooks/useSector";
import { useToast }             from "@/components/ui/Toast";
import { useLanguage }          from "@/contexts/LanguageContext";
import { specialiteRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { SpecialiteMedicale } from "@/types/api/p5.types";

const EMPTY = {
  nom_fr:              "",
  description:         "",
  medecins:            "",
  mots_cles_symptomes: "",
  contact_urgence:     "",
};

export function MedicalTab() {
  const { theme }         = useSector();
  const toast             = useToast();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.medical;

  const [items,   setItems]   = useState<SpecialiteMedicale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    specialiteRepository.getList()
      .then(setItems)
      .catch(() => toast.error(t.errorLoad))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const parseMedecins = (s: string) =>
    s.split(",").map((m) => m.trim()).filter(Boolean).map((m) => {
      const match = m.match(/^(.+?)\s*\((.+?)\)$/);
      return match ? { nom: match[1].trim(), titre: match[2].trim() } : { nom: m, titre: "" };
    });

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr:              f.nom_fr.trim(),
    description:         f.description.trim() || undefined,
    medecins:            parseMedecins(f.medecins),
    mots_cles_symptomes: f.mots_cles_symptomes.split(",").map((s) => s.trim()).filter(Boolean),
    contact_urgence:     f.contact_urgence.trim() || undefined,
    is_available:        true,
    ordre:               items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const c = await specialiteRepository.create(toPayload(form));
      setItems((p) => [...p, c]);
      setShowAdd(false); setForm(EMPTY);
      toast.success(t.createSuccess);
    } catch { toast.error(t.createError); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try {
      const u = await specialiteRepository.update(id, toPayload(form));
      setItems((p) => p.map((x) => x.id === id ? u : x));
      setEditId(null);
      toast.success(t.updateSuccess);
    } catch { toast.error(t.updateError); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try {
      await specialiteRepository.delete(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success(t.deleteSuccess);
    } catch { toast.error(t.deleteError); }
  });

  const handleToggle = (item: SpecialiteMedicale) => startSave(async () => {
    try {
      const u = await specialiteRepository.update(item.id, { is_available: !item.is_available });
      setItems((p) => p.map((x) => x.id === item.id ? u : x));
    } catch { toast.error(t.updateError); }
  });

  const startEdit = (item: SpecialiteMedicale) => {
    setEditId(item.id); setShowAdd(false);
    setForm({
      nom_fr:              item.nom_fr,
      description:         item.description ?? "",
      medecins:            item.medecins.map((m) => m.titre ? `${m.nom} (${m.titre})` : m.nom).join(", "),
      mots_cles_symptomes: (item.mots_cles_symptomes ?? []).join(", "),
      contact_urgence:     item.contact_urgence ?? "",
    });
  };

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} spécialité{items.length !== 1 ? "s" : ""}
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
        <SpecialiteForm form={form} set={set} theme={theme} t={t} d={d}
          onSave={handleCreate} onCancel={() => setShowAdd(false)}
          saving={saving} label={t.newTitle} />
      )}

      {items.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${theme.primary} 10%, transparent)` }}>
            <Stethoscope className="w-7 h-7" style={{ color: theme.primary }} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId === item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <SpecialiteForm form={form} set={set} theme={theme} t={t} d={d}
                onSave={() => handleUpdate(item.id)} onCancel={() => setEditId(null)}
                saving={saving} label={t.editTitle} />
            </div>
          ) : (
            <SpecialiteCard key={item.id} item={item} theme={theme} t={t} saving={saving}
              onToggle={() => handleToggle(item)}
              onEdit={() => startEdit(item)}
              onDelete={() => handleDelete(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SpecialiteCard ────────────────────────────────────────────────────────────

function SpecialiteCard({ item, theme, t, saving, onToggle, onEdit, onDelete }: {
  item: SpecialiteMedicale;
  theme: { primary: string };
  t: Record<string, string>;
  saving: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      !item.is_available && "opacity-60",
    )}>
      {/* Header gradient sectoriel */}
      <div className="h-16 flex items-center px-5"
        style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)` }}>
        <Stethoscope className="w-6 h-6 opacity-60 flex-shrink-0" style={{ color: theme.primary }} />
        <span className="ml-3 font-semibold text-sm text-[var(--text)] truncate">{item.nom_fr}</span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {item.description && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description}</p>
        )}

        {/* Médecins + Contact urgence */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {item.medecins.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {item.medecins.length} {item.medecins.length > 1 ? (t.medecinPlural ?? "médecins") : (t.medecinSingular ?? "médecin")}
            </span>
          )}
          {item.contact_urgence && (
            <span className="flex items-center gap-1 font-medium" style={{ color: theme.primary }}>
              <Phone className="w-3 h-3" /> {item.contact_urgence}
            </span>
          )}
        </div>

        {/* Chips symptômes */}
        {(item.mots_cles_symptomes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(item.mots_cles_symptomes ?? []).slice(0, 4).map((s) => (
              <span key={s}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                {s}
              </span>
            ))}
            {(item.mots_cles_symptomes ?? []).length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)]">
                +{(item.mots_cles_symptomes ?? []).length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <button type="button" onClick={onToggle} disabled={saving}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
            style={item.is_available
              ? { background: "var(--status-success-bg)", color: "var(--status-success-text)" }
              : { background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {item.is_available
              ? <><ToggleRight className="w-3.5 h-3.5" />{t.dispo}</>
              : <><ToggleLeft  className="w-3.5 h-3.5" />{t.indispo}</>}
          </button>
          <div className="flex gap-1">
            <button type="button" onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors">
              <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <button type="button" onClick={onDelete} disabled={saving}
              className="p-1.5 rounded-lg hover:bg-[var(--status-danger-bg)] transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SpecialiteForm ────────────────────────────────────────────────────────────

function SpecialiteForm({ form, set, onSave, onCancel, saving, theme, t, d, label }: {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void; onCancel: () => void;
  saving: boolean; theme: { primary: string };
  t: Record<string, string>; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d: any; label: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label={t.nomLabel}>
        <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
      </Row>
      <Row label={t.descriptionLabel}>
        <textarea className="input-base resize-none" rows={2}
          value={form.description} onChange={set("description")} />
      </Row>
      <Row label={t.medecinsLabel}>
        <input className="input-base" placeholder={t.medecinsPH}
          value={form.medecins} onChange={set("medecins")} />
      </Row>
      <Row label={t.symptomesLabel}>
        <input className="input-base" placeholder={t.symptomesPH}
          value={form.mots_cles_symptomes} onChange={set("mots_cles_symptomes")} />
      </Row>
      <Row label={t.urgenceLabel}>
        <input className="input-base" placeholder={t.urgencePH}
          value={form.contact_urgence} onChange={set("contact_urgence")} />
      </Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
            border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" /> {d.common.cancel}
        </button>
        <button type="button" onClick={onSave} disabled={saving || !form.nom_fr.trim()}
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