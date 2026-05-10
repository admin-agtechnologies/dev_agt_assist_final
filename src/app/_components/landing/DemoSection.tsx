// ============================================================
// FICHIER : src/app/_components/landing/DemoSection.tsx
// Section vidéo démo — player stylé façon macOS.
// ============================================================
"use client";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEMO_VIDEO_URL } from "./LandingData";

const CHAT_PREVIEW = [
  { msg: "Bonjour, j'ai besoin d'un RDV médical",   me: false },
  { msg: "Bien sûr ! Pour quelle spécialité ?",      me: true  },
  { msg: "Cardiologue, demain matin si possible",    me: false },
  { msg: "✅ RDV confirmé — Dr. Martin, Mardi 9h30", me: true  },
  { msg: "Merci ! Je reçois une confirmation ?",     me: false },
  { msg: "Oui, envoyée sur WhatsApp 📱",             me: true  },
];

export function DemoSection() {
  const { locale } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <section id="demo" className="max-w-6xl mx-auto px-4 py-20">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6C3CE1]/10 border border-[#6C3CE1]/20 text-[#6C3CE1] text-xs font-bold mb-4 uppercase tracking-widest">
          <Play className="w-3 h-3" />
          {locale === "fr" ? "Démonstration" : "Demo"}
        </div>
        <h2 className="text-3xl font-black text-[var(--text)] mb-4">
          {locale === "fr" ? "Voyez AGT Platform en action" : "See AGT Platform in action"}
        </h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          {locale === "fr"
            ? "En moins de 5 minutes, votre assistant est opérationnel pour répondre à vos clients."
            : "In less than 5 minutes, your assistant is operational to respond to your clients."}
        </p>
      </div>

      {/* Player */}
      <div
        className="relative rounded-2xl overflow-hidden max-w-3xl mx-auto"
        style={{
          background: "#010f0c",
          boxShadow: "0 40px 100px rgba(7,94,84,0.32), 0 8px 32px rgba(0,0,0,0.28)",
        }}
      >
        {/* Barre titre macOS */}
        <div
          className="flex items-center gap-2 px-5 py-3.5 border-b"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs text-white/35 font-mono">agt-platform.tech — Demo Live</span>
            </div>
          </div>
        </div>

        {/* Zone vidéo */}
        <div className="aspect-video relative bg-[#010f0c]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onEnded={() => setPlaying(false)}
            preload="metadata"
            playsInline
          >
            <source src={DEMO_VIDEO_URL} type="video/mp4" />
          </video>

          {/* Overlay play */}
          {!playing && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(1,15,12,0.65)", backdropFilter: "blur(2px)" }}
            >
              {/* Chat déco en fond */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none px-12">
                <div className="w-72 space-y-3">
                  {CHAT_PREVIEW.map((item, i) => (
                    <div key={i} className={`flex ${item.me ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-[11px] text-white max-w-[75%] leading-relaxed ${
                          item.me ? "bg-[#25D366]/60 rounded-br-sm" : "bg-white/15 rounded-bl-sm"
                        }`}
                      >
                        {item.msg}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton play */}
              <div className="relative flex flex-col items-center z-10">
                <div
                  className="absolute rounded-full border border-[#25D366]/15 animate-ping"
                  style={{ width: 130, height: 130, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                />
                <div
                  className="absolute rounded-full border border-[#25D366]/22"
                  style={{ width: 108, height: 108, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                />
                <button
                  onClick={handlePlay}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #25D366, #075E54)",
                    boxShadow: "0 0 40px rgba(37,211,102,0.42), 0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
                <p className="mt-8 text-white/45 text-sm font-medium">
                  {locale === "fr" ? "Regarder la démo" : "Watch the demo"}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[
                    { e: "🕐", t: "30 sec" },
                    { e: "⚡", t: locale === "fr" ? "Sans code" : "No code" },
                    { e: "📱", t: "WhatsApp" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/45"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {c.e} {c.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bouton pause */}
          {playing && (
            <button
              onClick={handlePlay}
              className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-70 hover:opacity-100"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <Pause className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Métriques bas */}
        <div
          className="grid grid-cols-3 divide-x border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
        >
          {[
            { v: "30 sec",  fr: "Durée",           en: "Duration"   },
            { v: "< 5 min", fr: "Mise en service", en: "Setup time" },
            { v: "0 code",  fr: "Requis",          en: "Required"   },
          ].map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center py-4 text-center"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <span className="font-black text-[#25D366] text-base">{m.v}</span>
              <span className="text-[10px] text-white/28 uppercase tracking-widest mt-0.5">
                {locale === "fr" ? m.fr : m.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}