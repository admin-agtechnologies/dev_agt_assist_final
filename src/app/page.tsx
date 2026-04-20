// src/app/page.tsx
"use client";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { PLANS_CONFIG, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Check, MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe,
  Sun, Moon, Star, Users, TrendingUp, Clock, Award,
  ChevronLeft, ChevronRight, Play, MapPin, Mail, ArrowRight,
  Bot, BookOpen, HelpCircle,
  Zap,
} from "lucide-react";

// ── Constantes ────────────────────────────────────────────────────────────────
const FEATURE_ICONS = [MessageSquare, Phone, CalendarDays, BarChart3, Smartphone, Globe];

// Données témoignages — hardcodées (marketing copy, pas de fetch API)
interface Testimonial {
  name: string;
  role: string;
  company: string;
  city: string;
  avatar: string;
  rating: number;
  textFr: string;
  textEn: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jean-Paul Mbarga",
    role: "Directeur",
    company: "Albatros Hôtel",
    city: "Yaoundé",
    avatar: "JM",
    rating: 5,
    textFr: "Depuis AGT Platform, notre réception virtuelle répond aux clients 24h/24. Les réservations ont augmenté de 35% en 2 mois. Un outil indispensable pour notre hôtel.",
    textEn: "Since AGT Platform, our virtual reception answers clients 24/7. Bookings increased by 35% in 2 months. An essential tool for our hotel.",
  },
  {
    name: "Christelle Nkomo",
    role: "Responsable Digital",
    company: "Orange Cameroun",
    city: "Douala",
    avatar: "CN",
    rating: 5,
    textFr: "L'assistant WhatsApp gère des centaines de demandes clients simultanément. Le temps de réponse est passé de 4h à moins de 30 secondes. Nos équipes peuvent se concentrer sur l'essentiel.",
    textEn: "The WhatsApp assistant handles hundreds of customer requests simultaneously. Response time dropped from 4h to under 30 seconds. Our teams can focus on what matters.",
  },
  {
    name: "Patrick Essama",
    role: "Gérant",
    company: "Finex Voyage",
    city: "Yaoundé",
    avatar: "PE",
    rating: 5,
    textFr: "Nos clients reçoivent leurs devis et confirmations de voyage instantanément via WhatsApp. AGT Platform a transformé notre service client. On ne peut plus s'en passer.",
    textEn: "Our clients receive their quotes and travel confirmations instantly via WhatsApp. AGT Platform transformed our customer service. We can't do without it.",
  },
  {
    name: "Dr. Aminatou Bello",
    role: "Médecin-chef",
    company: "Clinique Sainte-Marie",
    city: "Bafoussam",
    avatar: "AB",
    rating: 5,
    textFr: "La gestion des rendez-vous est maintenant entièrement automatisée. Plus de files d'attente téléphoniques. Nos patients adorent pouvoir prendre RDV à n'importe quelle heure.",
    textEn: "Appointment management is now fully automated. No more phone queues. Our patients love being able to book at any hour.",
  },
  {
    name: "Samuel Tchatchou",
    role: "CEO",
    company: "TechBuild Cameroun",
    city: "Douala",
    avatar: "ST",
    rating: 5,
    textFr: "En 5 minutes de configuration, notre assistant était opérationnel. L'agent vocal IA impressionne vraiment nos clients. Un investissement rentabilisé dès la première semaine.",
    textEn: "In 5 minutes of setup, our assistant was operational. The AI voice agent truly impresses our clients. An investment that paid off in the first week.",
  },
];

// ── Composant Carousel Témoignages ────────────────────────────────────────────
interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  locale: string;
}

function TestimonialsCarousel({ testimonials, locale }: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  // Nombre de cards visibles selon la largeur (géré par CSS, on navigue par 1)
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);

  // Auto-play toutes les 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // On affiche 3 cards : current, current+1, current+2 (cyclique)
  const visible = [0, 1, 2].map(offset => testimonials[(current + offset) % total]);

  return (
    <div className="relative">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((t, idx) => (
          <div
            key={`${t.company}-${idx}`}
            className={cn(
              "card p-6 flex flex-col gap-4 transition-all duration-500",
              idx === 1 ? "ring-2 ring-[#25D366]/40 shadow-card-hover" : "opacity-90"
            )}
          >
            {/* Étoiles */}
            <div className="flex gap-1">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Verbatim */}
            <p className="text-sm text-[var(--text)] leading-relaxed flex-1 italic">
              &ldquo;{locale === "fr" ? t.textFr : t.textEn}&rdquo;
            </p>

            {/* Auteur */}
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

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-card)] hover:border-[#25D366] transition-colors"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>

        {/* Indicateurs */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === current ? "bg-[#25D366] w-6" : "bg-[var(--border)]"
              )}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-card)] hover:border-[#25D366] transition-colors"
          aria-label="Suivant"
        >
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
}

// ── Types Hero ───────────────────────────────────────────────────────────────
interface HeroSlide {
  image: string;
  overlayColor: string;
  badgeFr: string;
  badgeEn: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  accentColor: string;
}

