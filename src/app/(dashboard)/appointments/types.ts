// src/app/pme/appointments/types.ts

// ── Types ─────────────────────────────────────────────────────────────────────

export type AppointmentStatus = "en_attente" | "confirme" | "annule" | "termine";

export type JourKey =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi"
  | "dimanche";

export type DayVal = { open: boolean; start: string; end: string };

// ── Constantes jours ──────────────────────────────────────────────────────────

export const JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const JOURS_LONG = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
];
export const JOURS_KEYS: JourKey[] = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];

export const DEF_DAY_VAL: DayVal = { open: true, start: "08:00", end: "18:00" };

// ── Constantes statut ─────────────────────────────────────────────────────────

/** Styles de la liste latérale (colonne gauche) */
export const STATUS_LIST: Record<AppointmentStatus, string> = {
  confirme:
    "bg-emerald-50  border-l-[3px] border-emerald-500 text-emerald-800",
  en_attente:
    "bg-amber-50    border-l-[3px] border-amber-400   text-amber-800",
  termine:
    "bg-blue-50     border-l-[3px] border-blue-400    text-blue-800",
  annule:
    "bg-gray-50     border-l-[3px] border-gray-300    text-gray-400 line-through opacity-60",
};

/** Styles des blocs dans l'agenda visuel */
export const STATUS_BLOCK: Record<
  AppointmentStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  confirme: {
    bg: "bg-emerald-500/15",
    border: "border-l-[3px] border-emerald-500",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  en_attente: {
    bg: "bg-amber-400/15",
    border: "border-l-[3px] border-amber-400",
    text: "text-amber-800",
    dot: "bg-amber-400",
  },
  termine: {
    bg: "bg-blue-400/15",
    border: "border-l-[3px] border-blue-400",
    text: "text-blue-800",
    dot: "bg-blue-400",
  },
  annule: {
    bg: "bg-gray-200/60",
    border: "border-l-[3px] border-gray-300",
    text: "text-gray-400",
    dot: "bg-gray-300",
  },
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirme: "Confirmé",
  en_attente: "En attente",
  termine: "Terminé",
  annule: "Annulé",
};

/** Pixels par minute dans le calendrier visuel */
export const PX_PER_MIN = 1.4;

// ── Helpers purs ──────────────────────────────────────────────────────────────

/** "08:30" → 510 (minutes depuis minuit) */
export function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** 510 → "08:30" */
export function toTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Date → JourKey (lundi … dimanche) */
export function dateToJourKey(d: Date): JourKey {
  return JOURS_KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

/** Formate une date locale "fr-FR" de façon lisible */
export function fmtDay(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}