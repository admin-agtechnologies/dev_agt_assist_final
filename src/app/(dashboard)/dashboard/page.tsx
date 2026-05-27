"use client";
// src/app/(dashboard)/dashboard/page.tsx
// Dashboard central — N3. Data-driven, sectoriel, branché sur vraies données.
// S56 refonte — S57 fix — S63 enrichissement (DashboardQuickActions, FeaturesChart,
//   RecentFeatures, Subscription).
// S64 FIX — BUG-S64-04 : conversationsRepository → agentRepository.listConversations
//           Les conversations live sont sur /api/v1/agent/conversations/, pas /api/v1/conversations/

import { useState, useEffect, useCallback } from "react";
import { useRouter }    from "next/navigation";
import { useAuth }      from "@/contexts/AuthContext";
import { useLanguage }  from "@/contexts/LanguageContext";
import { useSector }    from "@/hooks/useSector";
import { agentRepository }           from "@/repositories/agent.repository";
import { subscriptionsRepository }   from "@/repositories";
import { entrepriseStatsRepository } from "@/repositories/stats.repository";
import { Spinner }                   from "@/components/ui";
import { DashboardHeroKPIs }         from "./_components/DashboardHeroKPIs";
import { DashboardSectorWidgets }    from "./_components/DashboardSectorWidgets";
import { DashboardQuickActions }     from "./_components/DashboardQuickActions";
import { DashboardFeaturesChart }    from "./_components/DashboardFeaturesChart";
import { DashboardRecentFeatures }   from "./_components/DashboardRecentFeatures";
import { DashboardSubscription }     from "./_components/DashboardSubscription";
import type { Subscription }         from "@/types/api";
import type { AIConversation }       from "@/types/api/agent.types";
import type { EntrepriseStats }      from "@/types/api/stats.types";

export default function DashboardPage() {
  const router                    = useRouter();
  const { user }                  = useAuth();
  const { locale, dictionary: d } = useLanguage();
  const { theme }                 = useSector();

  const t = d.dashboard.pme;

  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState<EntrepriseStats | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [sub,           setSub]           = useState<Subscription | null>(null);

  // Suppression de la variable locale inutilisée
  void locale;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, convsRes, subRes] = await Promise.all([
        entrepriseStatsRepository.getStats(),
        // S64 FIX — agentRepository.listConversations (endpoint /api/v1/agent/conversations/)
        // l'ancien conversationsRepository pointait vers /api/v1/conversations/ (déprécié)
        agentRepository.listConversations({ mode: "live" }).catch(() => ({ results: [] as AIConversation[], count: 0, next: null, previous: null })),
        subscriptionsRepository.getMine().catch((): null => null),
      ]);
      setStats(statsRes);
      const convList = Array.isArray(convsRes)
        ? (convsRes as AIConversation[])
        : (convsRes as { results: AIConversation[] }).results ?? [];
      setConversations(convList.slice(0, 5));
      setSub(subRes);
    } catch {
      /* fail silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="border-[var(--border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  const featuresActives = stats?.features_actives ?? [];

  return (
    <div className="space-y-6 p-6">

      {/* ── Titre ── */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text)]">
          {t.welcome}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      {/* ── Actions rapides ── */}
      <DashboardQuickActions featuresActives={featuresActives} />

      {/* ── Hero KPIs ── */}
      <DashboardHeroKPIs stats={stats} />

      {/* ── Widgets sectoriels ── */}
      <DashboardSectorWidgets stats={stats} featuresActives={featuresActives} />

      {/* ── Graphique multi-features ── */}
      <DashboardFeaturesChart featuresActives={featuresActives} />

      {/* ── Grille principale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Conversations récentes — 2/3 */}
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
                  onClick={() => router.push("/conversations")}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                    style={{ background: theme?.primary ?? "var(--color-primary)" }}
                  >
                    {conv.contact?.nom?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                      {conv.contact?.nom ?? conv.contact?.phone ?? "—"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {conv.canal === "vocal" ? t.channel_voice : t.channel_whatsapp}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: conv.statut === "active"
                        ? "color-mix(in srgb, var(--color-primary) 15%, transparent)"
                        : "var(--bg)",
                      color: conv.statut === "active"
                        ? "var(--color-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {conv.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">
          <DashboardSubscription sub={sub} />
          <DashboardRecentFeatures featuresActives={featuresActives} />
        </div>
      </div>
    </div>
  );
}