// Slides — images locales dans public/images/hero/
// Pour migrer vers le serveur média : remplacer "/images/hero/X.jpg" par ENV.BACKEND_URL + "/media/hero/X.jpg"
const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero/hero-1.jpg",
    overlayColor: "from-[#075E54]/80 via-[#075E54]/60 to-[#022c22]/70",
    badgeFr: " 10 000 FCFA offerts à l'inscription",
    badgeEn: " 10,000 XAF offered at registration",
    titleFr: "Votre assistant virtuel,",
    titleEn: "Your virtual assistant,",
    subtitleFr: "prêt en 5 minutes.",
    subtitleEn: "ready in 5 minutes.",
    accentColor: "#25D366",
  },
  {
    image: "/images/hero/hero-2.png",
    overlayColor: "from-[#022c22]/85 via-[#075E54]/70 to-[#075E54]/60",
    badgeFr: " WhatsApp · 24h/24 · 7j/7",
    badgeEn: " WhatsApp · 24/7",
    titleFr: "Répondez à vos clients",
    titleEn: "Answer your customers",
    subtitleFr: "même quand vous dormez.",
    subtitleEn: "even while you sleep.",
    accentColor: "#25D366",
  },
  {
    image: "/images/hero/hero-3.jpg",
    overlayColor: "from-[#2D1B69]/85 via-[#6C3CE1]/65 to-[#2D1B69]/70",
    badgeFr: " Agent Vocal IA nouvelle génération",
    badgeEn: " Next-gen AI Voice Agent",
    titleFr: "Un agent IA qui décroche",
    titleEn: "An AI agent that answers",
    subtitleFr: "à votre place.",
    subtitleEn: "in your place.",
    accentColor: "#8B5CF6",
  },
];

interface HeroCarouselProps {
  t: Record<string, string>;
  locale: string;
}

