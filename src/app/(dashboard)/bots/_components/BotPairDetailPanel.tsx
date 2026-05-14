"use client";
import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Phone, CalendarDays, BarChart3,
  Settings, ArrowRightLeft, MessageCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { conversationsRepository, rendezVousRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import type { Conversation, RendezVous } from "@/types/api";

import { type BotPair, type DetailTab } from "./bots.types";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { AgendaTab }        from "./tabs/AgendaTab";
import { StatsTab }         from "./tabs/StatsTab";
import { BotConfigTab }     from "./tabs/BotConfigTab";
import { WhatsAppPanel }    from "./whatsapp/WhatsAppPanel";

interface BotPairDetailPanelProps {
  pair: BotPair;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}

export function BotPairDetailPanel({ pair, d, colors, onRefresh }: BotPairDetailPanelProps) {
  const t = d.bots;
  const toast = useToast();
  const [activeTab, setActiveTab]         = useState<DetailTab>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments]   = useState<RendezVous[]>([]);
  const [loadingData, setLoadingData]     = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const botIds = [pair.waBot.id, pair.voiceBot?.id].filter(Boolean) as string[];
      const [convRes, aptRes] = await Promise.all([
        conversationsRepository.getList().catch(() => ({ results: [] })),
        rendezVousRepository.getList().catch(() => ({ results: [] })),
      ]);
      setConversations(convRes.results.filter((c: Conversation) => botIds.includes(c.bot)));
      setAppointments(aptRes.results);
    } catch {
      toast.error(d.common.error);
    } finally {
      setLoadingData(false);
    }
  }, [pair.waBot.id, pair.voiceBot?.id, d.common.error, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalMessages = conversations.reduce((acc, c) => acc + c.nb_messages, 0);
  const totalCalls    = conversations.filter(c => c.bot_type === "vocal").length;
  const totalRdv      = conversations.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0);
  const totalHandoffs = conversations.filter(c => c.human_handoff).length;
  const totalEmails   = conversations.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0);

  const authorizedSlugs = pair.waBot.features_autorisees_slugs ?? [];
  const hasFeature = (slug: string) =>
    authorizedSlugs.length === 0 || authorizedSlugs.includes(slug);

  const kpiCards = [
    { show: true,                      label: t.statsMessages,     value: totalMessages, icon: MessageSquare,  color: "#25D366" },
    { show: !!pair.voiceBot,           label: t.statsCalls,        value: totalCalls,    icon: Phone,          color: "#6C3CE1" },
    { show: hasFeature("rendez_vous"), label: t.statsAppointments, value: totalRdv,      icon: CalendarDays,   color: "#F59E0B" },
    { show: true,                      label: "Transferts",        value: totalHandoffs, icon: ArrowRightLeft, color: "#EF4444" },
    { show: true,                      label: "Emails",            value: totalEmails,   icon: MessageSquare,  color: "#0EA5E9" },
  ].filter(k => k.show);

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "configuration", label: "Configuration",   icon: Settings },
    { id: "conversations", label: t.conversationsTab, icon: MessageSquare },
    { id: "agenda",        label: t.agendaTab,        icon: CalendarDays },
    { id: "stats",         label: t.statsTab,         icon: BarChart3 },
    { id: "whatsapp",      label: (d.bots as unknown as Record<string, string>).whatsappTab ?? "WhatsApp", icon: MessageCircle },
  ];

  return (
    <div className="border-t border-[var(--border)] animate-fade-in">

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="flex gap-2 flex-wrap">
          {kpiCards.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 flex-1 min-w-[120px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] px-4 py-3"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}18` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-black text-[var(--text)] leading-none">{stat.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-1 leading-tight">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nav onglets ── */}
      <div className="flex gap-1 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg)] overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-card)]",
              )}
              style={activeTab === tab.id ? { backgroundColor: colors.primary } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Zone scrollable : la sidebar reste fixe ── */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
        <div className="p-5">
          {loadingData ? (
            <div className="flex justify-center py-8">
              <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
            </div>
          ) : (
            <>
              {activeTab === "configuration" && (
                <BotConfigTab pair={pair} colors={colors} onRefresh={onRefresh} />
              )}
              {activeTab === "conversations" && (
                <ConversationsTab conversations={conversations} d={d} colors={colors} />
              )}
              {activeTab === "agenda" && (
                <AgendaTab appointments={appointments} d={d} />
              )}
              {activeTab === "stats" && (
                <StatsTab conversations={conversations} d={d} />
              )}
              {activeTab === "whatsapp" && (
                <div className="max-w-2xl mx-auto">
                  <WhatsAppPanel botId={pair.waBot.id} isBotPublished={pair.waBot.statut === "actif"} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}