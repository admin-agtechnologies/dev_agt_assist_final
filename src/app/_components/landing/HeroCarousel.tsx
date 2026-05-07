// src/app/_components/landing/HeroCarousel.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Phone, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { HERO_SLIDES } from "./LandingData";

interface HeroCarouselProps {
  t: Record<string, string>;
  locale: string;
}

export function HeroCarousel({ t, locale }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const total = HERO_SLIDES.length;

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${s.image})` }} />
          <div className={`absolute inset-0 bg-gradient-to-br ${s.overlayColor}`} />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div key={`badge-${current}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold mb-6 animate-fade-in">
          {current === 0 && <Zap className="w-4 h-4 text-[#25D366]" />}
          {current === 1 && <MessageSquare className="w-4 h-4 text-[#25D366]" />}
          {current === 2 && <Phone className="w-4 h-4 text-[#8B5CF6]" />}
          {locale === "fr" ? slide.badgeFr : slide.badgeEn}
        </div>

        <h1
          key={`title-${current}`}
          className="text-5xl md:text-7xl font-black text-white leading-tight mb-3 animate-slide-up"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          {locale === "fr" ? slide.titleFr : slide.titleEn}<br />
          <span style={{ color: slide.accentColor }}>
            {locale === "fr" ? slide.subtitleFr : slide.subtitleEn}
          </span>
        </h1>

        <p key={`sub-${current}`} className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in">
          {locale === "fr"
            ? "AGT Platform donne à chaque entreprise un assistant intelligent disponible 24h/24."
            : "AGT Platform gives every business an intelligent assistant available 24/7."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href={ROUTES.onboarding}
            className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-105 hover:shadow-modal"
            style={{ backgroundColor: slide.accentColor }}
          >
            {t.heroCta}
          </Link>
          <Link
            href={ROUTES.login}
            className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/15 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all"
          >
            {t.loginCta}
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110" aria-label="Slide précédent">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110" aria-label="Slide suivant">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{ width: i === current ? 32 : 8, height: 8, backgroundColor: i === current ? "#25D366" : "rgba(255,255,255,0.4)" }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-6 z-20 text-white/40 text-xs font-mono">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </section>
  );
}