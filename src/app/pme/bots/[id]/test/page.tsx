// "https://api.salma.agtgroupholding.com/media/seed/bourses/demo_test.mp4"
"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
  useMemo,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Send,
  Bot as BotIcon,
  RotateCcw,
  User,
  Zap,
  AlertTriangle,
  Mail,
  Calendar,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Clock,
  Wifi,
  WifiOff,
  MapPin,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Badge, PageLoader } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";
import { botsRepository, chatbotRepository } from "@/repositories";
import {
  VoiceDemoPlayer,
  type TranscriptLine,
} from "./_components/VoiceDemoPlayer";
import type {
  Bot,
  ChatMessage,
  ChatTestCanal,
  ChatbotTestResponse,
  ChatbotConfig,
  CollectedData,
  ChatAction,
  TestSessionSummary,
  UpdateChatbotConfigPayload,
} from "@/types/api";

// ── Types locaux ──────────────────────────────────────────────────────────────

/** Message affiché dans le simulateur de chat. */
interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: ChatAction[];
  intentions?: string[];
  tokens?: number;
  isTyping?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function actionIcon(type: ChatAction["type"]) {
  switch (type) {
    case "create_client":
      return <UserCheck className="w-3.5 h-3.5 text-[#25D366]" />;
    case "create_appointment":
      return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
    case "send_email":
      return <Mail className="w-3.5 h-3.5 text-[#6C3CE1]" />;
    case "human_handoff":
      return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
  }
}

