// src/app/pme/bots/[id]/test/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { botsRepository, tenantsRepository, rendezVousRepository, servicesRepository } from "@/repositories";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Globe, GlobeLock, Bot, MessageSquare, Phone } from "lucide-react";
import type { Bot as BotType, Tenant, RendezVous, Service } from "@/types/api";

import {
  getTheme, addDays, type ClientReport, type HumanTransfer,
  type EmailPhase, type LeftPanel, type SectorTheme,
} from "./_components/test.types";
import { LeftCockpitPanel }   from "./_components/LeftCockpitPanel";
import { WhatsAppSimulator }  from "./_components/WhatsAppSimulator";
import { VoiceSimulator }     from "./_components/VoiceSimulator";
import { AgendaPanel }        from "./_components/AgendaPanel";

// ─────────────────────────────────────────────────────────────────────────────

export default function BotTestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const toast = useToast();
  // ── Fix boucle infinie : toast via ref, pas dans les deps ──────────────────
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const [bot, setBot]               = useState<BotType | null>(null);
  const [tenant, setTenant]         = useState<Tenant | null>(null);
  const [appointments, setAppointments]     = useState<RendezVous[]>([]);
  const [mockAppointments, setMockAppointments] = useState<RendezVous[]>([]);
  const [services, setServices]     = useState<Service[]>([]);
  const [loading, setLoading]       = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeSimulator, setActiveSimulator] = useState<"whatsapp" | "voice">("whatsapp");

  const [openPanels, setOpenPanels]     = useState<Record<LeftPanel, boolean>>({ info: true, report: false, transfer: false, email: false });
  const [highlightPanel, setHighlightPanel] = useState<LeftPanel | null>(null);

  const [clientReport, setClientReport] = useState<ClientReport>({
    name: null, phone: null, email: null, intention: null, services: [], appointmentDate: null, status: "idle",
  });
  const [humanTransfer, setHumanTransfer] = useState<HumanTransfer>({ triggered: false, reason: "", at: "" });
  const [emailStep, setEmailStep]         = useState<EmailPhase | null>(null);

  // ── Helpers panel ─────────────────────────────────────────────────────────
  const expandPanel = useCallback((panel: LeftPanel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: true }));
    setHighlightPanel(panel);
    setTimeout(() => setHighlightPanel(null), 3000);
  }, []);

  const togglePanel = (panel: LeftPanel) => setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));

  // ── Callbacks partagés avec WhatsAppSimulator ─────────────────────────────
  const handleReportUpdate = useCallback((patch: Partial<ClientReport>) => {
    setClientReport(prev => {
      const next = { ...prev, ...patch };
      setOpenPanels(p => { if (!p.report) expandPanel("report"); return p; });
      return next;
    });
  }, [expandPanel]);

  const handleHumanTransfer = useCallback((reason: string) => {
    const at = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setHumanTransfer({ triggered: true, reason, at });
    expandPanel("transfer");
  }, [expandPanel]);

  const handleEmailTrigger = useCallback(async (subject: string, body: string, to: string) => {
    expandPanel("email");
    setEmailStep({ phase: "drafting" });
    await new Promise(r => setTimeout(r, 2000));
    setEmailStep({ phase: "preview", subject, body });
    await new Promise(r => setTimeout(r, 3000));
    setEmailStep({ phase: "sent", to });
  }, [expandPanel]);

  const handleMockAppointment = useCallback((apt: { date: Date; serviceId: string }) => {
    const mock: RendezVous = {
      id: `mock-${Date.now()}`,
      agenda: "", agenda_nom: "", agence: null, agence_nom: null,
      client: "",
      client_nom: clientReport.name ?? "Client simulé",
      client_telephone: clientReport.phone ?? "+237600000000",
      bot: null, statut: "en_attente", canal: "whatsapp",
      scheduled_at: apt.date.toISOString(),
      reminder_sent: false, notes: "RDV simulé (test bot)", services_detail: [],
      created_at: new Date().toISOString(),
    };
    setMockAppointments(prev => [...prev, mock]);
    setCurrentDate(apt.date);

    const svc       = services.find(s => s.id === apt.serviceId);
    const dateLabel = apt.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const timeLabel = apt.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const subject   = `Confirmation de votre rendez-vous — ${dateLabel}`;
    const body      = `Bonjour${clientReport.name ? " " + clientReport.name : ""},\n\nVotre rendez-vous a bien été enregistré :\n\n📅 Date : ${dateLabel} à ${timeLabel}\n🏥 Service : ${svc?.nom ?? "Consultation"}\n\nUn rappel vous sera envoyé 24h avant.\n\nCordialement,\nL'équipe`;
    const to        = clientReport.email ?? "client@exemple.com";
    handleEmailTrigger(subject, body, to);
  }, [clientReport, services, handleEmailTrigger]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const b = await botsRepository.getById(id);
      setBot(b);
      if (user?.entreprise?.id) {
        const [ten, aptsRes, svcsRes] = await Promise.all([
          tenantsRepository.getById(user.entreprise.id),
          rendezVousRepository.getList(),
          servicesRepository.getList(),
        ]);
        setTenant(ten);
        setAppointments(aptsRes.results);
        setServices(svcsRes.results);
      }
    } catch {
      toastRef.current.error(t.errorLoad); // ← ref stable, pas de boucle
    } finally {
      setLoading(false);
    }
  }, [id, user?.entreprise?.id, t.errorLoad]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Publier / Dépublier ───────────────────────────────────────────────────
  const handlePublishToggle = async () => {
    if (!bot) return;
    try {
      const newActive = !bot.is_active;
      await botsRepository.patch(bot.id, { is_active: newActive });
      setBot({ ...bot, is_active: newActive, statut: newActive ? "actif" : "en_pause" });
      toast.success(newActive ? t.publishSuccess : t.unpublishSuccess);
    } catch {
      toast.error(t.publishError);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <Spinner className="w-8 h-8 border-[#25D366] border-t-transparent" />
    </div>
  );
  if (!bot) return null;

  const theme: SectorTheme = getTheme(tenant?.sector ?? "");
  const allAppointments    = [...appointments, ...mockAppointments];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br", theme.bg)}>
      {/* ── Navbar ── */}
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
              <p className="text-sm font-bold text-[var(--text)]">{bot.nom}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{tenant?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
              bot.is_active ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[var(--border)] text-[var(--text-muted)]",
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full",
                bot.is_active ? "bg-[#25D366] animate-pulse" : "bg-[var(--text-muted)]")} />
              {bot.is_active ? t.testPublishedBadge : t.testUnpublishedBadge}
            </span>
            <button onClick={handlePublishToggle}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                bot.is_active
                  ? "border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                  : "text-white",
              )}
              style={!bot.is_active ? { backgroundColor: theme.primary } : {}}>
              {bot.is_active
                ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
                : <><Globe     className="w-3.5 h-3.5" /> {t.publish}</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps 3 colonnes ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_1fr] gap-5">

          {/* Col 1 : Cockpit */}
          <LeftCockpitPanel
            bot={bot} tenant={tenant} theme={theme}
            clientReport={clientReport} humanTransfer={humanTransfer} emailStep={emailStep}
            openPanels={openPanels} highlightPanel={highlightPanel}
            onTogglePanel={togglePanel}
          />

          {/* Col 2 : Simulateur */}
          <div className="space-y-4">
            {/* Toggle WA / Vocal */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-1 flex gap-1 shadow-sm">
              <button onClick={() => setActiveSimulator("whatsapp")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  activeSimulator === "whatsapp" ? "text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={activeSimulator === "whatsapp" ? { backgroundColor: theme.primary } : {}}>
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={() => setActiveSimulator("voice")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  activeSimulator === "voice" ? "text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={activeSimulator === "voice" ? { backgroundColor: "#6C3CE1" } : {}}>
                <Phone className="w-3.5 h-3.5" /> Vocal IA
              </button>
            </div>

            {activeSimulator === "whatsapp" ? (
              <WhatsAppSimulator
                bot={bot} tenant={tenant} theme={theme} d={d}
                appointments={allAppointments} services={services}
                clientReport={clientReport}
                onMockAppointment={handleMockAppointment}
                onReportUpdate={handleReportUpdate}
                onHumanTransfer={handleHumanTransfer}
              />
            ) : (
              <VoiceSimulator bot={bot} theme={theme} d={d} />
            )}
          </div>

          {/* Col 3 : Agenda */}
          <AgendaPanel
            allAppointments={allAppointments}
            currentDate={currentDate}
            theme={theme}
            onDateChange={setCurrentDate}
          />
        </div>
      </div>
    </div>
  );
}