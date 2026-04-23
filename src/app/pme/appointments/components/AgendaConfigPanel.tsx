// src/app/pme/appointments/components/AgendaConfigPanel.tsx
"use client";
import { useState } from "react";
import { Settings, X, Save, Plus } from "lucide-react";
import { agendasRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import type { Agenda } from "@/types/api";

// ─────────────────────────────────────────────────────────────────────────────

interface AgendaConfigPanelProps {
  /**
   * Agenda existant → mode édition (PATCH)
   * null            → mode création (POST) — l'agence n'a pas encore d'agenda
   */
  agenda: Agenda | null;
  /** UUID de l'agence sélectionnée — requis pour la création */
  agenceId: string;
  onSaved: () => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function AgendaConfigPanel({
  agenda,
  agenceId,
  onSaved,
  onClose,
}: AgendaConfigPanelProps) {
  const { dictionary: d } = useLanguage();
  const toast = useToast();

  const isCreate = agenda === null;

  const [duree, setDuree]   = useState(agenda?.duree_rdv_min ?? 30);
  const [buf,   setBuf]     = useState(agenda?.buffer_min    ?? 0);
  const [nom,   setNom]     = useState(agenda?.nom ?? "Agenda Principal");
  const [saving, setSaving] = useState(false);

  const total = duree + buf;

  const save = async () => {
    setSaving(true);
    try {
      if (isCreate) {
        // Création d'un agenda pour cette agence
        await agendasRepository.create({
          agence:        agenceId,
          nom:           nom.trim() || "Agenda Principal",
          duree_rdv_min: duree,
          buffer_min:    buf,
          is_active:     true,
        });
        toast.success("Agenda créé ✓");
      } else {
        // Mise à jour de l'agenda existant
        await agendasRepository.patch(agenda.id, {
          duree_rdv_min: duree,
          buffer_min:    buf,
        });
        toast.success("Configuration enregistrée ✓");
      }
      onSaved();
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 border-2 border-[#075E54]/20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[var(--text)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#075E54]" />
          {isCreate ? "Créer l'agenda de cette agence" : "Configuration des créneaux"}
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--border)]">
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Nom de l'agenda (création uniquement) */}
      {isCreate && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">
            Nom de l&apos;agenda
          </label>
          <input
            className="input-base w-full text-sm"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Agenda Principal"
          />
        </div>
      )}

      {/* Durée + Tampon */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">Durée RDV</label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={5} max={480} step={5} value={duree}
              onChange={(e) => setDuree(Number(e.target.value))}
              className="input-base w-full text-sm"
            />
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">min</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">Tampon</label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={120} step={5} value={buf}
              onChange={(e) => setBuf(Number(e.target.value))}
              className="input-base w-full text-sm"
            />
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">min</span>
          </div>
        </div>
      </div>

      {/* Aperçu visuel */}
      {total > 0 && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-3 py-1.5 bg-[var(--border)]/30 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Aperçu d&apos;un créneau ({total} min total)
          </div>
          <div className="flex h-8">
            <div
              className="bg-emerald-500/20 border-r-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-700"
              style={{ width: `${(duree / total) * 100}%` }}
            >
              {duree}min RDV
            </div>
            {buf > 0 && (
              <div
                className="bg-gray-200/80 flex items-center justify-center text-[10px] font-bold text-gray-500"
                style={{ width: `${(buf / total) * 100}%` }}
              >
                {buf}min tampon
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bouton save */}
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        {saving ? (
          <Spinner className="border-white/30 border-t-white w-3 h-3" />
        ) : isCreate ? (
          <Plus className="w-3.5 h-3.5" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {isCreate ? "Créer l'agenda" : "Enregistrer"}
      </button>
    </div>
  );
}