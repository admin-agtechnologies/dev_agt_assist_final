// src/app/pme/bots/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import {
  botsRepository, conversationsRepository, rendezVousRepository,
} from "@/repositories";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import {
  Bot, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp,
  MessageSquare, Phone, CalendarDays, Activity, FlaskConical,
  Globe, GlobeLock, CheckCircle, BarChart3, Settings,
  ArrowRightLeft, BookOpen, User, Wrench, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import type {
  Bot as BotType, CreateBotPayload, BotStatus,
  Conversation, RendezVous,
} from "@/types/api";

// ── Type local PhoneNumber ────────────────────────────────────────────────────
interface PhoneNumber {
  id: string;
  number: string;
  tenant_id: string | null;
  whatsapp_bot_id: string | null;
  voice_bot_id: string | null;
  provider_name: string;
  status: string;
}

// Une paire = 1 bot WhatsApp + 1 bot Vocal + leur numéro commun
interface BotPair {
  waBot: BotType;
  voiceBot: BotType | null;
  phoneNumber: PhoneNumber | null;
}

// ── Palette couleurs par secteur ──────────────────────────────────────────────
const SECTOR_COLORS: Record<string, { primary: string; accent: string }> = {
  sante: { primary: "#0EA5E9", accent: "#38BDF8" },
  santé: { primary: "#0EA5E9", accent: "#38BDF8" },
  juridique: { primary: "#1E3A5F", accent: "#3B82F6" },
  beaute: { primary: "#EC4899", accent: "#F9A8D4" },
  beauté: { primary: "#EC4899", accent: "#F9A8D4" },
  restauration: { primary: "#F97316", accent: "#FDBA74" },
  commerce: { primary: "#8B5CF6", accent: "#C4B5FD" },
  finance: { primary: "#059669", accent: "#34D399" },
  education: { primary: "#6366F1", accent: "#A5B4FC" },
  transport: { primary: "#64748B", accent: "#94A3B8" },
  default: { primary: "#075E54", accent: "#25D366" },
};

function getSectorColor(sector: string) {
  const key = sector?.toLowerCase()
    .replace(/[éè]/g, "e").replace(/[àâ]/g, "a") ?? "";
  return SECTOR_COLORS[key] ?? SECTOR_COLORS.default;
}

type DetailTab = "conversations" | "agenda" | "stats" | "settings";

// ── Mock données graphes (remplacées par API en production) ───────────────────
const MOCK_WEEK_DATA = [
  { day: "Lun", messages: 38, calls: 3, appointments: 2, emails: 10, handoffs: 1 },
  { day: "Mar", messages: 52, calls: 5, appointments: 4, emails: 15, handoffs: 2 },
  { day: "Mer", messages: 45, calls: 2, appointments: 1, emails: 8, handoffs: 0 },
  { day: "Jeu", messages: 61, calls: 7, appointments: 5, emails: 20, handoffs: 3 },
  { day: "Ven", messages: 48, calls: 4, appointments: 3, emails: 12, handoffs: 1 },
  { day: "Sam", messages: 32, calls: 2, appointments: 8, emails: 5, handoffs: 0 },
  { day: "Dim", messages: 36, calls: 3, appointments: 6, emails: 7, handoffs: 1 },
];

// ── Mock historique messages style WhatsApp ───────────────────────────────────
interface MockMessage { role: "bot" | "client"; text: string; time: string; }
const MOCK_HISTORY: Record<string, MockMessage[]> = {
  default: [
    { role: "client", text: "Bonjour, je voudrais prendre un rendez-vous.", time: "14:02" },
    { role: "bot", text: "Bonjour ! Bien sûr, pour quel service ?", time: "14:02" },
    { role: "client", text: "Une consultation médicale.", time: "14:03" },
    { role: "bot", text: "Parfait. Quelle date vous convient ?", time: "14:03" },
    { role: "client", text: "Demain à 10h si possible.", time: "14:04" },
    { role: "bot", text: "RDV confirmé pour demain à 10h. Vous recevrez un rappel.", time: "14:04" },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function PmeBotsPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();
  const router = useRouter();

  const [bots, setBots] = useState<BotType[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  const [formModal, setFormModal] = useState<{ open: boolean; editId: string | null }>
    ({ open: false, editId: null });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedPairId, setExpandedPairId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const [botsRes, pnRaw] = await Promise.all([
          botsRepository.getList({ tenant_id: user.tenant_id! }),
          fetch(`${apiUrl}/api/v1/phone-numbers?tenant_id=${user.tenant_id}`)
            .then(r => r.json()).catch(() => []),
        ]);
        setBots(botsRes.results);
        setPhoneNumbers(Array.isArray(pnRaw) ? pnRaw : pnRaw.results ?? []);
      } catch { toast.error(t.errorLoad); }
      finally { setLoading(false); }
    });
  }, [user?.tenant_id, t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Grouper par paire (on prend le bot WhatsApp comme référence) ──────────
  const botPairs: BotPair[] = bots
    .filter(b => (b as BotType & { bot_type?: string }).bot_type === "whatsapp"
      || (!bots.some(other =>
        (other as BotType & { paired_bot_id?: string }).paired_bot_id === b.id
      ) && !(b as BotType & { bot_type?: string }).bot_type
      )
    )
    .map(waBot => {
      const waBotExt = waBot as BotType & { bot_type?: string; paired_bot_id?: string; phone_number_id?: string };
      const voiceBot = waBotExt.paired_bot_id
        ? bots.find(b => b.id === waBotExt.paired_bot_id) ?? null
        : null;
      const phoneNumber = waBotExt.phone_number_id
        ? phoneNumbers.find(pn => pn.id === waBotExt.phone_number_id) ?? null
        : null;
      return { waBot, voiceBot, phoneNumber };
    });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await botsRepository.delete(deleteId);
      const bot = bots.find(b => b.id === deleteId) as (BotType & { paired_bot_id?: string }) | undefined;
      if (bot?.paired_bot_id) {
        await botsRepository.delete(bot.paired_bot_id).catch(() => null);
      }
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      if (expandedPairId === deleteId) setExpandedPairId(null);
      fetchData();
    } catch { toast.error(t.deleteError); }
    finally { setIsDeleting(false); }
  };

  const handlePublishToggle = async (pair: BotPair) => {
    try {
      const newStatus: BotStatus = pair.waBot.status === "active" ? "paused" : "active";
      const isActive = newStatus === "active";
      await Promise.all([
        botsRepository.patch(pair.waBot.id, { is_active: isActive, status: newStatus }),
        pair.voiceBot
          ? botsRepository.patch(pair.voiceBot.id, { is_active: isActive, status: newStatus })
          : Promise.resolve(),
      ]);
      toast.success(isActive ? t.publishSuccess : t.unpublishSuccess);
      fetchData();
    } catch { toast.error(t.publishError); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(2)].map((_, i) => <div key={i} className="h-28 card bg-[var(--bg)]" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <SectionHeader title={t.title} subtitle={t.subtitle} action={
          <button onClick={() => setFormModal({ open: true, editId: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> {t.newBtn}
          </button>
        } />

        {botPairs.length === 0
          ? <div className="card"><EmptyState message={t.noData} icon={Bot} /></div>
          : (
            <div className="space-y-3">
              {botPairs.map(pair => (
                <BotPairCard
                  key={pair.waBot.id}
                  pair={pair}
                  isExpanded={expandedPairId === pair.waBot.id}
                  tenantId={user?.tenant_id ?? ""}
                  sector={(user as unknown as { sector?: string })?.sector ?? ""}
                  onToggleExpand={() =>
                    setExpandedPairId(expandedPairId === pair.waBot.id ? null : pair.waBot.id)
                  }
                  onEdit={() => setFormModal({ open: true, editId: pair.waBot.id })}
                  onDelete={() => setDeleteId(pair.waBot.id)}
                  onPublishToggle={() => handlePublishToggle(pair)}
                  onTest={() => router.push(`/pme/bots/${pair.waBot.id}/test`)}
                  onRefresh={fetchData}
                  d={d}
                />
              ))}
            </div>
          )}
      </div>

      {mounted && formModal.open && createPortal(
        <BotFormModal
          editId={formModal.editId}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setFormModal({ open: false, editId: null })}
          onSave={fetchData}
        />,
        document.body
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteId} isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete} message={t.confirmDelete}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOT PAIR CARD
// ════════════════════════════════════════════════════════════════════════════
interface BotPairCardProps {
  pair: BotPair;
  isExpanded: boolean;
  tenantId: string;
  sector: string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublishToggle: () => void;
  onTest: () => void;
  onRefresh: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
}

function BotPairCard({
  pair, isExpanded, tenantId, sector,
  onToggleExpand, onEdit, onDelete, onPublishToggle, onTest, onRefresh, d,
}: BotPairCardProps) {
  const t = d.bots;
  const colors = getSectorColor(sector);
  const isActive = pair.waBot.status === "active";
  const waBotExt = pair.waBot as BotType & { main_name?: string; phone_number_id?: string };
  const mainName = waBotExt.main_name ?? pair.waBot.name;
  const phoneDisplay = pair.phoneNumber?.number ?? null;

  return (
    <div className="card overflow-hidden">
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.primary}18` }}>
          <Bot className="w-6 h-6" style={{ color: colors.primary }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-[var(--text)]">{mainName}</p>
            <Badge variant={isActive ? "green" : "amber"}>
              {isActive ? t.statusActive : t.statusPaused}
            </Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Numéro de téléphone */}
            {phoneDisplay ? (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono">
                <Phone className="w-3 h-3" /> {phoneDisplay}
              </span>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">Numéro non configuré</span>
            )}
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3 text-[#25D366]" />
              <span className="text-[#25D366] font-semibold">WhatsApp</span>
            </span>
            {pair.voiceBot && (
              <span className="flex items-center gap-1 text-xs">
                <Phone className="w-3 h-3 text-[#6C3CE1]" />
                <span className="text-[#6C3CE1] font-semibold">Vocal IA</span>
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              {pair.waBot.languages.join(", ")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] hover:border-[#6C3CE1] hover:text-[#6C3CE1] transition-colors">
            <FlaskConical className="w-3.5 h-3.5" /> {t.testBtn}
          </button>

          {/* Publier / Dépublier — s'adapte au statut */}
          <button onClick={onPublishToggle}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
              isActive
                ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                : "bg-[#25D366] text-white hover:bg-[#128C7E]"
            )}>
            {isActive
              ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
              : <><Globe className="w-3.5 h-3.5" /> {t.publish}</>
            }
          </button>

          <button onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <BotPairDetailPanel
          pair={pair}
          tenantId={tenantId}
          d={d}
          colors={colors}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU DÉTAIL PAIRE
// ════════════════════════════════════════════════════════════════════════════
function BotPairDetailPanel({
  pair, tenantId, d, colors, onRefresh,
}: {
  pair: BotPair;
  tenantId: string;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}) {
  const t = d.bots;
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DetailTab>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mounted, setMounted] = useState(false);
  const [convPage, setConvPage] = useState(1);
  const PAGE = 5;
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [metricFilter, setMetricFilter] = useState<"messages" | "calls" | "appointments" | "emails" | "handoffs">("messages");
  const [periodFilter, setPeriodFilter] = useState<number>(7); // jours
  const [timeOffset, setTimeOffset] = useState<number>(0); // 0 = période actuelle, -1 = période précédente
  // À mettre avec tes autres states en haut de BotPairDetailPanel
  const [visibleMetrics, setVisibleMetrics] = useState({
    messages: true,
    calls: true,
    appointments: true,
    emails: true,
    handoffs: true
  });
  const STATUT_LABEL: Record<string, string> = {
  confirme: d.appointments.statuses.confirmed,
  en_attente: d.appointments.statuses.pending,
  termine: d.appointments.statuses.done,
  annule: d.appointments.statuses.cancelled,
};

  const metricsDef = [
    { id: 'messages', label: 'Messages', color: '#25D366' },
    { id: 'calls', label: 'Appels', color: '#6C3CE1' },
    { id: 'appointments', label: 'RDV', color: '#F59E0B' },
    { id: 'emails', label: 'Emails', color: '#0EA5E9' },
    { id: 'handoffs', label: 'Transferts', color: '#EF4444' },
  ];

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const botIds = [
        pair.waBot.id,
        pair.voiceBot?.id,
      ].filter(Boolean) as string[];

      const [convRes, aptRes] = await Promise.all([
        conversationsRepository.getList({ tenant_id: tenantId }),
        rendezVousRepository.getList(),
      ]);
      setConversations(convRes.results.filter((c: Conversation) => botIds.includes(c.bot_id)));

      setAppointments(aptRes.results);
    } catch { toast.error(d.common.error); }
    finally { setLoadingData(false); }
  }, [pair.waBot.id, pair.voiceBot?.id, tenantId, d.common.error, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Stats calculées ───────────────────────────────────────────────────────
  const waConvs = conversations.filter(c => c.channel === "whatsapp");
  const voiceConvs = conversations.filter(c => c.channel === "voice");
  const totalMessages = conversations.reduce((acc, c) => acc + c.messages_count, 0);
  const totalCalls = voiceConvs.length;
  const totalRdv = conversations.filter(c => c.report?.appointment_scheduled).length;
  const totalHandoffs = conversations.filter(c => c.report?.human_handoff).length;
  const resolutionRate = conversations.length > 0
    ? Math.round(((conversations.length - totalHandoffs) / conversations.length) * 100)
    : 0;

  const donutData = [
    { name: "WhatsApp", value: waConvs.length, color: "#25D366" },
    { name: "Vocal", value: voiceConvs.length, color: "#6C3CE1" },
  ].filter(entry => entry.value > 0);

  const totalPages = Math.ceil(conversations.length / PAGE);
  const pagedConvs = conversations.slice((convPage - 1) * PAGE, convPage * PAGE);

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "conversations", label: t.conversationsTab, icon: MessageSquare },
    { id: "agenda", label: t.agendaTab, icon: CalendarDays },
    { id: "stats", label: t.statsTab, icon: BarChart3 },
    { id: "settings", label: (d.bots as Record<string, any>).settingsTab ?? "Paramètres", icon: Settings },
  ];

  return (
    <div className="border-t border-[var(--border)] animate-fade-in">
      {/* KPI rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-b border-[var(--border)]">
        {[
          { label: t.statsMessages, value: totalMessages, icon: MessageSquare, color: "#25D366" },
          { label: t.statsCalls, value: totalCalls, icon: Phone, color: "#6C3CE1" },
          { label: t.statsAppointments, value: totalRdv, icon: CalendarDays, color: "#F59E0B" },
          { label: "Transferts humains", value: totalHandoffs, icon: ArrowRightLeft, color: "#EF4444" },
          { label: "Emails envoyés", value: 128, icon: Globe, color: "#0EA5E9" }, // Changement ici
        ].map((stat, i) => (
          <div key={i} className={cn(
            "px-4 py-3 flex items-center gap-3",
            i < 4 && "border-r border-[var(--border)]"
          )}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}18` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-black text-[var(--text)]">{stat.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest leading-tight">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-3 border-b border-[var(--border)] bg-[var(--bg)] overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id ? "text-white" : "text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
              )}
              style={activeTab === tab.id ? { backgroundColor: colors.primary } : {}}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu onglets */}
      <div className="p-5">
        {loadingData ? (
          <div className="flex justify-center py-8">
            <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
          </div>
        ) : (
          <>
            {/* ── Conversations ────────────────────────────────────────── */}
            {activeTab === "conversations" && (
              <div className="grid grid-cols-1 gap-4">
                {pagedConvs.length === 0
                  ? <EmptyState message={t.conversationsEmpty} icon={MessageSquare} />
                  : pagedConvs.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className="group relative flex items-center gap-5 p-5 rounded-[2rem] bg-white border border-[var(--border)] cursor-pointer hover:border-[#075E54] hover:shadow-2xl hover:shadow-[#075E54]/5 transition-all duration-300 overflow-hidden"
                    >
                      {/* Décoration subtile au survol */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#075E54] opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Avatar Stylisé avec Initiales */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--bg)] to-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-black text-xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                        {conv.client_name?.charAt(0) || "C"}
                      </div>

                      {/* Corps de la carte */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-base font-black text-[var(--text)] truncate group-hover:text-[#075E54] transition-colors">
                            {conv.client_name || "Client anonyme"}
                          </p>
                          <Badge variant={conv.channel === "whatsapp" ? "green" : "violet"} className="rounded-lg text-[9px] uppercase tracking-tighter">
                            {conv.channel === "whatsapp" ? "WhatsApp" : "Vocal"}
                          </Badge>
                        </div>

                        <p className="text-sm text-[var(--text-muted)] line-clamp-1 italic group-hover:text-[var(--text)] transition-colors">
                          "{conv.last_message}"
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                            <MessageSquare className="w-3 h-3" />
                            {conv.messages_count} messages
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest">
                            Dernier contact : {new Date(conv.last_message_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Bouton d'action qui apparaît au survol */}
                      <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <span className="text-[10px] font-black uppercase text-[#075E54]">Analyser</span>
                        <div className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center text-white shadow-lg">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                }

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                      onClick={() => setConvPage(p => Math.max(1, p - 1))}
                      disabled={convPage === 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                    </button>
                    <span className="text-xs font-black text-[var(--text-muted)] tracking-widest">
                      PAGE {convPage} SUR {totalPages}
                    </span>
                    <button
                      onClick={() => setConvPage(p => Math.min(totalPages, p + 1))}
                      disabled={convPage === totalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <ChevronDown className="w-5 h-5 -rotate-90" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Agenda ───────────────────────────────────────────────── */}

            {activeTab === "agenda" && (
              <div className="space-y-6">
                {/* En-tête du Calendrier */}
                <div className="flex items-center justify-between bg-[var(--bg)] p-4 rounded-2xl border border-[var(--border)]">
                  <h3 className="font-bold text-[var(--text)] capitalize">
                    {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                      className="p-2 hover:bg-[var(--bg-card)] rounded-lg border border-[var(--border)] transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={() => setViewDate(new Date())}
                      className="px-3 py-1 text-xs font-bold hover:bg-[var(--bg-card)] rounded-lg border border-[var(--border)]"
                    >
                      Aujourd'hui
                    </button>
                    <button
                      onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                      className="p-2 hover:bg-[var(--bg-card)] rounded-lg border border-[var(--border)] transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                  {/* Grille du Calendrier (60% de l'espace) */}
                  <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--bg)]/50">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                        <div key={day} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Cases des jours */}
                    <div className="grid grid-cols-7">
                      {(() => {
                        const days = [];
                        const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                        const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

                        // Ajustement pour commencer le lundi (0=Dimanche, donc on ajuste)
                        let startDay = start.getDay() === 0 ? 6 : start.getDay() - 1;

                        // Cellules vides au début
                        for (let i = 0; i < startDay; i++) {
                          days.push(<div key={`empty-${i}`} className="aspect-square border-b border-r border-[var(--border)] bg-[var(--bg)]/20" />);
                        }

                        // Jours du mois
                        for (let d = 1; d <= end.getDate(); d++) {
                          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
                          const isToday = new Date().toDateString() === date.toDateString();
                          const isSelected = selectedDate.toDateString() === date.toDateString();

                          // Trouver les RDV de ce jour
                          const dayAppointments = appointments.filter(a =>
                            new Date(a.scheduled_at).toDateString() === date.toDateString()
                          );

                          days.push(
                            <div
                              key={d}
                              onClick={() => setSelectedDate(date)}
                              className={cn(
                                "aspect-square border-b border-r border-[var(--border)] p-1.5 cursor-pointer transition-all relative group",
                                isSelected ? "bg-[#075E54]/5" : "hover:bg-[var(--bg)]"
                              )}
                            >
                              <span className={cn(
                                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg",
                                isToday ? "bg-[#25D366] text-white" : isSelected ? "text-[#075E54]" : "text-[var(--text)]"
                              )}>
                                {d}
                              </span>

                              {/* Indicateurs de RDV */}
                              <div className="flex flex-wrap gap-0.5 mt-1">
                                {dayAppointments.slice(0, 3).map((a, idx) => (
                                  <div key={idx} className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                   a.statut === 'confirme' ? "bg-[#25D366]" : "bg-amber-400"
                                  )} />
                                ))}
                                {dayAppointments.length > 3 && <span className="text-[8px] font-bold">+</span>}
                              </div>
                            </div>
                          );
                        }
                        return days;
                      })()}
                    </div>
                  </div>

                  {/* Liste détaillée du jour sélectionné (40% de l'espace) */}
                  <div className="lg:col-span-3 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      RDV du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </h4>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {appointments.filter(a => new Date(a.scheduled_at).toDateString() === selectedDate.toDateString()).length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-2xl">
                          <p className="text-sm text-[var(--text-muted)]">Aucun rendez-vous ce jour</p>
                        </div>
                      ) : (
                        appointments
                          .filter(a => new Date(a.scheduled_at).toDateString() === selectedDate.toDateString())
                          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                          .map(apt => (
                            <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:shadow-sm transition-all">
                              <div className="bg-[var(--bg-card)] px-2 py-1 rounded-lg border border-[var(--border)] text-center min-w-[50px]">
                                <p className="text-[10px] font-bold text-[#075E54]">
                                  {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--text)] truncate">{apt.client_nom}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{apt.services_detail?.[0]?.service_nom || "Consultation"}</p>
                              </div>
                              <Badge variant={apt.statut === "confirme" ? "green" : "amber"}>
                                {STATUT_LABEL[apt.statut] ?? apt.statut}
                              </Badge>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Stats ────────────────────────────────────────────────── */}

            {activeTab === "stats" && (
              <div className="space-y-6">

                {/* --- BARRE DE CONTRÔLE GLOBALE --- */}
                <div className="flex flex-col lg:flex-row gap-4 bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Afficher / Masquer les métriques</p>
                    <div className="flex flex-wrap gap-2">
                      {metricsDef.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setVisibleMetrics(prev => ({ ...prev, [m.id]: !prev[m.id as keyof typeof prev] }))}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                            visibleMetrics[m.id as keyof typeof visibleMetrics]
                              ? "bg-white border-transparent shadow-sm shadow-black/5"
                              : "opacity-40 grayscale border-dashed border-[var(--border)]"
                          )}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
                    <div className="flex bg-[var(--bg-card)] rounded-xl p-1 border border-[var(--border)]">
                      {[7, 30, 90].map(p => (
                        <button key={p} onClick={() => setPeriodFilter(p)}
                          className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                            periodFilter === p ? "bg-[#075E54] text-white" : "text-[var(--text-muted)]")}>
                          {p}J
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setTimeOffset(prev => prev - 1)} className="p-2 bg-white rounded-xl border border-[var(--border)]"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                      <button onClick={() => setTimeOffset(prev => prev + 1)} disabled={timeOffset === 0} className="p-2 bg-white rounded-xl border border-[var(--border)] disabled:opacity-30"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                    </div>
                  </div>
                </div>

                {/* --- GRAPHIQUE 1 : TENDANCES (AREA) --- */}
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-tight">Courbes d'évolution</h3>
                    <Badge variant="slate">Vue Cumulative</Badge>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_WEEK_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        {metricsDef.map(m => visibleMetrics[m.id as keyof typeof visibleMetrics] && (
                          <Area key={m.id} type="monotone" dataKey={m.id} stroke={m.color} fill={m.color} fillOpacity={0.1} strokeWidth={2} />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* --- GRAPHIQUE 2 : COMPARAISON (BARRES) --- */}
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-tight">Comparaison par volume</h3>
                    <Badge variant="slate">Vue en bandes</Badge>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_WEEK_DATA} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        {metricsDef.map(m => visibleMetrics[m.id as keyof typeof visibleMetrics] && (
                          <Bar key={m.id} dataKey={m.id} fill={m.color} radius={[4, 4, 0, 0]} barSize={8} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* --- GRAPHIQUE 3 : RÉPARTITION (PIE) --- */}
                  <div className="card p-6 col-span-1 md:col-span-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Répartition globale des actions</h3>
                    <div className="flex items-center justify-around">
                      <div className="w-40 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metricsDef.filter(m => visibleMetrics[m.id as keyof typeof visibleMetrics])
                                .map(m => ({ name: m.label, value: 40, color: m.color }))} // Valeur statique pour démo
                              innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value"
                            >
                              {metricsDef.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {metricsDef.map(m => visibleMetrics[m.id as keyof typeof visibleMetrics] && (
                          <div key={m.id} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                            <span className="text-xs font-bold text-[var(--text)]">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* --- NOUVEAU : EMAILS ENVOYÉS --- */}
                  <div className="card p-6 flex flex-col items-center justify-center text-center bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-800">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-sky-200">
                      <Globe className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Emails envoyés</p>
                    <p className="text-5xl font-black text-sky-900 dark:text-sky-100">128</p>
                    <p className="text-[10px] text-sky-600/70 mt-2 font-bold italic">Ce mois-ci</p>
                  </div>
                </div>

              </div>
            )}

            {/* ── Paramètres ───────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <BotSettingsPanel pair={pair} d={d} colors={colors} onRefresh={onRefresh} />
            )}
          </>
        )}
      </div>

      {/* Modale conversation style WhatsApp */}
      {mounted && selectedConv && createPortal(
        <ConversationReportModal
          conversation={selectedConv}
          onClose={() => setSelectedConv(null)}
          d={d}
          colors={colors}
        />,
        document.body
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODALE RAPPORT CONVERSATION — historique style WhatsApp + rapport
// ════════════════════════════════════════════════════════════════════════════
function ConversationReportModal({ conversation, onClose, d, colors }: {
  conversation: Conversation;
  onClose: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
}) {
  const t = d.bots;
  const report = conversation.report;
  const [showChat, setShowChat] = useState(false); // État pour afficher/masquer le chat

  const ACTION_ICONS: Record<string, React.ElementType> = {
    appointment: CalendarDays,
    handoff: ArrowRightLeft,
    faq: BookOpen,
    service_info: Wrench,
    contact_collected: User,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Largeur dynamique : s'élargit quand on ouvre le chat */}
      <div className={cn(
        "relative bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] transition-all duration-500 ease-in-out overflow-hidden",
        showChat ? "max-w-5xl w-full" : "max-w-lg w-full"
      )}>

        {/* --- HEADER --- */}
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-card)] z-20">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${colors.primary}18` }}>
            <Activity className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text)] truncate">
              Rapport d'analyse : {conversation.client_name || "Client"}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
              {conversation.channel === "whatsapp" ? "Canal WhatsApp" : "Canal Vocal"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* BOUTON OEIL (Toggle Chat) */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                showChat
                  ? "bg-[#075E54] text-white"
                  : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              )}
            >
              {showChat ? <GlobeLock className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              <span>{showChat ? "Masquer chat" : "Voir chat"}</span>
            </button>

            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- CORPS DE LA MODALE (Flex Row) --- */}
        <div className="flex flex-1 overflow-hidden">

          {/* PANNEAU GAUCHE : LE RAPPORT (Toujours visible) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-[var(--border)]">
            {report ? (
              <>
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Résumé de l'IA</p>
                  <div className="bg-[var(--bg)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text)] border border-[var(--border)]">
                    {report.summary}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <div className={cn("p-4 rounded-2xl border", report.appointment_scheduled ? "bg-[#25D366]/5 border-[#25D366]/20" : "bg-[var(--bg)] border-[var(--border)]")}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Rendez-vous</p>
                    <p className="text-sm font-bold">{report.appointment_scheduled ? "✅ Planifié" : "❌ Non planifié"}</p>
                  </div>
                  <div className={cn("p-4 rounded-2xl border", report.human_handoff ? "bg-amber-50 border-amber-200" : "bg-[var(--bg)] border-[var(--border)]")}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Besoin humain</p>
                    <p className="text-sm font-bold">{report.human_handoff ? "⚠️ Requis" : "✅ Géré par IA"}</p>
                  </div>
                </section>

                {report.key_takeaways && (
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Points clés</p>
                    <ul className="space-y-2">
                      {report.key_takeaways.map((tk, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm p-2 rounded-xl hover:bg-[var(--bg)] transition-colors">
                          <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0 mt-0.5" />
                          <span>{tk}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {report.actions && (
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Actions détectées</p>
                    <div className="space-y-2">
                      {report.actions.map((action, i) => {
                        const Icon = ACTION_ICONS[action.type] ?? Activity;
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <Icon className="w-4 h-4 text-[#075E54]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{action.label}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{action.detail}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <FlaskConical className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm italic">Analyse en cours ou indisponible...</p>
              </div>
            )}
          </div>

          {/* PANNEAU DROIT : LE CHAT (Affiché avec animation) */}
          <div className={cn(
            "bg-[var(--bg)] transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
            showChat ? "w-[400px] opacity-100" : "w-0 opacity-0"
          )}>
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Discussion WhatsApp</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(MOCK_HISTORY[conversation.id] ?? MOCK_HISTORY.default).map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm",
                    msg.role === "client"
                      ? "bg-[#25D366] text-white rounded-br-none"
                      : "bg-white text-[var(--text)] border border-[var(--border)] rounded-bl-none"
                  )}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={cn("text-[9px] mt-1 opacity-70", msg.role === "client" ? "text-right" : "")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div className="py-4 text-center">
                <span className="text-[9px] px-2 py-1 bg-[var(--border)] rounded-full text-[var(--text-muted)] font-bold uppercase">Fin de discussion</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ONGLET PARAMÈTRES — Noms éditables + numéro en lecture seule
// ════════════════════════════════════════════════════════════════════════════
function BotSettingsPanel({
  pair, d, colors, onRefresh,
}: {
  pair: BotPair;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const waBot = pair.waBot as BotType & {
    main_name?: string;
    whatsapp_display_name?: string;
    voice_display_name?: string;
  };
  const voiceBot = pair.voiceBot as (BotType & { voice_display_name?: string }) | null;

  const [mainName, setMainName] = useState(waBot.main_name ?? waBot.name);
  const [waDisplayName, setWaDisplayName] = useState(waBot.whatsapp_display_name ?? "");
  const [voiceDisplayName, setVoiceDisplayName] = useState(
    voiceBot?.voice_display_name ?? waBot.voice_display_name ?? ""
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await botsRepository.patch(pair.waBot.id, {
        main_name: mainName,
        whatsapp_display_name: waDisplayName,
        voice_display_name: voiceDisplayName,
      } as Partial<CreateBotPayload>);

      if (pair.voiceBot) {
        await botsRepository.patch(pair.voiceBot.id, {
          main_name: mainName,
          voice_display_name: voiceDisplayName,
        } as Partial<CreateBotPayload>);
      }

      toast.success("Paramètres sauvegardés !");
      onRefresh();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">

      {/* COLONNE GAUCHE : FORMULAIRE (7/12) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[var(--bg)] p-6 rounded-3xl border border-[var(--border)] space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Settings className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Identité des agents</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-base font-bold mb-1.5 block">Nom interne du projet</label>
              <input className="input-base bg-white" value={mainName} onChange={e => setMainName(e.target.value)} placeholder="Ex: Pharma Bot" />
            </div>

            <div>
              <label className="label-base font-bold mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> Nom WhatsApp
              </label>
              <input className="input-base bg-white" value={waDisplayName} onChange={e => setWaDisplayName(e.target.value)} placeholder="Ex: Sophie" />
            </div>

            <div>
              <label className="label-base font-bold mb-1.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#6C3CE1]" /> Nom Vocal
              </label>
              <input className="input-base bg-white" value={voiceDisplayName} onChange={e => setVoiceDisplayName(e.target.value)} placeholder="Ex: Voix Sophie" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg)] p-6 rounded-3xl border border-[var(--border)]">
          <label className="label-base font-bold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" /> Numéro de téléphone assigné
          </label>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text)] font-mono tracking-tighter">
                  {pair.phoneNumber?.number ?? "Non configuré"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Ligne active • {pair.phoneNumber?.provider_name}</p>
              </div>
            </div>
            <Badge variant="slate">Lecture seule</Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3 shadow-lg shadow-[#075E54]/20 transition-all hover:scale-[1.02]">
            {saving ? <Spinner className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* COLONNE DROITE : RÉSUMÉ & STATUT (5/12) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#075E54] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Statut en direct</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Activity className="w-8 h-8 text-[#25D366]" />
              </div>
              <div>
                <h4 className="text-xl font-black">{waBot.status === 'active' ? 'Opérationnel' : 'En pause'}</h4>
                <p className="text-white/60 text-xs">Dernière activité il y a 2 min</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Intelligence (LLM)</span>
                <Badge className="bg-[#25D366] text-[#075E54] border-none">Gemini Pro</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Canal WhatsApp</span>
                <span className="text-xs font-bold text-[#25D366]">Connecté</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Canal Vocal</span>
                <span className="text-xs font-bold text-sky-300">Prêt</span>
              </div>
            </div>
          </div>

          {/* Décoration en arrière-plan */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#25D366] rounded-full blur-[80px] opacity-20"></div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">Besoin d'aide ?</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Si vous souhaitez changer de numéro ou modifier les capacités profondes de l'IA, veuillez contacter votre conseiller AGT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODALE FORMULAIRE BOT
// ════════════════════════════════════════════════════════════════════════════
function BotFormModal({ editId, tenantId, onClose, onSave }: {
  editId: string | null;
  tenantId: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!editId;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateBotPayload>({
    name: "",
    welcome_message: "",
    personality: "",
    languages: ["fr"],
    whatsapp_provider: "waha",
    voice_ai_provider: "gemini",
    is_active: true,
    bot_type: "whatsapp",
  });

  useEffect(() => {
    if (editId) {
      botsRepository.getById(editId).then(bot => {
        setForm({
          name: bot.name,
          welcome_message: bot.welcome_message,
          personality: bot.personality,
          languages: bot.languages,
          whatsapp_provider: bot.whatsapp_provider,
          voice_ai_provider: bot.voice_ai_provider,
          is_active: bot.is_active,
          bot_type: (bot as BotType & { bot_type?: string }).bot_type ?? "whatsapp",
        });
      }).catch(() => null);
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await botsRepository.patch(editId!, { ...form, tenant_id: tenantId } as Partial<CreateBotPayload>);
      } else {
        await botsRepository.create({ ...form, tenant_id: tenantId });
      }
      toast.success(t.createSuccess);
      onSave();
      onClose();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  const tm = t.modal;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-modal border border-[var(--border)] animate-zoom-in max-h-[90vh] overflow-y-auto">

        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--bg-card)] z-10">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {isEdit ? tm.editTitle : tm.createTitle}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label-base">{tf.name}</label>
            <input className="input-base" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-base">{tf.welcome}</label>
            <textarea className="input-base resize-none" rows={3}
              value={form.welcome_message}
              onChange={e => setForm({ ...form, welcome_message: e.target.value })} />
          </div>
          <div>
            <label className="label-base">{tf.personality}</label>
            <textarea className="input-base resize-none" rows={2}
              value={form.personality}
              onChange={e => setForm({ ...form, personality: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={cn(
              "relative w-10 h-6 rounded-full transition-colors",
              form.is_active ? "bg-[#25D366]" : "bg-[var(--border)]"
            )}>
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                form.is_active ? "translate-x-4" : "translate-x-0"
              )} />
            </div>
            <span className="text-sm font-medium text-[var(--text)]">{tf.isActive}</span>
            <input type="checkbox" className="sr-only" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          </label>
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3 sticky bottom-0 bg-[var(--bg-card)]">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? tm.btnUpdate : tm.btnCreate}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}