function actionLabel(
  type: ChatAction["type"],
  d: ReturnType<typeof useLanguage>["dictionary"],
): string {
  const map: Record<ChatAction["type"], string> = {
    create_client: d.bots.actionTypes.contact_collected,
    create_appointment: d.bots.actionTypes.appointment,
    send_email: d.bots.actionTypes.faq,
    human_handoff: d.bots.actionTypes.handoff,
  };
  return map[type] ?? type;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function BotTestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const botId = params.id;
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();
  const [, startTransition] = useTransition();

  // ── État global ────────────────────────────────────────────────────────────
  const [bot, setBot] = useState<Bot | null>(null);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [sessions, setSessions] = useState<TestSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Transcription vocale ───────────────────────────────────────────────────
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [canal, setCanal] = useState<ChatTestCanal>("whatsapp");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVoiceCalling, setIsVoiceCalling] = useState(false);

  // Données live de la session courante
  const [collected, setCollected] = useState<CollectedData>({});
  const [summary, setSummary] = useState("");
  const [hasHandoff, setHasHandoff] = useState(false);

  // ── Config IA ──────────────────────────────────────────────────────────────
  const [configOpen, setConfigOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [editTemp, setEditTemp] = useState(0.3);
  const [editTokens, setEditTokens] = useState(1000);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // ── Sessions panel ─────────────────────────────────────────────────────────
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // session_id unique par montage — immuable via useRef
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // historique LLM — maintenu localement pour chaque requête
  const historyRef = useRef<ChatMessage[]>([]);

  // scroll auto bas du chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  // scroll auto bas de la transcription
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // ── Session courante ───────────────────────────────────────────────────────
  // On filtre la liste des sessions backend pour ne garder que celle qui
  // correspond à l'UUID frontend en cours. `messages` est dans les deps pour
  // que le useMemo se ré-évalue après un reset (sessionIdRef.current change).
  const currentSession = useMemo(
    () => sessions.find((s) => s.session_id === sessionIdRef.current) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, messages],
  );

  // ── Dernière action `human_handoff` exécutée avec succès ───────────────────
  // Parcouru en sens inverse pour récupérer la plus récente.
  const lastHandoffAction = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const a = messages[i].actions?.find(
        (ac) => ac.type === "human_handoff" && ac.status === "success",
      );
      if (a) return a;
    }
    return null;
  }, [messages]);

  // ── Dernière action `create_appointment` exécutée avec succès ──────────────
  const lastAppointmentAction = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const a = messages[i].actions?.find(
        (ac) => ac.type === "create_appointment" && ac.status === "success",
      );
      if (a) return a;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptLines]);

  // ── Chargement initial ─────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [botData, configData, sessionsData] = await Promise.all([
        botsRepository.getById(botId),
        chatbotRepository.getChatbotConfig(botId),
        chatbotRepository.getSessions(botId),
      ]);
      setBot(botData);
      setConfig(configData);
      setEditPrompt(configData.system_prompt);
      setEditTemp(configData.temperature);
      setEditTokens(configData.max_tokens);
      setSessions(sessionsData.results ?? []);
    } catch {
      toast.error(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [botId, t.errorLoad, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Réinitialisation session ───────────────────────────────────────────────
  const resetSession = useCallback(() => {
    sessionIdRef.current = crypto.randomUUID();
    historyRef.current = [];
    setMessages([]);
    setCollected({});
    setSummary("");
    setHasHandoff(false);
    setTranscriptLines([]);
    setIsVoiceCalling(false);
  }, []);

  // ── Envoi d'un message WhatsApp ────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isSending || !botId) return;

    setInputValue("");
    setIsSending(true);

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const typingMsg: DisplayMessage = {
      id: "typing",
      role: "assistant",
      content: "",
      isTyping: true,
    };
    setMessages((prev) => [...prev, userMsg, typingMsg]);

    try {
      const response: ChatbotTestResponse = await chatbotRepository.testChat({
        bot_id: botId,
        session_id: sessionIdRef.current,
        canal,
        message: text,
        history: historyRef.current,
      });

      historyRef.current = [
        ...historyRef.current,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: response.reply },
      ].slice(-20);

      setCollected(response.collected_data ?? {});
      if (response.conversation_summary)
        setSummary(response.conversation_summary);
      if (response.human_handoff) setHasHandoff(true);

      const assistantMsg: DisplayMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        actions: response.actions ?? [],
        intentions: response.intentions ?? [],
        tokens: response.tokens_used,
      };
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "typing"),
        assistantMsg,
      ]);

      startTransition(() => {
        chatbotRepository
          .getSessions(botId)
          .then((res) => setSessions(res.results ?? []))
          .catch(() => null);
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));
      toast.error(t.testSendError);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, botId, canal, t.testSendError, toast]);

  // ── Sauvegarde config ──────────────────────────────────────────────────────
  const saveConfig = useCallback(async () => {
    if (!botId) return;
    setIsSavingConfig(true);
    try {
      const payload: UpdateChatbotConfigPayload = {
        system_prompt: editPrompt,
        temperature: editTemp,
        max_tokens: editTokens,
      };
      const updated = await chatbotRepository.updateChatbotConfig(
        botId,
        payload,
      );
      setConfig(updated);
      toast.success(t.testConfigSaved);
    } catch {
      toast.error(t.testConfigError);
    } finally {
      setIsSavingConfig(false);
    }
  }, [
    botId,
    editPrompt,
    editTemp,
    editTokens,
    t.testConfigSaved,
    t.testConfigError,
    toast,
  ]);

  // ── Handler clavier ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // ── Loading / guard ────────────────────────────────────────────────────────
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
          <h1 className="text-lg font-bold text-[var(--text)] truncate">
            {bot.nom}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">{t.testSubtitle}</p>
        </div>

        {/* Statut en ligne */}
        <Badge variant={isOnline ? "green" : "slate"}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              {t.testPublishedBadge}
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              {t.testUnpublishedBadge}
            </>
          )}
        </Badge>

        {/* Switch canal */}
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          <button
            onClick={() => setCanal("whatsapp")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors",
              canal === "whatsapp"
                ? "bg-[#25D366] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" /> {t.table.whatsapp}
          </button>
          <button
            onClick={() => setCanal("vocal")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors",
              canal === "vocal"
                ? "bg-[#6C3CE1] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            <Phone className="w-3.5 h-3.5" /> {t.testVoiceTitle}
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={resetSession}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {t.testResetSession}
        </button>
      </div>

      {/* ── Corps principal ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
        {/* ── Simulateur (3/5) ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col card overflow-hidden">
          {/* Zone messages / player */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
            {/* Placeholder WhatsApp vide */}
            {canal === "whatsapp" && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-[#25D366]" />
                </div>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">
                  {t.testSubtitle}
                </p>
              </div>
            )}

            {/* ── Player vidéo vocal ── */}
            {canal === "vocal" && (
              <VoiceDemoPlayer
                videoSrc="demo_test.mp4"
                onCallStart={() => {
                  setIsVoiceCalling(true);
                  setTranscriptLines([]);
                }}
                onCallEnd={() => setIsVoiceCalling(false)}
                onLineAppear={(lines) => setTranscriptLines(lines)}
              />
            )}

            {/* Bulles WhatsApp */}
            {canal === "whatsapp" &&
              messages.map((msg) => {
                if (msg.role === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      isUser ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        isUser ? "bg-[#6C3CE1]/10" : "bg-[#25D366]/10",
                      )}
                    >
                      {isUser ? (
                        <User className="w-4 h-4 text-[#6C3CE1]" />
                      ) : (
                        <BotIcon className="w-4 h-4 text-[#25D366]" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[75%]",
                        isUser ? "items-end" : "items-start",
                      )}
                    >
                      {/* Bulle */}
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isUser
                            ? "bg-[#6C3CE1] text-white rounded-tr-sm"
                            : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm",
                        )}
                      >
                        {msg.isTyping ? (
                          <div className="flex gap-1 items-center h-4">
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Actions */}
                      {!isUser &&
                        !msg.isTyping &&
                        msg.actions &&
                        msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {msg.actions.map((action, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                                  action.status === "success"
                                    ? "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]"
                                    : "bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20",
                                )}
                              >
                                {actionIcon(action.type)}
                                {actionLabel(action.type, d)}
                              </span>
                            ))}
                          </div>
                        )}

                      {/* Tokens */}
                      {!isUser && msg.tokens && msg.tokens > 0 && (
                        <p className="text-[10px] text-[var(--text-muted)]">
                          <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                          {msg.tokens} {t.testTokensUsed}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

            <div ref={chatEndRef} />
          </div>

          {/* Alerte handoff */}
          {hasHandoff && (
            <div className="mx-4 mb-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                {t.testHandoffAlert}
              </p>
            </div>
          )}

          {/* Zone de saisie — WhatsApp uniquement, vocal géré dans le player */}
          <div className="border-t border-[var(--border)] p-4">
            {canal === "whatsapp" ? (
              <div className="flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.testWhatsappPlaceholder}
                  rows={1}
                  disabled={isSending}
                  className="flex-1 resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 disabled:opacity-50 min-h-[42px] max-h-[120px]"
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={!inputValue.trim() || isSending}
                  className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : /* Vocal : les contrôles sont dans VoiceDemoPlayer */
            null}
          </div>
        </div>

        {/* ── Panneau droite (2/5) ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[700px] pr-1">
          {/* ── Données collectées / Transcription ─────────────────────────── */}
          <div className="card p-4">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              {canal === "vocal" ? "Transcription" : t.testCollectedData}
            </p>

            {canal === "vocal" ? (
              /* ── Mode vocal : transcription synchronisée ── */
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {transcriptLines.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    {isVoiceCalling
                      ? "En attente de la première réplique…"
                      : t.testSessionsEmpty}
                  </p>
                ) : (
                  transcriptLines.map((line) => (
                    <div
                      key={line.id}
                      className={cn(
                        "flex gap-2 items-start",
                        line.speaker === "client"
                          ? "flex-row-reverse"
                          : "flex-row",
                      )}
                    >
                      {/* Badge speaker */}
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5",
                          line.speaker === "bot"
                            ? "bg-[#6C3CE1]/10 text-[#6C3CE1]"
                            : "bg-[#25D366]/10 text-[#25D366]",
                        )}
                      >
                        {line.speaker === "bot" ? "Bot" : "Vous"}
                      </span>
                      {/* Texte */}
                      <p
                        className={cn(
                          "text-xs leading-relaxed rounded-xl px-2.5 py-1.5 max-w-[80%]",
                          line.speaker === "bot"
                            ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                            : "bg-[#25D366]/10 text-[var(--text)]",
                        )}
                      >
                        {line.text}
                      </p>
                    </div>
                  ))
                )}
                {/* Scroll auto vers la dernière ligne */}
                <div ref={transcriptEndRef} />
              </div>
            ) : /* ── Mode WhatsApp : données collectées classiques ── */
            Object.keys(collected).length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                {t.testSessionsEmpty}
              </p>
            ) : (
              <div className="space-y-2">
                {collected.nom && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {collected.nom}
                    </span>
                  </div>
                )}
                {collected.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text)]">
                      {collected.telephone}
                    </span>
                  </div>
                )}
                {collected.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text)]">
                      {collected.email}
                    </span>
                  </div>
                )}
                {collected.notes_client && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 italic">
                    {collected.notes_client}
                  </p>
                )}
              </div>
            )}

            {/* Résumé session (WhatsApp uniquement) */}
            {canal !== "vocal" && summary && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  {t.testSummaryTitle}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {summary}
                </p>
              </div>
            )}
          </div>

          {/* ── Action déclenchée : Transfert humain ────────────────────────── */}
          {/* S'affiche uniquement si le bot a exécuté avec succès l'action
              `human_handoff` au cours de cette session. */}
          {lastHandoffAction && (
            <div className="card overflow-hidden border-amber-200 dark:border-amber-800 animate-fade-in">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text)]">
                      {actionLabel("human_handoff", d)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
                      Action exécutée par le bot
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                {lastHandoffAction.payload.raison && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Motif du transfert
                    </p>
                    <p className="text-xs text-[var(--text)] leading-relaxed">
                      {lastHandoffAction.payload.raison}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                  {lastHandoffAction.payload.persisted ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                      <span>Enregistré en base — un agent sera notifié.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>
                        Mode test — aucun agent n&apos;est réellement notifié.
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Action déclenchée : Prise de rendez-vous ────────────────────── */}
          {/* S'affiche uniquement si le bot a exécuté avec succès l'action
              `create_appointment` au cours de cette session. */}
          {lastAppointmentAction && (
            <div className="card overflow-hidden border-[#25D366]/30 animate-fade-in">
              <div className="p-4 bg-[#25D366]/5 border-b border-[#25D366]/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text)]">
                      {actionLabel("create_appointment", d)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
                      Action exécutée par le bot
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                {lastAppointmentAction.payload.client_nom && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[var(--text)] truncate">
                      {lastAppointmentAction.payload.client_nom}
                    </span>
                  </div>
                )}

                {lastAppointmentAction.payload.client_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text)]">
                      {lastAppointmentAction.payload.client_phone}
                    </span>
                  </div>
                )}

                {lastAppointmentAction.payload.scheduled_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text)]">
                      {formatDateTime(
                        lastAppointmentAction.payload.scheduled_at,
                      )}
                    </span>
                  </div>
                )}

                {lastAppointmentAction.payload.service?.nom && (
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text)] truncate">
                      {lastAppointmentAction.payload.service.nom}
                    </span>
                  </div>
                )}

                {lastAppointmentAction.payload.agence && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text-muted)] truncate">
                      {lastAppointmentAction.payload.agence}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                  {lastAppointmentAction.payload.is_test ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Mode test — aucun RDV réel n&apos;est créé.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                      <span>RDV enregistré dans l&apos;agenda.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Config IA (accordéon) ───────────────────────────────────────── */}
          <div className="card overflow-hidden">
            <button
              onClick={() => setConfigOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#075E54]" />
                <span className="text-sm font-bold text-[var(--text)]">
                  {t.testConfigTitle}
                </span>
                {config && (
                  <Badge variant={config.is_deployed ? "green" : "slate"}>
                    {config.is_deployed
                      ? t.testPublishedBadge
                      : t.testUnpublishedBadge}
                  </Badge>
                )}
              </div>
              {configOpen ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>

            {configOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)]">
                {/* System prompt */}
                <div className="space-y-1 pt-4">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    {t.testConfigPrompt}
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={5}
                    className="w-full resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#075E54]/40"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      {t.testConfigTemperature}
                    </label>
                    <span className="text-xs font-bold text-[#075E54]">
                      {editTemp.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={editTemp}
                    onChange={(e) => setEditTemp(parseFloat(e.target.value))}
                    className="w-full accent-[#075E54]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>0.0</span>
                    <span>1.0</span>
                  </div>
                </div>

                {/* Max tokens */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    {t.testConfigMaxTokens}
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={4000}
                    step={100}
                    value={editTokens}
                    onChange={(e) =>
                      setEditTokens(parseInt(e.target.value, 10))
                    }
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#075E54]/40"
                  />
                </div>

                <button
                  onClick={() => void saveConfig()}
                  disabled={isSavingConfig}
                  className="w-full btn-primary text-sm disabled:opacity-50"
                >
                  {isSavingConfig ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> {t.testConfigSave}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Session en cours (accordéon) ────────────────────────────────── */}
          {/* On affiche uniquement la session correspondant à l'UUID frontend
              en cours, et plus l'historique complet — l'historique reste
              disponible côté backend si besoin. */}
          <div className="card overflow-hidden">
            <button
              onClick={() => setSessionsOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm font-bold text-[var(--text)]">
                  {t.testSessions}
                </span>
                {currentSession && (
                  <span className="text-xs bg-[#075E54]/10 text-[#075E54] font-bold px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </div>
              {sessionsOpen ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>

            {sessionsOpen && (
              <div className="border-t border-[var(--border)]">
                {!currentSession ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6 italic">
                    {t.testSessionsEmpty}
                  </p>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto">
                    <div className="p-3 hover:bg-[var(--bg)] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              currentSession.canal === "whatsapp"
                                ? "green"
                                : "violet"
                            }
                          >
                            {currentSession.canal === "whatsapp" ? (
                              <MessageSquare className="w-2.5 h-2.5 mr-0.5" />
                            ) : (
                              <Phone className="w-2.5 h-2.5 mr-0.5" />
                            )}
                            {currentSession.canal}
                          </Badge>
                          {currentSession.has_transfer && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatDateTime(currentSession.created_at)}
                        </span>
                      </div>

                      {currentSession.collected_data?.nom && (
                        <p className="text-xs font-semibold text-[var(--text)] truncate">
                          {currentSession.collected_data.nom}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {currentSession.nb_messages} msg
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                          {currentSession.tokens_total}
                        </span>
                      </div>

                      {currentSession.intentions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentSession.intentions
                            .slice(0, 3)
                            .map((intent, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded-full text-[var(--text-muted)]"
                              >
                                {intent}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
