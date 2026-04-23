// src/app/pme/appointments/components/HorairesEditor.tsx
"use client";
import { useState, useEffect } from "react";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { horairesRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { HorairesOuverture } from "@/types/api";
import {
  type DayVal,
  type JourKey,
  JOURS_KEYS,
  JOURS_LONG,
  DEF_DAY_VAL,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────

interface HorairesEditorProps {
  horaires: HorairesOuverture | null;
  type: "ouverture" | "rendez_vous";
  agenceId: string;
  onSaved: () => void;
}

type ValsState = Record<JourKey, DayVal>;

function buildVals(horaires: HorairesOuverture | null): ValsState {
  return {
    lundi:    { ...((horaires?.lundi    as DayVal | undefined) ?? DEF_DAY_VAL) },
    mardi:    { ...((horaires?.mardi    as DayVal | undefined) ?? DEF_DAY_VAL) },
    mercredi: { ...((horaires?.mercredi as DayVal | undefined) ?? DEF_DAY_VAL) },
    jeudi:    { ...((horaires?.jeudi    as DayVal | undefined) ?? DEF_DAY_VAL) },
    vendredi: { ...((horaires?.vendredi as DayVal | undefined) ?? DEF_DAY_VAL) },
    samedi:   { ...((horaires?.samedi   as DayVal | undefined) ?? DEF_DAY_VAL) },
    dimanche: { ...((horaires?.dimanche as DayVal | undefined) ?? DEF_DAY_VAL) },
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function HorairesEditor({
  horaires,
  type,
  agenceId,
  onSaved,
}: HorairesEditorProps) {
  const { dictionary: d } = useLanguage();
  const toast = useToast();
  const [vals, setVals]   = useState<ValsState>(() => buildVals(horaires));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVals(buildVals(horaires));
  }, [horaires]);

  const save = async () => {
    setSaving(true);
    try {
      if (horaires?.id) {
        await horairesRepository.patch(horaires.id, vals);
      } else {
        await horairesRepository.create({ agence_id: agenceId, type, ...vals });
      }
      toast.success("Horaires enregistrés ✓");
      onSaved();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {JOURS_KEYS.map((k, i) => {
        const v = vals[k];
        return (
          <div
            key={k}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
              v.open ? "bg-[var(--bg)]" : "bg-[var(--bg)]/40 opacity-60",
            )}
          >
            <span className="text-xs font-bold w-10 text-[var(--text-muted)]">
              {JOURS_LONG[i].slice(0, 3)}
            </span>

            <button
              type="button"
              onClick={() =>
                setVals((p) => ({ ...p, [k]: { ...v, open: !v.open } }))
              }
              className="flex-shrink-0"
            >
              {v.open ? (
                <ToggleRight className="w-5 h-5 text-[#25D366]" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </button>

            {v.open ? (
              <>
                <input
                  type="time"
                  value={v.start}
                  onChange={(e) =>
                    setVals((p) => ({
                      ...p,
                      [k]: { ...v, start: e.target.value },
                    }))
                  }
                  className="input-base py-1 text-xs w-24 flex-shrink-0"
                />
                <span className="text-xs text-[var(--text-muted)]">→</span>
                <input
                  type="time"
                  value={v.end}
                  onChange={(e) =>
                    setVals((p) => ({
                      ...p,
                      [k]: { ...v, end: e.target.value },
                    }))
                  }
                  className="input-base py-1 text-xs w-24 flex-shrink-0"
                />
              </>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">
                Fermé
              </span>
            )}
          </div>
        );
      })}

      <div className="pt-2 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4"
        >
          {saving ? (
            <Spinner className="border-white/30 border-t-white w-3 h-3" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {d.common.save}
        </button>
      </div>
    </div>
  );
}
