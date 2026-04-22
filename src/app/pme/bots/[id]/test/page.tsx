// src/app/pme/bots/[id]/test/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import {
  botsRepository, tenantsRepository,
  appointmentsRepository, servicesRepository,
} from "@/repositories";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import {
  ArrowLeft, Globe, GlobeLock, Bot, Send,
  Phone, PhoneOff, Mic, MicOff, Volume2,
  MessageSquare, Zap, ChevronLeft, ChevronRight,
  Clock, CalendarDays, ChevronDown, ChevronUp,
  User, Mail, Users, AlertTriangle, CheckCircle,
  FileText, Loader2, AtSign, Briefcase,
} from "lucide-react";
import type { Bot as BotType, Tenant, Appointment, Service } from "@/types/api";

// ── Palette par secteur ────────────────────────────────────────────────────────
const SECTOR_THEMES: Record<string, {
  primary: string; accent: string; bg: string;
  header: string; name: string;
}> = {
  sante:        { primary: "#0EA5E9", accent: "#38BDF8", bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",         header: "bg-sky-500",      name: "Santé" },
  juridique:    { primary: "#1E3A5F", accent: "#3B82F6", bg: "from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950",     header: "bg-[#1E3A5F]",    name: "Juridique" },
  beaute:       { primary: "#EC4899", accent: "#F9A8D4", bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",       header: "bg-pink-500",     name: "Beauté" },
  restauration: { primary: "#F97316", accent: "#FDBA74", bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950", header: "bg-orange-500",   name: "Restauration" },
  commerce:     { primary: "#8B5CF6", accent: "#C4B5FD", bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950", header: "bg-violet-500", name: "Commerce" },
  finance:      { primary: "#059669", accent: "#34D399", bg: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950", header: "bg-emerald-600", name: "Finance" },
  education:    { primary: "#6366F1", accent: "#A5B4FC", bg: "from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950", header: "bg-indigo-500",  name: "Éducation" },
  transport:    { primary: "#64748B", accent: "#94A3B8", bg: "from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950",     header: "bg-slate-600",    name: "Transport" },
  default:      { primary: "#075E54", accent: "#25D366", bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",     header: "bg-[#075E54]",    name: "AGT" },
};

function getTheme(sector: string) {
  const key = sector?.toLowerCase()
    .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a")
    .replace(/[ùû]/g, "u").split(" ")[0] ?? "";
  return SECTOR_THEMES[key] ?? SECTOR_THEMES.default;
}

// ── Agenda helpers ─────────────────────────────────────────────────────────────
const SLOT_MIN = 30;
const HOUR_START = 7;
const HOUR_END = 20;
const SLOT_H = 48;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function slotTop(date: Date): number {
  return ((date.getHours() - HOUR_START) * 60 + date.getMinutes()) / SLOT_MIN * SLOT_H;
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const STATUS_BG: Record<string, string> = {
  confirmed: "bg-[#25D366]/20 border-[#25D366]",
  pending:   "bg-amber-100 border-amber-400 dark:bg-amber-900/30",
  done:      "bg-blue-100 border-blue-400 dark:bg-blue-900/30",
  cancelled: "bg-[var(--bg)] border-[var(--border)] opacity-50",
};

// ── Types locaux ───────────────────────────────────────────────────────────────
interface ClientReport {
  name: string | null;
  phone: string | null;
  email: string | null;
  intention: string | null;
  services: string[];
  appointmentDate: string | null;
  status: "idle" | "active" | "closed";
}

type EmailPhase =
  | { phase: "drafting" }
  | { phase: "preview"; subject: string; body: string }
  | { phase: "sent"; to: string };

interface HumanTransfer {
  triggered: boolean;
  reason: string;
  at: string;
}

// Panneau actif dans la colonne gauche
type LeftPanel = "info" | "report" | "transfer" | "email";

// ── Mock responses intelligentes ───────────────────────────────────────────────
interface MockResult {
  text: string;
  mockApt?: { date: Date; serviceId: string };
  reportPatch?: Partial<ClientReport>;
  triggerTransfer?: string;
  triggerEmail?: { subject: string; body: string; to: string };
}

function getMockResponse(
  input: string,
  appointments: Appointment[],
  services: Service[],
  durationMin: number,
  report: ClientReport,
): MockResult {
  const lower = input.toLowerCase();
  const result: MockResult = { text: "" };

  // ── Détection nom / téléphone / email dans le texte libre
  const phoneMatch = input.match(/(\+?237[\s.]?\d[\d\s.]{7,}|\b6[5-9]\d[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}\b)/);
  const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const nameMatch = input.match(/je m['']?appelle\s+([A-Za-zÀ-ÿ\s]+)|mon nom (?:est|c'est)\s+([A-Za-zÀ-ÿ\s]+)/i);

  if (phoneMatch && !report.phone) result.reportPatch = { ...result.reportPatch, phone: phoneMatch[0].trim() };
  if (emailMatch && !report.email) result.reportPatch = { ...result.reportPatch, email: emailMatch[0].trim() };
  if (nameMatch && !report.name) {
    const n = (nameMatch[1] ?? nameMatch[2] ?? "").trim();
    if (n) result.reportPatch = { ...result.reportPatch, name: n };
  }

  // ── Détection transfert humain
  const wantsHuman = /parler.*(quelqu|agent|humain|personne|responsable)|agent|responsable|plainte|problème.*(grave|urgent|sérieux)|pas satisfait/i.test(lower);
  if (wantsHuman) {
    result.triggerTransfer = "Le client souhaite parler à un agent humain.";
    result.text = "Je comprends votre demande. Je transmets votre conversation à l'un de nos conseillers disponibles. Vous serez pris en charge dans les plus brefs délais. 🤝";
    result.reportPatch = { ...result.reportPatch, intention: "Transfert humain", status: "closed" };
    return result;
  }

  // ── Détection intentions
  const wantsAppointment = /rdv|rendez.?vous|réserver|prendre|planifier|disponible|créneau/i.test(lower);
  const wantsHours = /heure|horaire|ouvert|ferme|quand/i.test(lower) && !wantsAppointment;
  const wantsService = /service|prix|tarif|combien|coût/i.test(lower);

  if (!report.intention && wantsAppointment) result.reportPatch = { ...result.reportPatch, intention: "Prise de RDV", status: "active" };
  if (!report.intention && wantsService) result.reportPatch = { ...result.reportPatch, intention: "Renseignement services", status: "active" };
  if (!report.intention && wantsHours) result.reportPatch = { ...result.reportPatch, intention: "Horaires", status: "active" };

  if (wantsHours) {
    result.text = "Nous sommes ouverts du lundi au samedi de 8h à 18h. Le dimanche nous sommes fermés. Souhaitez-vous prendre rendez-vous ?";
    return result;
  }

  if (wantsService && services.length > 0) {
    const list = services.slice(0, 3).map(s =>
      `• ${s.nom} — ${s.prix === 0 ? "Gratuit" : `${s.prix.toLocaleString()} XAF`}${s.duree_min ? ` / ${s.duree_min} min` : ""}`
    ).join("\n");
    const names = services.slice(0, 3).map(s => s.nom);
    result.reportPatch = { ...result.reportPatch, services: names, status: "active" };
    result.text = `Voici nos services disponibles :\n${list}\n\nSouhaitez-vous réserver un créneau ?`;
    return result;
  }

  if (wantsAppointment) {
    const now = new Date();
    const tomorrow = addDays(now, 1);
    tomorrow.setHours(9, 0, 0, 0);
    let freeSlot: Date | null = null;
    for (let d = 0; d < 7 && !freeSlot; d++) {
      const day = addDays(tomorrow, d);
      if (day.getDay() === 0) continue;
      for (let h = 9; h < 17; h++) {
        const slot = new Date(day);
        slot.setHours(h, 0, 0, 0);
        const slotEnd = new Date(slot.getTime() + durationMin * 60000);
        const isOccupied = appointments.some(a => {
          const aStart = new Date(a.scheduled_at);
          const aEnd = new Date(aStart.getTime() + durationMin * 60000);
          return slot < aEnd && slotEnd > aStart && isSameDay(slot, aStart);
        });
        if (!isOccupied) { freeSlot = slot; break; }
      }
    }
    if (freeSlot) {
      const dayLabel = DAYS_FR[freeSlot.getDay() === 0 ? 6 : freeSlot.getDay() - 1];
      const dateLabel = `${dayLabel} ${freeSlot.getDate()} ${MONTHS_FR[freeSlot.getMonth()]} à ${String(freeSlot.getHours()).padStart(2, "0")}h${String(freeSlot.getMinutes()).padStart(2, "0")}`;
      const svc = services[0];
      result.text = `J'ai vérifié le calendrier 📅. Le prochain créneau disponible est le **${dateLabel}**${svc ? ` pour "${svc.nom}"` : ""}.\n\nJe confirme ce rendez-vous pour vous ?`;
      result.mockApt = { date: freeSlot, serviceId: svc?.id ?? "" };
      result.reportPatch = { ...result.reportPatch, appointmentDate: dateLabel, intention: "Prise de RDV" };
      return result;
    }
    result.text = "Je vérifie les disponibilités... Tous les créneaux semblent pris cette semaine. Souhaitez-vous que je regarde la semaine prochaine ?";
    return result;
  }

  // ── Réponses génériques
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

interface ChatMessage {
  id: string;
  role: "bot" | "client";
  content: string;
  time: string;
  mockApt?: { date: Date; serviceId: string };
}

// ── Composant AccordionBlock ───────────────────────────────────────────────────
interface AccordionBlockProps {
  id: LeftPanel;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean;
  primaryColor: string;
  children: React.ReactNode;
}

function AccordionBlock({
  title, icon, badge, badgeColor, isOpen, onToggle, highlight, primaryColor, children,
}: AccordionBlockProps) {
  return (
    <div className={cn(
      "bg-[var(--bg-card)] rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
      highlight
        ? "border-2 shadow-md"
        : "border-[var(--border)]",
    )}
      style={highlight ? { borderColor: primaryColor, boxShadow: `0 0 0 3px ${primaryColor}15` } : {}}>
      {/* Header accordéon */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--bg)] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0" style={{ color: primaryColor }}>{icon}</span>
          <span className="text-xs font-bold text-[var(--text)] truncate">{title}</span>
          {badge && (
            <span
              className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white"
              style={{ backgroundColor: badgeColor ?? primaryColor }}
            >
              {badge}
            </span>
          )}
          {highlight && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }} />
          )}
        </div>
        {isOpen
          ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />}
      </button>

      {/* Contenu */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Bloc Rapport client ────────────────────────────────────────────────────────
function ClientReportBlock({ report, primaryColor }: { report: ClientReport; primaryColor: string }) {
  const fields: { label: string; value: string | null; icon: React.ReactNode }[] = [
    { label: "Nom", value: report.name, icon: <User className="w-3 h-3" /> },
    { label: "Téléphone", value: report.phone, icon: <Phone className="w-3 h-3" /> },
    { label: "Email", value: report.email, icon: <AtSign className="w-3 h-3" /> },
  ];

  const statusLabel: Record<ClientReport["status"], string> = {
    idle: "En attente",
    active: "En cours",
    closed: "Terminé",
  };
  const statusColor: Record<ClientReport["status"], string> = {
    idle: "text-[var(--text-muted)]",
    active: "text-emerald-600 dark:text-emerald-400",
    closed: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Statut */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Contact</span>
        <span className={cn("text-[10px] font-bold", statusColor[report.status])}>
          ● {statusLabel[report.status]}
        </span>
      </div>

      {/* Champs contact */}
      <div className="space-y-2">
        {fields.map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] flex-shrink-0">{f.icon}</span>
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">{f.label}</span>
            {f.value
              ? <span className="text-xs font-semibold text-[var(--text)] truncate">{f.value}</span>
              : <span className="text-[10px] text-[var(--text-muted)] italic">Non détecté</span>
            }
          </div>
        ))}
      </div>

      {/* Séparateur */}
      <div className="border-t border-[var(--border)]" />
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Conversation</span>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">Intention</span>
          {report.intention
            ? <span className="text-xs font-semibold text-[var(--text)]">{report.intention}</span>
            : <span className="text-[10px] text-[var(--text-muted)] italic">Analyse en cours...</span>
          }
        </div>

        {report.services.length > 0 && (
          <div className="flex items-start gap-2">
            <Briefcase className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">Services</span>
            <div className="flex flex-wrap gap-1">
              {report.services.map(s => (
                <span key={s} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {report.appointmentDate && (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">RDV</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{report.appointmentDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bloc Transfert humain ──────────────────────────────────────────────────────
function HumanTransferBlock({ transfer }: { transfer: HumanTransfer }) {
  if (!transfer.triggered) return (
    <div className="pt-1 text-center py-4">
      <Users className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
      <p className="text-[10px] text-[var(--text-muted)] italic">Aucun transfert déclenché</p>
    </div>
  );

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Escalade déclenchée</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{transfer.reason}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span>Heure de transfert</span>
        <span className="font-bold text-[var(--text)]">{transfer.at}</span>
      </div>
      <div className="flex items-center gap-2 p-2 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
        <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-[#25D366]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[var(--text)]">Agent disponible</p>
          <p className="text-[9px] text-[var(--text-muted)]">Prise en charge en cours...</p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-[#25D366] animate-pulse flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Bloc Email bot ─────────────────────────────────────────────────────────────
function EmailBotBlock({ emailStep }: { emailStep: EmailPhase | null }) {
  if (!emailStep) return (
    <div className="pt-1 text-center py-4">
      <Mail className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
      <p className="text-[10px] text-[var(--text-muted)] italic">En attente d&apos;un événement déclencheur</p>
    </div>
  );

  const steps: { key: EmailPhase["phase"]; label: string; icon: React.ReactNode }[] = [
    { key: "drafting", label: "Rédaction", icon: <FileText className="w-3 h-3" /> },
    { key: "preview",  label: "Prévisualisation", icon: <Mail className="w-3 h-3" /> },
    { key: "sent",     label: "Envoyé", icon: <CheckCircle className="w-3 h-3" /> },
  ];
  const currentIdx = steps.findIndex(s => s.key === emailStep.phase);

  return (
    <div className="space-y-3 pt-1">
      {/* Stepper */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                done   ? "bg-[#25D366] text-white" :
                active ? "bg-blue-500 text-white animate-pulse" :
                         "bg-[var(--border)] text-[var(--text-muted)]"
              )}>
                {done ? <CheckCircle className="w-3 h-3" /> :
                 active && emailStep.phase === "drafting" ? <Loader2 className="w-3 h-3 animate-spin" /> :
                 step.icon}
              </div>
              <span className={cn(
                "text-[9px] font-bold truncate",
                done || active ? "text-[var(--text)]" : "text-[var(--text-muted)]"
              )}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 mx-1", done ? "bg-[#25D366]" : "bg-[var(--border)]")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Contenu selon phase */}
      {emailStep.phase === "drafting" && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">Le bot rédige l&apos;email de confirmation...</p>
        </div>
      )}

      {emailStep.phase === "preview" && (
        <div className="space-y-2 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text)] truncate">{emailStep.subject}</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
            {emailStep.body}
          </p>
        </div>
      )}

      {emailStep.phase === "sent" && (
        <div className="flex items-center gap-2 p-3 bg-[#25D366]/10 rounded-xl border border-[#25D366]/30">
          <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#25D366]">Email envoyé avec succès</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">À : {emailStep.to}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// PAGE TEST
// ╔══════════════════════════════════════════════════════════════════════════════
export default function BotTestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  const [bot, setBot] = useState<BotType | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mockAppointments, setMockAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Agenda state ───────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate);
  const displayDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from(
    { length: ((HOUR_END - HOUR_START) * 60) / SLOT_MIN },
    (_, i) => {
      const total = HOUR_START * 60 + i * SLOT_MIN;
      return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    }
  );

  // ── Switcher simulateur ────────────────────────────────────────────────────
  const [activeSimulator, setActiveSimulator] = useState<"whatsapp" | "voice">("whatsapp");

  // ── État cockpit gauche ────────────────────────────────────────────────────
  const [openPanels, setOpenPanels] = useState<Record<LeftPanel, boolean>>({
    info: true,
    report: false,
    transfer: false,
    email: false,
  });
  const [highlightPanel, setHighlightPanel] = useState<LeftPanel | null>(null);

  const [clientReport, setClientReport] = useState<ClientReport>({
    name: null, phone: null, email: null,
    intention: null, services: [], appointmentDate: null, status: "idle",
  });
  const [humanTransfer, setHumanTransfer] = useState<HumanTransfer>({
    triggered: false, reason: "", at: "",
  });
  const [emailStep, setEmailStep] = useState<EmailPhase | null>(null);

  // Auto-expand : ouvre un panneau et le met en avant
  const expandPanel = useCallback((panel: LeftPanel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: true }));
    setHighlightPanel(panel);
    setTimeout(() => setHighlightPanel(null), 3000);
  }, []);

  const togglePanel = (panel: LeftPanel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  // ── Callbacks depuis simulateur ────────────────────────────────────────────
  const handleReportUpdate = useCallback((patch: Partial<ClientReport>) => {
    setClientReport(prev => {
      const next = { ...prev, ...patch };
      // Si le rapport n'était pas ouvert, l'ouvrir
      setOpenPanels(p => {
        if (!p.report) expandPanel("report");
        return p;
      });
      return next;
    });
  }, [expandPanel]);

  const handleHumanTransfer = useCallback((reason: string) => {
    const at = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setHumanTransfer({ triggered: true, reason, at });
    expandPanel("transfer");
  }, [expandPanel]);

  const handleEmailTrigger = useCallback(async (
    subject: string, body: string, to: string
  ) => {
    expandPanel("email");
    // Étape 1 : rédaction
    setEmailStep({ phase: "drafting" });
    await new Promise(r => setTimeout(r, 2000));
    // Étape 2 : prévisualisation
    setEmailStep({ phase: "preview", subject, body });
    await new Promise(r => setTimeout(r, 3000));
    // Étape 3 : envoyé
    setEmailStep({ phase: "sent", to });
  }, [expandPanel]);

  const handleMockAppointment = useCallback((apt: { date: Date; serviceId: string }) => {
    const mock: Appointment = {
      id: `mock-${Date.now()}`,
      tenant_id: user?.tenant_id ?? "",
      service_id: apt.serviceId,
      client_name: clientReport.name ?? "Client simulé",
      client_phone: clientReport.phone ?? "+237600000000",
      client_email: clientReport.email ?? "",
      scheduled_at: apt.date.toISOString(),
      status: "pending",
      channel: "whatsapp",
      reminder_sent: false,
      notes: "RDV simulé (test bot)",
    };
    setMockAppointments(prev => [...prev, mock]);
    setCurrentDate(apt.date);

    // Déclencher l'email de confirmation
    const svc = services.find(s => s.id === apt.serviceId);
    const dateLabel = apt.date.toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
    const timeLabel = apt.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const subject = `Confirmation de votre rendez-vous — ${dateLabel}`;
    const body = `Bonjour${clientReport.name ? " " + clientReport.name : ""},\n\nVotre rendez-vous a bien été enregistré :\n\n📅 Date : ${dateLabel} à ${timeLabel}\n🏥 Service : ${svc?.nom ?? "Consultation"}\n\nUn rappel vous sera envoyé 24h avant.\n\nCordialement,\nL'équipe`;
    const to = clientReport.email ?? "client@exemple.com";
    handleEmailTrigger(subject, body, to);
  }, [user?.tenant_id, clientReport, services, handleEmailTrigger]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const b = await botsRepository.getById(id);
      setBot(b);
      if (user?.tenant_id) {
        const [ten, aptsRes, svcsRes] = await Promise.all([
          tenantsRepository.getById(user.tenant_id),
          appointmentsRepository.getList({ tenant_id: user.tenant_id }),
          servicesRepository.getList({ tenant_id: user.tenant_id }),
        ]);
        setTenant(ten);
        setAppointments(aptsRes.results);
        setServices(svcsRes.results);
      }
    } catch { toast.error(t.errorLoad); }
    finally { setLoading(false); }
  }, [id, user?.tenant_id, t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePublishToggle = async () => {
    if (!bot) return;
    try {
      const newActive = !bot.is_active;
      await botsRepository.patch(bot.id, { is_active: newActive });
      setBot({ ...bot, is_active: newActive, status: newActive ? "active" : "paused" });
      toast.success(newActive ? t.publishSuccess : t.unpublishSuccess);
    } catch { toast.error(t.publishError); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <Spinner className="w-8 h-8 border-[#25D366] border-t-transparent" />
    </div>
  );
  if (!bot) return null;

  const theme = getTheme(tenant?.sector ?? "");
  const allAppointments = [...appointments, ...mockAppointments];
  const periodLabel = `${weekStart.getDate()} ${MONTHS_FR[weekStart.getMonth()]} — ${addDays(weekStart, 6).getDate()} ${MONTHS_FR[addDays(weekStart, 6).getMonth()]} ${weekStart.getFullYear()}`;

  // Badges dynamiques pour les panneaux
  const reportBadge = clientReport.status !== "idle" ? "●" : undefined;
  const transferBadge = humanTransfer.triggered ? "!" : undefined;
  const emailBadge = emailStep ? (emailStep.phase === "sent" ? "✓" : "…") : undefined;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br", theme.bg)}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(ROUTES.dashboard)}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t.testBackDashboard}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}>
              <Bot className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{bot.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{tenant?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
              bot.is_active
                ? "bg-[#25D366]/10 text-[#25D366]"
                : "bg-[var(--border)] text-[var(--text-muted)]"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                bot.is_active ? "bg-[#25D366] animate-pulse" : "bg-[var(--text-muted)]"
              )} />
              {bot.is_active ? t.testPublishedBadge : t.testUnpublishedBadge}
            </span>
            <button
              onClick={handlePublishToggle}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                bot.is_active
                  ? "border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                  : "text-white"
              )}
              style={!bot.is_active ? { backgroundColor: theme.primary } : {}}
            >
              {bot.is_active
                ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
                : <><Globe className="w-3.5 h-3.5" /> {t.publish}</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps 3 colonnes ─────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_1fr] gap-5">

          {/* ── COL 1 : Cockpit supervision ──────────────────────────────────── */}
          <div className="space-y-3">

            {/* Bloc 1 — Infos bot */}
            <AccordionBlock
              id="info"
              title={`${tenant?.name ?? "Bot"} — ${theme.name}`}
              icon={<Bot className="w-3.5 h-3.5" />}
              isOpen={openPanels.info}
              onToggle={() => togglePanel("info")}
              highlight={highlightPanel === "info"}
              primaryColor={theme.primary}
            >
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base"
                    style={{ backgroundColor: theme.primary }}>
                    {tenant?.name?.[0] ?? "A"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text)] truncate">{tenant?.name ?? "—"}</p>
                    {tenant?.description && (
                      <p className="text-[10px] text-[var(--text-muted)] leading-snug line-clamp-2 mt-0.5">
                        {tenant.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-2 space-y-1.5">
                  {[
                    { label: "Personnalité", value: bot.personality },
                    { label: "Langues", value: bot.languages.join(", ").toUpperCase() },
                    { label: "WhatsApp", value: bot.whatsapp_provider?.toUpperCase() },
                    { label: "IA Vocale", value: bot.voice_ai_provider },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center gap-2">
                      <span className="text-[10px] text-[var(--text-muted)]">{item.label}</span>
                      <span className="text-[10px] font-semibold text-[var(--text)] text-right truncate max-w-[140px]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-2 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: theme.primary }} />
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                    Essayez : &quot;Je veux un RDV&quot;, &quot;Vos services ?&quot;, &quot;Vos horaires ?&quot;, &quot;Je veux parler à quelqu&apos;un&quot;
                  </p>
                </div>
              </div>
            </AccordionBlock>

            {/* Bloc 2 — Rapport client live */}
            <AccordionBlock
              id="report"
              title="Rapport client"
              icon={<FileText className="w-3.5 h-3.5" />}
              badge={reportBadge}
              isOpen={openPanels.report}
              onToggle={() => togglePanel("report")}
              highlight={highlightPanel === "report"}
              primaryColor={theme.primary}
            >
              <ClientReportBlock report={clientReport} primaryColor={theme.primary} />
            </AccordionBlock>

            {/* Bloc 3 — Transfert humain */}
            <AccordionBlock
              id="transfer"
              title="Transfert humain"
              icon={<Users className="w-3.5 h-3.5" />}
              badge={transferBadge}
              badgeColor="#F59E0B"
              isOpen={openPanels.transfer}
              onToggle={() => togglePanel("transfer")}
              highlight={highlightPanel === "transfer"}
              primaryColor="#F59E0B"
            >
              <HumanTransferBlock transfer={humanTransfer} />
            </AccordionBlock>

            {/* Bloc 4 — Email bot */}
            <AccordionBlock
              id="email"
              title="Email bot"
              icon={<Mail className="w-3.5 h-3.5" />}
              badge={emailBadge}
              badgeColor={emailStep?.phase === "sent" ? "#25D366" : "#3B82F6"}
              isOpen={openPanels.email}
              onToggle={() => togglePanel("email")}
              highlight={highlightPanel === "email"}
              primaryColor="#3B82F6"
            >
              <EmailBotBlock emailStep={emailStep} />
            </AccordionBlock>

          </div>

          {/* ── COL 2 : Simulateur ───────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Toggle WhatsApp / Vocal */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-1 flex gap-1 shadow-sm">
              <button
                onClick={() => setActiveSimulator("whatsapp")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  activeSimulator === "whatsapp"
                    ? "text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
                style={activeSimulator === "whatsapp" ? { backgroundColor: theme.primary } : {}}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => setActiveSimulator("voice")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  activeSimulator === "voice"
                    ? "text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
                style={activeSimulator === "voice" ? { backgroundColor: "#6C3CE1" } : {}}
              >
                <Phone className="w-3.5 h-3.5" />
                Vocal IA
              </button>
            </div>

            {/* Simulateur actif */}
            {activeSimulator === "whatsapp" ? (
              <WhatsAppSimulator
                bot={bot}
                tenant={tenant}
                theme={theme}
                d={d}
                appointments={allAppointments}
                services={services}
                clientReport={clientReport}
                onMockAppointment={handleMockAppointment}
                onReportUpdate={handleReportUpdate}
                onHumanTransfer={handleHumanTransfer}
              />
            ) : (
              <VoiceSimulator bot={bot} theme={theme} d={d} />
            )}

          </div>

          {/* ── COL 3 : Agenda (inchangé) ────────────────────────────────────── */}
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2"
              style={{ backgroundColor: `${theme.primary}10` }}>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" style={{ color: theme.primary }} />
                <p className="text-xs font-bold text-[var(--text)]">Agenda temps réel</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(dt => addDays(dt, -7))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[var(--border)] hover:bg-[var(--bg)] transition-colors text-[var(--text-muted)]"
                >
                  Auj.
                </button>
                <button
                  onClick={() => setCurrentDate(dt => addDays(dt, 7))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-[var(--text-muted)] py-1 border-b border-[var(--border)]">
              {periodLabel}
            </p>

            {/* En-têtes jours */}
            <div className="grid grid-cols-[32px_repeat(7,1fr)] border-b border-[var(--border)] bg-[var(--bg)]">
              <div className="border-r border-[var(--border)]" />
              {displayDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                const dayLabel = DAYS_FR[day.getDay() === 0 ? 6 : day.getDay() - 1];
                return (
                  <div key={i} className={cn(
                    "py-2 text-center border-r border-[var(--border)] last:border-r-0",
                    isToday && "bg-[#25D366]/5"
                  )}>
                    <p className={cn("text-[8px] font-black uppercase",
                      isToday ? "text-[#25D366]" : "text-[var(--text-muted)]")}>
                      {dayLabel}
                    </p>
                    <p className={cn(
                      "text-xs font-bold mt-0.5",
                      isToday
                        ? "w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center mx-auto text-[10px]"
                        : "text-[var(--text)]"
                    )}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Corps grille */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: "520px" }}>
              <div className="grid grid-cols-[32px_repeat(7,1fr)]">
                {/* Heures */}
                <div className="border-r border-[var(--border)]">
                  {timeSlots.map(slot => (
                    <div key={slot} style={{ height: SLOT_H }}
                      className="border-b border-[var(--border)] flex items-start justify-end pr-1 pt-0.5">
                      <span className="text-[8px] text-[var(--text-muted)] font-mono">{slot}</span>
                    </div>
                  ))}
                </div>

                {/* Colonnes jours */}
                {displayDays.map((day, di) => {
                  const dayApts = allAppointments.filter(a =>
                    isSameDay(new Date(a.scheduled_at), day)
                  );
                  const isToday = isSameDay(day, new Date());
                  const totalH = timeSlots.length * SLOT_H;

                  return (
                    <div key={di}
                      className={cn(
                        "relative border-r border-[var(--border)] last:border-r-0",
                        isToday && "bg-[#25D366]/[0.02]"
                      )}
                      style={{ height: totalH }}
                    >
                      {timeSlots.map((_, si) => (
                        <div key={si}
                          style={{ top: si * SLOT_H, height: SLOT_H }}
                          className="absolute inset-x-0 border-b border-[var(--border)]" />
                      ))}

                      {dayApts.map(apt => {
                        const top = slotTop(new Date(apt.scheduled_at));
                        const height = Math.max(SLOT_H * 0.9, 28);
                        const isMock = apt.id.startsWith("mock-");
                        return (
                          <div key={apt.id}
                            style={{ top, height, left: 1, right: 1 }}
                            className={cn(
                              "absolute rounded-md border-l-2 px-1 py-0.5 overflow-hidden z-10",
                              isMock
                                ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                                : STATUS_BG[apt.status] ?? STATUS_BG.pending
                            )}>
                            <p className={cn(
                              "text-[8px] font-bold truncate leading-tight",
                              isMock ? "text-amber-700 dark:text-amber-300" : "text-[var(--text)]"
                            )}>
                              {isMock ? "⚡ " : ""}{apt.client_name}
                            </p>
                            <p className="text-[7px] opacity-70 flex items-center gap-0.5">
                              <Clock className="w-2 h-2 inline" />
                              {new Date(apt.scheduled_at).toLocaleTimeString("fr-FR", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Légende */}
            <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-4 bg-[var(--bg)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#25D366]/20 border-l-2 border-[#25D366]" />
                <span className="text-[9px] text-[var(--text-muted)]">Confirmé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-100 border-l-2 border-amber-400" />
                <span className="text-[9px] text-[var(--text-muted)]">En attente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-50 border-l-2 border-dashed border-amber-400" />
                <span className="text-[9px] text-[var(--text-muted)]">Simulé ⚡</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// SIMULATEUR WHATSAPP
// ╔══════════════════════════════════════════════════════════════════════════════
interface WhatsAppSimulatorProps {
  bot: BotType;
  tenant: Tenant | null;
  theme: ReturnType<typeof getTheme>;
  d: ReturnType<typeof useLanguage>["dictionary"];
  appointments: Appointment[];
  services: Service[];
  clientReport: ClientReport;
  onMockAppointment: (apt: { date: Date; serviceId: string }) => void;
  onReportUpdate: (patch: Partial<ClientReport>) => void;
  onHumanTransfer: (reason: string) => void;
}

function WhatsAppSimulator({
  bot, tenant, theme, d,
  appointments, services, clientReport,
  onMockAppointment, onReportUpdate, onHumanTransfer,
}: WhatsAppSimulatorProps) {
  const t = d.bots;
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "init", role: "bot",
    content: bot.welcome_message,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingApt, setPendingApt] = useState<{ date: Date; serviceId: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    setMessages(prev => [...prev, { id: `c-${Date.now()}`, role: "client", content, time: now }]);
    setInput("");
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 600));

    // Confirmation RDV en attente
    if (pendingApt && /oui|confirme|ok|parfait|d'accord|yes/i.test(content)) {
      const svc = services.find(s => s.id === pendingApt.serviceId);
      const dateLabel = `${DAYS_FR[pendingApt.date.getDay() === 0 ? 6 : pendingApt.date.getDay() - 1]} ${pendingApt.date.getDate()} ${MONTHS_FR[pendingApt.date.getMonth()]} à ${String(pendingApt.date.getHours()).padStart(2, "0")}h${String(pendingApt.date.getMinutes()).padStart(2, "0")}`;
      const confirmMsg = `✅ RDV confirmé ! Le **${dateLabel}**${svc ? ` pour "${svc.nom}"` : ""}. Vous recevrez un rappel. Y a-t-il autre chose ?`;
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`, role: "bot",
        content: confirmMsg,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }]);
      onMockAppointment(pendingApt);
      setPendingApt(null);
      setIsTyping(false);
      return;
    }

    const response = getMockResponse(content, appointments, services, 30, clientReport);

    // Appliquer les mises à jour du rapport
    if (response.reportPatch) onReportUpdate(response.reportPatch);

    // Transfert humain
    if (response.triggerTransfer) onHumanTransfer(response.triggerTransfer);

    if (response.mockApt) setPendingApt(response.mockApt);

    setMessages(prev => [...prev, {
      id: `b-${Date.now()}`, role: "bot",
      content: response.text,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      mockApt: response.mockApt,
    }]);
    setIsTyping(false);
  };

  const formatContent = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center gap-3", theme.header)}>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{bot.name}</p>
          <p className="text-[10px] text-white/70 flex items-center gap-1">
            <MessageSquare className="w-2.5 h-2.5" />{tenant?.name ?? "Assistant"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span className="text-[10px] text-white/80 font-semibold">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="h-80 overflow-y-auto p-3 space-y-2"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.primary}08 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      >
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm leading-relaxed",
              msg.role === "bot"
                ? "bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-sm"
                : "text-white rounded-tr-sm"
            )} style={msg.role === "client" ? { backgroundColor: theme.primary } : {}}>
              <p className="whitespace-pre-line" style={{ color: msg.role === "bot" ? "var(--text)" : "white" }}>
                {formatContent(msg.content)}
              </p>
              {msg.mockApt && (
                <div className="mt-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Créneau affiché dans l&apos;agenda →
                </div>
              )}
              <p className={cn("text-[10px] mt-0.5 text-right",
                msg.role === "bot" ? "text-[var(--text-muted)]" : "text-white/70")}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: theme.primary, animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
        {["Je veux un RDV", "Vos services ?", "Vos horaires ?", "Parler à quelqu'un"].map(s => (
          <button key={s} onClick={() => sendMessage(s)} disabled={isTyping}
            className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] flex gap-2 items-end bg-[var(--bg)]">
        <input
          className="flex-1 input-base py-2 text-sm"
          placeholder={t.testWhatsappPlaceholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={isTyping}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
          style={{ backgroundColor: theme.primary }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// SIMULATEUR VOCAL
// ╔══════════════════════════════════════════════════════════════════════════════
function VoiceSimulator({ bot, theme, d }: {
  bot: BotType;
  theme: ReturnType<typeof getTheme>;
  d: ReturnType<typeof useLanguage>["dictionary"];
}) {
  const t = d.bots;
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Transcription simulée
  const VOICE_TRANSCRIPT: { delay: number; role: "bot" | "client"; text: string }[] = [
    { delay: 1500,  role: "bot",    text: `Bonjour, vous êtes bien chez ${bot.name}. Comment puis-je vous aider ?` },
    { delay: 4000,  role: "client", text: "Bonjour, je voudrais prendre un rendez-vous." },
    { delay: 6000,  role: "bot",    text: "Bien sûr ! Pour quel service souhaitez-vous prendre rendez-vous ?" },
    { delay: 9000,  role: "client", text: "Une consultation, si possible demain matin." },
    { delay: 11500, role: "bot",    text: "Je vérifie les disponibilités... J'ai un créneau disponible demain à 9h. Cela vous convient ?" },
    { delay: 14000, role: "client", text: "Oui, parfait !" },
    { delay: 16000, role: "bot",    text: "Très bien, votre rendez-vous est confirmé pour demain à 9h. À bientôt !" },
  ];

  const [transcript, setTranscript] = useState<{ role: "bot" | "client"; text: string }[]>([]);
  const transcriptRef = useRef<NodeJS.Timeout[]>([]);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  const startCall = () => {
    setCallState("calling");
    setTranscript([]);
    setTimeout(() => {
      setCallState("connected");
      timerRef.current = setInterval(() => setDuration(s => s + 1), 1000);

      // Lancer la transcription simulée
      VOICE_TRANSCRIPT.forEach(({ delay, role, text }) => {
        const tid = setTimeout(() => {
          setTranscript(prev => [...prev, { role, text }]);
        }, delay);
        transcriptRef.current.push(tid);
      });
    }, 2000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transcriptRef.current.forEach(clearTimeout);
    transcriptRef.current = [];
    setCallState("ended");
    setTimeout(() => { setCallState("idle"); setDuration(0); setIsMuted(false); }, 2000);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transcriptRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("px-5 py-3", theme.header)}>
        <p className="text-sm font-bold text-white">{t.testVoiceTitle}</p>
        <p className="text-xs text-white/70">{bot.voice_ai_provider} · {bot.languages.join(", ").toUpperCase()}</p>
      </div>

      <div className="p-5 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {callState === "connected" && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: theme.primary, transform: "scale(1.5)" }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-10"
                style={{ backgroundColor: theme.primary, transform: "scale(1.9)", animationDelay: "300ms" }} />
            </>
          )}
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white relative z-10"
            style={{ backgroundColor: theme.primary }}>
            {callState === "connected"
              ? <Volume2 className="w-7 h-7 animate-pulse" />
              : <Phone className="w-7 h-7" />}
          </div>
        </div>

        {/* Statut */}
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--text)]">{bot.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {callState === "idle" && t.testVoiceSubtitle}
            {callState === "calling" && (
              <span className="flex items-center gap-1.5">
                <Spinner className="w-3 h-3 border-[#25D366] border-t-transparent" />
                {t.testVoiceCalling}
              </span>
            )}
            {callState === "connected" && (
              <span style={{ color: theme.primary }} className="font-bold">
                {t.testVoiceConnected} · {fmt(duration)}
              </span>
            )}
            {callState === "ended" && "Appel terminé"}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {callState === "connected" && (
            <button
              onClick={() => setIsMuted(m => !m)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isMuted ? "bg-red-100 text-red-500" : "bg-[var(--bg)] text-[var(--text-muted)]"
              )}>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {(callState === "idle" || callState === "ended") ? (
            <button onClick={startCall}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: "#25D366" }}>
              <Phone className="w-5 h-5" />
            </button>
          ) : callState === "connected" ? (
            <button onClick={endCall}
              className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform">
              <PhoneOff className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}30` }}>
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: theme.primary }} />
            </div>
          )}
        </div>
      </div>

      {/* Transcription en temps réel */}
      {(callState === "connected" || (callState === "ended" && transcript.length > 0)) && (
        <div className="mx-5 mb-5 rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--bg)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Transcription en direct
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-40 overflow-y-auto bg-[var(--bg-card)]">
            {transcript.length === 0 && (
              <p className="text-[10px] text-[var(--text-muted)] italic text-center py-2">
                En attente de parole...
              </p>
            )}
            {transcript.map((line, i) => (
              <div key={i} className={cn("flex gap-2 items-start", line.role === "client" && "flex-row-reverse")}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[8px] font-black",
                  line.role === "bot" ? "text-white" : "bg-[var(--border)]"
                )} style={line.role === "bot" ? { backgroundColor: theme.primary } : {}}>
                  {line.role === "bot" ? "B" : "C"}
                </div>
                <div className={cn(
                  "max-w-[80%] px-2.5 py-1.5 rounded-xl text-[10px] leading-relaxed",
                  line.role === "bot"
                    ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                    : "text-white"
                )} style={line.role === "client" ? { backgroundColor: theme.primary } : {}}>
                  {line.text}
                </div>
              </div>
            ))}
            <div ref={transcriptBottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}