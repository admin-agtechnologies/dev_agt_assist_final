// ============================================================
// FICHIER : src/app/_components/sector/pme/PmeHero.tsx
// Carousel hero 4 slides — landing sectorielle pme.
// Couleurs : primary #075E54, accent #10B981
// Pattern identique à EcommerceHero.tsx
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  MessageCircle, TrendingUp, Package, RefreshCcw,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#075E54";
const ACCENT  = "#10B981";

interface PmeSlide {
  image: string; overlayA: string; overlayB: string;
  badgeFr: string; badgeEn: string; BadgeIcon: React.ElementType;
  line1Fr: string; line1En: string; line2Fr: string; line2En: string;
  ctaFr: string; ctaEn: string;
  featuresFr: string[]; featuresEn: string[];
}

const SLIDES: PmeSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80",
    overlayA: "#022c22F0", overlayB: "#075E54D0",
    badgeFr: "Support client", badgeEn: "Customer support",
    BadgeIcon: MessageCircle,
    line1Fr: "Votre PME, professionnelle", line1En: "Your SME, professional",
    line2Fr: "24h/24.",                   line2En: "24/7.",
    ctaFr: "Créer mon assistant PME",    ctaEn: "Create my SME assistant",
    featuresFr: ["Réponse 24/7", "WhatsApp", "Zéro appel manqué", "Multi-canal"],
    featuresEn: ["24/7 replies", "WhatsApp", "Zero missed calls", "Multi-channel"],
  },
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80",
    overlayA: "#022c22F0", overlayB: "#075E54D0",
    badgeFr: "Conversion prospects", badgeEn: "Lead conversion",
    BadgeIcon: TrendingUp,
    line1Fr: "Convertissez plus de leads",  line1En: "Convert more leads",
    line2Fr: "automatiquement.",            line2En: "automatically.",
    ctaFr: "Booster mes conversions",      ctaEn: "Boost my conversions",
    featuresFr: ["Qualification auto", "Réponse ciblée", "Suivi pipeline", "Taux conversion +40%"],
    featuresEn: ["Auto qualification", "Targeted reply", "Pipeline tracking", "+40% conversion"],
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400&q=80",
    overlayA: "#022c22F0", overlayB: "#075E54D0",
    badgeFr: "Catalogue & Commandes", badgeEn: "Catalogue & Orders",
    BadgeIcon: Package,
    line1Fr: "Votre catalogue toujours", line1En: "Your catalogue always",
    line2Fr: "disponible sur WhatsApp.", line2En: "available on WhatsApp.",
    ctaFr: "Activer mon catalogue",     ctaEn: "Enable my catalogue",
    featuresFr: ["Catalogue WhatsApp", "Commandes auto", "Paiement intégré", "Stock en direct"],
    featuresEn: ["WhatsApp catalogue", "Auto orders", "Integrated payment", "Live stock"],
  },
  {
    image: "https://images.unsplash.com/photo-1543269665-7821e259a8df?w=1400&q=80",
    overlayA: "#022c22F0", overlayB: "#075E54D0",
    badgeFr: "Fidélisation clients", badgeEn: "Customer loyalty",
    BadgeIcon: RefreshCcw,
    line1Fr: "Relancez vos clients",     line1En: "Re-engage your customers",
    line2Fr: "sans effort.",             line2En: "effortlessly.",
    ctaFr: "Fidéliser mes clients",      ctaEn: "Retain my customers",
    featuresFr: ["Relance automatique", "Offres ciblées", "Programme fidélité", "Anniversaires"],
    featuresEn: ["Auto follow-up", "Targeted offers", "Loyalty programme", "Birthdays"],
  },
];

export function PmeHero() {
  const { locale }                        = useLanguage();
  const [current, setCurrent]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total                             = SLIDES.length;

  const goTo = useCallback((i: number) => {
    if (transitioning) return;
    setTransitioning(true); setCurrent(i);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);

  useEffect(() => { const t = setInterval(next, 5500); return () => clearInterval(t); }, [next]);

  const s = SLIDES[current];
  const { BadgeIcon } = s;

  const sectionStyle: React.CSSProperties = { position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" };
  const bgImageStyle: React.CSSProperties = { position: "absolute", inset: 0, backgroundImage: `url(${s.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "opacity 0.6s ease", opacity: transitioning ? 0 : 1 };
  const overlayStyle: React.CSSProperties = { position: "absolute", inset: 0, background: `linear-gradient(135deg, ${s.overlayA} 0%, ${s.overlayB} 100%)` };
  const badgeStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${ACCENT}25`, border: `1px solid ${ACCENT}60`, color: "#fff", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: "1.5rem" };
  const ctaButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: ACCENT, color: "#fff", padding: "0.875rem 2rem", borderRadius: "0.75rem", fontWeight: 900, fontSize: "1rem", boxShadow: `0 8px 32px ${ACCENT}60`, transition: "transform 0.2s" };
  const dotActiveStyle: React.CSSProperties = { width: 24, height: 8, borderRadius: 4, backgroundColor: ACCENT, boxShadow: `0 0 10px ${ACCENT}80`, transition: "all 0.3s" };
  const dotInactiveStyle: React.CSSProperties = { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.32)", transition: "all 0.3s" };

  return (
    <section style={sectionStyle}>
      <div style={bgImageStyle} />
      <div style={overlayStyle} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease" }}>
        <div>
          <div style={badgeStyle}><BadgeIcon size={14} />{locale === "fr" ? s.badgeFr : s.badgeEn}</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            {locale === "fr" ? s.line1Fr : s.line1En}<br />
            <span style={{ color: ACCENT }}>{locale === "fr" ? s.line2Fr : s.line2En}</span>
          </h1>
          <a href={`${ROUTES.onboarding}?sector=pme`} style={ctaButtonStyle} className="inline-flex items-center gap-2 hover:scale-105">
            {locale === "fr" ? s.ctaFr : s.ctaEn}<ArrowRight size={18} />
          </a>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-3">
          {(locale === "fr" ? s.featuresFr : s.featuresEn).map((f, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: `${ACCENT}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={14} color={ACCENT} /></div>
              <span className="text-white text-sm font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }} aria-label="Précédent"><ChevronLeft size={20} color="#fff" /></button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }} aria-label="Suivant"><ChevronRight size={20} color="#fff" /></button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">{SLIDES.map((_, i) => (<button key={i} onClick={() => goTo(i)} style={i === current ? dotActiveStyle : dotInactiveStyle} />))}</div>
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
    </section>
  );
}