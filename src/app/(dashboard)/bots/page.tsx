// src/app/(dashboard)/bots/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { botsRepository } from "@/repositories";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { bots as botsFr } from "@/dictionaries/fr/bots.fr";
import { bots as botsEn } from "@/dictionaries/en/bots.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import type { Bot } from "@/types/api";
import type { StatusVariant } from "@/components/ui/StatusBadge";
import { Bot as BotIcon, Phone, MessageSquare } from "lucide-react";

const STATUT_VARIANT: Record<string, StatusVariant> = {
  actif:    "actif",
  en_pause: "en_pause",
  archive:  "archive",
};

function BotCard({
  bot,
  labels,
}: {
  bot: Bot;
  labels: {
    statusActive: string;
    statusPaused: string;
    statusArchived: string;
  };
}) {
  const statusLabel =
    bot.statut === "actif"
      ? labels.statusActive
      : bot.statut === "en_pause"
      ? labels.statusPaused
      : labels.statusArchived;

  const TypeIcon = bot.bot_type === "vocal" ? Phone : MessageSquare;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--color-primary)", opacity: 0.9 }}
          >
            <TypeIcon size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {bot.nom}
            </p>
            <p className="text-xs text-gray-400 capitalize">{bot.bot_type}</p>
          </div>
        </div>
        <StatusBadge
          variant={STATUT_VARIANT[bot.statut] ?? "info"}
          label={statusLabel}
          size="xs"
        />
      </div>

      {bot.message_accueil && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {bot.message_accueil}
        </p>
      )}

      {bot.numero_value && (
        <p className="text-xs text-gray-400">{bot.numero_value}</p>
      )}
    </div>
  );
}

export default function BotsPage() {
  const { lang } = useLanguage();
  const { theme } = useSector();

  const d = lang === "fr" ? botsFr : botsEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    botsRepository
      .getList()
      .then((res) => setBots(res.results))
      .catch(() => setBots([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={d.title}
        subtitle={d.subtitle}
        badge={
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
          >
            {bots.length}
          </span>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BotIcon size={40} style={{ color: `${theme.primary}40` }} />
          <p className="text-sm text-gray-400">{d.noData}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} labels={d} />
          ))}
        </div>
      )}
    </div>
  );
}