// src/app/pme/bots/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import {
  botsRepository, conversationsRepository,
  appointmentsRepository, statsRepository,
} from "@/repositories";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import {
  Bot, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp,
  MessageSquare, Phone, CalendarDays, Activity,
  FlaskConical, Globe, GlobeLock, CheckCircle,
  User, Mail, ArrowRightLeft, Wrench, BookOpen,
} from "lucide-react";
import type {
  Bot as BotType, CreateBotPayload, BotStatus,
  Conversation, Appointment,
} from "@/types/api";
import { ROUTES } from "@/lib/constants";

// ── Palette couleurs par secteur ──────────────────────────────────────────────
const SECTOR_COLORS: Record<string, { primary: string; accent: string }> = {
  sante:        { primary: "#0EA5E9", accent: "#38BDF8" },
  juridique:    { primary: "#1E3A5F", accent: "#3B82F6" },
  beaute:       { primary: "#EC4899", accent: "#F9A8D4" },
  restauration: { primary: "#F97316", accent: "#FDBA74" },
  commerce:     { primary: "#8B5CF6", accent: "#C4B5FD" },
  finance:      { primary: "#059669", accent: "#34D399" },
  education:    { primary: "#6366F1", accent: "#A5B4FC" },
  transport:    { primary: "#64748B", accent: "#94A3B8" },
  default:      { primary: "#075E54", accent: "#25D366" },
};

function getSectorColor(sector: string) {
  const key = sector?.toLowerCase().replace(/[éè]/g, "e").replace(/[àâ]/g, "a") ?? "";
  return SECTOR_COLORS[key] ?? SECTOR_COLORS.default;
}

