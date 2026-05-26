// src/app/(dashboard)/knowledge/_components/tabs/ChambresTab.tsx
// S71 — Ajout ImagePreviewModal + prop onPreview sur ChambreCard (BUG 3)
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, BedDouble, Check, X } from "lucide-react";
import { useLanguage }        from "@/contexts/LanguageContext";
import { useSector }          from "@/hooks/useSector";
import { useToast }           from "@/components/ui/Toast";
import { chambreRepository }  from "@/repositories/chambre.repository";
import { ChambreCard }        from "../chambres/ChambreCard";
import { ImagePreviewModal }  from "../ImagePreviewModal";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import type { ChambreType, CreateChambreTypePayload } from "@/types/api/chambre.types";

const EMPTY = {
  nom_fr: "", nom_en: "",
  description_fr: "", description_en: "",
  capacite: "2", prix_nuit: "", equipements: "",
};

export function ChambresTab() {
  const { dictionary: d } = useLanguage();
  const { theme }         = useSector();
  const toast             = useToast();

  const [chambres,   setChambres]   = useState<ChambreType[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     startSave]     = useTransition();
  const [previewSrc, setPreviewSrc] = useState<{ src: string; alt: string } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = ((d.knowledge as unknown as any).chambres as Record<string, string>) ?? {};
  const tCommon: Record<string, string> = { save: d.common.save, cancel: d.common.cancel ?? "Annuler", ...t };

  useEffect(() => {
    chambreRepository.getList()
      .then(setChambres)
      .catch(() => toast.error(tCommon.errorLoad))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim() || !form.prix_nuit) return;
    try {
      const payload: CreateChambreTypePayload = {
        nom_fr:         form.nom_fr.trim(),
        nom_en:         form.nom_en.trim()         || undefined,
        description_fr: form.description_fr.trim() || undefined,
        description_en: form.description_en.trim() || undefined,
        capacite:       Number(form.capacite) || 1,
        prix_nuit:      Number(form.prix_nuit),
        equipements:    form.equipements.split(",").map((e) => e.trim()).filter(Boolean),
        ordre:          chambres.length,
      };
      const created = await chambreRepository.create(payload);
      setChambres((prev) => [...prev, created]);
      setForm(EMPTY);
      setShowAdd(false);
      toast.success(tCommon.created);
    } catch { toast.error(tCommon.errorSave); }
  });

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Preview modal */}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc.src}
          alt={previewSrc.alt}
          onClose={() => setPreviewSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {chambres.length} {tCommon.typeLabel ?? "type(s) de chambre"}
        </p>
        {!showAdd && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {tCommon.addBtn}
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
          style={{ borderColor: theme.primary }}>
          <p className="text-sm font-semibold text-[var(--text)]">{tCommon.newTitle}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row label={tCommon.nomFr + " *"}>
              <input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus />
            </Row>
            <Row label={tCommon.nomEn}>
              <input className="input-base" value={form.nom_en} onChange={set("nom_en")} />
            </Row>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row label={tCommon.descriptionFr ?? "Description (FR)"}>
              <textarea className="input-base resize-none" rows={2}
                value={form.description_fr} onChange={set("description_fr")} />
            </Row>
            <Row label={tCommon.descriptionEn ?? "Description (EN)"}>
              <textarea className="input-base resize-none" rows={2}
                value={form.description_en} onChange={set("description_en")} />
            </Row>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Row label={(tCommon.capacite ?? "Capacité") + " *"}>
              <input className="input-base" type="number" min="1"
                value={form.capacite} onChange={set("capacite")} />
            </Row>
            <Row label={(tCommon.prixNuit ?? "Prix / nuit (XAF)") + " *"}>
              <input className="input-base" type="number" min="0"
                value={form.prix_nuit} onChange={set("prix_nuit")} />
            </Row>
          </div>
          <Row label={tCommon.equipements ?? "Équipements (séparés par virgule)"}>
            <input className="input-base" placeholder="WiFi, Clim, TV, Baignoire..."
              value={form.equipements} onChange={set("equipements")} />
          </Row>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl
                border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
              <X className="w-4 h-4" /> {tCommon.cancel}
            </button>
            <button type="button" onClick={handleCreate}
              disabled={saving || !form.nom_fr.trim() || !form.prix_nuit}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {tCommon.save}
            </button>
          </div>
        </div>
      )}

      {/* Grille des chambres */}
      {chambres.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <BedDouble className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{tCommon.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {chambres.map((chambre) => (
            <ChambreCard
              key={chambre.id}
              chambre={chambre}
              onUpdated={(updated) => setChambres((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
              onDeleted={(id) => setChambres((prev) => prev.filter((c) => c.id !== id))}
              onPreview={(src, alt) => setPreviewSrc({ src, alt })}
              t={tCommon}
            />
          ))}
        </div>
      )}
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