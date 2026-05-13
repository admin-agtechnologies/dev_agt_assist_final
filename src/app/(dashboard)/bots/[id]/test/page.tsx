"use client";
// src/app/(dashboard)/bots/[id]/test/page.tsx
// Page de test bot — branchée sur le nouvel agent IA (session 14 — Bloc C)
// Ancienne version chatbot_bridge remplacée par /api/v1/agent/conversations/message/

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MessageSquare, Phone, RotateCcw,
  Bot as BotIcon, Wifi, WifiOff,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Badge, PageLoader } from "@/components/ui";
import { cn } from "@/lib/utils";
import { botsRepository, chatbotRepository } from "@/repositories";
import { WhatsAppSimulator } from "./_components/WhatsAppSimulator";
import { ConversationPanel } from "./_components/ConversationPanel";
import { VoiceDemoPlayer } from "./_components/VoiceDemoPlayer";
import type { Bot, ChatbotConfig } from "@/types/api";
import type { AIConversation } from "@/types/api/agent.types";

// ── Constantes ────────────────────────────────────────────────────────────────

type Canal = "whatsapp" | "vocal";

/**
 * URL de la vidéo de démonstration de l'agent vocal.
 * Anciennement en commentaire dans page.tsx, maintenant constant nommé.
 */
const VOICE_DEMO_URL =
  "https://api.salma.agtgroupholding.com/media/seed/bourses/demo_test.mp4";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function BotTestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const botId = params.id;
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  // ── État global ───────────────────────────────────────────────────────────
  const [bot, setBot]               = useState<Bot | null>(null);
  const [config, setConfig]         = useState<ChatbotConfig | null>(null);
  const [loading, setLoading]       = useState(true);
  const [canal, setCanal]           = useState<Canal>("whatsapp");
  const [resetKey, setResetKey]     = useState(0);
  const [conversation, setConversation] = useState<AIConversation | null>(null);

  // ── Chargement initial ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [botData, configData] = await Promise.all([
        botsRepository.getById(botId),
        chatbotRepository.getChatbotConfig(botId),
      ]);
      setBot(botData);
      setConfig(configData);
    } catch {
      toast.error(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [botId, t.errorLoad, toast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Réinitialisation ──────────────────────────────────────────────────────
  const handleReset = () => {
    setResetKey(k => k + 1);
    setConversation(null);
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader />;
  if (!bot) return null;

  const isOnline = bot.statut === "actif";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
        </button>

        <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
          <BotIcon className="w-5 h-5 text-[#25D366]" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[var(--text)] truncate">{bot.nom}</h1>
          <p className="text-xs text-[var(--text-muted)]">{t.testSubtitle}</p>
        </div>

        <Badge variant={isOnline ? "green" : "slate"}>
          {isOnline
            ? <><Wifi className="w-3 h-3 mr-1" />{t.testPublishedBadge}</>
            : <><WifiOff className="w-3 h-3 mr-1" />{t.testUnpublishedBadge}</>}
        </Badge>

        {/* Switch canal */}
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          {(["whatsapp", "vocal"] as Canal[]).map(c => (
            <button
              key={c}
              onClick={() => setCanal(c)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors",
                canal === c
                  ? c === "whatsapp" ? "bg-[#25D366] text-white" : "bg-[#6C3CE1] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {c === "whatsapp"
                ? <><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</>
                : <><Phone className="w-3.5 h-3.5" /> {t.testVoiceTitle}</>}
            </button>
          ))}
        </div>

        {/* Reset session */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {t.testResetSession}
        </button>
      </div>

      {/* ── Corps principal ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">

        {/* Simulateur (3/5) */}
        <div className="lg:col-span-3 flex flex-col card overflow-hidden">
          {canal === "whatsapp" ? (
            <WhatsAppSimulator
              key={resetKey}
              botNom={bot.nom}
              onConversationUpdate={setConversation}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <VoiceDemoPlayer
                videoSrc={VOICE_DEMO_URL}
                onCallStart={() => {}}
                onCallEnd={() => {}}
                onLineAppear={() => {}}
              />
            </div>
          )}
        </div>

        {/* Panneau droit (2/5) */}
        <div className="lg:col-span-2">
          <ConversationPanel
            conversation={conversation}
            botId={botId}
            config={config}
            onConfigSaved={setConfig}
          />
        </div>
      </div>
    </div>
  );
}