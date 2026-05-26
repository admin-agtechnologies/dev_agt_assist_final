"use client";
// src/app/(dashboard)/bots/_components/tabs/BotConfigTab.tsx
// Tab Configuration du bot — orchestre BotConfigSections en mode edit.
// Charge aussi la config Chatbot (system_prompt, temperature, max_tokens).

import { useState, useEffect } from "react";
import { Spinner }         from "@/components/ui";
import { useLanguage }     from "@/contexts/LanguageContext";
import { botsRepository }  from "@/repositories";
import type { BotPair }    from "../bots.types";
import type { ChatbotConfig } from "@/types/api";
import { BotConfigSections } from "./_ui/BotConfigSections";

interface BotConfigTabProps {
  pair:      BotPair;
  onRefresh: () => void;
}

export function BotConfigTab({ pair, onRefresh }: BotConfigTabProps) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;

  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [loadingIA,     setLoadingIA]     = useState(true);

  // Charger la config Chatbot au montage
  useEffect(() => {
    let cancelled = false;
    setLoadingIA(true);
    botsRepository.getChatbot(pair.waBot.id)
      .then((c) => { if (!cancelled) setChatbotConfig(c); })
      .catch(() => { /* silencieux — config IA optionnelle */ })
      .finally(() => { if (!cancelled) setLoadingIA(false); });
    return () => { cancelled = true; };
  }, [pair.waBot.id]);

  if (loadingIA) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-1 pb-4">
      <BotConfigSections
        mode="edit"
        pair={pair}
        chatbotConfig={chatbotConfig}
        onBasicsSaved={onRefresh}
        onIASaved={(c) => setChatbotConfig(c)}
      />
    </div>
  );
}