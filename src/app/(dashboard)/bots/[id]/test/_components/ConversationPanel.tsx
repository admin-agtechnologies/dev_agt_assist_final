"use client";
// src/app/(dashboard)/bots/[id]/test/_components/ConversationPanel.tsx
// Panneau droit : contexte agent, actions exécutées, config IA.

import { useState, useCallback, useEffect } from "react";
import {
  User, Phone, Mail, Zap, AlertTriangle,
  ChevronDown, ChevronUp, Save, Loader2, MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatbotRepository } from "@/repositories";
import type { ChatbotConfig, UpdateChatbotConfigPayload } from "@/types/api";
import type { AIConversation } from "@/types/api/agent.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  conversation: AIConversation | null;
  botId: string;
  config: ChatbotConfig | null;
  onConfigSaved: (c: ChatbotConfig) => void;
}

type ConvStatut = AIConversation["statut"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: ConvStatut }) {
  const map: Record<ConvStatut, { label: string; variant: "green" | "slate" | "amber" }> = {
    active:     { label: "Active",      variant: "green" },
    terminee:   { label: "Terminée",   variant: "slate" },
    transferee: { label: "Transférée", variant: "amber" },
  };
  const s = map[statut] ?? { label: statut, variant: "slate" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

export function ConversationPanel({ conversation, botId, config, onConfigSaved }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  // ── Config IA ──────────────────────────────────────────────────────────────
  const [configOpen, setConfigOpen] = useState(false);
  const [prompt, setPrompt]   = useState("");
  const [temp, setTemp]       = useState(0.3);
  const [tokens, setTokens]   = useState(1000);
  const [saving, setSaving]   = useState(false);

  // Initialisation depuis les props config (chargé de manière asynchrone)
  useEffect(() => {
    if (config) {
      setPrompt(config.system_prompt);
      setTemp(config.temperature);
      setTokens(config.max_tokens);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.id]); // Seulement quand l'id change (premier chargement)

  const saveConfig = useCallback(async () => {
    setSaving(true);
    try {
      const payload: UpdateChatbotConfigPayload = {
        system_prompt: prompt,
        temperature:   temp,
        max_tokens:    tokens,
      };
      const updated = await chatbotRepository.updateChatbotConfig(botId, payload);
      onConfigSaved(updated);
      toast.success(t.testConfigSaved);
    } catch {
      toast.error(t.testConfigError);
    } finally {
      setSaving(false);
    }
  }, [botId, prompt, temp, tokens, onConfigSaved, t, toast]);

  // ── Données de la conversation ────────────────────────────────────────────
  const contexte = conversation?.contexte ?? {};
  const contact  = (contexte.contact ?? {}) as Record<string, string>;
  const statusMessages = (conversation?.messages ?? []).filter(m => m.role === "status");
  const hasTransfer    = conversation?.statut === "transferee";

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[700px] pr-1">

      {/* ── Contexte agent ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            {t.testCollectedData}
          </p>
          {conversation && <StatutBadge statut={conversation.statut} />}
        </div>

        {!conversation ? (
          <p className="text-xs text-[var(--text-muted)] italic">{t.testSessionsEmpty}</p>
        ) : (
          <div className="space-y-2">
            {contact.nom && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-sm font-semibold text-[var(--text)]">{contact.nom}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text)]">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text)]">{contact.email}</span>
              </div>
            )}
            {!contact.nom && !contact.phone && !contact.email && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Aucune donnée collectée pour l'instant.
              </p>
            )}
          </div>
        )}

        {/* Actions exécutées (messages status) */}
        {statusMessages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
              {t.testActionsExecuted ?? "Actions exécutées"}
            </p>
            {statusMessages.map(m => (
              <div key={m.id} className="flex items-start gap-1.5">
                <MessageCircle className="w-3 h-3 text-[#25D366] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-muted)] italic leading-snug">
                  {m.contenu}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Alerte transfert humain */}
        {hasTransfer && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
              {t.testHandoffAlert}
            </p>
          </div>
        )}
      </div>

      {/* ── Config IA (accordéon) ── */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setConfigOpen(v => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#075E54]" />
            <span className="text-sm font-bold text-[var(--text)]">{t.testConfigTitle}</span>
            {config && (
              <Badge variant={config.is_deployed ? "green" : "slate"}>
                {config.is_deployed ? t.testPublishedBadge : t.testUnpublishedBadge}
              </Badge>
            )}
          </div>
          {configOpen
            ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
            : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
        </button>

        {configOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)]">
            {/* System prompt */}
            <div className="space-y-1 pt-4">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                {t.testConfigPrompt}
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={5}
                className="w-full resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#075E54]/40"
              />
            </div>
            {/* Température */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  {t.testConfigTemperature}
                </label>
                <span className="text-xs font-bold text-[#075E54]">{temp.toFixed(1)}</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.1} value={temp}
                onChange={e => setTemp(parseFloat(e.target.value))}
                className="w-full accent-[#075E54]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0.0</span><span>1.0</span>
              </div>
            </div>
            {/* Max tokens */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                {t.testConfigMaxTokens}
              </label>
              <input
                type="number" min={100} max={4000} step={100} value={tokens}
                onChange={e => setTokens(parseInt(e.target.value, 10))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#075E54]/40"
              />
            </div>
            <button
              onClick={() => void saveConfig()}
              disabled={saving}
              className="w-full btn-primary text-sm disabled:opacity-50"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                : <><Save className="w-4 h-4" /> {t.testConfigSave}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}