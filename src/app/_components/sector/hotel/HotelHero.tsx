// ============================================================
// FICHIER : src/app/_components/sector/hotel/HotelHero.tsx
// Carousel hero 4 slides — landing sectorielle hotel.
// Couleurs : primary #1A3C5E, accent #C9A84C
// Images : Unsplash hôtels / lodges africains
// Pattern identique à EcommerceHero.tsx
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BedDouble, CalendarCheck, ConciergeBell, Star,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#1A3C5E";
const ACCENT  = "#C9A84C";

interface HotelSlide {
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

const SLIDES: HotelSlide[] = [
  {
    image:    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
    overlayA: "#0A1A2EF0", overlayB: "#1A3C5ED0",
    badgeFr: "Réservation chambre", badgeEn: "Room booking",
    BadgeIcon: BedDouble,
    line1Fr: "Vos chambres se remplissent",  line1En: "Your rooms fill up",
    line2Fr: "même à minuit.",               line2En: "even at midnight.",
    ctaFr: "Créer mon assistant hôtelier",   ctaEn: "Create my hotel assistant",
    featuresFr: ["Résa 24/7", "Confirmation auto", "Paiement intégré", "Zéro appel manqué"],
    featuresEn: ["24/7 booking", "Auto confirmation", "Integrated payment", "Zero missed calls"],
  },
  {
    image:    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=80",
    overlayA: "#0A1A2EF0", overlayB: "#1A3C5ED0",
    badgeFr: "Disponibilités & Tarifs", badgeEn: "Availability & Rates",
    BadgeIcon: CalendarCheck,
    line1Fr: "Affichez vos disponibilités",  line1En: "Show availability",
    line2Fr: "en temps réel.",               line2En: "in real time.",
    ctaFr: "Activer les disponibilités",     ctaEn: "Enable availability",
    featuresFr: ["Calendrier live", "Tarifs dynamiques", "Chambres multiples", "Sync agenda"],
    featuresEn: ["Live calendar", "Dynamic pricing", "Multiple rooms", "Agenda sync"],
  },
  {
    image:    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1400&q=80",
    overlayA: "#0A1A2EF0", overlayB: "#1A3C5ED0",
    badgeFr: "Concierge Virtuel", badgeEn: "Virtual Concierge",
    BadgeIcon: ConciergeBell,
    line1Fr: "Un concierge toujours",        line1En: "A concierge always",
    line2Fr: "disponible pour vos hôtes.",   line2En: "available for your guests.",
    ctaFr: "Activer le concierge",           ctaEn: "Enable concierge",
    featuresFr: ["Transfert aéroport", "Restauration", "Excursions", "Services extra"],
    featuresEn: ["Airport transfer", "Dining", "Excursions", "Extra services"],
  },
  {
    image:    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1400&q=80",
    overlayA: "#0A1A2EF0", overlayB: "#1A3C5ED0",
    badgeFr: "Fidélisation Clients", badgeEn: "Guest Loyalty",
    BadgeIcon: Star,
    line1Fr: "Transformez chaque séjour",    line1En: "Turn every stay into",
    line2Fr: "en client fidèle.",            line2En: "a loyal guest.",
    ctaFr: "Booster ma fidélisation",        ctaEn: "Boost my loyalty",
    featuresFr: ["Rappels séjour", "Demandes d'avis", "Offres retour", "Taux occupation +22%"],
    featuresEn: ["Stay reminders", "Review requests", "Return offers", "+22% occupancy"],
  },
];

export function HotelHero() {
  const { locale }                        = useLanguage();
  const [current, setCurrent]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total                             = SLIDES.length;

  const goTo = useCallback((i: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(i);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const s = SLIDES[current];
  const { BadgeIcon } = s;

  const sectionStyle: React.CSSProperties = {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  };

  const bgImageStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${s.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 0.6s ease",
    opacity: transitioning ? 0 : 1,
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(135deg, ${s.overlayA} 0%, ${s.overlayB} 100%)`,
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: `${ACCENT}25`,
    border: `1px solid ${ACCENT}60`,
    color: "#fff",
    padding: "0.375rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    marginBottom: "1.5rem",
  };

  const ctaButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: ACCENT,
    color: PRIMARY,
    padding: "0.875rem 2rem",
    borderRadius: "0.75rem",
    fontWeight: 900,
    fontSize: "1rem",
    boxShadow: `0 8px 32px ${ACCENT}60`,
    transition: "transform 0.2s",
  };

  const dotActiveStyle: React.CSSProperties = {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    boxShadow: `0 0 10px ${ACCENT}80`,
    transition: "all 0.3s",
  };

  const dotInactiveStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.32)",
    transition: "all 0.3s",
  };

  return (
    <section style={sectionStyle}>
      <div style={bgImageStyle} />
      <div style={overlayStyle} />

      <div
        className="relative z-10 max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease" }}
      >
        {/* Colonne gauche */}
        <div>
          <div style={badgeStyle}>
            <BadgeIcon size={14} />
            {locale === "fr" ? s.badgeFr : s.badgeEn}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            {locale === "fr" ? s.line1Fr : s.line1En}
            <br />
            <span style={{ color: ACCENT }}>
              {locale === "fr" ? s.line2Fr : s.line2En}
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a
              href={`${ROUTES.onboarding}?sector=hotel`}
              style={ctaButtonStyle}
              className="hover:scale-105"
            >
              {locale === "fr" ? s.ctaFr : s.ctaEn}
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Colonne droite — features */}
        <div className="hidden lg:grid grid-cols-2 gap-3">
          {(locale === "fr" ? s.featuresFr : s.featuresEn).map((f, i) => {
            const featureCardStyle: React.CSSProperties = {
              backgroundColor: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: "0.75rem",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            };
            return (
              <div key={i} style={featureCardStyle}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: `${ACCENT}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} color={ACCENT} />
                </div>
                <span className="text-white text-sm font-semibold">{f}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
        aria-label="Précédent"
      >
        <ChevronLeft size={20} color="#fff" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
        aria-label="Suivant"
      >
        <ChevronRight size={20} color="#fff" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={i === current ? dotActiveStyle : dotInactiveStyle}
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