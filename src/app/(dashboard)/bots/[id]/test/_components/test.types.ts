// src/app/pme/bots/[id]/test/_components/test.types.ts
// Types, constantes et helpers locaux au cockpit de test bot.

import type { RendezVous, Service } from "@/types/api";

// ── Thèmes secteur ────────────────────────────────────────────────────────────
export const SECTOR_THEMES: Record<string, {
  primary: string; accent: string; bg: string; header: string; name: string;
}> = {
  sante:        { primary: "#0EA5E9", accent: "#38BDF8", bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",            header: "bg-sky-500",      name: "Santé"        },
  juridique:    { primary: "#1E3A5F", accent: "#3B82F6", bg: "from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950",         header: "bg-[#1E3A5F]",    name: "Juridique"    },
  beaute:       { primary: "#EC4899", accent: "#F9A8D4", bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",           header: "bg-pink-500",     name: "Beauté"       },
  restauration: { primary: "#F97316", accent: "#FDBA74", bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",     header: "bg-orange-500",   name: "Restauration" },
  commerce:     { primary: "#8B5CF6", accent: "#C4B5FD", bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950",   header: "bg-violet-500",   name: "Commerce"     },
  finance:      { primary: "#059669", accent: "#34D399", bg: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950",   header: "bg-emerald-600",  name: "Finance"      },
  education:    { primary: "#6366F1", accent: "#A5B4FC", bg: "from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950",   header: "bg-indigo-500",   name: "Éducation"    },
  transport:    { primary: "#64748B", accent: "#94A3B8", bg: "from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950",         header: "bg-slate-600",    name: "Transport"    },
  default:      { primary: "#075E54", accent: "#25D366", bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",         header: "bg-[#075E54]",    name: "AGT"          },
};

export type SectorTheme = (typeof SECTOR_THEMES)[string];

export function getTheme(sector: string): SectorTheme {
  const key = (sector ?? "")
    .toLowerCase()
    .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[ùû]/g, "u")
    .split(" ")[0];
  return SECTOR_THEMES[key] ?? SECTOR_THEMES.default;
}

// ── Agenda helpers ─────────────────────────────────────────────────────────────
export const SLOT_MIN   = 30;
export const HOUR_START = 7;
export const HOUR_END   = 20;
export const SLOT_H     = 48;

export const DAYS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
export const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

export const STATUS_BG: Record<string, string> = {
  confirme:   "bg-[#25D366]/20 border-[#25D366]",
  en_attente: "bg-amber-100 border-amber-400 dark:bg-amber-900/30",
  termine:    "bg-blue-100 border-blue-400 dark:bg-blue-900/30",
  annule:     "bg-[var(--bg)] border-[var(--border)] opacity-50",
};

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function slotTop(date: Date): number {
  return (((date.getHours() - HOUR_START) * 60 + date.getMinutes()) / SLOT_MIN) * SLOT_H;
}

// ── Types locaux ───────────────────────────────────────────────────────────────
export interface ClientReport {
  name: string | null;
  phone: string | null;
  email: string | null;
  intention: string | null;
  services: string[];
  appointmentDate: string | null;
  status: "idle" | "active" | "closed";
}

export type EmailPhase =
  | { phase: "drafting" }
  | { phase: "preview"; subject: string; body: string }
  | { phase: "sent"; to: string };

export interface HumanTransfer {
  triggered: boolean;
  reason: string;
  at: string;
}

export type LeftPanel = "info" | "report" | "transfer" | "email";

export interface ChatMessage {
  id: string;
  role: "bot" | "client";
  content: string;
  time: string;
  mockApt?: { date: Date; serviceId: string };
}

export interface MockResult {
  text: string;
  mockApt?: { date: Date; serviceId: string };
  reportPatch?: Partial<ClientReport>;
  triggerTransfer?: string;
  triggerEmail?: { subject: string; body: string; to: string };
}

// ── Mock intelligence ──────────────────────────────────────────────────────────
export function getMockResponse(
  input: string,
  appointments: RendezVous[],
  services: Service[],
  durationMin: number,
  report: ClientReport,
): MockResult {
  const lower = input.toLowerCase();
  const result: MockResult = { text: "" };

  const phoneMatch = input.match(/(\+?237[\s.]?\d[\d\s.]{7,}|\b6[5-9]\d[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}\b)/);
  const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const nameMatch  = input.match(/je m['']?appelle\s+([A-Za-zÀ-ÿ\s]+)|mon nom (?:est|c'est)\s+([A-Za-zÀ-ÿ\s]+)/i);

  if (phoneMatch && !report.phone) result.reportPatch = { ...result.reportPatch, phone: phoneMatch[0].trim() };
  if (emailMatch && !report.email) result.reportPatch = { ...result.reportPatch, email: emailMatch[0].trim() };
  if (nameMatch && !report.name) {
    const n = (nameMatch[1] ?? nameMatch[2] ?? "").trim();
    if (n) result.reportPatch = { ...result.reportPatch, name: n };
  }

  const wantsHuman = /parler.*(quelqu|agent|humain|personne|responsable)|agent|responsable|plainte|problème.*(grave|urgent|sérieux)|pas satisfait/i.test(lower);
  if (wantsHuman) {
    result.triggerTransfer = "Le client souhaite parler à un agent humain.";
    result.text = "Je comprends votre demande. Je transmets votre conversation à l'un de nos conseillers disponibles. Vous serez pris en charge dans les plus brefs délais. 🤝";
    result.reportPatch = { ...result.reportPatch, intention: "Transfert humain", status: "closed" };
    return result;
  }

  const wantsAppointment = /rdv|rendez.?vous|réserver|prendre|planifier|disponible|créneau/i.test(lower);
  const wantsHours       = /heure|horaire|ouvert|ferme|quand/i.test(lower) && !wantsAppointment;
  const wantsService     = /service|prix|tarif|combien|coût/i.test(lower);

  if (!report.intention && wantsAppointment) result.reportPatch = { ...result.reportPatch, intention: "Prise de RDV",            status: "active" };
  if (!report.intention && wantsService)     result.reportPatch = { ...result.reportPatch, intention: "Renseignement services",  status: "active" };
  if (!report.intention && wantsHours)       result.reportPatch = { ...result.reportPatch, intention: "Horaires",                status: "active" };

  if (wantsHours) {
    result.text = "Nous sommes ouverts du lundi au samedi de 8h à 18h. Le dimanche nous sommes fermés. Souhaitez-vous prendre rendez-vous ?";
    return result;
  }

  if (wantsService && services.length > 0) {
    const list  = services.slice(0, 3).map(s => `• ${s.nom} — ${s.prix === 0 ? "Gratuit" : `${s.prix.toLocaleString()} XAF`}${s.duree_min ? ` / ${s.duree_min} min` : ""}`).join("\n");
    const names = services.slice(0, 3).map(s => s.nom);
    result.reportPatch = { ...result.reportPatch, services: names, status: "active" };
    result.text = `Voici nos services disponibles :\n${list}\n\nSouhaitez-vous réserver un créneau ?`;
    return result;
  }

  if (wantsAppointment) {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(9, 0, 0, 0);
    let freeSlot: Date | null = null;
    for (let d = 0; d < 7 && !freeSlot; d++) {
      const day = addDays(tomorrow, d);
      if (day.getDay() === 0) continue;
      for (let h = 9; h < 17; h++) {
        const slot    = new Date(day);
        slot.setHours(h, 0, 0, 0);
        const slotEnd = new Date(slot.getTime() + durationMin * 60000);
        const busy    = appointments.some(a => {
          const aStart = new Date(a.scheduled_at);
          const aEnd   = new Date(aStart.getTime() + durationMin * 60000);
          return slot < aEnd && slotEnd > aStart && isSameDay(slot, aStart);
        });
        if (!busy) { freeSlot = slot; break; }
      }
    }
    if (freeSlot) {
      const dayLabel  = DAYS_FR[freeSlot.getDay() === 0 ? 6 : freeSlot.getDay() - 1];
      const dateLabel = `${dayLabel} ${freeSlot.getDate()} ${MONTHS_FR[freeSlot.getMonth()]} à ${String(freeSlot.getHours()).padStart(2,"0")}h${String(freeSlot.getMinutes()).padStart(2,"0")}`;
      const svc       = services[0];
      result.text       = `J'ai vérifié le calendrier 📅. Le prochain créneau disponible est le **${dateLabel}**${svc ? ` pour "${svc.nom}"` : ""}.\n\nJe confirme ce rendez-vous pour vous ?`;
      result.mockApt    = { date: freeSlot, serviceId: svc?.id ?? "" };
      result.reportPatch = { ...result.reportPatch, appointmentDate: dateLabel, intention: "Prise de RDV" };
      return result;
    }
    result.text = "Je vérifie les disponibilités... Tous les créneaux semblent pris cette semaine. Souhaitez-vous que je regarde la semaine prochaine ?";
    return result;
  }

  if (report.status === "idle") result.reportPatch = { status: "active" };
  const generic = [
    "Bonjour ! Je suis ravi de vous aider. Que puis-je faire pour vous ?",
    "Bien sûr, je comprends votre demande. Y a-t-il autre chose que je puisse faire ?",
    "Merci pour votre message. N'hésitez pas si vous avez d'autres questions.",
    "Je suis là pour vous aider 24h/24. Comment puis-je vous être utile ?",
  ];
  result.text = generic[Math.floor(Math.random() * generic.length)];
  return result;
}