"use client";
// src/app/(dashboard)/bots/[id]/test/_components/modals/SystemModals.tsx
// Modals système : Configuration IA et Vidéo Démo.
// Cycle de vie distinct des modals métier — déclenchés par l'interface, pas par l'agent.

import React from "react";
import { Play } from "lucide-react";
import type { ChatbotConfig, UpdateChatbotConfigPayload } from "@/types/api";
import { Overlay, ModalHeader } from "../_ui/modal-primitives";

// ── ModalConfigIA ─────────────────────────────────────────────────────────────

interface ModalConfigIAProps {
  open: boolean;
  onClose: () => void;
  config: ChatbotConfig | null;
  botId: string;
  onSaved: (c: ChatbotConfig) => void;
}

export function ModalConfigIA({ open, onClose, config, botId, onSaved }: ModalConfigIAProps) {
  const [prompt, setPrompt] = React.useState(config?.system_prompt ?? "");
  const [temp,   setTemp]   = React.useState(config?.temperature   ?? 0.7);
  const [tokens, setTokens] = React.useState(config?.max_tokens    ?? 1000);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (config) {
      setPrompt(config.system_prompt);
      setTemp(config.temperature);
      setTokens(config.max_tokens);
    }
  }, [config?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true);
    try {
      const { chatbotRepository } = await import("@/repositories");
      const payload: UpdateChatbotConfigPayload = {
        system_prompt: prompt,
        temperature:   temp,
        max_tokens:    tokens,
      };
      const updated = await chatbotRepository.updateChatbotConfig(botId, payload);
      onSaved(updated);
      onClose();
    } catch { /* toast géré par l'appelant */ }
    finally { setSaving(false); }
  };

  return (
    <Overlay open={open} onClose={onClose} width="w-[420px]">
      <ModalHeader title="Configuration du bot" onClose={onClose} />
      <div className="px-4 py-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Prompt système
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            className="w-full resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[12px] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>
        <details className="group">
          <summary className="text-[11px] text-[var(--text-muted)] cursor-pointer list-none flex items-center gap-1.5 hover:text-[var(--text)] transition-colors select-none">
            <span className="transition-transform group-open:rotate-90 inline-block">›</span>
            Paramètres avancés (température, tokens)
          </summary>
          <div className="mt-3 space-y-3 pl-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Température
                </label>
                <span className="text-[11px] font-bold text-[var(--color-primary)]">{temp.toFixed(1)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.1} value={temp}
                onChange={e => setTemp(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
                <span>0 = déterministe</span><span>1 = créatif</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Tokens max
              </label>
              <input type="number" min={100} max={4000} step={100} value={tokens}
                onChange={e => setTokens(parseInt(e.target.value, 10))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[12px] text-[var(--text)] focus:outline-none" />
            </div>
          </div>
        </details>
      </div>
      <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={() => {
            onClose();
            window.location.href = window.location.href.replace("/test", "/configuration");
          }}
          className="text-[11px] text-[var(--color-primary)] flex items-center gap-1.5 hover:underline"
        >
          ← Retourner à la configuration du bot
        </button>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="text-[11px] px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
            Annuler
          </button>
          <button onClick={() => void save()} disabled={saving}
            className="text-[11px] px-3 py-1.5 rounded-lg btn-primary disabled:opacity-50">
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── ModalVideoDemo ────────────────────────────────────────────────────────────

export function ModalVideoDemo({ open, onClose, secteurNom }: {
  open: boolean;
  onClose: () => void;
  secteurNom?: string;
}) {
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Démo — Assistant Vocal AGT" onClose={onClose} />
      <div className="aspect-video bg-neutral-900 flex flex-col items-center justify-center gap-3 px-5">
        <Play className="w-10 h-10 text-white/30" />
        {secteurNom && (
          <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full">{secteurNom}</span>
        )}
        <p className="text-[11px] text-white/40 text-center leading-relaxed">
          Vidéo de démo adaptée à votre secteur<br />chargée dynamiquement
        </p>
      </div>
      <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
        L&apos;assistant vocal AGT s&apos;adapte à votre secteur, votre catalogue et votre langue.
        Disponible prochainement.
      </div>
    </Overlay>
  );
}