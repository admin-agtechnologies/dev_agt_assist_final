// src/app/(dashboard)/knowledge/_components/chambres/ChambreCard.tsx
// S71 — Ajout bouton Eye preview image (BUG 3)
"use client";

import { useState, useTransition } from "react";
import {
  BedDouble, Users, Pencil, Trash2, Loader2,
  Check, X, ToggleLeft, ToggleRight, Eye,
} from "lucide-react";
import { useSector }         from "@/hooks/useSector";
import { useToast }          from "@/components/ui/Toast";
import { useLanguage }       from "@/contexts/LanguageContext";
import { chambreRepository } from "@/repositories/chambre.repository";
import { resolveImage }      from "@/lib/image-placeholder";
import { cn }                from "@/lib/utils";
import type { ChambreType, UpdateChambreTypePayload } from "@/types/api/chambre.types";

interface Props {
  chambre:   ChambreType;
  onUpdated: (c: ChambreType) => void;
  onDeleted: (id: string) => void;
  onPreview: (src: string, alt: string) => void;
  t:         Record<string, string>;
}

type FormState = {
  nom_fr: string; nom_en: string;
  description_fr: string; description_en: string;
  capacite: string; prix_nuit: string;
  equipements: string; image_url: string;
};

function chambreToForm(c: ChambreType): FormState {
  return {
    nom_fr:         c.nom_fr,
    nom_en:         c.nom_en          ?? "",
    description_fr: c.description_fr  ?? "",
    description_en: (c as unknown as Record<string, string>).description_en ?? "",
    capacite:       String(c.capacite),
    prix_nuit:      String(c.prix_nuit),
    equipements:    c.equipements.join(", "),
    image_url:      c.image_url       ?? "",
  };
}

export function ChambreCard({ chambre, onUpdated, onDeleted, onPreview, t }: Props) {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const tc                = d.knowledge.chambres;
  const toast             = useToast();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState<FormState>(chambreToForm(chambre));
  const [saving,  startSave]  = useTransition();

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
        image_url:      form.image_url.trim() || "",
      };
      const updated = await chambreRepository.update(chambre.id, payload);
      onUpdated(updated);
      setEditing(false);
      toast.success(tc.updated);
    } catch { toast.error(tc.errorSave); }
  });

  const handleToggle = () => startSave(async () => {
    try {
      onUpdated(await chambreRepository.update(chambre.id, { is_available: !chambre.is_available }));
    } catch { toast.error(tc.errorSave); }
  });

  const handleDelete = () => startSave(async () => {
    try {
      await chambreRepository.delete(chambre.id);
      onDeleted(chambre.id);
      toast.success(tc.deleted);
    } catch { toast.error(tc.errorDelete); }
  });

  // ── Mode édition ──────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3
        col-span-1 sm:col-span-2 xl:col-span-3"
        style={{ borderColor: theme.primary }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Row label={tc.nomFr + " *"}>
            <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
          </Row>
          <Row label={tc.nomEn}>
            <input className="input-base" value={form.nom_en} onChange={set("nom_en")} />
          </Row>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Row label={tc.description}>
            <textarea className="input-base resize-none" rows={2}
              value={form.description_fr} onChange={set("description_fr")} />
          </Row>
          <Row label={tc.descriptionEn ?? "Description (EN)"}>
            <textarea className="input-base resize-none" rows={2}
              value={form.description_en} onChange={set("description_en")} />
          </Row>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Row label={tc.capacite + " *"}>
            <input className="input-base" type="number" min="1"
              value={form.capacite} onChange={set("capacite")} />
          </Row>
          <Row label={tc.prixNuit + " *"}>
            <input className="input-base" type="number" min="0"
              value={form.prix_nuit} onChange={set("prix_nuit")} />
          </Row>
        </div>
        <Row label={tc.equipements}>
          <input className="input-base" placeholder="WiFi, Clim, TV..."
            value={form.equipements} onChange={set("equipements")} />
        </Row>
        <Row label={tc.imageUrl}>
          <div className="flex items-center gap-3">
            <input className="input-base flex-1" type="url" placeholder="https://..."
              value={form.image_url} onChange={set("image_url")} />
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-[var(--border)]">
              <img
                src={resolveImage(form.image_url || null, "chambre", form.nom_fr)}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Row>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button"
            onClick={() => { setEditing(false); setForm(chambreToForm(chambre)); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
              border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
            <X className="w-4 h-4" /> {tc.cancel}
          </button>
          <button type="button" onClick={handleSave}
            disabled={saving || !form.nom_fr.trim() || !form.prix_nuit}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {tc.save}
          </button>
        </div>
      </div>
    );
  }

  // ── Mode affichage ────────────────────────────────────────────────────────
  const imgSrc = resolveImage(chambre.image_url, "chambre", chambre.nom_fr);

  return (
    <div className={cn(
      "group bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      !chambre.is_available && "opacity-60",
    )}>
      {/* Image hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={imgSrc}
          alt={chambre.nom_fr}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay actions au hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
          transition-opacity duration-200 flex items-center justify-center gap-2">
          {/* Eye — preview */}
          <button type="button"
            onClick={() => onPreview(imgSrc, chambre.nom_fr)}
            className="p-2.5 rounded-xl bg-white/90 text-gray-800
              hover:bg-white hover:scale-110 transition-all shadow-sm">
            <Eye className="w-4 h-4" />
          </button>
          {/* Edit */}
          <button type="button"
            onClick={() => { setForm(chambreToForm(chambre)); setEditing(true); }}
            className="p-2.5 rounded-xl bg-white/90 text-gray-800
              hover:bg-white hover:scale-110 transition-all shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          {/* Delete */}
          <button type="button" onClick={handleDelete} disabled={saving}
            className="p-2.5 rounded-xl bg-white/90 text-red-500
              hover:bg-white hover:scale-110 transition-all shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Toggle disponibilité */}
        <button type="button" onClick={handleToggle} disabled={saving}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold backdrop-blur-sm bg-white/85 shadow-sm hover:bg-white
            transition-colors">
          {chambre.is_available
            ? <>
                <ToggleRight className="w-3 h-3" style={{ color: "var(--status-success-text)" }} />
                <span style={{ color: "var(--status-success-text)" }}>{tc.disponible}</span>
              </>
            : <>
                <ToggleLeft className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">{tc.indisponible}</span>
              </>}
        </button>

        {/* Gradient bas */}
        <div className="absolute bottom-0 left-0 right-0 h-12
          bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-sm text-[var(--text)] leading-tight">
          {chambre.nom_fr}
        </p>
        {chambre.description_fr && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
            {chambre.description_fr}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Users className="w-3 h-3" /> {chambre.capacite} pers.
          </span>
          <span className="font-bold text-sm ml-auto" style={{ color: theme.primary }}>
            {Number(chambre.prix_nuit).toLocaleString("fr-FR")} XAF/nuit
          </span>
        </div>
        {chambre.equipements.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
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