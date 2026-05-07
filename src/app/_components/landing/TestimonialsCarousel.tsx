// src/app/_components/landing/TestimonialsCarousel.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "./LandingData";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  locale: string;
}

export function TestimonialsCarousel({ testimonials, locale }: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const visible = [0, 1, 2].map(offset => testimonials[(current + offset) % total]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((t, idx) => (
          <div
            key={`${t.company}-${idx}`}
            className={cn(
              "card p-6 flex flex-col gap-4 transition-all duration-500",
              idx === 1 ? "ring-2 ring-[#25D366]/40 shadow-card-hover" : "opacity-90"
            )}
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
              <div className="w-10 h-10 rounded-full bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-xs font-black flex-shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{t.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{t.role} · {t.company}</p>
                <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {t.city}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={prev} className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-card)] hover:border-[#25D366] transition-colors" aria-label="Précédent">
          <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn("w-2 h-2 rounded-full transition-all duration-300", i === current ? "bg-[#25D366] w-6" : "bg-[var(--border)]")}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-card)] hover:border-[#25D366] transition-colors" aria-label="Suivant">
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
}