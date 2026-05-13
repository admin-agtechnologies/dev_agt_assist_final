// ============================================================
// FICHIER : src/app/_components/sector/public/PublicHero.tsx
// Carousel hero 4 slides — landing sectorielle public.
// Couleurs : primary #2D3561, accent #DC2626
// Pattern identique à EcommerceHero.tsx
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Users, Inbox, Megaphone, Building2,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#2D3561";
const ACCENT  = "#DC2626";

interface PublicSlide {
  image: string; overlayA: string; overlayB: string;
  badgeFr: string; badgeEn: string; BadgeIcon: React.ElementType;
  line1Fr: string; line1En: string; line2Fr: string; line2En: string;
  ctaFr: string; ctaEn: string;
  featuresFr: string[]; featuresEn: string[];
}

const SLIDES: PublicSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1400&q=80",
    overlayA: "#1a1f3cF0", overlayB: "#2D3561D0",
    badgeFr: "Accueil citoyen", badgeEn: "Citizen services",
    BadgeIcon: Users,
    line1Fr: "Vos citoyens informés,", line1En: "Your citizens informed,",
    line2Fr: "à toute heure.",        line2En: "at any hour.",
    ctaFr: "Créer mon assistant institutionnel", ctaEn: "Create my institutional assistant",
    featuresFr: ["Réponse 24/7", "WhatsApp", "Zéro file d'attente", "Multi-services"],
    featuresEn: ["24/7 replies", "WhatsApp", "Zero queuing", "Multi-department"],
  },
  {
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=80",
    overlayA: "#1a1f3cF0", overlayB: "#2D3561D0",
    badgeFr: "Gestion des demandes", badgeEn: "Request management",
    BadgeIcon: Inbox,
    line1Fr: "Chaque demande,",        line1En: "Every request,",
    line2Fr: "au bon service.",         line2En: "to the right department.",
    ctaFr: "Automatiser mes demandes",  ctaEn: "Automate my requests",
    featuresFr: ["Tri automatique", "Orientation rapide", "Suivi dossier", "Accusé réception"],
    featuresEn: ["Auto sorting", "Fast routing", "File tracking", "Acknowledgement"],
  },
  {
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=80",
    overlayA: "#1a1f3cF0", overlayB: "#2D3561D0",
    badgeFr: "Communication officielle", badgeEn: "Official communication",
    BadgeIcon: Megaphone,
    line1Fr: "Vos communiqués",         line1En: "Your announcements",
    line2Fr: "atteignent tous les citoyens.", line2En: "reach every citizen.",
    ctaFr: "Diffuser mes informations", ctaEn: "Broadcast my updates",
    featuresFr: ["Alertes urgentes", "Appels d'offres", "Actualités mairie", "Campagnes santé"],
    featuresEn: ["Urgent alerts", "Tenders", "City news", "Health campaigns"],
  },
  {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80",
    overlayA: "#1a1f3cF0", overlayB: "#2D3561D0",
    badgeFr: "Multi-institutions", badgeEn: "Multi-institution",
    BadgeIcon: Building2,
    line1Fr: "Tous vos services,",      line1En: "All your services,",
    line2Fr: "un seul assistant.",      line2En: "one assistant.",
    ctaFr: "Centraliser mes services",  ctaEn: "Centralise my services",
    featuresFr: ["Mairie & préfecture", "Multi-guichets", "Tableau centralisé", "Rapports quotidiens"],
    featuresEn: ["City hall & prefecture", "Multi-counter", "Central dashboard", "Daily reports"],
  },
];

export function PublicHero() {
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
          <a href={`${ROUTES.onboarding}?sector=public`} style={ctaButtonStyle} className="inline-flex items-center gap-2 hover:scale-105">
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