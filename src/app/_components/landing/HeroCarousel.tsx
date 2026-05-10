// ============================================================
// FICHIER : src/app/_components/landing/HeroCarousel.tsx
// Carousel 13 slides :
//   - 1 général, 2 features, 10 secteurs
//   - Slides secteurs : 4 features listées + CTA contextualisé
//   - Logo : carré vert #075E54 + "A" blanc
// ============================================================
"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Zap, MessageSquare, Phone, Sparkles,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HERO_SLIDES } from "./LandingData";

const BADGE_ICONS = {
  zap:      Zap,
  message:  MessageSquare,
  phone:    Phone,
  sparkles: Sparkles,
};

export function HeroCarousel() {
  const { locale } = useLanguage();
  const [current, setCurrent]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total = HERO_SLIDES.length;

  const goTo = useCallback(
    (i: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setCurrent(i);
      setTimeout(() => setTransitioning(false), 700);
    },
    [transitioning],
  );

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const s        = HERO_SLIDES[current];
  const BadgeIcon = BADGE_ICONS[s.badgeIcon];
  const features  = locale === "fr" ? s.featuresFr : s.featuresEn;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

      {/* ── Couches image + overlay ── */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: i === current ? "scale(1)" : "scale(1.05)",
              transition: "transform 8s ease-out",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(145deg, ${slide.overlayA} 0%, ${slide.overlayB} 100%)` }}
          />
        </div>
      ))}

      {/* ── Grain cinématique ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.16]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Grille déco ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Orbes ── */}
      <div
        className="absolute top-[-100px] right-[12%] w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${s.accent}28 0%, transparent 65%)` }}
      />
      <div
        className="absolute bottom-[-80px] left-[8%] w-[320px] h-[320px] rounded-full blur-3xl pointer-events-none opacity-35"
        style={{ background: "radial-gradient(circle, #6C3CE145 0%, transparent 65%)" }}
      />

      {/* ── Contenu ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-4"
        style={{ minHeight: "100svh", paddingTop: "64px", paddingBottom: "80px" }}
      >
        {/* Badge */}
        <div
          key={`b-${current}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold mb-7"
          style={{
            background: "rgba(255,255,255,0.11)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: `0 0 24px ${s.accent}28`,
          }}
        >
          <BadgeIcon className="w-4 h-4" style={{ color: s.accent }} />
          {locale === "fr" ? s.badgeFr : s.badgeEn}
        </div>

        {/* Titre */}
        <h1
          key={`h-${current}`}
          style={{
            fontSize: "clamp(1.6rem,4vw,3rem)",
            fontWeight: 900,
            lineHeight: 1.06,
            color: "#fff",
            textShadow: "0 4px 32px rgba(0,0,0,0.4)",
            letterSpacing: "-0.03em",
            maxWidth: "880px",
          }}
        >
          {locale === "fr" ? s.line1Fr : s.line1En}
          <br />
          <span style={{ color: s.accent, filter: `drop-shadow(0 0 22px ${s.accent}55)` }}>
            {locale === "fr" ? s.line2Fr : s.line2En}
          </span>
        </h1>

        {/* Features (slides secteur uniquement) */}
        {features && features.length > 0 && (
          <div
            key={`f-${current}`}
            className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 mb-2"
          >
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/85">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${s.accent}30`, border: `1px solid ${s.accent}60` }}
                >
                  <Check className="w-3 h-3" style={{ color: s.accent }} />
                </div>
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Sous-titre (slides général/feature uniquement) */}
        {(!features || features.length === 0) && (
          <p
            key={`p-${current}`}
            className="mt-5 mb-4 text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)", maxWidth: "560px" }}
          >
            {locale === "fr"
              ? "AGT-BOT donne à chaque entreprise un assistant intelligent disponible 24h/24."
              : "AGT-BOT gives every business an intelligent assistant available 24/7."}
          </p>
        )}

        {/* CTA contextualisé */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-8">
          <Link
            href={s.ctaHref}
            className="group px-8 py-4 rounded-2xl font-black text-base text-white flex items-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: s.accent, boxShadow: `0 8px 32px ${s.accent}50` }}
          >
            {locale === "fr" ? s.ctaFr : s.ctaEn}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#secteurs"
            className="px-8 py-4 rounded-2xl font-semibold text-base text-white flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.11)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.24)",
            }}
          >
            {locale === "fr" ? "Voir les solutions" : "See solutions"}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/22 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 rounded-full bg-white/45 animate-bounce" />
          </div>
        </div>
      </div>

      {/* ── Flèches ── */}
      <button
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)" }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)" }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              backgroundColor: i === current ? s.accent : "rgba(255,255,255,0.32)",
              boxShadow: i === current ? `0 0 8px ${s.accent}80` : "none",
            }}
          />
        ))}
      </div>

      {/* ── Compteur ── */}
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </section>
  );
}