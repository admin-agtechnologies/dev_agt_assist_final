// src/app/pme/dashboard/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  statsRepository,
  conversationsRepository,
  subscriptionsRepository,
  rendezVousRepository,
} from "@/repositories";
import { PageLoader } from "@/components/ui";
import { PLANS_CONFIG } from "@/lib/constants";
import type { TenantStats, Conversation, Subscription, RendezVous } from "@/types/api";

import { KpiCards }            from "./_components/KpiCards";
import { WeekChart }           from "./_components/WeekChart";
import { ActiveConversations } from "./_components/ActiveConversations";
import { RecentConversations } from "./_components/RecentConversations";
import { SubscriptionUsage }   from "./_components/SubscriptionUsage";
import { TodayAppointments }   from "./_components/TodayAppointments";
import { EmailStats }          from "./_components/EmailStats";
import { QuickLinks }          from "./_components/QuickLinks";
import { ConversationModal }   from "./_components/ConversationModal";

// ── Données semaine fallback (backend ne retourne pas de données par jour) ────
const WEEK_FALLBACK = [
  { day: "Lun", messages: 38, calls: 3 },
  { day: "Mar", messages: 52, calls: 5 },
  { day: "Mer", messages: 45, calls: 2 },
  { day: "Jeu", messages: 61, calls: 7 },
  { day: "Ven", messages: 48, calls: 4 },
  { day: "Sam", messages: 32, calls: 2 },
  { day: "Dim", messages: 36, calls: 3 },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function PmeDashboardPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.dashboard.pme;

  const [stats, setStats]                       = useState<TenantStats | null>(null);
  const [conversations, setConversations]       = useState<Conversation[]>([]);
  const [subscription, setSubscription]         = useState<Subscription | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<RendezVous[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedConv, setSelectedConv]         = useState<Conversation | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const [s, c, sub, appts] = await Promise.all([
      statsRepository.getByTenant().catch(() => null),
      conversationsRepository
        .getList()
        .catch(() => ({ results: [] as Conversation[], count: 0, next: null, previous: null })),
      subscriptionsRepository.getMine().catch(() => null),
      rendezVousRepository
        .getList()
        .catch(() => ({ results: [] as RendezVous[], count: 0, next: null, previous: null })),
    ]);
    setStats(s);
    setConversations((c.results ?? []).slice(0, 5));
    setSubscription(sub);
    setTodayAppointments(
      (appts.results ?? [])
        .filter((a: RendezVous) => a.scheduled_at?.startsWith(today))
        .slice(0, 3),
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <PageLoader />;

  // ── Plan courant (pour UsageBar) ─────────────────────────────────────────
  const currentPlan = subscription
    ? (PLANS_CONFIG.find(p => p.slug === subscription.plan?.slug) ?? null)
    : null;

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t.welcome},{" "}
            <span className="font-semibold text-[var(--text)]">{user?.name}</span>
          </p>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <KpiCards
          stats={stats}
          labels={{
            messagesToday:     t.messagesToday,
            callsToday:        t.callsToday,
            appointmentsToday: t.appointmentsToday,
            thisWeek:          t.thisWeek,
          }}
        />

        {/* ── Conversations actives ────────────────────────────────────────── */}
        {stats && (
          <ActiveConversations
            stats={stats}
            label={t.activeConversations ?? "Conversations actives"}
          />
        )}

        {/* ── Accès rapides ────────────────────────────────────────────────── */}
        <QuickLinks
          labels={{
            title:        t.quickLinks,
            bots:         d.nav.bots,
            services:     d.nav.services,
            appointments: d.nav.appointments,
            billing:      d.nav.billing,
          }}
        />

        {/* ── Contenu principal 2 colonnes ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Colonne gauche 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            <WeekChart data={WEEK_FALLBACK} title={t.thisWeek} />
            <RecentConversations
              conversations={conversations}
              onSelect={setSelectedConv}
              labels={{
                title:           t.recentConversations,
                empty:           t.noConversations,
                channelWhatsapp: t.channel_whatsapp,
                channelVoice:    t.channel_voice,
              }}
            />
          </div>

          {/* Colonne droite 2/5 */}
          <div className="lg:col-span-2 space-y-6">
            <SubscriptionUsage
              subscription={subscription}
              stats={stats}
              currentPlan={currentPlan}
              labels={{
                title:           t.subscription,
                active:          d.billing.statusActive,
                suspended:       d.billing.statusSuspended,
                renewsOn:        d.billing.renewsOn,
                changePlan:      d.billing.changePlan,
                usageMessages:   t.usageMessages,
                usageCalls:      t.usageCalls,
                noSubscription:  t.noSubscription,
              }}
            />
            <TodayAppointments
              appointments={todayAppointments}
              labels={{
                title:      t.todayAppointments,
                viewAgenda: t.viewAgenda,
                none:       t.noAppointmentsToday,
                statuses: {
                  confirme:   d.appointments.statuses.confirmed,
                  en_attente: d.appointments.statuses.pending,
                  termine:    d.appointments.statuses.done,
                  annule:     d.appointments.statuses.cancelled,
                },
              }}
            />
            <EmailStats
              stats={stats}
              labels={{
                title:     t.emailStats,
                sentWeek:  t.emailsSentWeek,
                opened:    t.emailsOpened,
                failed:    t.emailsFailed,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Modale conversation ──────────────────────────────────────────── */}
      {selectedConv && (
        <ConversationModal
          conv={selectedConv}
          onClose={() => setSelectedConv(null)}
          labels={{
            historyTitle:         t.conversationHistory,
            channelWhatsapp:      t.channel_whatsapp,
            channelVoice:         t.channel_voice,
            summary:              d.bots.reportSummary,
            keyPoints:            d.bots.reportTakeaways,
            actionTitle:          t.conversationAction,
            actionNoAction:       t.conversationNoAction,
            appointmentConfirmed: d.appointments.statuses.confirmed,
            handoffRequired:      d.bots.reportHandoff,
            appointments:         d.appointments.title,
          }}
        />
      )}
    </>
  );
}