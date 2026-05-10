// ============================================================
// FICHIER : src/app/_components/LandingPageContent.tsx
// Orchestrateur pur — assemble toutes les sections de la landing hub.
// Aucune logique UI ici, uniquement la composition.
// ============================================================
"use client";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LandingNavbar }        from "./landing/LandingNavbar";
import { HeroCarousel }         from "./landing/HeroCarousel";
import { StatsSection }         from "./landing/StatsSection";
import { SectorsSection }       from "./landing/SectorsSection";
import { DemoSection }          from "./landing/DemoSection";
import { FeaturesSection }      from "./landing/FeaturesSection";
import { TestimonialsCarousel } from "./landing/TestimonialsCarousel";
import { CtaSection }           from "./landing/CtaSection";
import { LandingFooter }        from "./landing/LandingFooter";

export default function LandingPageContent() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.landing;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Navbar */}
      <LandingNavbar />

      {/* Hero — pleine hauteur, 7 slides */}
      <HeroCarousel />

      {/* Stats — 500+, 98%, <5min, 24/7 */}
      <StatsSection />

      {/* Secteurs — fond sombre, grille 9 cartes */}
      <SectorsSection />

      {/* Démo vidéo */}
      <DemoSection />

      {/* Fonctionnalités */}
      <FeaturesSection />

      {/* Témoignages */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold mb-4 uppercase tracking-widest">
            <Star className="w-3 h-3" />
            {t.testimonialsTag}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">
            {t.testimonialsTitle}
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            {t.testimonialsSubtitle}
          </p>
        </div>
        <TestimonialsCarousel />
      </section>

      {/* CTA finale */}
      <CtaSection />

      {/* Footer */}
      <LandingFooter />

    </div>
  );
}