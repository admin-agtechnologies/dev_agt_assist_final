// ============================================================
// FICHIER : src/app/_components/landing/TestimonialsCarousel.tsx
// Carousel témoignages — couleur accent dynamique via prop.
// Par défaut : vert AGT-BOT #25D366 (hub).
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TESTIMONIALS } from "./LandingData";
import { cn } from "@/lib/utils";

interface TestimonialsCarouselProps {
  accentColor?: string;
}

const DEFAULT_ACCENT = "#25D366";

export function TestimonialsCarousel({ accentColor = DEFAULT_ACCENT }: TestimonialsCarouselProps) {
  const { locale } = useLanguage();
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const visible = [0, 1, 2].map((o) => TESTIMONIALS[(current + o) % total]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((t, idx) => (
          <div
            key={`${t.company}-${idx}`}
            className={cn(
              "card p-6 flex flex-col gap-4 transition-all duration-500",
              idx === 1 ? "shadow-lg" : "opacity-90",
            )}
            style={idx === 1 ? {
              outline: `2px solid ${accentColor}40`,
              boxShadow: `0 8px 24px ${accentColor}15`,
            } : {}}
          >
            <div className="flex gap-1">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-[var(--text)] leading-relaxed flex-1 italic">
              &ldquo;{locale === "fr" ? t.textFr : t.textEn}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{t.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{t.role} · {t.company}</p>
                <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{t.city}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          aria-label="Témoignage précédent"
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center transition-colors"
          style={{ borderColor: "var(--border)" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>

        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Témoignage ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                backgroundColor: i === current ? accentColor : "var(--border)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Témoignage suivant"
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center transition-colors"
          onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
}