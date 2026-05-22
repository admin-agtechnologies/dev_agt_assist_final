"use client";
// src/app/(dashboard)/bots/[id]/test/_components/VoiceDemoPlayer.tsx
// Player vidéo + contrôles + synchronisation SRT.
// Données SRT → data/demo-transcript.ts (séparées pour faciliter le remplacement de la démo)

import { useRef, useState, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRANSCRIPT_DATA, type TranscriptLine } from "./data/demo-transcript";

// ── Types exportés ────────────────────────────────────────────────────────────

export type { TranscriptLine };

interface VoiceDemoPlayerProps {
  videoSrc: string;
  onLineAppear?: (lines: TranscriptLine[]) => void;
  onCallEnd?: () => void;
  onCallStart?: () => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function VoiceDemoPlayer({ videoSrc, onLineAppear, onCallEnd, onCallStart }: VoiceDemoPlayerProps) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const visibleIdsRef = useRef<Set<number>>(new Set());

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isMuted,    setIsMuted]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [callState,  setCallState]  = useState<"idle" | "calling" | "ended">("idle");

  // ── Synchronisation SRT ───────────────────────────────────────────────────

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const currentTime = video.currentTime;
    const duration    = video.duration || 1;
    setProgress((currentTime / duration) * 100);

    let hasNew = false;
    TRANSCRIPT_DATA.forEach(line => {
      if (currentTime >= line.startSec && !visibleIdsRef.current.has(line.id)) {
        visibleIdsRef.current.add(line.id);
        hasNew = true;
      }
    });
    if (hasNew) {
      const visible = TRANSCRIPT_DATA.filter(l => visibleIdsRef.current.has(l.id));
      onLineAppear?.(visible);
    }
  }, [onLineAppear]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCallState("ended");
    onCallEnd?.();
  }, [onCallEnd]);

  // ── Contrôles ─────────────────────────────────────────────────────────────

  const startCall = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    visibleIdsRef.current = new Set();
    setProgress(0);
    setCallState("calling");
    void video.play();
    setIsPlaying(true);
    onCallStart?.();
  }, [onCallStart]);

  const hangUp = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    setCallState("ended");
    onCallEnd?.();
  }, [onCallEnd]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(v => !v);
  }, []);

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3">

      {/* ── Zone vidéo ── */}
      <div className="relative flex-1 bg-[#0D0D1A] rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px]">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover rounded-2xl"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          playsInline
          preload="metadata"
        />

        {isPlaying && (
          <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none" />
        )}

        {/* Badge "En appel" */}
        {isPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            En appel
          </div>
        )}

        {/* Placeholder idle */}
        {callState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D0D1A]/70 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#6C3CE1]/20 flex items-center justify-center ring-2 ring-[#6C3CE1]/40">
              <Phone className="w-7 h-7 text-[#6C3CE1]" />
            </div>
            <p className="text-sm text-white/60 font-medium">Appuyez pour simuler un appel</p>
          </div>
        )}

        {/* Écran fin d'appel */}
        {callState === "ended" && !isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D0D1A]/70 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center ring-2 ring-[#25D366]/40">
              <Phone className="w-7 h-7 text-[#25D366]" />
            </div>
            <p className="text-sm text-white/60 font-medium">Appel terminé</p>
            <button onClick={startCall} className="text-xs text-[#6C3CE1] font-semibold hover:underline">
              Rejouer la démo
            </button>
          </div>
        )}

        {/* Barre de progression */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 rounded-b-2xl">
            <div
              className="h-full bg-[#6C3CE1] rounded-b-2xl transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Contrôles ── */}
      <div className="flex items-center justify-center gap-4 pb-1">
        {callState === "idle" || callState === "ended" ? (
          <button
            onClick={startCall}
            className="w-14 h-14 rounded-full bg-[#6C3CE1] text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
          >
            <Phone className="w-6 h-6" />
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                isMuted
                  ? "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40"
                  : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={hangUp}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Label état */}
      <p className="text-center text-xs font-semibold text-[var(--text-muted)] pb-1">
        {callState === "idle"    && "Simuler un appel"}
        {callState === "calling" && "Appel en cours…"}
        {callState === "ended"   && "Appel terminé"}
      </p>
    </div>
  );
}