"use client";
// src/app/(dashboard)/dashboard/page.tsx
// Dashboard central — N3. Data-driven, sectoriel, branché sur vraies données.
// S56 refonte — S57 fix : barrel subscriptionsRepository, Subscription type,
//   cast d.dashboard.pme, featuresActives prop, retrait page_size.

import { useState, useEffect, useCallback } from "react";
import { useRouter }    from "next/navigation";
import { useAuth }      from "@/contexts/AuthContext";
import { useLanguage }  from "@/contexts/LanguageContext";
import { useSector }    from "@/hooks/useSector";
import {
  conversationsRepository,
  rendezVousRepository,
  subscriptionsRepository,
} from "@/repositories";
import { entrepriseStatsRepository } from "@/repositories/stats.repository";
import { Spinner }                   from "@/components/ui";
import { DashboardHeroKPIs }         from "./_components/DashboardHeroKPIs";
import { DashboardSectorWidgets }    from "./_components/DashboardSectorWidgets";
import type { Conversation, RendezVous, Subscription } from "@/types/api";
import type { EntrepriseStats }      from "@/types/api/stats.types";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router                    = useRouter();
  const { user }                  = useAuth();
  const { locale, dictionary: d } = useLanguage();
  const { theme }                 = useSector();

  // S57 fix — accès direct d.dashboard.pme (pas de cast Record<...>)
  const t = d.dashboard.pme;

  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState<EntrepriseStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments,  setAppointments]  = useState<RendezVous[]>([]);
  const [sub,           setSub]           = useState<Subscription | null>(null);

  // ── Chargement des données ─────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, convsRes, apptRes, subRes] = await Promise.all([
        entrepriseStatsRepository.getStats(),
        // S57 fix — retrait page_size (type conflict), limitation client-side
        conversationsRepository.getList().catch(() => ({ results: [] as Conversation[] })),
        rendezVousRepository.getList().catch(() => ({ results: [] as RendezVous[] })),
        subscriptionsRepository.getMine().catch((): null => null),
      ]);
      setStats(statsRes);
      const convList = Array.isArray(convsRes)
        ? convsRes
        : (convsRes as { results: Conversation[] }).results ?? [];
      setConversations(convList.slice(0, 5));
      const apptList = Array.isArray(apptRes)
        ? apptRes
        : (apptRes as { results: RendezVous[] }).results ?? [];
      setAppointments(apptList.slice(0, 5));
      setSub(subRes);
    } catch {
      /* fail silently — composants gèrent leur état vide */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Billing labels (absents de dashboard.fr.ts → fallback locale) ──────────
  const billingLabels = {
    active:     locale === "fr" ? "Actif"           : "Active",
    suspended:  locale === "fr" ? "Suspendu"        : "Suspended",
    renewsOn:   locale === "fr" ? "Renouvellement"  : "Renews on",
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="border-[var(--border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Titre ── */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text)]">
          {t.welcome}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* ── Hero KPIs ── */}
      <DashboardHeroKPIs stats={stats} />

      {/* ── Widgets sectoriels — S57 fix : prop featuresActives ── */}
      <DashboardSectorWidgets
        stats={stats}
        featuresActives={stats?.features_actives ?? []}
      />

      {/* ── Grille widgets secondaires ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Conversations récentes */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text)]">
              {t.recentConversations}
            </h2>
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {t.thisWeek}
            </span>
          </div>
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-[var(--text-muted)]">
              <p className="text-sm">{t.noConversations}</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--bg)] transition-colors cursor-pointer"
                  onClick={() => router.push(`/conversations`)}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                    style={{ background: theme?.primary ?? "var(--color-primary)" }}
                  >
                    {(conv as { contact_name?: string }).contact_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                      {(conv as { contact_name?: string }).contact_name ?? "—"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {conv.bot_type === "vocal" ? t.channel_voice : t.channel_whatsapp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          {/* Abonnement */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              {t.subscription}
            </h3>
            {!sub ? (
              <p className="text-sm text-[var(--text-muted)]">{t.noSubscription}</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--text)]">
                    {sub.plan?.nom}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: sub.statut === "actif"
                        ? "var(--status-success-bg)"
                        : "var(--status-amber-bg)",
                      color: sub.statut === "actif"
                        ? "var(--status-success-text)"
                        : "var(--status-amber-text)",
                    }}
                  >
                    {sub.statut === "actif" ? billingLabels.active : billingLabels.suspended}
                  </span>
                </div>
                {sub.periode_fin && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {billingLabels.renewsOn} : {new Date(sub.periode_fin).toLocaleDateString(locale)}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  {t.usageMessages} : {sub.usage_messages ?? 0}
                </p>
              </div>
            )}
          </div>

          {/* RDV du jour */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              {t.todayAppointments}
            </h3>
            {appointments.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t.noAppointmentsToday}</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[var(--text)] truncate flex-1">
                      {appt.client_nom}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--bg)", color: "var(--text-muted)" }}
                    >
                      {d.appointments.statuses[appt.statut as keyof typeof d.appointments.statuses]
                        ?? appt.statut}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => router.push("/appointments")}
                  className="text-xs font-bold mt-1"
                  style={{ color: theme?.primary ?? "var(--color-primary)" }}
                >
                  {t.viewAgenda}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}