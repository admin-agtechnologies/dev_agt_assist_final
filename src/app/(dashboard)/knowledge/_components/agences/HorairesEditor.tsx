// src/app/(dashboard)/knowledge/_components/agences/HorairesEditor.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useSector }   from "@/hooks/useSector";
import type { HorairesAgence, HoraireJour, JourSemaine } from "@/types/api/agence.types";
import { JOURS_SEMAINE } from "@/types/api/agence.types";

const LABELS: Record<JourSemaine, { fr: string; en: string }> = {
  lundi:    { fr: "Lundi",    en: "Monday"    },
  mardi:    { fr: "Mardi",    en: "Tuesday"   },
  mercredi: { fr: "Mercredi", en: "Wednesday" },
  jeudi:    { fr: "Jeudi",    en: "Thursday"  },
  vendredi: { fr: "Vendredi", en: "Friday"    },
  samedi:   { fr: "Samedi",   en: "Saturday"  },
  dimanche: { fr: "Dimanche", en: "Sunday"    },
};

interface Props {
  horaires:  HorairesAgence;
  onChange:  (h: HorairesAgence) => void;
  disabled?: boolean;
}

export function HorairesEditor({ horaires, onChange, disabled }: Props) {
  const { theme }                  = useSector();
  const { dictionary: d, locale }  = useLanguage();
  const closedLabel                = d.knowledge.agences.closed;

  const updateJour = (jour: JourSemaine, patch: Partial<HoraireJour>) =>
    onChange({ ...horaires, [jour]: { ...horaires[jour], ...patch } });

  return (
    <div className="space-y-2">
      {JOURS_SEMAINE.map((jour: JourSemaine) => {
        const h      = horaires[jour];
        const isOpen = h.ouvert;
        const label  = LABELS[jour][locale];

        return (
          <div key={jour}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isOpen
                ? "bg-[var(--bg-card)] border-[var(--border)]"
                : "bg-[var(--bg)] border-[var(--border)] opacity-60"
            }`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => updateJour(jour, { ouvert: !isOpen })}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              style={{ backgroundColor: isOpen ? theme.primary : "var(--border)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: isOpen ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>

            <span className="w-24 text-sm font-medium text-[var(--text)] flex-shrink-0">
              {label}
            </span>

            {isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={h.debut} disabled={disabled}
                  onChange={(e) => updateJour(jour, { debut: e.target.value })}
                  className="input-base w-32 text-sm disabled:opacity-50 disabled:cursor-not-allowed" />
                <span className="text-[var(--text-muted)] text-sm">→</span>
                <input type="time" value={h.fin} disabled={disabled}
                  onChange={(e) => updateJour(jour, { fin: e.target.value })}
                  className="input-base w-32 text-sm disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            ) : (
              <span className="text-sm text-[var(--text-muted)] italic">{closedLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}