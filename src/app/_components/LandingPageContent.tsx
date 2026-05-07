// src/app/_components/LandingPageContent.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Play, Star, Check, Users, TrendingUp, Clock, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";
import { plansRepository } from "@/repositories";
import type { Plan } from "@/types/api";
import { formatCurrency, cn } from "@/lib/utils";
import { LandingNavbar }        from "./landing/LandingNavbar";
import { HeroCarousel }         from "./landing/HeroCarousel";
import { TestimonialsCarousel } from "./landing/TestimonialsCarousel";
import { LandingFooter }        from "./landing/LandingFooter";
import { TESTIMONIALS, FEATURE_ICONS } from "./landing/LandingData";

const STATS = [
  { value: "500+",    labelFr: "Entreprises équipées",   labelEn: "Businesses equipped",     icon: Users },
  { value: "98%",     labelFr: "Satisfaction client",     labelEn: "Client satisfaction",     icon: Award },
  { value: "< 5 min", labelFr: "Temps de configuration", labelEn: "Setup time",              icon: Clock },
  { value: "24/7",    labelFr: "Disponibilité garantie", labelEn: "Guaranteed availability", icon: TrendingUp },
];

export default function LandingPageContent() {
  const { dictionary: d, locale } = useLanguage();
  const t  = d.landing;
  const tp = d.plans;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [landingPlans, setLandingPlans] = useState<Plan[]>([]);

  useEffect(() => {
    plansRepository.getList().then(setLandingPlans).catch(() => {});
  }, []);

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc },
    { title: t.feature2Title, desc: t.feature2Desc },
    { title: t.feature3Title, desc: t.feature3Desc },
    { title: t.feature4Title, desc: t.feature4Desc },
    { title: t.feature5Title, desc: t.feature5Desc },
    { title: t.feature6Title, desc: t.feature6Desc },
  ];

  const handlePlayVideo = () => {
    if (!videoRef.current) return;
    videoPlaying ? videoRef.current.pause() : videoRef.current.play();
    setVideoPlaying(v => !v);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      <LandingNavbar />
      <HeroCarousel t={t} locale={locale} />

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="card p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center justify-center gap-2 py-8 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ backgroundColor: "#25D36618" }}>
                    <Icon className="w-6 h-6 text-[#075E54]" />
                  </div>
                  <p className="text-3xl font-black text-[var(--text)]">{stat.value}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                    {locale === "fr" ? stat.labelFr : stat.labelEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Démo vidéo */}
      <section id="demo" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6C3CE1]/10 border border-[#6C3CE1]/20 text-[#6C3CE1] text-xs font-bold mb-4 uppercase tracking-widest">
            <Play className="w-3 h-3" />{t.demoTag}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.demoTitle}</h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm">{t.demoSubtitle}</p>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] shadow-modal bg-[var(--bg-card)] group">
          <video ref={videoRef} src="demo.mp4" className="w-full aspect-video object-cover"
            playsInline preload="metadata" onEnded={() => setVideoPlaying(false)} />
          {!videoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button onClick={handlePlayVideo} aria-label={t.demoPlay}
                className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-modal transition-all hover:scale-110">
                <Play className="w-8 h-8 text-[#075E54] fill-[#075E54] ml-1" />
              </button>
            </div>
          )}
          {videoPlaying && (
            <button onClick={handlePlayVideo} aria-label="Pause"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20" />
          )}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold backdrop-blur-sm">00:30</div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.featuresTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={i} className="card p-6 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#25D36618" }}>
                  <Icon className="w-5 h-5 text-[#075E54]" />
                </div>
                <h3 className="font-bold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.plansTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm">{t.plansSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingPlans.map(plan => (
            <div key={plan.id} className={cn(
              "card p-6 flex flex-col gap-4 relative transition-all",
              plan.highlight ? "ring-2 ring-[#25D366] shadow-card-hover" : "hover:shadow-card-hover"
            )}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#25D366] text-white text-xs font-bold">
                  {d.common.recommended}
                </div>
              )}
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{plan.nom}</p>
                <p className="text-3xl font-black text-[var(--text)]">
                  {formatCurrency(plan.prix)}
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    / {plan.billing_cycle === "annuel" ? "an" : "mois"}
                  </span>
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#25D366]" />{feature}
                  </li>
                ))}
              </ul>
              <Link href={ROUTES.onboarding} className={cn(
                "w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors",
                plan.highlight ? "bg-[#075E54] text-white hover:bg-[#128C7E]" : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
              )}>
                {tp.choosePlan}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold mb-4 uppercase tracking-widest">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{t.testimonialsTag}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.testimonialsTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm">{t.testimonialsSubtitle}</p>
        </div>
        <TestimonialsCarousel testimonials={TESTIMONIALS} locale={locale} />
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="card p-12 text-center bg-gradient-to-br from-[#075E54]/5 to-[#25D366]/5">
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">{t.ctaTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
          <Link href={ROUTES.onboarding} className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            {t.ctaBtn}
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}