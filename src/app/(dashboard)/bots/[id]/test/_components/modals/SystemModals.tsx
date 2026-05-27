"use client";
// src/app/(dashboard)/bots/[id]/test/_components/modals/SystemModals.tsx
// Modals système : Configuration IA (enrichie S55) et Vidéo Démo.

import React, { useState, useEffect } from "react";
import { Play }        from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner }     from "@/components/ui";
import { botsRepository } from "@/repositories";
import type { ChatbotConfig } from "@/types/api";
import type { BotPair }       from "../../../../_components/bots.types";
import { Overlay, ModalHeader } from "../_ui/modal-primitives";
import { BotConfigSections }    from "../../../../_components/tabs/_ui/BotConfigSections";

// ── ModalConfigIA ─────────────────────────────────────────────────────────────

interface ModalConfigIAProps {
  open:    boolean;
  onClose: () => void;
  config:  ChatbotConfig | null;
  pair:    BotPair;
  onSaved: (c: ChatbotConfig) => void;
}

export function ModalConfigIA({ open, onClose, config, pair, onSaved }: ModalConfigIAProps) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;

  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(config);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => { setChatbotConfig(config); }, [config?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || chatbotConfig) return;
    setLoading(true);
    botsRepository.getChatbot(pair.waBot.id)
      .then(setChatbotConfig)
      .catch(() => { /* silencieux */ })
      .finally(() => setLoading(false));
  }, [open, pair.waBot.id, chatbotConfig]);

  const handleIASaved = (c: ChatbotConfig) => { setChatbotConfig(c); onSaved(c); };

  return (
    <Overlay open={open} onClose={onClose} width="w-[520px]">
      <ModalHeader title={t.configReadonlyTitle} onClose={onClose} />

      <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
          </div>
        ) : (
          <BotConfigSections
            mode="edit"
            pair={pair}
            chatbotConfig={chatbotConfig}
            onBasicsSaved={onClose}
            onIASaved={handleIASaved}
          />
        )}
      </div>

      <div className="px-4 py-3 border-t border-[var(--border)] flex justify-end">
        <button onClick={onClose}
          className="text-[11px] px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
          ✕
        </button>
      </div>
    </Overlay>
  );
}

// ── ModalVideoDemo ────────────────────────────────────────────────────────────

export function ModalVideoDemo({ open, onClose, secteurNom }: {
  open:       boolean;
  onClose:    () => void;
  secteurNom?: string;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;

  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title={t.videoDemoTitle} onClose={onClose} />
      <div className="aspect-video bg-neutral-900 flex flex-col items-center justify-center gap-3 px-5">
        <Play className="w-10 h-10 text-white/30" />
        {secteurNom && (
          <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full">{secteurNom}</span>
        )}
        <p className="text-[11px] text-white/40 text-center leading-relaxed">
          {t.videoDemoPlaceholder}
        </p>
      </div>
      <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
        {t.videoDemoDescription}
      </div>
    </Overlay>
  );
}