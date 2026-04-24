// src/app/pme/bots/[id]/test/_components/VoiceSimulator.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Bot as BotType } from "@/types/api";
import type { SectorTheme } from "./test.types";

interface VoiceSimulatorProps {
  bot: BotType;
  theme: SectorTheme;
  d: ReturnType<typeof useLanguage>["dictionary"];
}

const VOICE_TRANSCRIPT = (botNom: string): { delay: number; role: "bot" | "client"; text: string }[] => [
  { delay: 1500,  role: "bot",    text: `Bonjour, vous êtes bien chez ${botNom}. Comment puis-je vous aider ?` },
  { delay: 4000,  role: "client", text: "Bonjour, je voudrais prendre un rendez-vous." },
  { delay: 6000,  role: "bot",    text: "Bien sûr ! Pour quel service souhaitez-vous prendre rendez-vous ?" },
  { delay: 9000,  role: "client", text: "Une consultation, si possible demain matin." },
  { delay: 11500, role: "bot",    text: "Je vérifie les disponibilités... J'ai un créneau disponible demain à 9h. Cela vous convient ?" },
  { delay: 14000, role: "client", text: "Oui, parfait !" },
  { delay: 16000, role: "bot",    text: "Très bien, votre rendez-vous est confirmé pour demain à 9h. À bientôt !" },
];

export function VoiceSimulator({ bot, theme, d }: VoiceSimulatorProps) {
  const t = d.bots;
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [duration, setDuration]   = useState(0);
  const [isMuted, setIsMuted]     = useState(false);
  const [transcript, setTranscript] = useState<{ role: "bot" | "client"; text: string }[]>([]);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const transcriptTimers = useRef<NodeJS.Timeout[]>([]);
  const bottomRef        = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transcriptTimers.current.forEach(clearTimeout);
  }, []);

  const startCall = () => {
    setCallState("calling");
    setTranscript([]);
    setTimeout(() => {
      setCallState("connected");
      timerRef.current = setInterval(() => setDuration(s => s + 1), 1000);
      VOICE_TRANSCRIPT(bot.nom).forEach(({ delay, role, text }) => {
        const tid = setTimeout(() => setTranscript(prev => [...prev, { role, text }]), delay);
        transcriptTimers.current.push(tid);
      });
    }, 2000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transcriptTimers.current.forEach(clearTimeout);
    transcriptTimers.current = [];
    setCallState("ended");
    setTimeout(() => { setCallState("idle"); setDuration(0); setIsMuted(false); }, 2000);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("px-5 py-3", theme.header)}>
        <p className="text-sm font-bold text-white">{t.testVoiceTitle}</p>
        <p className="text-xs text-white/70">{bot.config_voice_ai ?? "IA Vocale"} · {bot.langues.join(", ").toUpperCase()}</p>
      </div>

      {/* Call UI */}
      <div className="p-5 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {callState === "connected" && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: theme.primary, transform: "scale(1.5)" }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-10"
                style={{ backgroundColor: theme.primary, transform: "scale(1.9)", animationDelay: "300ms" }} />
            </>
          )}
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white relative z-10"
            style={{ backgroundColor: theme.primary }}>
            {callState === "connected" ? <Volume2 className="w-7 h-7 animate-pulse" /> : <Phone className="w-7 h-7" />}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--text)]">{bot.nom}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {callState === "idle"      && t.testVoiceSubtitle}
            {callState === "calling"   && <span className="flex items-center gap-1.5"><Spinner className="w-3 h-3 border-[#25D366] border-t-transparent" />{t.testVoiceCalling}</span>}
            {callState === "connected" && <span style={{ color: theme.primary }} className="font-bold">{t.testVoiceConnected} · {fmt(duration)}</span>}
            {callState === "ended"     && "Appel terminé"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {callState === "connected" && (
            <button onClick={() => setIsMuted(m => !m)}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isMuted ? "bg-red-100 text-red-500" : "bg-[var(--bg)] text-[var(--text-muted)]")}>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {(callState === "idle" || callState === "ended") ? (
            <button onClick={startCall}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: "#25D366" }}>
              <Phone className="w-5 h-5" />
            </button>
          ) : callState === "connected" ? (
            <button onClick={endCall}
              className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform">
              <PhoneOff className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}30` }}>
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: theme.primary }} />
            </div>
          )}
        </div>
      </div>

      {/* Transcription */}
      {(callState === "connected" || (callState === "ended" && transcript.length > 0)) && (
        <div className="mx-5 mb-5 rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--bg)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Transcription en direct
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-40 overflow-y-auto bg-[var(--bg-card)]">
            {transcript.length === 0 && (
              <p className="text-[10px] text-[var(--text-muted)] italic text-center py-2">En attente de parole...</p>
            )}
            {transcript.map((line, i) => (
              <div key={i} className={cn("flex gap-2 items-start", line.role === "client" && "flex-row-reverse")}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[8px] font-black",
                  line.role === "bot" ? "text-white" : "bg-[var(--border)]",
                )}
                  style={line.role === "bot" ? { backgroundColor: theme.primary } : {}}>
                  {line.role === "bot" ? "B" : "C"}
                </div>
                <div className={cn(
                  "max-w-[80%] px-2.5 py-1.5 rounded-xl text-[10px] leading-relaxed",
                  line.role === "bot" ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]" : "text-white",
                )}
                  style={line.role === "client" ? { backgroundColor: theme.primary } : {}}>
                  {line.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}