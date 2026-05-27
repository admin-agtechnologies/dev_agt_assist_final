"use client";
// src/app/(dashboard)/bots/[id]/test/page.tsx
// S65 — header compact maquette S49 · resize drag · bouton retour intégré.

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MessageSquare, Mic, RotateCcw,
  Bot as BotIcon, Wifi, WifiOff, GripVertical,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast }    from "@/components/ui/Toast";
import { useSector }   from "@/hooks/useSector";
import { PageLoader }  from "@/components/ui";
import { cn }          from "@/lib/utils";
import { botsRepository, chatbotRepository } from "@/repositories";
import { featuresRepository, type ActiveFeature } from "@/repositories/features.repository";
import { WhatsAppSimulator } from "./_components/WhatsAppSimulator";
import { ConversationPanel } from "./_components/ConversationPanel";
import { VoiceDemoPlayer }   from "./_components/VoiceDemoPlayer";
import type { Bot, ChatbotConfig } from "@/types/api";
import type { BotPair }            from "../../_components/bots.types";
import type { AIConversation }     from "@/types/api/agent.types";
import { useAuth } from "@/contexts/AuthContext";

// ── Constantes ────────────────────────────────────────────────────────────────

type Canal = "whatsapp" | "vocal";

const VOICE_DEMO_URL =
  "https://api.salma.agtgroupholding.com/media/seed/bourses/demo_test.mp4";

/** Largeur min/max du panel droit en px */
const PANEL_MIN = 280;
const PANEL_MAX = 560;
const PANEL_DEFAULT = 360;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BotTestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const botId  = params.id;
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const toast = useToast();
  const { user }  = useAuth();
  const { theme } = useSector();

  // ── État global ───────────────────────────────────────────────────────────
  const [bot,            setBot]            = useState<Bot | null>(null);
  const [config,         setConfig]         = useState<ChatbotConfig | null>(null);
  const [activeFeatures, setActiveFeatures] = useState<ActiveFeature[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [canal,          setCanal]          = useState<Canal>("whatsapp");
  const [resetKey,       setResetKey]       = useState(0);
  const [conversation,   setConversation]   = useState<AIConversation | null>(null);
  const [sessionToLoad,  setSessionToLoad]  = useState<AIConversation | null>(null);
  const prevSessionIdRef = useRef<string | null>(null);

  // ── Resize ────────────────────────────────────────────────────────────────
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const isDragging   = useRef(false);
  const dragStartX   = useRef(0);
  const dragStartW   = useRef(PANEL_DEFAULT);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current  = true;
    dragStartX.current  = e.clientX;
    dragStartW.current  = panelWidth;
    document.body.style.cursor    = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // On tire vers la gauche → panel s'agrandit
      const delta = dragStartX.current - e.clientX;
      const next  = Math.min(PANEL_MAX, Math.max(PANEL_MIN, dragStartW.current + delta));
      setPanelWidth(next);
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor    = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ── Chargement initial ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [botData, configData, featuresData] = await Promise.all([
        botsRepository.getById(botId),
        chatbotRepository.getChatbotConfig(botId),
        featuresRepository.getActive(),
      ]);
      setBot(botData);
      setConfig(configData);
      setActiveFeatures(featuresData.features);
    } catch {
      toast.error(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [botId, t.errorLoad, toast]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setResetKey(k => k + 1);
    setConversation(null);
    setSessionToLoad(null);
    prevSessionIdRef.current = null;
  };

  const handleLoadSession = useCallback((conv: AIConversation) => {
    if (prevSessionIdRef.current === conv.id) return;
    prevSessionIdRef.current = conv.id;
    setSessionToLoad(conv);
    setConversation(conv);
    setResetKey(k => k + 1);
  }, []);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader />;
  if (!bot)    return null;

  const isOnline = bot.statut === "actif";
  const pair: BotPair = { waBot: bot, voiceBot: null };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Card unifiée pleine hauteur ── */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}
      >

        {/* ── Simulateur gauche ── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--border)]">

          {/* Header compact maquette S49 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] flex-wrap gap-2">

            {/* Gauche : retour + avatar + nom */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <BotIcon className="w-4 h-4" style={{ color: theme.primary }} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--text)] leading-tight">{bot.nom}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.testSubtitle}</p>
              </div>
            </div>

            {/* Droite : statut + canaux + reset */}
            <div className="flex items-center gap-1.5 flex-wrap">

              {/* Pill statut */}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0",
                isOnline
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                  : "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]",
              )}>
                {isOnline
                  ? <><Wifi    className="w-2.5 h-2.5" />{t.testPublishedBadge}</>
                  : <><WifiOff className="w-2.5 h-2.5" />{t.testUnpublishedBadge}</>}
              </span>

              {/* WhatsApp */}
              <button
                onClick={() => setCanal("whatsapp")}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors font-medium flex-shrink-0",
                  canal === "whatsapp"
                    ? "text-white"
                    : "text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={canal === "whatsapp" ? { backgroundColor: theme.primary } : undefined}
              >
                <MessageSquare className="w-3 h-3" /> WhatsApp
              </button>

              {/* Assistant Vocal */}
              <button
                onClick={() => setCanal("vocal")}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors font-medium flex-shrink-0",
                  canal === "vocal"
                    ? "text-white"
                    : "text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={canal === "vocal" ? { backgroundColor: theme.primary } : undefined}
              >
                <Mic className="w-3 h-3" /> {t.testVoiceTitle}
              </button>

              {/* Réinitialiser */}
              <button
                onClick={handleReset}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors font-medium flex-shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> {t.testResetSession}
              </button>
            </div>
          </div>

          {/* Contenu simulateur */}
          {canal === "whatsapp" ? (
            <WhatsAppSimulator
              key={resetKey}
              botNom={bot.nom}
              botId={botId}
              sectorSlug={user?.entreprise?.secteur?.slug ?? undefined}
              sectorNom={user?.entreprise?.secteur?.label_fr ?? undefined}
              activeFeatures={activeFeatures}
              initialSession={sessionToLoad}
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

        {/* ── Barre de drag resize ── */}
        <div
          onMouseDown={onDragStart}
          className="w-1.5 flex-shrink-0 flex items-center justify-center cursor-col-resize group relative hover:bg-[var(--border)] transition-colors"
          title="Redimensionner"
        >
          <GripVertical className="w-3 h-3 text-[var(--border)] group-hover:text-[var(--text-muted)] transition-colors absolute" />
        </div>

        {/* ── Panel droit — largeur dynamique ── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: panelWidth }}
        >
          <ConversationPanel
            conversation={conversation}
            pair={pair}
            config={config}
            onConfigSaved={(c: ChatbotConfig) => setConfig(c)}
            onLoadSession={handleLoadSession}
          />
        </div>
      </div>
    </div>
  );
}