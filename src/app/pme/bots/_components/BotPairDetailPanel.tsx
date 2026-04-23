// src/app/pme/bots/_components/BotPairDetailPanel.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Phone, CalendarDays, BarChart3, Settings,
  ArrowRightLeft,
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { conversationsRepository, rendezVousRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import type { Conversation, RendezVous } from "@/types/api";

import { type BotPair, type DetailTab } from "./bots.types";
import { ConversationsTab }  from "./tabs/ConversationsTab";
import { AgendaTab }         from "./tabs/AgendaTab";
import { StatsTab }          from "./tabs/StatsTab";
import { BotSettingsPanel }  from "./tabs/BotSettingsPanel";

// ── Props ─────────────────────────────────────────────────────────────────────
interface BotPairDetailPanelProps {
  pair: BotPair;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

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
        conversationsRepository.getList(),
        rendezVousRepository.getList(),
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

  // ── Stats KPI ─────────────────────────────────────────────────────────────
  const waConvs       = conversations.filter(c => c.bot_type === "whatsapp");
  const voiceConvs    = conversations.filter(c => c.bot_type === "vocal");
  const totalMessages = conversations.reduce((acc, c) => acc + c.nb_messages, 0);
  const totalCalls    = voiceConvs.length;
  const totalRdv      = conversations.filter(c => c.rapport?.rdv_planifies && c.rapport.rdv_planifies > 0).length;
  const totalHandoffs = conversations.filter(c => c.human_handoff).length;

  // ── Onglets ───────────────────────────────────────────────────────────────
  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "conversations", label: t.conversationsTab, icon: MessageSquare },
    { id: "agenda",        label: t.agendaTab,        icon: CalendarDays  },
    { id: "stats",         label: t.statsTab,         icon: BarChart3     },
    {
      id: "settings",
      label: (d.bots as unknown as Record<string, string>).settingsTab ?? "Paramètres",
      icon: Settings,
    },
  ];

  return (
    <div className="border-t border-[var(--border)] animate-fade-in">
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-b border-[var(--border)]">
        {[
          { label: t.statsMessages,      value: totalMessages, icon: MessageSquare,  color: "#25D366" },
          { label: t.statsCalls,         value: totalCalls,    icon: Phone,          color: "#6C3CE1" },
          { label: t.statsAppointments,  value: totalRdv,      icon: CalendarDays,   color: "#F59E0B" },
          { label: "Transferts humains", value: totalHandoffs, icon: ArrowRightLeft, color: "#EF4444" },
          { label: "Emails envoyés",     value: 128,           icon: MessageSquare,  color: "#0EA5E9" },
        ].map((stat, i) => (
          <div key={i} className={cn("px-4 py-3 flex items-center gap-3", i < 4 && "border-r border-[var(--border)]")}>
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

      {/* ── Nav onglets ── */}
      <div className="flex gap-1 p-3 border-b border-[var(--border)] bg-[var(--bg)] overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id ? "text-white" : "text-[var(--text-muted)] hover:bg-[var(--bg-card)]",
              )}
              style={activeTab === tab.id ? { backgroundColor: colors.primary } : {}}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenu onglet ── */}
      <div className="p-5">
        {loadingData ? (
          <div className="flex justify-center py-8">
            <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
          </div>
        ) : (
          <>
            {activeTab === "conversations" && (
              <ConversationsTab conversations={conversations} d={d} colors={colors} />
            )}
            {activeTab === "agenda" && (
              <AgendaTab appointments={appointments} d={d} />
            )}
            {activeTab === "stats" && (
              <StatsTab conversations={conversations} d={d} />
            )}
            {activeTab === "settings" && (
              <BotSettingsPanel pair={pair} d={d} colors={colors} onRefresh={onRefresh} />
            )}
          </>
        )}
      </div>
    </div>
  );
}