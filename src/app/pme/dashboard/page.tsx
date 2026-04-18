// src/app/pme/dashboard/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  statsRepository, conversationsRepository,
  subscriptionsRepository, appointmentsRepository,
} from "@/repositories";
import { formatDateTime, formatDate, cn } from "@/lib/utils";
import { Badge, PageLoader, EmptyState, UsageBar, Spinner } from "@/components/ui";
import { ROUTES, PLANS_CONFIG } from "@/lib/constants";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, Phone, CalendarDays, Activity,
  Bot, Wrench, Clock, CreditCard,
  Mail, CheckCircle, XCircle, ChevronRight,
  X, User, Zap,
} from "lucide-react";
import type { TenantStats, Conversation, Subscription, Appointment } from "@/types/api";
import Link from "next/link";

// ── Mock historique conversation ──────────────────────────────────────────────
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

// ── Données semaine mockées (fallback si pas de vraies stats) ─────────────────
const WEEK_FALLBACK = [
  { day: "Lun", messages: 38, calls: 3 }, { day: "Mar", messages: 52, calls: 5 },
  { day: "Mer", messages: 45, calls: 2 }, { day: "Jeu", messages: 61, calls: 7 },
  { day: "Ven", messages: 48, calls: 4 }, { day: "Sam", messages: 32, calls: 2 },
  { day: "Dim", messages: 36, calls: 3 },
];

