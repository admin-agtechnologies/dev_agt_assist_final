// src/app/(dashboard)/knowledge/_components/chambres/ChambreCard.tsx
"use client";

import { useState, useTransition } from "react";
import {
  BedDouble, Users, Pencil, Trash2, Loader2,
  Check, X, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useSector }          from "@/hooks/useSector";
import { useToast }           from "@/components/ui/Toast";
import { chambreRepository }  from "@/repositories/chambre.repository";
import { cn }                 from "@/lib/utils";
import type { ChambreType, UpdateChambreTypePayload } from "@/types/api/chambre.types";

interface Props {
  chambre:   ChambreType;
  onUpdated: (c: ChambreType) => void;
  onDeleted: (id: string) => void;
  t:         Record<string, string>;
}

type FormState = {
  nom_fr:        string;
  nom_en:        string;
  description_fr: string;
  capacite:      string;
  prix_nuit:     string;
  equipements:   string; // saisie libre, séparés par virgule
  image_url:     string;
};

// Tous les champs optionnels de ChambreType reçoivent ?? "" pour rester string
function chambreToForm(c: ChambreType): FormState {
  return {
    nom_fr:         c.nom_fr,
    nom_en:         c.nom_en         ?? "",
    description_fr: c.description_fr ?? "",
    capacite:       String(c.capacite),
    prix_nuit:      String(c.prix_nuit),
    equipements:    c.equipements.join(", "),
    image_url:      c.image_url      ?? "",
  };
}

export function ChambreCard({ chambre, onUpdated, onDeleted, t }: Props) {
  const { theme }             = useSector();
  const toast                 = useToast();
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState<FormState>(chambreToForm(chambre));
  const [saving,   startSave]   = useTransition();

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => startSave(async () => {
    if (!form.nom_fr.trim() || !form.prix_nuit) return;
    try {
      const payload: UpdateChambreTypePayload = {
        nom_fr:         form.nom_fr.trim(),
        nom_en:         form.nom_en.trim()         || undefined,
        description_fr: form.description_fr.trim() || undefined,
        capacite:       Number(form.capacite)      || 1,
        prix_nuit:      Number(form.prix_nuit),
        equipements:    form.equipements.split(",").map((e) => e.trim()).filter(Boolean),
        image_url:      form.image_url.trim()      || undefined,
      };
      const updated = await chambreRepository.update(chambre.id, payload);
      onUpdated(updated);
      setEditing(false);
      toast.success(t.updated);
    } catch { toast.error(t.errorSave); }
  });

  const handleToggle = () => startSave(async () => {
    try {
      onUpdated(await chambreRepository.update(chambre.id, { is_available: !chambre.is_available }));
    } catch { toast.error(t.errorSave); }
  });

  const handleDelete = () => startSave(async () => {
    try {
      await chambreRepository.delete(chambre.id);
      onDeleted(chambre.id);
      toast.success(t.deleted);
    } catch { toast.error(t.errorDelete); }
  });

  if (editing) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3 col-span-1 sm:col-span-2 xl:col-span-3"
        style={{ borderColor: theme.primary }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Row label={t.nomFr + " *"}>
            <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
          </Row>
          <Row label={t.nomEn}>
            <input className="input-base" value={form.nom_en} onChange={set("nom_en")} />
          </Row>
        </div>
        <Row label={t.description}>
          <textarea className="input-base resize-none" rows={2}
            value={form.description_fr} onChange={set("description_fr")} />
        </Row>
        <div className="grid grid-cols-2 gap-3">
          <Row label={t.capacite + " *"}>
            <input className="input-base" type="number" min="1"
              value={form.capacite} onChange={set("capacite")} />
          </Row>
          <Row label={t.prixNuit + " *"}>
            <input className="input-base" type="number" min="0"
              value={form.prix_nuit} onChange={set("prix_nuit")} />
          </Row>
        </div>
        <Row label={t.equipements}>
          <input className="input-base" placeholder="WiFi, Clim, TV..."
            value={form.equipements} onChange={set("equipements")} />
        </Row>
        <Row label={t.imageUrl}>
          <input className="input-base" type="url" placeholder="https://..."
            value={form.image_url} onChange={set("image_url")} />
        </Row>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button"
            onClick={() => { setEditing(false); setForm(chambreToForm(chambre)); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
            <X className="w-4 h-4" /> {t.cancel}
          </button>
          <button type="button" onClick={handleSave}
            disabled={saving || !form.nom_fr.trim() || !form.prix_nuit}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col",
      "transition-all hover:shadow-md hover:border-[var(--text-muted)]",
      !chambre.is_available && "opacity-60",
    )}>
      {/* Image / Placeholder */}
      <div className="h-32 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)` }}>
        {chambre.image_url
          ? <img src={chambre.image_url} alt={chambre.nom_fr} className="w-full h-full object-cover" />
          : <BedDouble className="w-10 h-10 opacity-40" style={{ color: theme.primary }} />}

        {/* Toggle disponibilité */}
        <button type="button" onClick={handleToggle} disabled={saving}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm bg-white/80 dark:bg-black/40">
          {chambre.is_available
            ? <><ToggleRight className="w-3.5 h-3.5 text-green-500" /> {t.disponible}</>
            : <><ToggleLeft  className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {t.indisponible}</>}
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-sm text-[var(--text)] leading-tight">{chambre.nom_fr}</p>
        {chambre.description_fr && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2">{chambre.description_fr}</p>
        )}

        {/* Capacité + Prix */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {chambre.capacite} pers.
          </span>
          <span className="font-bold text-sm" style={{ color: theme.primary }}>
            {Number(chambre.prix_nuit).toLocaleString("fr-FR")} XAF/nuit
          </span>
        </div>

        {/* Équipements */}
        {chambre.equipements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chambre.equipements.slice(0, 4).map((eq) => (
              <span key={eq}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg)] text-[var(--text-muted)]">
                {eq}
              </span>
            ))}
            {chambre.equipements.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg)] text-[var(--text-muted)]">
                +{chambre.equipements.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-1 mt-auto pt-2">
          <button type="button"
            onClick={() => { setForm(chambreToForm(chambre)); setEditing(true); }}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors">
            <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
          <button type="button" onClick={handleDelete} disabled={saving}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            {saving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2  className="w-3.5 h-3.5 text-red-400" />}
          </button>
        </div>
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