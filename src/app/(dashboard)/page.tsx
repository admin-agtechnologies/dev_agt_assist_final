// src/app/(dashboard)/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { SectorNav } from "@/components/sector/SectorNav";
import { SectorBadge } from "@/components/sector/SectorBadge";
import { dashboard as dashFr } from "@/dictionaries/fr/dashboard.fr";
import { dashboard as dashEn } from "@/dictionaries/en/dashboard.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import { MessageSquare, Bot, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  primaryColor: string;
}

function StatCard({ label, value, icon, primaryColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { theme } = useSector();
  const { features, isLoading } = useActiveFeatures();

  const d = lang === "fr" ? dashFr : dashEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const activeCount = features.filter((f) => f.is_active).length;
  const entrepriseName = user?.entreprise?.name ?? user?.name ?? "";

  return (
    <div className="space-y-8">

      {/* En-tête de bienvenue */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{d.welcome},</p>
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {entrepriseName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{d.subtitle}</p>
        </div>
        <SectorBadge size="md" />
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={d.activeConversations}
          value="—"
          primaryColor={theme.primary}
          icon={<MessageSquare size={18} style={{ color: theme.primary }} />}
        />
        <StatCard
          label={d.messagesToday}
          value="—"
          primaryColor={theme.primary}
          icon={<Bot size={18} style={{ color: theme.primary }} />}
        />
        <StatCard
          label={c.active}
          value={isLoading ? "…" : activeCount}
          primaryColor={theme.accent}
          icon={<Zap size={18} style={{ color: theme.accent }} />}
        />
      </div>

      {/* Modules actifs — SectorNav */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: theme.primary }}
          >
            {d.quickLinks}
          </h2>
          <Link
            href="/settings"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {c.settings}
            <ArrowRight size={12} />
          </Link>
        </div>
        <SectorNav />
      </section>

      {/* Conversations récentes — placeholder jusqu'à module 1.2 */}
      <section>
        <h2
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{ color: theme.primary }}
        >
          {d.recentConversations}
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <MessageSquare
            size={32}
            className="mx-auto mb-3"
            style={{ color: `${theme.primary}40` }}
          />
          <p className="text-sm text-gray-400">{d.noConversations}</p>
          <Link
            href="/conversations"
            className="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-colors hover:underline"
            style={{ color: theme.primary }}
          >
            {d.recentConversations}
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

    </div>
  );
}