function HeroCarousel({ t, locale }: HeroCarouselProps) {
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

  // Auto-play 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      {/* Images — toutes préchargées, on change l'opacité */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {/* Image de fond */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${s.image})` }}
          />
          {/* Overlay gradient coloré */}
          <div className={`absolute inset-0 bg-gradient-to-br ${s.overlayColor}`} />
        </div>
      ))}

      {/* Contenu centré */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          {/* Badge */}
    <div
      key={`badge-${current}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold mb-6 animate-fade-in"
    >
      {current === 0 && <Zap className="w-4 h-4 text-[#25D366]" />}
      {current === 1 && <MessageSquare className="w-4 h-4 text-[#25D366]" />}
      {current === 2 && <Phone className="w-4 h-4 text-[#8B5CF6]" />}
      {locale === "fr" ? slide.badgeFr : slide.badgeEn}
    </div>

        {/* Titre */}
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

        {/* Sous-titre */}
        <p
          key={`sub-${current}`}
          className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in"
        >
          {locale === "fr"
            ? "AGT Platform donne à chaque PME un assistant intelligent disponible 24h/24."
            : "AGT Platform gives every SME an intelligent assistant available 24/7."}
        </p>

        {/* CTAs */}
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

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Flèches navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 32 : 8,
              height: 8,
              backgroundColor: i === current ? "#25D366" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Indicateur slide actuel — coin bas droite */}
      <div className="absolute bottom-8 right-6 z-20 text-white/40 text-xs font-mono">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </section>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;
  const tp = d.plans;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc },
    { title: t.feature2Title, desc: t.feature2Desc },
    { title: t.feature3Title, desc: t.feature3Desc },
    { title: t.feature4Title, desc: t.feature4Desc },
    { title: t.feature5Title, desc: t.feature5Desc },
    { title: t.feature6Title, desc: t.feature6Desc },
  ];

  // Stats marketing — données hardcodées intentionnellement (page publique)
  const stats = [
    { value: "500+", labelFr: "PME équipées", labelEn: "Businesses equipped", icon: Users },
    { value: "98%", labelFr: "Satisfaction client", labelEn: "Client satisfaction", icon: Award },
    { value: "< 5 min", labelFr: "Temps de configuration", labelEn: "Setup time", icon: Clock },
    { value: "24/7", labelFr: "Disponibilité garantie", labelEn: "Guaranteed availability", icon: TrendingUp },
  ];

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[var(--text)] text-sm">AGT Platform</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">by AG Technologies</span>
            </div>
          </div>

          {/* Liens d'ancrage — desktop uniquement */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--text)] transition-colors">{t.navFeatures}</a>
            <a href="#demo" className="hover:text-[var(--text)] transition-colors">{t.navDemo}</a>
            <a href="#plans" className="hover:text-[var(--text)] transition-colors">{t.navPlans}</a>
            <a href="#testimonials" className="hover:text-[var(--text)] transition-colors">{t.navTestimonials}</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors text-xs font-bold"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href={ROUTES.login}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
            >
              {t.loginCta}
            </Link>
            <Link href={ROUTES.onboarding} className="btn-primary text-sm">
              {t.heroCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Carousel Full-Screen ───────────────────────────────────────── */}
      <HeroCarousel t={t} locale={locale} />

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="card p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center justify-center gap-2 py-8 px-6 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: "#25D36618" }}
                  >
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

      {/* ── Démo vidéo ─────────────────────────────────────────────────────── */}
      <section id="demo" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6C3CE1]/10 border border-[#6C3CE1]/20 text-[#6C3CE1] text-xs font-bold mb-4 uppercase tracking-widest">
            <Play className="w-3 h-3" />
            {t.demoTag}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.demoTitle}</h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm">{t.demoSubtitle}</p>
        </div>

        {/* Lecteur vidéo */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] shadow-modal bg-[var(--bg-card)] group">
          <video
            ref={videoRef}
            src="/videos/demo.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            preload="metadata"
            onEnded={() => setVideoPlaying(false)}
          />

          {/* Overlay play/pause */}
          {!videoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayVideo}
                className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-modal transition-all hover:scale-110"
                aria-label={t.demoPlay}
              >
                <Play className="w-8 h-8 text-[#075E54] fill-[#075E54] ml-1" />
              </button>
            </div>
          )}

          {/* Bouton pause sur hover quand la vidéo joue */}
          {videoPlaying && (
            <button
              onClick={handlePlayVideo}
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20"
              aria-label="Pause"
            />
          )}

          {/* Badge durée */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
            00:30
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.featuresTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={i} className="card p-6 hover:shadow-card-hover transition-shadow">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#25D36618" }}
                >
                  <Icon className="w-5 h-5 text-[#075E54]" />
                </div>
                <h3 className="font-bold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Plans ──────────────────────────────────────────────────────────── */}
      <section id="plans" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.plansTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm">{t.plansSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS_CONFIG.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "card p-6 flex flex-col gap-4 relative transition-all",
                plan.highlight ? "ring-2 ring-[#25D366] shadow-card-hover" : "hover:shadow-card-hover"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#25D366] text-white text-xs font-bold">
                  {d.common.recommended}
                </div>
              )}
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  {plan.name}
                </p>
                <p className="text-3xl font-black text-[var(--text)]">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-[var(--text-muted)]">{d.common.perMonth}</span>
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features_keys.map((key) => {
                  const parts = key.split(".") as ["plans", "features", keyof typeof d.plans.features];
                  const label = d.plans.features[parts[2]];
                  return (
                    <li key={key} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#25D366]" />
                      {label}
                    </li>
                  );
                })}
              </ul>
              <Link
                href={ROUTES.onboarding}
                className={cn(
                  "w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  plan.highlight
                    ? "bg-[#075E54] text-white hover:bg-[#128C7E]"
                    : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                )}
              >
                {tp.choosePlan}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Témoignages ────────────────────────────────────────────────────── */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold mb-4 uppercase tracking-widest">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {t.testimonialsTag}
          </div>
          <h2 className="text-3xl font-black text-[var(--text)] mb-3">{t.testimonialsTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm">{t.testimonialsSubtitle}</p>
        </div>
        <TestimonialsCarousel testimonials={TESTIMONIALS} locale={locale} />
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="card p-12 text-center bg-gradient-to-br from-[#075E54]/5 to-[#25D366]/5">
          <h2 className="text-3xl font-black text-[var(--text)] mb-4">{t.ctaTitle}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
          <Link href={ROUTES.onboarding} className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            {t.ctaBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Colonne 1 — Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white font-black text-sm">
                  A
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-sm text-[var(--text)]">AGT Platform</span>
                  <span className="text-[10px] text-[var(--text-muted)]">by AG Technologies</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t.footerTagline}
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Montée Anne rouge, Immeuble Kadji, Yaoundé</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <a href="mailto:secretariatagtechnologies@gmail.com" className="hover:text-[#25D366] transition-colors">
                  secretariatagtechnologies@gmail.com
                </a>
              </div>
            </div>

            {/* Colonne 2 — Produit */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text)]">{t.footerProduct}</p>
              <ul className="space-y-2.5">
                {[
                  { label: t.footerFeatures, href: "#features" },
                  { label: t.footerPlans, href: "#plans" },
                  { label: t.footerDemo, href: "#demo" },
                  { label: t.footerSignup, href: ROUTES.onboarding },
                ].map(item => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 — Ressources */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text)]">{t.footerResources}</p>
              <ul className="space-y-2.5">
                {[
                  { label: t.footerHelp, href: ROUTES.help, icon: HelpCircle },
                  { label: t.footerTutorial, href: ROUTES.tutorial, icon: BookOpen },
                  { label: t.footerLogin, href: ROUTES.login, icon: Bot },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link href={item.href} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Colonne 4 — Autres produits AGT */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text)]">{t.footerGroup}</p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://www.salma-studies.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    SALMA — Bourses & Mobilité
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.agtgroupholding.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    AG Technologies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bas du footer */}
          <div className="border-t border-[var(--border)] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              © {new Date().getFullYear()} AG Technologies. {t.footerRights}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-bold"
              >
                {locale === "fr" ? "🇬🇧 English" : "🇫🇷 Français"}
              </button>
              <button
                onClick={toggle}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}