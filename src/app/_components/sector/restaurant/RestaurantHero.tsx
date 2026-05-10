// ============================================================
// FICHIER : src/app/_components/sector/restaurant/RestaurantHero.tsx
// Carousel hero 4 slides — landing sectorielle restaurant.
// Couleurs : primary #F97316, accent #FDBA74
// ============================================================
"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Utensils, CalendarDays, UtensilsCrossed, ShoppingCart,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#F97316";
const ACCENT  = "#FDBA74";

interface RestaurantSlide {
  image:      string;
  overlayA:   string;
  overlayB:   string;
  badgeFr:    string;
  badgeEn:    string;
  BadgeIcon:  React.ElementType;
  line1Fr:    string;
  line1En:    string;
  line2Fr:    string;
  line2En:    string;
  ctaFr:      string;
  ctaEn:      string;
  featuresFr: string[];
  featuresEn: string[];
}

const SLIDES: RestaurantSlide[] = [
  {
    image:    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80",
    overlayA: "#9A3412EE", overlayB: "#EA580CCC",
    badgeFr: "Restauration & Hôtellerie", badgeEn: "Food & Hospitality",
    BadgeIcon: Utensils,
    line1Fr: "Votre restaurant digital,",   line1En: "Your digital restaurant,",
    line2Fr: "commandes & réservations IA.",line2En: "AI orders & reservations.",
    ctaFr: "Créer mon assistant restaurant", ctaEn: "Create my restaurant assistant",
    featuresFr: ["Commandes WhatsApp", "Réservations tables", "Menu digital", "Livraisons suivi"],
    featuresEn: ["WhatsApp orders", "Table reservations", "Digital menu", "Delivery tracking"],
  },
  {
    image:    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
    overlayA: "#7C2D12EE", overlayB: "#9A3412CC",
    badgeFr: "Réservation de table", badgeEn: "Table reservation",
    BadgeIcon: CalendarDays,
    line1Fr: "Réservez une table",          line1En: "Book a table",
    line2Fr: "en 30 secondes sur WhatsApp.",line2En: "in 30 seconds on WhatsApp.",
    ctaFr: "Activer les réservations", ctaEn: "Enable reservations",
    featuresFr: ["RDV automatique 24/7", "Confirmation instantanée", "Rappels clients", "Gestion annulations"],
    featuresEn: ["Auto booking 24/7", "Instant confirmation", "Client reminders", "Cancellation management"],
  },
  {
    image:    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
    overlayA: "#92400EEE", overlayB: "#B45309CC",
    badgeFr: "Menu digital", badgeEn: "Digital menu",
    BadgeIcon: UtensilsCrossed,
    line1Fr: "Votre menu complet",          line1En: "Your full menu",
    line2Fr: "mis à jour en temps réel.",   line2En: "updated in real time.",
    ctaFr: "Digitaliser mon menu", ctaEn: "Digitize my menu",
    featuresFr: ["Menu WhatsApp interactif", "Photos & descriptions", "Prix & disponibilités", "Mise à jour instantanée"],
    featuresEn: ["Interactive WhatsApp menu", "Photos & descriptions", "Prices & availability", "Instant update"],
  },
  {
    image:    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80",
    overlayA: "#991B1BEE", overlayB: "#B91C1CCC",
    badgeFr: "Commande & Paiement", badgeEn: "Order & Payment",
    BadgeIcon: ShoppingCart,
    line1Fr: "Commandez et payez",          line1En: "Order and pay",
    line2Fr: "directement sur WhatsApp.",   line2En: "directly on WhatsApp.",
    ctaFr: "Activer les commandes", ctaEn: "Enable orders",
    featuresFr: ["Commande WhatsApp", "Paiement Orange Money", "Paiement MTN MoMo", "Suivi commande live"],
    featuresEn: ["WhatsApp ordering", "Orange Money payment", "MTN MoMo payment", "Live order tracking"],
  },
];

export function RestaurantHero() {
  const { locale } = useLanguage();
  const [current, setCurrent]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total = SLIDES.length;

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

  const s = SLIDES[current];
  const BadgeIcon = s.BadgeIcon;
  const features  = locale === "fr" ? s.featuresFr : s.featuresEn;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

      {/* Couches image + overlay */}
      {SLIDES.map((slide, i) => (
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

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Orbe */}
      <div
        className="absolute top-[-80px] right-[10%] w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${ACCENT}50 0%, transparent 65%)` }}
      />

      {/* Contenu */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full"
        style={{ minHeight: "100svh", paddingTop: "80px", paddingBottom: "100px" }}
      >
        {/* Badge */}
        <div
          key={`b-${current}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold mb-7 uppercase tracking-widest"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${ACCENT}50`,
            boxShadow: `0 0 24px ${PRIMARY}30`,
          }}
        >
          <BadgeIcon className="w-4 h-4" style={{ color: ACCENT }} />
          {locale === "fr" ? s.badgeFr : s.badgeEn}
        </div>

        {/* Titre */}
        <h1
          key={`h-${current}`}
          style={{
            fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
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
          <span style={{ color: ACCENT, filter: `drop-shadow(0 0 20px ${ACCENT}55)` }}>
            {locale === "fr" ? s.line2Fr : s.line2En}
          </span>
        </h1>

        {/* Features */}
        <div key={`f-${current}`} className="grid grid-cols-2 gap-x-8 gap-y-2 mt-7 mb-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/85">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${ACCENT}30`, border: `1px solid ${ACCENT}60` }}
              >
                <Check className="w-3 h-3" style={{ color: ACCENT }} />
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-9">
          <Link
            href={ROUTES.onboarding}
            className="group px-8 py-4 rounded-2xl font-black text-base text-white flex items-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: PRIMARY, boxShadow: `0 8px 32px ${PRIMARY}50` }}
          >
            {locale === "fr" ? s.ctaFr : s.ctaEn}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href={ROUTES.login}
            className="px-8 py-4 rounded-2xl font-semibold text-base text-white flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {locale === "fr" ? "J'ai déjà un compte" : "I already have an account"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Flèches */}
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

      {/* Dots */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              backgroundColor: i === current ? ACCENT : "rgba(255,255,255,0.32)",
              boxShadow: i === current ? `0 0 10px ${ACCENT}80` : "none",
            }}
          />
        ))}
      </div>

      {/* Compteur */}
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </section>
  );
}