// src/app/pme/bots/[id]/test/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { botsRepository, tenantsRepository, appointmentsRepository, servicesRepository } from "@/repositories";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import {
  ArrowLeft, Globe, GlobeLock, Bot, Send,
  Phone, PhoneOff, Mic, MicOff, Volume2,
  MessageSquare, Zap, ChevronLeft, ChevronRight,
  Clock, CalendarDays,
} from "lucide-react";
import type { Bot as BotType, Tenant, Appointment, Service } from "@/types/api";

// ── Palette par secteur ───────────────────────────────────────────────────────
const SECTOR_THEMES: Record<string, {
  primary: string; accent: string; bg: string;
  header: string; name: string;
}> = {
  sante:        { primary: "#0EA5E9", accent: "#38BDF8", bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",       header: "bg-sky-500",      name: "Santé" },
  juridique:    { primary: "#1E3A5F", accent: "#3B82F6", bg: "from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950",   header: "bg-[#1E3A5F]",    name: "Juridique" },
  beaute:       { primary: "#EC4899", accent: "#F9A8D4", bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",     header: "bg-pink-500",     name: "Beauté" },
  restauration: { primary: "#F97316", accent: "#FDBA74", bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950", header: "bg-orange-500", name: "Restauration" },
  commerce:     { primary: "#8B5CF6", accent: "#C4B5FD", bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950", header: "bg-violet-500", name: "Commerce" },
  finance:      { primary: "#059669", accent: "#34D399", bg: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950", header: "bg-emerald-600", name: "Finance" },
  education:    { primary: "#6366F1", accent: "#A5B4FC", bg: "from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950", header: "bg-indigo-500", name: "Éducation" },
  transport:    { primary: "#64748B", accent: "#94A3B8", bg: "from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950",    header: "bg-slate-600",    name: "Transport" },
  default:      { primary: "#075E54", accent: "#25D366", bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",   header: "bg-[#075E54]",    name: "AGT" },
};

function getTheme(sector: string) {
  const key = sector?.toLowerCase()
    .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a")
    .replace(/[ùû]/g, "u").split(" ")[0] ?? "";
  return SECTOR_THEMES[key] ?? SECTOR_THEMES.default;
}

// ── Agenda helpers ────────────────────────────────────────────────────────────
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
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
  mock:      "border-2 border-dashed",
};

// ── Réponses mock intelligentes ────────────────────────────────────────────────
function getMockResponse(
  input: string,
  appointments: Appointment[],
  services: Service[],
  durationMin: number,
  botName: string,
  primaryColor: string,
): { text: string; mockApt?: { date: Date; serviceId: string } } {
  const lower = input.toLowerCase();

  // Détection intention RDV
  const wantsAppointment = /rdv|rendez.?vous|réserver|prendre|planifier|disponible|créneau/i.test(lower);
  const wantsHours = /heure|horaire|ouvert|ferme|disponible|quand/i.test(lower) && !wantsAppointment;
  const wantsService = /service|prix|tarif|combien|coût/i.test(lower);

  if (wantsHours) {
    return { text: "Nous sommes ouverts du lundi au samedi de 8h à 18h. Le dimanche nous sommes fermés. Souhaitez-vous prendre rendez-vous ?" };
  }

  if (wantsService && services.length > 0) {
    const list = services.slice(0, 3).map(s =>
      `• ${s.name} — ${s.price === 0 ? "Gratuit" : `${s.price.toLocaleString()} XAF`}${s.duration_min ? ` / ${s.duration_min} min` : ""}`
    ).join("\n");
    return { text: `Voici nos services disponibles :\n${list}\n\nSouhaitez-vous réserver un créneau ?` };
  }

  if (wantsAppointment) {
    // Trouver le prochain créneau libre
    const now = new Date();
    const tomorrow = addDays(now, 1);
    tomorrow.setHours(9, 0, 0, 0);

    // Chercher un créneau libre dans les 7 prochains jours
    let freeSlot: Date | null = null;
    for (let d = 0; d < 7 && !freeSlot; d++) {
      const day = addDays(tomorrow, d);
      if (day.getDay() === 0) continue; // dimanche fermé
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
      return {
        text: `J'ai vérifié le calendrier 📅. Le prochain créneau disponible est le **${dateLabel}**${svc ? ` pour "${svc.name}"` : ""}.\n\nJe confirme ce rendez-vous pour vous ?`,
        mockApt: { date: freeSlot, serviceId: svc?.id ?? "" },
      };
    }
    return { text: "Je vérifie les disponibilités... Tous les créneaux semblent pris cette semaine. Souhaitez-vous que je regarde la semaine prochaine ?" };
  }

  // Réponses génériques
  const generic = [
    "Bonjour ! Je suis ravi de vous aider. Que puis-je faire pour vous ?",
    "Bien sûr, je comprends votre demande. Y a-t-il autre chose que je puisse faire ?",
    "Merci pour votre message. N'hésitez pas si vous avez d'autres questions.",
    "Je suis là pour vous aider 24h/24. Comment puis-je vous être utile ?",
  ];
  return { text: generic[Math.floor(Math.random() * generic.length)] };
}

interface ChatMessage {
  id: string;
  role: "bot" | "client";
  content: string;
  time: string;
  mockApt?: { date: Date; serviceId: string };
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE TEST
// ════════════════════════════════════════════════════════════════════════════
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

  // ── Agenda state ──────────────────────────────────────────────────────────
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

  const handleMockAppointment = useCallback((apt: { date: Date; serviceId: string }) => {
    const mock: Appointment = {
      id: `mock-${Date.now()}`,
      tenant_id: user?.tenant_id ?? "",
      service_id: apt.serviceId,
      client_name: "Client simulé",
      client_phone: "+237600000000",
      client_email: "",
      scheduled_at: apt.date.toISOString(),
      status: "pending",
      channel: "whatsapp",
      reminder_sent: false,
      notes: "RDV simulé (test bot)",
    };
    setMockAppointments(prev => [...prev, mock]);
    // Naviguer vers la semaine du RDV
    setCurrentDate(apt.date);
  }, [user?.tenant_id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <Spinner className="w-8 h-8 border-[#25D366] border-t-transparent" />
    </div>
  );
  if (!bot) return null;

  const theme = getTheme(tenant?.sector ?? "");
  const allAppointments = [...appointments, ...mockAppointments];

  const periodLabel = `${weekStart.getDate()} ${MONTHS_FR[weekStart.getMonth()]} — ${addDays(weekStart, 6).getDate()} ${MONTHS_FR[addDays(weekStart, 6).getMonth()]} ${weekStart.getFullYear()}`;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br", theme.bg)}>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={() => router.push(ROUTES.dashboard)}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
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
              bot.is_active ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[var(--border)] text-[var(--text-muted)]"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", bot.is_active ? "bg-[#25D366] animate-pulse" : "bg-[var(--text-muted)]")} />
              {bot.is_active ? t.testPublishedBadge : t.testUnpublishedBadge}
            </span>
            <button onClick={handlePublishToggle}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                bot.is_active
                  ? "border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                  : "text-white"
              )}
              style={!bot.is_active ? { backgroundColor: theme.primary } : {}}>
              {bot.is_active
                ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
                : <><Globe className="w-3.5 h-3.5" /> {t.publish}</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps 3 colonnes ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_1fr] gap-5">

          {/* ── COL 1 : Infos ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] rounded-3xl p-5 border border-[var(--border)] shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                  style={{ backgroundColor: theme.primary }}>
                  {tenant?.name?.[0] ?? "A"}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)]">{tenant?.name ?? "—"}</p>
                  <p className="text-xs text-[var(--text-muted)]">{theme.name}</p>
                </div>
              </div>
              {tenant?.description && (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{tenant.description}</p>
              )}
            </div>

            <div className="bg-[var(--bg-card)] rounded-3xl p-5 border border-[var(--border)] shadow-sm space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Configuration</p>
              {[
                { label: "Personnalité", value: bot.personality },
                { label: "Langues", value: bot.languages.join(", ").toUpperCase() },
                { label: "WhatsApp", value: bot.whatsapp_provider.toUpperCase() },
                { label: "IA Vocale", value: bot.voice_ai_provider },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{item.label}</span>
                  <span className="text-xs font-semibold text-[var(--text)] text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {mockAppointments.length > 0 && (
              <div className="bg-[var(--bg-card)] rounded-3xl p-5 border border-dashed border-amber-400 shadow-sm space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  RDV simulés ({mockAppointments.length})
                </p>
                {mockAppointments.map((m, i) => (
                  <div key={i} className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    {new Date(m.scheduled_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    {" à "}
                    {new Date(m.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[var(--bg-card)] rounded-3xl p-4 border border-[var(--border)] shadow-sm">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: theme.primary }} />
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {t.testSubtitle} Essayez : "Je veux un rendez-vous", "Quels sont vos services ?", "Vos horaires ?"
                </p>
              </div>
            </div>
          </div>

          {/* ── COL 2 : Simulateur ──────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Vocal */}
            <VoiceSimulator bot={bot} theme={theme} d={d} />
            {/* WhatsApp */}
            <WhatsAppSimulator
              bot={bot} tenant={tenant} theme={theme} d={d}
              appointments={allAppointments}
              services={services}
              onMockAppointment={handleMockAppointment}
            />
          </div>

          {/* ── COL 3 : Agenda ──────────────────────────────────────────── */}
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
            {/* Header agenda */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2"
              style={{ backgroundColor: `${theme.primary}10` }}>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" style={{ color: theme.primary }} />
                <p className="text-xs font-bold text-[var(--text)]">Agenda temps réel</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentDate(d => addDays(d, -7))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
                <button onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[var(--border)] hover:bg-[var(--bg)] transition-colors text-[var(--text-muted)]">
                  Auj.
                </button>
                <button onClick={() => setCurrentDate(d => addDays(d, 7))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-[var(--text-muted)] py-1 border-b border-[var(--border)]">{periodLabel}</p>

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
                    <p className={cn("text-[8px] font-black uppercase", isToday ? "text-[#25D366]" : "text-[var(--text-muted)]")}>
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
                  const dayApts = allAppointments.filter(a => isSameDay(new Date(a.scheduled_at), day));
                  const isToday = isSameDay(day, new Date());
                  const totalH = timeSlots.length * SLOT_H;
                  const isMock = (id: string) => id.startsWith("mock-");

                  return (
                    <div key={di}
                      className={cn("relative border-r border-[var(--border)] last:border-r-0", isToday && "bg-[#25D366]/[0.02]")}
                      style={{ height: totalH }}>
                      {timeSlots.map((_, si) => (
                        <div key={si}
                          style={{ top: si * SLOT_H, height: SLOT_H }}
                          className="absolute inset-x-0 border-b border-[var(--border)]" />
                      ))}

                      {dayApts.map(apt => {
                        const top = slotTop(new Date(apt.scheduled_at));
                        const height = Math.max(SLOT_H * 0.9, 28);
                        const mock = isMock(apt.id);
                        return (
                          <div key={apt.id}
                            style={{ top, height, left: 1, right: 1 }}
                            className={cn(
                              "absolute rounded-md border-l-2 px-1 py-0.5 overflow-hidden z-10 cursor-pointer",
                              mock
                                ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                                : STATUS_BG[apt.status] ?? STATUS_BG.pending
                            )}>
                            <p className={cn("text-[8px] font-bold truncate leading-tight",
                              mock ? "text-amber-700 dark:text-amber-300" : "text-[var(--text)]")}>
                              {mock ? "⚡ " : ""}{apt.client_name}
                            </p>
                            <p className="text-[7px] opacity-70 flex items-center gap-0.5">
                              <Clock className="w-2 h-2 inline" />
                              {new Date(apt.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
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

// ════════════════════════════════════════════════════════════════════════════
// SIMULATEUR WHATSAPP
// ════════════════════════════════════════════════════════════════════════════
interface WhatsAppSimulatorProps {
  bot: BotType;
  tenant: Tenant | null;
  theme: ReturnType<typeof getTheme>;
  d: ReturnType<typeof useLanguage>["dictionary"];
  appointments: Appointment[];
  services: Service[];
  onMockAppointment: (apt: { date: Date; serviceId: string }) => void;
}

function WhatsAppSimulator({ bot, tenant, theme, d, appointments, services, onMockAppointment }: WhatsAppSimulatorProps) {
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

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
      const confirmMsg = `✅ RDV confirmé ! Le **${dateLabel}**${svc ? ` pour "${svc.name}"` : ""}. Vous recevrez un rappel. Y a-t-il autre chose ?`;
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: "bot", content: confirmMsg, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
      onMockAppointment(pendingApt);
      setPendingApt(null);
      setIsTyping(false);
      return;
    }

    const response = getMockResponse(content, appointments, services, 30, bot.name, theme.primary);

    if (response.mockApt) setPendingApt(response.mockApt);

    setMessages(prev => [...prev, {
      id: `b-${Date.now()}`, role: "bot",
      content: response.text,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      mockApt: response.mockApt,
    }]);
    setIsTyping(false);
  };

  // Formater le texte avec **bold**
  const formatContent = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

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
      <div className="h-72 overflow-y-auto p-3 space-y-2"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.primary}08 1px, transparent 0)`, backgroundSize: "20px 20px" }}>
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
                  <CalendarDays className="w-3 h-3" /> Créneau affiché dans l'agenda →
                </div>
              )}
              <p className={cn("text-[10px] mt-0.5 text-right", msg.role === "bot" ? "text-[var(--text-muted)]" : "text-white/70")}>
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
        {["Je veux un RDV", "Vos services ?", "Vos horaires ?"].map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-full border border-[var(--border)] text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors disabled:opacity-40">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] flex gap-2 items-end bg-[var(--bg)]">
        <input className="flex-1 input-base py-2 text-sm"
          placeholder={t.testWhatsappPlaceholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={isTyping} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
          style={{ backgroundColor: theme.primary }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SIMULATEUR VOCAL
// ════════════════════════════════════════════════════════════════════════════
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

  const startCall = () => {
    setCallState("calling");
    setTimeout(() => {
      setCallState("connected");
      timerRef.current = setInterval(() => setDuration(s => s + 1), 1000);
    }, 2000);
  };
  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => { setCallState("idle"); setDuration(0); setIsMuted(false); }, 2000);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
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
            {callState === "connected" ? <Volume2 className="w-7 h-7 animate-pulse" /> : <Phone className="w-7 h-7" />}
          </div>
        </div>

        {/* Statut */}
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--text)]">{bot.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {callState === "idle" && t.testVoiceSubtitle}
            {callState === "calling" && <span className="flex items-center gap-1.5"><Spinner className="w-3 h-3 border-[#25D366] border-t-transparent" />{t.testVoiceCalling}</span>}
            {callState === "connected" && <span style={{ color: theme.primary }} className="font-bold">{t.testVoiceConnected} · {fmt(duration)}</span>}
            {callState === "ended" && "Appel terminé"}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {callState === "connected" && (
            <button onClick={() => setIsMuted(m => !m)}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isMuted ? "bg-red-100 text-red-500" : "bg-[var(--bg)] text-[var(--text-muted)]")}>
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
    </div>
  );
}