// ============================================================
// FICHIER : src/app/_components/landing/DemoSection.tsx
// Section démo — vidéo large format + chat WhatsApp animé.
// Zéro style macOS. Design immersif, premium.
// ============================================================
"use client";
import { useRef, useState, useEffect } from "react";
import { Play, Pause, MessageCircle, Zap, Clock, Code2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEMO_VIDEO_URL } from "./LandingData";

const CHAT_MESSAGES = [
  { msg: "Bonjour 👋 J'aimerais réserver une table pour 4 ce soir", me: false, delay: 0    },
  { msg: "Bien sûr ! À quelle heure souhaitez-vous venir ?",        me: true,  delay: 1400 },
  { msg: "Vers 20h si possible",                                     me: false, delay: 2600 },
  { msg: "✅ Table pour 4 — ce soir 20h00. Confirmation envoyée !",  me: true,  delay: 3800 },
  { msg: "Super merci 🙏",                                           me: false, delay: 4800 },
  { msg: "À ce soir ! Bon appétit d'avance 😊",                     me: true,  delay: 5600 },
];

const STATS = [
  { icon: Clock, value: "30 sec",  fr: "Durée",           en: "Length"   },
  { icon: Zap,   value: "< 5 min", fr: "Mise en service", en: "Setup"    },
  { icon: Code2, value: "0 code",  fr: "Requis",          en: "Required" },
];

export function DemoSection() {
  const { locale }              = useLanguage();
  const videoRef                = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [visible, setVisible]   = useState<number[]>([]);

  useEffect(() => {
    const timers = CHAT_MESSAGES.map((m, i) =>
      setTimeout(() => setVisible(v => [...v, i]), m.delay + 800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  return (
    <section id="demo" className="py-24 px-4 relative overflow-hidden">

      {/* Halos fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #075E54, transparent)", filter: "blur(80px)" }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #25D366, transparent)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold mb-5 uppercase tracking-widest">
            <Play className="w-3 h-3" />
            {locale === "fr" ? "Démonstration live" : "Live demo"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] mb-4 leading-tight">
            {locale === "fr" ? "Voyez AGT-BOT en action" : "See AGT-BOT in action"}
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            {locale === "fr"
              ? "En moins de 5 minutes, votre assistant répond à vos clients — sans ligne de code."
              : "In less than 5 minutes, your assistant answers clients — zero code needed."}
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">

          {/* ── Chat WhatsApp ─────────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden flex flex-col border border-[var(--border)]"
            style={{ background: "var(--bg-card)" }}>

            {/* Header WhatsApp */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: "#075E54" }}>
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-black flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">AGT-BOT</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  <p className="text-white/60 text-xs">
                    {locale === "fr" ? "En ligne · répond instantanément" : "Online · replies instantly"}
                  </p>
                </div>
              </div>
              <MessageCircle className="w-4 h-4 text-white/40" />
            </div>

            {/* Bulles */}
            <div className="flex-1 p-4 space-y-3" style={{ background: "var(--bg)", minHeight: 280 }}>
              {CHAT_MESSAGES.map((item, i) => (
                <div key={i} className={`flex ${item.me ? "justify-end" : "justify-start"}`}
                  style={{
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    opacity:   visible.includes(i) ? 1 : 0,
                    transform: visible.includes(i) ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <div className="px-3.5 py-2.5 text-xs leading-relaxed max-w-[88%]"
                    style={{
                      background:   item.me ? "#25D366" : "var(--bg-card)",
                      color:        item.me ? "#fff"    : "var(--text)",
                      borderRadius: item.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      boxShadow:    "0 1px 6px rgba(0,0,0,0.10)",
                    }}
                  >{item.msg}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs text-[var(--text-muted)]">
                {locale === "fr" ? "Réponse automatique par IA" : "Automated AI response"}
              </span>
            </div>
          </div>

          {/* ── Vidéo + stats ─────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Player vidéo large */}
            <div className="relative rounded-3xl overflow-hidden"
              style={{
                background: "#000",
                boxShadow: "0 40px 100px rgba(7,94,84,0.22), 0 8px 32px rgba(0,0,0,0.28)",
                border: "1px solid rgba(37,211,102,0.10)",
                aspectRatio: "16/9",
              }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                onEnded={() => setPlaying(false)}
                preload="metadata"
                playsInline
              >
                <source src={DEMO_VIDEO_URL} type="video/mp4" />
              </video>

              {/* Overlay play */}
              {!playing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                  style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(2px)" }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-40 h-40 rounded-full border border-[#25D366]/10 animate-ping" />
                    <div className="absolute w-32 h-32 rounded-full border border-[#25D366]/15" />
                    <button onClick={handlePlay}
                      className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #25D366, #075E54)",
                        boxShadow: "0 0 60px rgba(37,211,102,0.40), 0 8px 30px rgba(0,0,0,0.4)",
                      }}
                    >
                      <Play className="w-10 h-10 text-white ml-1.5" />
                    </button>
                  </div>
                  <p className="text-white/45 text-sm font-medium tracking-wide">
                    {locale === "fr" ? "Lancer la démonstration" : "Play the demo"}
                  </p>
                </div>
              )}

              {/* Pause */}
              {playing && (
                <button onClick={handlePlay}
                  className="absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all opacity-60 hover:opacity-100"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <Pause className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i}
                    className="flex flex-col items-center py-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all hover:border-[#25D366]/30"
                  >
                    <Icon className="w-4 h-4 text-[#25D366] mb-2" />
                    <span className="font-black text-[#25D366] text-xl leading-none">{s.value}</span>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1.5">
                      {locale === "fr" ? s.fr : s.en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// END OF FILE: src/app/_components/landing/DemoSection.tsx