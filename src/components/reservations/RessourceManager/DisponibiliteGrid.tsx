// src/components/reservations/RessourceManager/DisponibiliteGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useSector }                         from "@/hooks/useSector";
import type { Ressource, DisponibiliteRessource } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

const JOURS_ABBR_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOURS_ABBR_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type JourIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface JourConfig { actif: boolean; debut: string; fin: string; }

const DEFAULT_JOUR: JourConfig = { actif: false, debut: "08:00", fin: "18:00" };
const ALL_JOURS = [0, 1, 2, 3, 4, 5, 6] as JourIndex[];

function buildInitial(dispos: DisponibiliteRessource[]): Record<JourIndex, JourConfig> {
  const result = Object.fromEntries(
    ALL_JOURS.map((j) => [j, { ...DEFAULT_JOUR }])
  ) as Record<JourIndex, JourConfig>;

  // Garde : si l'API renvoie null/undefined/autre → tous fermés par défaut
  if (!Array.isArray(dispos)) return result;

  for (const d of dispos) {
    result[d.jour_semaine as JourIndex] = {
      actif: d.est_active,
      debut: d.heure_debut,
      fin:   d.heure_fin,
    };
  }
  return result;
}

interface DisponibiliteGridProps {
  ressource: Ressource;
  locale:    Locale;
  onLoad:    () => Promise<DisponibiliteRessource[]>;
  onSave:    (dispo: Omit<DisponibiliteRessource, "id" | "est_active">[]) => Promise<void>;
}

export function DisponibiliteGrid({ ressource: _ressource, locale, onLoad, onSave }: DisponibiliteGridProps) {
  const { theme } = useSector();
  const abbr      = locale === "fr" ? JOURS_ABBR_FR : JOURS_ABBR_EN;

  const [jours,   setJours]   = useState<Record<JourIndex, JourConfig>>(
    Object.fromEntries(ALL_JOURS.map((j) => [j, { ...DEFAULT_JOUR }])) as Record<JourIndex, JourConfig>
  );
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    onLoad()
      .then((dispos) => setJours(buildInitial(dispos)))
      .catch(() => {
        // Pas de données → grille vide, l'utilisateur configure depuis zéro
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const toggle = (j: JourIndex) =>
    setJours((prev) => ({ ...prev, [j]: { ...prev[j], actif: !prev[j].actif } }));

  const setTime = (j: JourIndex, key: "debut" | "fin", val: string) =>
    setJours((prev) => ({ ...prev, [j]: { ...prev[j], [key]: val } }));

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const payload = ALL_JOURS
        .filter((j) => jours[j].actif)
        .map((j) => ({
          jour_semaine: j,
          heure_debut:  jours[j].debut,
          heure_fin:    jours[j].fin,
        }));
      await onSave(payload);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Grille des jours */}
      <div className="space-y-1.5">
        {ALL_JOURS.map((j) => {
          const cfg   = jours[j];
          const actif = cfg.actif;
          return (
            <div key={j} className={[
              "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
              actif
                ? "bg-[var(--bg)] border border-[var(--border)]"
                : "bg-[var(--bg-card)] border border-transparent opacity-60",
            ].join(" ")}>

              {/* Checkbox + label */}
              <button type="button" onClick={() => toggle(j)}
                className="flex items-center gap-2 w-20 flex-shrink-0">
                <span
                  className={[
                    "w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0",
                    actif ? "border-transparent" : "border-[var(--border)]",
                  ].join(" ")}
                  style={actif ? { backgroundColor: theme.primary } : {}}
                >
                  {actif && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-xs font-medium text-[var(--text)]">{abbr[j]}</span>
              </button>

              {/* Heures */}
              {actif ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={cfg.debut}
                    onChange={(e) => setTime(j, "debut", e.target.value)}
                    className="input-base py-1 text-xs w-28" />
                  <span className="text-xs text-[var(--text-muted)]">→</span>
                  <input type="time" value={cfg.fin}
                    onChange={(e) => setTime(j, "fin", e.target.value)}
                    className="input-base py-1 text-xs w-28" />
                </div>
              ) : (
                <span className="text-xs text-[var(--text-muted)] flex-1">
                  {locale === "fr" ? "Fermé" : "Closed"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback erreur */}
      {status === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">
            {locale === "fr" ? "Erreur d'enregistrement — vérifiez la connexion au serveur." : "Save error — check server connection."}
          </p>
        </div>
      )}

      {/* Feedback succès */}
      {status === "success" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-xs text-green-600 dark:text-green-400">
            {locale === "fr" ? "Disponibilités enregistrées ✓" : "Availability saved ✓"}
          </p>
        </div>
      )}

      {/* Bouton save */}
      <button type="button" onClick={handleSave} disabled={saving}
        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {locale === "fr"
          ? (saving ? "Enregistrement…" : "Enregistrer")
          : (saving ? "Saving…"         : "Save")}
      </button>
    </div>
  );
}