"use client";
// src/components/reservations/RessourceManager/DisponibiliteGrid.tsx

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Ressource, DisponibiliteRessource } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOURS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type JourIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface JourConfig {
  actif: boolean;
  debut: string;
  fin: string;
}

const DEFAULT_JOUR: JourConfig = { actif: false, debut: "08:00", fin: "18:00" };

function buildInitial(dispos: DisponibiliteRessource[]): Record<JourIndex, JourConfig> {
  const result = Object.fromEntries(
    ([0, 1, 2, 3, 4, 5, 6] as JourIndex[]).map((j) => [j, { ...DEFAULT_JOUR }])
  ) as Record<JourIndex, JourConfig>;

  for (const d of dispos) {
    result[d.jour_semaine as JourIndex] = {
      actif: d.est_active,
      debut: d.heure_debut,
      fin: d.heure_fin,
    };
  }
  return result;
}

interface DisponibiliteGridProps {
  ressource: Ressource;
  locale: Locale;
  onLoad: () => Promise<DisponibiliteRessource[]>;
  onSave: (dispo: Omit<DisponibiliteRessource, "id" | "est_active">[]) => Promise<void>;
}

export function DisponibiliteGrid({ ressource: _ressource, locale, onLoad, onSave }: DisponibiliteGridProps) {
  const jours = locale === "fr" ? JOURS_FR : JOURS_EN;
  const [config, setConfig] = useState<Record<JourIndex, JourConfig>>(
    buildInitial([])
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    onLoad().then((data) => {
      if (!cancelled) {
        setConfig(buildInitial(data));
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const update = (jour: JourIndex, patch: Partial<JourConfig>) => {
    setConfig((prev) => ({ ...prev, [jour]: { ...prev[jour], ...patch } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = (([0, 1, 2, 3, 4, 5, 6] as JourIndex[]))
      .filter((j) => config[j].actif)
      .map((j) => ({
        jour_semaine: j,
        heure_debut: config[j].debut,
        heure_fin: config[j].fin,
      }));
    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {([0, 1, 2, 3, 4, 5, 6] as JourIndex[]).map((j) => (
          <div key={j} className="flex items-center gap-3">
            <label className="flex items-center gap-2 w-16 flex-shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config[j].actif}
                onChange={(e) => update(j, { actif: e.target.checked })}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text)]">{jours[j]}</span>
            </label>
            {config[j].actif ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={config[j].debut}
                  onChange={(e) => update(j, { debut: e.target.value })}
                  className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                />
                <span className="text-xs text-[var(--text-muted)]">→</span>
                <input
                  type="time"
                  value={config[j].fin}
                  onChange={(e) => update(j, { fin: e.target.value })}
                  className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                />
              </div>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">
                {locale === "fr" ? "Fermé" : "Closed"}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
      >
        {saving && <LoadingSpinner size={14} className="text-white" />}
        {locale === "fr" ? (saving ? "Enregistrement…" : "Enregistrer") : (saving ? "Saving…" : "Save")}
      </button>
    </div>
  );
}