export default function PmeDashboardPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.dashboard.pme;
  const router = useRouter();

  const [stats, setStats] = useState<TenantStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchAll = useCallback(async () => {
    if (!user?.tenant_id) { setLoading(false); return; }
    const today = new Date().toISOString().split("T")[0];
    const [s, c, sub, appts] = await Promise.all([
      statsRepository.getByTenant(user.tenant_id).catch(() => null),
conversationsRepository.getList({ tenant_id: user.tenant_id }).catch(() => ({ results: [] })),
      subscriptionsRepository.getByTenant(user.tenant_id).catch(() => null),
      appointmentsRepository.getList({ tenant_id: user.tenant_id }).catch(() => ({ results: [] })),
    ]);
    setStats(s);
    setConversations(c.results.slice(0, 5));
    setSubscription(sub);
    // Filtrer RDV du jour
    setTodayAppointments(
      appts.results.filter(a => a.scheduled_at?.startsWith(today)).slice(0, 3)
    );
    setLoading(false);
  }, [user?.tenant_id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <PageLoader />;

  // ── KPI cards ───────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: t.messagesToday, value: stats?.messages_today ?? 0,
      week: stats?.messages_week ?? 0, icon: MessageSquare,
      color: "text-[#25D366]", bg: "bg-[#25D366]/10",
    },
    {
      label: t.callsToday, value: stats?.calls_today ?? 0,
      week: stats?.calls_week ?? 0, icon: Phone,
      color: "text-[#6C3CE1]", bg: "bg-[#6C3CE1]/10",
    },
    {
      label: t.appointmentsToday, value: stats?.appointments_today ?? 0,
      week: stats?.appointments_week ?? 0, icon: CalendarDays,
      color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: t.activeConversations, value: stats?.active_conversations ?? 0,
      week: null, icon: Activity,
      color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  // ── Données graphique ────────────────────────────────────────────────────────
  const weekData = stats?.week_data ?? WEEK_FALLBACK;

  // ── Plan actuel ──────────────────────────────────────────────────────────────
  const currentPlan = subscription
    ? PLANS_CONFIG.find(p => p.slug === subscription.plan_slug) ?? null
    : null;
  const msgUsed = stats?.messages_week ?? 0;
  const msgTotal = currentPlan?.messages_limit ?? 2000;
  const callsUsed = stats?.calls_week ?? 0;
 const callsTotal = currentPlan?.calls_limit ?? 100;

  // ── Mock stats emails ────────────────────────────────────────────────────────
  const emailSentWeek = stats?.emails_sent_week ?? 12;
  const emailOpened = Math.round(emailSentWeek * 0.68);
  const emailFailed = Math.round(emailSentWeek * 0.04);

  // ── Statuts RDV ──────────────────────────────────────────────────────────────
  const apptStatusVariant: Record<string, "green" | "amber" | "slate" | "red"> = {
    confirmed: "green", pending: "amber", done: "slate", cancelled: "red",
  };
  const apptStatusLabel: Record<string, string> = {
    confirmed: d.appointments.statuses.confirmed,
    pending: d.appointments.statuses.pending,
    done: d.appointments.statuses.done,
    cancelled: d.appointments.statuses.cancelled,
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t.welcome},{" "}
            <span className="font-semibold text-[var(--text)]">{user?.name}</span>
          </p>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", card.bg)}>
                    <Icon className={cn("w-5 h-5", card.color)} strokeWidth={2} />
                  </div>
                  <span className={cn("text-3xl font-black", card.color)}>{card.value}</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-muted)]">{card.label}</p>
                {card.week !== null && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {t.thisWeek} : <span className="font-bold">{card.week}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Accès rapides ─────────────────────────────────────────────────── */}
        <div className="card p-4">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            {t.quickLinks}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Bot, label: d.nav.bots, href: ROUTES.bots, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
              { icon: Wrench, label: d.nav.services, href: ROUTES.services, color: "text-[#6C3CE1]", bg: "bg-[#6C3CE1]/10" },
              { icon: CalendarDays, label: d.nav.appointments, href: ROUTES.appointments, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { icon: CreditCard, label: d.nav.billing, href: ROUTES.billing, color: "text-[#075E54]", bg: "bg-[#075E54]/10" },
            ].map(({ icon: Icon, label, href, color, bg }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg)] transition-colors group">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[#075E54] transition-colors">
                  {label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Contenu principal 2 colonnes ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Colonne gauche — 3/5 */}
          <div className="lg:col-span-3 space-y-6">

            {/* Graphique */}
            <div className="card p-6">
              <h2 className="text-sm font-bold text-[var(--text)] mb-4">{t.thisWeek}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="messages" stroke="#25D366" strokeWidth={2} fill="url(#gMsg)" name="Messages" />
                  <Area type="monotone" dataKey="calls" stroke="#6C3CE1" strokeWidth={2} fill="url(#gCall)" name="Appels" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Conversations récentes */}
            <div className="card">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-sm font-bold text-[var(--text)]">{t.recentConversations}</h2>
              </div>
              {conversations.length === 0 ? (
                <EmptyState message={t.noConversations} icon={MessageSquare} />
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[var(--bg)] transition-colors text-left group">
                      <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] flex-shrink-0">
                        {conv.channel === "whatsapp"
                          ? <MessageSquare className="w-4 h-4" />
                          : <Phone className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">
                          {conv.client_name || conv.client_identifier}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{conv.last_message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={conv.channel === "whatsapp" ? "green" : "violet"}>
                          {conv.channel === "whatsapp" ? t.channel_whatsapp : t.channel_voice}
                        </Badge>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          {formatDateTime(conv.last_message_at)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite — 2/5 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Abonnement + usage */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text)]">{t.subscription}</h2>
                {subscription ? (
                  <Badge variant={subscription.status === "active" ? "green" : "red"}>
                    {subscription.status === "active" ? d.billing.statusActive : d.billing.statusSuspended}
                  </Badge>
                ) : null}
              </div>

              {currentPlan ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#075E54]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--text)]">{currentPlan.name}</p>
                      {subscription?.renewal_date && (
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {d.billing.renewsOn} {formatDate(subscription.renewal_date)}
                        </p>
                      )}
                    </div>
                    <Link href={ROUTES.billing}
                      className="ml-auto text-xs text-[#075E54] font-semibold hover:underline">
                      {d.billing.changePlan}
                    </Link>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                    <UsageBar
                      label={t.usageMessages}
                      used={msgUsed} total={msgTotal}
                      pct={Math.round((msgUsed / msgTotal) * 100)}
                      color="#25D366"
                    />
                    <UsageBar
                      label={t.usageCalls}
                      used={callsUsed} total={callsTotal}
                      pct={Math.round((callsUsed / callsTotal) * 100)}
                      color="#6C3CE1"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">{t.noSubscription}</p>
              )}
            </div>

            {/* RDV du jour */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--text)]">{t.todayAppointments}</h2>
                <Link href={ROUTES.appointments}
                  className="text-xs text-[#075E54] font-semibold hover:underline">
                  {t.viewAgenda}
                </Link>
              </div>
              {todayAppointments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">{t.noAppointmentsToday}</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map(appt => (
                    <div key={appt.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">
                          {appt.client_name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {formatDateTime(appt.scheduled_at)}
                        </p>
                      </div>
                      <Badge variant={apptStatusVariant[appt.status] ?? "slate"}>
                        {apptStatusLabel[appt.status] ?? appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Emails de rappel */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--text)]">{t.emailStats}</h2>
                <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="text-center mb-4">
                <p className="text-4xl font-black text-[var(--text)]">{emailSentWeek}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.emailsSentWeek}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg)] rounded-xl p-3 text-center">
                  <CheckCircle className="w-5 h-5 text-[#25D366] mx-auto mb-1" />
                  <p className="text-lg font-black text-[var(--text)]">{emailOpened}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.emailsOpened}</p>
                </div>
                <div className="bg-[var(--bg)] rounded-xl p-3 text-center">
                  <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-lg font-black text-[var(--text)]">{emailFailed}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.emailsFailed}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modale conversation détail ─────────────────────────────────────── */}
      {mounted && selectedConv && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedConv(null)} />
          <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[85vh] animate-zoom-in">

            {/* Header modale */}
            <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text)] truncate">
                  {selectedConv.client_name || selectedConv.client_identifier}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={selectedConv.channel === "whatsapp" ? "green" : "violet"}>
                    {selectedConv.channel === "whatsapp" ? t.channel_whatsapp : t.channel_voice}
                  </Badge>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDateTime(selectedConv.last_message_at)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedConv(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg)] hover:opacity-70 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Historique messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                {t.conversationHistory}
              </p>
              {(MOCK_HISTORY[selectedConv.id] ?? MOCK_HISTORY.default).map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                    msg.role === "client"
                      ? "bg-[#25D366] text-white rounded-br-sm"
                      : "bg-[var(--bg)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]"
                  )}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={cn("text-[10px] mt-1", msg.role === "client" ? "text-white/70 text-right" : "text-[var(--text-muted)]")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer : action déclenchée */}
            <div className="p-5 border-t border-[var(--border)] bg-[var(--bg)] rounded-b-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                {t.conversationAction}
              </p>
              {selectedConv.appointment_id ? (
                <div className="flex items-center gap-2 text-sm text-[#25D366] font-semibold">
                  <CalendarDays className="w-4 h-4" />
                  <span>{d.appointments.title} — {d.appointments.statuses.confirmed}</span>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">{t.conversationNoAction}</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}