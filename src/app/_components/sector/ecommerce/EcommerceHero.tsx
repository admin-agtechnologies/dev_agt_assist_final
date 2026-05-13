// ============================================================
// FICHIER : src/app/_components/sector/ecommerce/EcommerceHero.tsx
// Carousel hero 4 slides — landing sectorielle ecommerce.
// Couleurs : primary #E63946, accent #E63946
// Images : Unsplash commerce en ligne / boutiques africaines
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ShoppingCart, CreditCard, Package, RefreshCcw,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#E63946";
const ACCENT  = "#E63946";

interface EcommerceSlide {
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

const SLIDES: EcommerceSlide[] = [
  {
    // Boutique en ligne / shopping
    image:    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
    overlayA: "#4A0010F0", overlayB: "#E63946D0",
    badgeFr: "Commerce en ligne", badgeEn: "Online commerce",
    BadgeIcon: ShoppingCart,
    line1Fr: "Votre boutique ne ferme",       line1En: "Your store never",
    line2Fr: "jamais.",                        line2En: "closes.",
    ctaFr: "Créer mon assistant e-commerce",  ctaEn: "Create my e-commerce assistant",
    featuresFr: ["Catalogue 24/7", "Commandes WhatsApp", "Paiement intégré", "Support client"],
    featuresEn: ["24/7 catalogue", "WhatsApp orders", "Integrated payment", "Customer support"],
  },
  {
    // Paiement mobile / transaction
    image:    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80",
    overlayA: "#4A0010F0", overlayB: "#E63946D0",
    badgeFr: "Commande & Paiement", badgeEn: "Order & Payment",
    BadgeIcon: CreditCard,
    line1Fr: "Commandez et payez",            line1En: "Order and pay",
    line2Fr: "directement sur WhatsApp.",     line2En: "directly on WhatsApp.",
    ctaFr: "Activer les commandes",           ctaEn: "Enable orders",
    featuresFr: ["Orange Money", "MTN MoMo", "Carte bancaire", "Confirmation auto"],
    featuresEn: ["Orange Money", "MTN MoMo", "Bank card", "Auto confirmation"],
  },
  {
    // Livraison / colis
    image:    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=80",
    overlayA: "#4A0010F0", overlayB: "#E63946D0",
    badgeFr: "Suivi de Commande", badgeEn: "Order Tracking",
    BadgeIcon: Package,
    line1Fr: "Suivez chaque commande",        line1En: "Track every order",
    line2Fr: "en temps réel.",                line2En: "in real time.",
    ctaFr: "Activer le suivi",               ctaEn: "Enable tracking",
    featuresFr: ["Statut en direct", "Notifications SMS", "Numéro de tracking", "Alertes livraison"],
    featuresEn: ["Live status", "SMS notifications", "Tracking number", "Delivery alerts"],
  },
  {
    // Relance / marketing
    image:    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&q=80",
    overlayA: "#4A0010F0", overlayB: "#E63946D0",
    badgeFr: "Relance Panier Abandonné", badgeEn: "Abandoned Cart Recovery",
    BadgeIcon: RefreshCcw,
    line1Fr: "Récupérez vos paniers",         line1En: "Recover your abandoned",
    line2Fr: "abandonnés automatiquement.",   line2En: "carts automatically.",
    ctaFr: "Activer la relance",             ctaEn: "Enable recovery",
    featuresFr: ["Relance automatique", "Message personnalisé", "Délai configurable", "Taux de récup."],
    featuresEn: ["Auto follow-up", "Personalised message", "Configurable delay", "Recovery rate"],
  },
];

export function EcommerceHero() {
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

  // ── Styles extraits ──────────────────────────────────────────────────────
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
    backgroundColor: PRIMARY,
    color: "#fff",
    padding: "0.875rem 2rem",
    borderRadius: "0.75rem",
    fontWeight: 900,
    fontSize: "1rem",
    boxShadow: `0 8px 32px ${PRIMARY}60`,
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
      {/* Image de fond */}
      <div style={bgImageStyle} />
      {/* Overlay dégradé */}
      <div style={overlayStyle} />

      {/* Contenu */}
      <div
        className="relative z-10 max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease" }}
      >
        {/* Colonne gauche */}
        <div>
          {/* Badge */}
          <div style={badgeStyle}>
            <BadgeIcon size={14} />
            {locale === "fr" ? s.badgeFr : s.badgeEn}
          </div>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            {locale === "fr" ? s.line1Fr : s.line1En}
            <br />
            <span style={{ color: ACCENT }}>
              {locale === "fr" ? s.line2Fr : s.line2En}
            </span>
          </h1>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a
              href={`${ROUTES.onboarding}?sector=ecommerce`}
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

      {/* Navigation chevrons */}
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

// END OF FILE: src/app/_components/sector/ecommerce/EcommerceHero.tsx