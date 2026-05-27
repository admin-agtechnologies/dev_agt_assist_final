"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/_sections/SectionReadonly.tsx
// Vue lecture seule des 5 sections — utilisée dans ConversationPanel accordéon 3.

import { useLanguage }  from "@/contexts/LanguageContext";
import { Badge }        from "@/components/ui";
import { TON_OPTIONS, LANGUES_OPTIONS, SECTIONS_KB } from "../../bot-config.constants";
import type { Bot, ChatbotConfig } from "@/types/api";

interface Props {
  bot:           Bot;
  chatbotConfig: ChatbotConfig | null;
}

export function SectionReadonly({ bot, chatbotConfig }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;

  return (
    <div className="space-y-1.5 text-[12px]">
      <Row label={t.configBotName}
        value={bot.nom} />
      <Row label={t.configTone}
        value={TON_OPTIONS.find((o) => o.value === bot.ton)?.label ?? (bot.ton ?? "—")} />
      {bot.signature && (
        <Row label={t.configSignature} value={bot.signature} />
      )}
      {(bot.langues ?? []).length > 0 && (
        <Row label={t.configLangues}
          value={(bot.langues ?? [])
            .map((l: string) => LANGUES_OPTIONS.find((o) => o.value === l)?.label ?? l)
            .join(", ")} />
      )}

      {chatbotConfig && (
        <>
          <div className="border-t border-[var(--border)] pt-2 mt-2" />
          <div className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)] shrink-0">{t.configIAStatus}</span>
            <Badge variant={chatbotConfig.is_deployed ? "green" : "slate"}>
              {chatbotConfig.is_deployed ? t.testPublishedBadge : t.testUnpublishedBadge}
            </Badge>
          </div>
          <Row label={t.configIATemperature} value={String(chatbotConfig.temperature)} />
          <Row label={t.configIATokens}      value={chatbotConfig.max_tokens.toLocaleString()} />
          {chatbotConfig.system_prompt && (
            <div className="pt-1">
              <span className="text-[var(--text-muted)] block mb-0.5">{t.configIAReadonlyPrompt}</span>
              <p className="text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-2 leading-relaxed line-clamp-3">
                {chatbotConfig.system_prompt}
              </p>
            </div>
          )}
        </>
      )}

      {(bot.sections_actives ?? []).length > 0 && (
        <>
          <div className="border-t border-[var(--border)] pt-2 mt-2" />
          <Row label={t.configSections}
            value={SECTIONS_KB
              .filter((s) => (bot.sections_actives ?? []).includes(s.key))
              .map((s) => s.label)
              .join(", ")} />
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="font-medium text-[var(--text)] text-right truncate">{value}</span>
    </div>
  );
}