// src/app/pme/appointments/components/AgendaConfigPanel.tsx
"use client";
import { useState } from "react";
import { Settings, X, Save } from "lucide-react";
import { agendasRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import type { Agenda } from "@/types/api";

// ─────────────────────────────────────────────────────────────────────────────

interface AgendaConfigPanelProps {
  agenda: Agenda;
  onSaved: () => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function AgendaConfigPanel({
  agenda,
  onSaved,
  onClose,
}: AgendaConfigPanelProps) {
  const { dictionary: d } = useLanguage();
  const toast = useToast();

  const [duree, setDuree]   = useState(agenda.duree_rdv_min ?? 30);
  const [buf, setBuf]       = useState(agenda.buffer_min ?? 0);
  const [saving, setSaving] = useState(false);

  const total = duree + buf;

  const save = async () => {
    setSaving(true);
    try {
      await agendasRepository.patch(agenda.id, {
        duree_rdv_min: duree,
        buffer_min: buf,
      });
      toast.success("Configuration enregistrée ✓");
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
          Configuration des créneaux
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--border)]"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Durée + Tampon */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">
            Durée RDV
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={duree}
              onChange={(e) => setDuree(Number(e.target.value))}
              className="input-base w-full text-sm"
            />
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
              min
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">Tampon</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={120}
              step={5}
              value={buf}
              onChange={(e) => setBuf(Number(e.target.value))}
              className="input-base w-full text-sm"
            />
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
              min
            </span>
          </div>
        </div>
      </div>

      {/* Aperçu visuel */}
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

      {/* Bouton save */}
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        {saving ? (
          <Spinner className="border-white/30 border-t-white w-3 h-3" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        Enregistrer
      </button>
    </div>
  );
}