type DetailTab = "conversations" | "agenda" | "stats";

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
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // ── Modales ───────────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{ open: boolean; editId: string | null }>
    ({ open: false, editId: null });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Panneau détail ────────────────────────────────────────────────────────
  const [expandedBotId, setExpandedBotId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchBots = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const res = await botsRepository.getList({ tenant_id: user.tenant_id! });
        setBots(res.results);
      } catch { toast.error(t.errorLoad); }
      finally { setLoading(false); }
    });
  }, [user?.tenant_id, t.errorLoad, toast]);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await botsRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      if (expandedBotId === deleteId) setExpandedBotId(null);
      fetchBots();
    } catch { toast.error(t.deleteError); }
    finally { setIsDeleting(false); }
  };

  const handlePublishToggle = async (bot: BotType) => {
    try {
      const newStatus: BotStatus = bot.status === "active" ? "paused" : "active";
      await botsRepository.patch(bot.id, { is_active: newStatus === "active" });
      toast.success(newStatus === "active" ? t.publishSuccess : t.unpublishSuccess);
      fetchBots();
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

        {bots.length === 0
          ? <div className="card"><EmptyState message={t.noData} icon={Bot} /></div>
          : (
            <div className="space-y-3">
              {bots.map(bot => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  isExpanded={expandedBotId === bot.id}
                  tenantId={user?.tenant_id ?? ""}
                  sector={user?.tenant_id ?? ""}
                  onToggleExpand={() => setExpandedBotId(expandedBotId === bot.id ? null : bot.id)}
                  onEdit={() => setFormModal({ open: true, editId: bot.id })}
                  onDelete={() => setDeleteId(bot.id)}
                  onPublishToggle={() => handlePublishToggle(bot)}
                  onTest={() => router.push(`/pme/bots/${bot.id}/test`)}
                  d={d}
                />
              ))}
            </div>
          )}
      </div>

      {/* Modale formulaire */}
      {mounted && formModal.open && createPortal(
        <BotFormModal
          editId={formModal.editId}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setFormModal({ open: false, editId: null })}
          onSave={fetchBots}
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
// BOT CARD + PANNEAU DÉTAIL
// ════════════════════════════════════════════════════════════════════════════
interface BotCardProps {
  bot: BotType;
  isExpanded: boolean;
  tenantId: string;
  sector: string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublishToggle: () => void;
  onTest: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
}

function BotCard({ bot, isExpanded, tenantId, onToggleExpand, onEdit, onDelete, onPublishToggle, onTest, d }: BotCardProps) {
  const t = d.bots;
  const colors = getSectorColor("");
  const isActive = bot.status === "active";

  return (
    <div className="card overflow-hidden">
      {/* ── En-tête bot ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Icône colorée */}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.primary}18` }}>
          <Bot className="w-5 h-5" style={{ color: colors.primary }} />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[var(--text)]">{bot.name}</p>
            <Badge variant={isActive ? "green" : "amber"}>
              {isActive ? t.statusActive : t.statusPaused}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
            {bot.whatsapp_provider.toUpperCase()} · {bot.voice_ai_provider} · {bot.languages.join(", ")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Bouton test */}
          <button onClick={onTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] hover:border-[#6C3CE1] hover:text-[#6C3CE1] transition-colors">
            <FlaskConical className="w-3.5 h-3.5" /> {t.testBtn}
          </button>

          {/* Publier/Dépublier */}
          <button onClick={onPublishToggle}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
              isActive
                ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                : "bg-[#25D366] text-white hover:bg-[#128C7E]"
            )}>
            {isActive
              ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
              : <><Globe className="w-3.5 h-3.5" /> {t.publish}</>}
          </button>

          <button onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle expand */}
          <button onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Panneau détail ────────────────────────────────────────────────── */}
      {isExpanded && (
        <BotDetailPanel bot={bot} tenantId={tenantId} d={d} colors={colors} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU DÉTAIL
// ════════════════════════════════════════════════════════════════════════════
function BotDetailPanel({ bot, tenantId, d, colors }: {
  bot: BotType;
  tenantId: string;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
}) {
  const t = d.bots;
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DetailTab>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mounted, setMounted] = useState(false);
  const [convPage, setConvPage] = useState(1);
  const PAGE = 5;

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [convRes, aptRes] = await Promise.all([
        conversationsRepository.getList({ bot_id: bot.id }),
        appointmentsRepository.getList({ tenant_id: tenantId }),
      ]);
      setConversations(convRes.results);
      setAppointments(aptRes.results);
    } catch { toast.error(d.common.error); }
    finally { setLoadingData(false); }
  }, [bot.id, tenantId, d.common.error, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Stats calculées ───────────────────────────────────────────────────────
  const stats = {
    conversations: conversations.length,
    messages: conversations.reduce((acc, c) => acc + c.messages_count, 0),
    appointments: conversations.filter(c => c.report?.appointment_scheduled).length,
    handoffs: conversations.filter(c => c.report?.human_handoff).length,
  };

  // ── Pagination conversations ───────────────────────────────────────────
  const totalPages = Math.ceil(conversations.length / PAGE);
  const pagedConvs = conversations.slice((convPage - 1) * PAGE, convPage * PAGE);

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "conversations", label: t.conversationsTab, icon: MessageSquare },
    { id: "agenda", label: t.agendaTab, icon: CalendarDays },
    { id: "stats", label: t.statsTab, icon: Activity },
  ];

  return (
    <div className="border-t border-[var(--border)] animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-[var(--border)]">
        {[
          { label: t.statsConversations, value: stats.conversations, icon: MessageSquare },
          { label: t.statsMessages, value: stats.messages, icon: MessageSquare },
          { label: t.statsAppointments, value: stats.appointments, icon: CalendarDays },
          { label: "Transferts humain", value: stats.handoffs, icon: ArrowRightLeft },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "px-5 py-4 flex items-center gap-3",
            i < 3 && "border-r border-[var(--border)]"
          )}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}18` }}>
              <stat.icon className="w-4 h-4" style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-xl font-black text-[var(--text)]">{stat.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-3 border-b border-[var(--border)] bg-[var(--bg)]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.id
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
              )}
              style={activeTab === tab.id ? { backgroundColor: colors.primary } : {}}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu onglets */}
      <div className="p-5">
        {loadingData
          ? <div className="flex justify-center py-8"><Spinner className="w-5 h-5 border-[#25D366] border-t-transparent" /></div>
          : (
            <>
              {/* ── Conversations ─────────────────────────────────────────── */}
              {activeTab === "conversations" && (
                <div className="space-y-3">
                  {conversations.length === 0
                    ? <EmptyState message={t.conversationsEmpty} icon={MessageSquare} />
                    : (
                      <>
                        <div className="space-y-2">
                          {pagedConvs.map(conv => (
                            <div key={conv.id}
                              onClick={() => setSelectedConv(conv)}
                              className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] hover:border-[var(--text-muted)] cursor-pointer transition-all hover:shadow-sm bg-[var(--bg-card)]">
                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${colors.primary}18` }}>
                                <User className="w-4 h-4" style={{ color: colors.primary }} />
                              </div>

                              {/* Infos */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-[var(--text)]">{conv.client_name}</p>
                                  <Badge variant={conv.channel === "whatsapp" ? "green" : "violet"}>
                                    {conv.channel === "whatsapp" ? "WhatsApp" : "Vocal"}
                                  </Badge>
                                  {conv.report?.appointment_scheduled && (
                                    <Badge variant="blue">RDV</Badge>
                                  )}
                                  {conv.report?.human_handoff && (
                                    <Badge variant="amber">Transfert</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{conv.last_message}</p>
                              </div>

                              {/* Meta */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-[10px] text-[var(--text-muted)]">{formatDateTime(conv.last_message_at)}</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{conv.messages_count} {t.conversationMessages}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button disabled={convPage === 1}
                              onClick={() => setConvPage(p => p - 1)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--bg)] transition-colors">
                              {d.common.prev}
                            </button>
                            <span className="text-xs text-[var(--text-muted)]">{convPage} / {totalPages}</span>
                            <button disabled={convPage === totalPages}
                              onClick={() => setConvPage(p => p + 1)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--bg)] transition-colors">
                              {d.common.next}
                            </button>
                          </div>
                        )}
                      </>
                    )
                  }
                </div>
              )}

              {/* ── Agenda ────────────────────────────────────────────────── */}
              {activeTab === "agenda" && (
                <div className="space-y-2">
                  {appointments.length === 0
                    ? <EmptyState message={d.appointments.noData} icon={CalendarDays} />
                    : appointments.slice(0, 8).map(apt => (
                      <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: apt.status === "confirmed" ? "#25D366" : apt.status === "pending" ? "#F59E0B" : "#94A3B8" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text)]">{apt.client_name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{formatDateTime(apt.scheduled_at)}</p>
                        </div>
                        <Badge variant={apt.status === "confirmed" ? "green" : apt.status === "pending" ? "amber" : "slate"}>
                          {d.appointments.statuses[apt.status]}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── Stats ─────────────────────────────────────────────────── */}
              {activeTab === "stats" && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t.statsConversations, value: stats.conversations },
                    { label: t.statsMessages, value: stats.messages },
                    { label: t.statsAppointments, value: stats.appointments },
                    { label: "Transferts", value: stats.handoffs },
                  ].map((s, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
                      <p className="text-3xl font-black" style={{ color: colors.primary }}>{s.value}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        }
      </div>

      {/* Modale rapport conversation */}
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
// MODALE RAPPORT CONVERSATION
// ════════════════════════════════════════════════════════════════════════════
function ConversationReportModal({ conversation, onClose, d, colors }: {
  conversation: Conversation;
  onClose: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
}) {
  const t = d.bots;
  const report = conversation.report;

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
      <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">

        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center"
          style={{ borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}18` }}>
              <User className="w-4 h-4" style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{conversation.client_name}</p>
              <p className="text-xs text-[var(--text-muted)]">{conversation.client_phone}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Coordonnées client */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--bg)] rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                {t.reportContact}
              </p>
              <p className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> {conversation.client_phone}
              </p>
              {conversation.client_email && (
                <p className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 mt-1">
                  <Mail className="w-3 h-3" /> {conversation.client_email}
                </p>
              )}
            </div>
            <div className="p-3 bg-[var(--bg)] rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Canal</p>
              <Badge variant={conversation.channel === "whatsapp" ? "green" : "violet"}>
                {conversation.channel === "whatsapp" ? "WhatsApp" : "Vocal"}
              </Badge>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatDateTime(conversation.last_message_at)}</p>
            </div>
          </div>

          {report ? (
            <>
              {/* Résumé */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  {t.reportSummary}
                </p>
                <p className="text-sm text-[var(--text)] bg-[var(--bg)] rounded-xl p-4 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Points clés */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  {t.reportTakeaways}
                </p>
                <ul className="space-y-1.5">
                  {report.key_takeaways.map((tk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                      {tk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  {t.reportActions}
                </p>
                <div className="space-y-2">
                  {report.actions.map((action, i) => {
                    const Icon = ACTION_ICONS[action.type] ?? Activity;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded-xl">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${colors.primary}18` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{action.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{action.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RDV + Transfert */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "p-3 rounded-xl border",
                  report.appointment_scheduled
                    ? "border-[#25D366]/30 bg-[#25D366]/5"
                    : "border-[var(--border)] bg-[var(--bg)]"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: report.appointment_scheduled ? "#25D366" : "var(--text-muted)" }}>
                    {t.reportAppointment}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text)]">
                    {report.appointment_scheduled ? "✓ " + t.reportAppointment : t.reportNoAppointment}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl border",
                  report.human_handoff
                    ? "border-amber-300 bg-amber-50 dark:bg-amber-900/10"
                    : "border-[var(--border)] bg-[var(--bg)]"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-[var(--text-muted)]">
                    {t.reportHandoff}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text)]">
                    {report.human_handoff ? report.handoff_reason ?? t.reportHandoff : t.reportNoHandoff}
                  </p>
                </div>
              </div>

              {/* Services discutés */}
              {report.services_discussed.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    {t.reportServices}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.services_discussed.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-[var(--border)] text-[var(--text)]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Aucun rapport disponible.</p>
          )}
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

  const DEF: CreateBotPayload = {
    name: "", welcome_message: "", personality: "",
    languages: ["fr"], whatsapp_provider: "waha",
    voice_ai_provider: "gemini", is_active: true,
  };
  const [form, setForm] = useState<CreateBotPayload>(DEF);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      botsRepository.getById(editId)
        .then(b => setForm({
          name: b.name, welcome_message: b.welcome_message,
          personality: b.personality, languages: b.languages,
          whatsapp_provider: b.whatsapp_provider,
          voice_ai_provider: b.voice_ai_provider,
          is_active: b.is_active,
        }))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await botsRepository.patch(editId!, form);
      else await botsRepository.create({ ...form, tenant_id: tenantId });
      toast.success(t.createSuccess);
      onSave();
      onClose();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {isEdit ? t.modal.editTitle : t.modal.createTitle}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading
            ? <div className="flex justify-center py-8"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>
            : <>
              <div>
                <label className="label-base">{tf.name}</label>
                <input required className="input-base" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.welcome}</label>
                <textarea rows={3} className="input-base resize-none" value={form.welcome_message}
                  onChange={e => setForm({ ...form, welcome_message: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.personality}</label>
                <input className="input-base" value={form.personality}
                  onChange={e => setForm({ ...form, personality: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">{tf.whatsappProvider}</label>
                  <select className="input-base" value={form.whatsapp_provider}
                    onChange={e => setForm({ ...form, whatsapp_provider: e.target.value as "waha" | "meta_api" })}>
                    <option value="waha">{t.providerWaha}</option>
                    <option value="meta_api">{t.providerMeta}</option>
                  </select>
                </div>
                <div>
                  <label className="label-base">{tf.voiceProvider}</label>
                  <select className="input-base" value={form.voice_ai_provider}
                    onChange={e => setForm({ ...form, voice_ai_provider: e.target.value as "gemini" | "openai" })}>
                    <option value="gemini">{t.providerGemini}</option>
                    <option value="openai">{t.providerOpenAI}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-base">{tf.languages}</label>
                <div className="flex gap-3 mt-1">
                  {["fr", "en"].map(lang => (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.languages.includes(lang)}
                        onChange={e => setForm({
                          ...form,
                          languages: e.target.checked
                            ? [...form.languages, lang]
                            : form.languages.filter(l => l !== lang),
                        })} />
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {lang === "fr" ? "Français" : "English"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={cn("w-10 h-6 rounded-full p-1 transition-colors cursor-pointer",
                    form.is_active ? "bg-[#25D366]" : "bg-[var(--border)]")}>
                  <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform",
                    form.is_active ? "translate-x-4" : "translate-x-0")} />
                </div>
                <span className="text-sm font-medium text-[var(--text)]">{tf.isActive}</span>
              </label>
            </>
          }
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? t.modal.btnUpdate : t.modal.btnCreate}
          </button>
        </div>
      </form>
    </div>
  );
}