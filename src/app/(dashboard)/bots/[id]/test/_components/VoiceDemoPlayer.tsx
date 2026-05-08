// src/app/pme/bots/[id]/test/_components/VoiceDemoPlayer.tsx
"use client";
import { useRef, useState, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types exportés ────────────────────────────────────────────────────────────

export type TranscriptSpeaker = "bot" | "client";

export interface TranscriptLine {
    id: number;
    startSec: number;
    speaker: TranscriptSpeaker;
    text: string;
}

interface VoiceDemoPlayerProps {
    videoSrc: string;
    onLineAppear?: (lines: TranscriptLine[]) => void;
    onCallEnd?: () => void;
    onCallStart?: () => void;
}

// ── Utilitaire : conversion timestamp SRT → secondes ─────────────────────────

function t(h: number, m: number, s: number, ms: number): number {
    return h * 3600 + m * 60 + s + ms / 1000;
}

// ── Données SRT — 22 segments horodatés précisément ──────────────────────────
// Source : demo_test.srt (TurboScribe)
// Speaker : détecté manuellement depuis la transcription fournie

const TRANSCRIPT_DATA: TranscriptLine[] = [
    { id: 1, startSec: t(0, 0, 2, 670), speaker: "client", text: "J'aimerais que nous parlions en français, s'il vous plaît." },
    { id: 2, startSec: t(0, 0, 13, 410), speaker: "client", text: "J'aimerais faire une réservation." },
    { id: 3, startSec: t(0, 0, 18, 70), speaker: "bot", text: "Merveilleux ! Pour commencer, pour quelle date souhaitez-vous réserver et pour combien de personnes ?" },
    { id: 4, startSec: t(0, 0, 23, 690), speaker: "bot", text: "Avez-vous également une préférence pour le type de chambre ?" },
    { id: 5, startSec: t(0, 0, 26, 950), speaker: "client", text: "Oui, j'aimerais que la réservation commence à partir d'après-demain." },
    { id: 6, startSec: t(0, 0, 33, 290), speaker: "client", text: "Nous sommes cinq personnes et nous voulons prendre une suite." },
    { id: 7, startSec: t(0, 0, 49, 310), speaker: "client", text: "Nous voulons séjourner pour trois nuits." },
    { id: 8, startSec: t(0, 1, 2, 160), speaker: "client", text: "Oui, je confirme." },
    { id: 9, startSec: t(0, 1, 20, 990), speaker: "client", text: "Oui, en ce qui concerne la gastronomie, j'aimerais que vous nous fassiez des plats africains, en particulier camerounais." },
    { id: 10, startSec: t(0, 1, 32, 390), speaker: "client", text: "J'aimerais que vous nous fassiez du ndolé, ça me ferait vraiment plaisir." },
    { id: 11, startSec: t(0, 1, 41, 370), speaker: "bot", text: "Quelle excellente idée ! Notre chef sera ravi de vous préparer cette spécialité camerounaise." },
    { id: 12, startSec: t(0, 1, 46, 890), speaker: "bot", text: "Pourriez-vous me dire combien de personnes souhaitent déguster ce plat et pour quel repas ?" },
    { id: 13, startSec: t(0, 1, 50, 990), speaker: "bot", text: "Comme cela, je pourrais faire la demande spéciale au chef." },
    { id: 14, startSec: t(0, 1, 54, 370), speaker: "client", text: "Oui, le plat sera pour trois personnes, tout au juste, trois personnes." },
    { id: 15, startSec: t(0, 2, 3, 280), speaker: "bot", text: "Entendu ! Donc, du ndolé pour trois personnes." },
    { id: 16, startSec: t(0, 2, 6, 320), speaker: "bot", text: "Pour quel repas souhaitez-vous que ce soit préparé ? Le dîner, par exemple ?" },
    { id: 17, startSec: t(0, 2, 10, 300), speaker: "client", text: "Oui, le dîner." },
    { id: 18, startSec: t(0, 2, 15, 220), speaker: "bot", text: "Très bien, le message est passé au chef. Le ndolé sera prêt pour le dîner de trois personnes." },
    { id: 19, startSec: t(0, 2, 20, 640), speaker: "bot", text: "Nous nous réjouissons de vous faire découvrir cette saveur. Y a-t-il autre chose que je puisse faire pour vous ?" },
    { id: 20, startSec: t(0, 2, 25, 820), speaker: "client", text: "Je pense que là nous avons fait le tour. Merci beaucoup." },
    { id: 21, startSec: t(0, 2, 32, 260), speaker: "bot", text: "Il n'y a pas, ce fut un plaisir de vous aider. Nous avons hâte de vous accueillir très bientôt. Excellente journée !" },
    { id: 22, startSec: t(0, 2, 38, 480), speaker: "client", text: "Merci." },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export function VoiceDemoPlayer({
    videoSrc,
    onLineAppear,
    onCallEnd,
    onCallStart,
}: VoiceDemoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const visibleIdsRef = useRef<Set<number>>(new Set());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);   // 0–100
    const [callState, setCallState] = useState<"idle" | "calling" | "ended">("idle");

    // ── Synchronisation SRT sur timeupdate ────────────────────────────────────
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const currentTime = video.currentTime;
        const duration = video.duration || 1;
        setProgress((currentTime / duration) * 100);

        // Lignes dont le startSec est dépassé et pas encore affichées
        let hasNew = false;
        TRANSCRIPT_DATA.forEach(line => {
            if (currentTime >= line.startSec && !visibleIdsRef.current.has(line.id)) {
                visibleIdsRef.current.add(line.id);
                hasNew = true;
            }
        });

        if (hasNew) {
            // Notifie le parent avec la liste complète des lignes visibles à cet instant
            const visible = TRANSCRIPT_DATA.filter(l => visibleIdsRef.current.has(l.id));
            onLineAppear?.(visible);
        }
    }, [onLineAppear]);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        setCallState("ended");
        onCallEnd?.();
    }, [onCallEnd]);

    // ── Démarrer l'appel ───────────────────────────────────────────────────────
    const startCall = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        // Reset complet
        video.currentTime = 0;
        visibleIdsRef.current = new Set();
        setProgress(0);
        setCallState("calling");
        void video.play();
        setIsPlaying(true);
        onCallStart?.();
    }, [onCallStart]);

    // ── Raccrocher ────────────────────────────────────────────────────────────
    const hangUp = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        setIsPlaying(false);
        setCallState("ended");
        onCallEnd?.();
    }, [onCallEnd]);

    // ── Mute ──────────────────────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(v => !v);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDU
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full gap-3">

            {/* ── Zone vidéo ──────────────────────────────────────────────────────── */}
            <div className="relative flex-1 bg-[#0D0D1A] rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px]">

                {/* Vidéo principale */}
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover rounded-2xl"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    playsInline
                    preload="metadata"
                />

                {/* Overlay léger pendant la lecture */}
                {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none" />
                )}

                {/* Badge "En appel" animé */}
                {isPlaying && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        En appel
                    </div>
                )}

                {/* Placeholder avant démarrage */}
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
                        <button
                            onClick={startCall}
                            className="text-xs text-[#6C3CE1] font-semibold hover:underline"
                        >
                            Rejouer la démo
                        </button>
                    </div>
                )}

                {/* Barre de progression en bas de la vidéo */}
                {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 rounded-b-2xl">
                        <div
                            className="h-full bg-[#6C3CE1] rounded-b-2xl transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* ── Contrôles ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-center gap-4 pb-1">
                {callState === "idle" || callState === "ended" ? (
                    /* Bouton démarrer */
                    <button
                        onClick={startCall}
                        className="w-14 h-14 rounded-full bg-[#6C3CE1] text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                    >
                        <Phone className="w-6 h-6" />
                    </button>
                ) : (
                    /* Contrôles pendant l'appel */
                    <>
                        {/* Mute */}
                        <button
                            onClick={toggleMute}
                            className={cn(
                                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                                isMuted
                                    ? "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40"
                                    : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
                            )}
                        >
                            {isMuted
                                ? <MicOff className="w-4 h-4" />
                                : <Mic className="w-4 h-4" />
                            }
                        </button>

                        {/* Raccrocher */}
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
                {callState === "idle" && "Simuler un appel"}
                {callState === "calling" && "Appel en cours…"}
                {callState === "ended" && "Appel terminé"}
            </p>
        </div>
    );
}