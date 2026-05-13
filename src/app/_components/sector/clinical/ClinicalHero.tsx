// ============================================================
// FICHIER : src/app/_components/sector/clinical/ClinicalHero.tsx
// Carousel hero 4 slides — landing sectorielle clinical.
// Couleurs : primary #0077B6, accent #00B4D8
// Pattern identique à EcommerceHero.tsx
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck, UserCheck, Bell, Stethoscope,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#0077B6";
const ACCENT  = "#00B4D8";

interface ClinicalSlide {
  image: string; overlayA: string; overlayB: string;
  badgeFr: string; badgeEn: string; BadgeIcon: React.ElementType;
  line1Fr: string; line1En: string; line2Fr: string; line2En: string;
  ctaFr: string; ctaEn: string;
  featuresFr: string[]; featuresEn: string[];
}

const SLIDES: ClinicalSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=80",
    overlayA: "#003554F0", overlayB: "#0077B6D0",
    badgeFr: "Prise de RDV médicaux", badgeEn: "Medical appointments",
    BadgeIcon: CalendarCheck,
    line1Fr: "Vos patients sont orientés,", line1En: "Your patients are guided,",
    line2Fr: "même la nuit.",              line2En: "even at night.",
    ctaFr: "Créer mon assistant médical", ctaEn: "Create my medical assistant",
    featuresFr: ["RDV 24/7", "Confirmation auto", "Zéro appel manqué", "Multi-praticiens"],
    featuresEn: ["24/7 bookings", "Auto confirmation", "Zero missed calls", "Multi-practitioner"],
  },
  {
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1400&q=80",
    overlayA: "#003554F0", overlayB: "#0077B6D0",
    badgeFr: "Orientation & Triage", badgeEn: "Orientation & Triage",
    BadgeIcon: UserCheck,
    line1Fr: "Le bon médecin,",           line1En: "The right doctor,",
    line2Fr: "au bon moment.",            line2En: "at the right time.",
    ctaFr: "Activer le triage",          ctaEn: "Enable triage",
    featuresFr: ["Triage par symptômes", "Bon spécialiste", "Orientation rapide", "IA médicale"],
    featuresEn: ["Symptom triage", "Right specialist", "Fast orientation", "Medical AI"],
  },
  {
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=80",
    overlayA: "#003554F0", overlayB: "#0077B6D0",
    badgeFr: "Rappels & Suivi", badgeEn: "Reminders & Follow-up",
    BadgeIcon: Bell,
    line1Fr: "Zéro absent,",             line1En: "Zero no-shows,",
    line2Fr: "grâce aux rappels auto.",   line2En: "thanks to auto reminders.",
    ctaFr: "Activer les rappels",        ctaEn: "Enable reminders",
    featuresFr: ["Rappel J-1", "SMS automatique", "Taux d'absentéisme −40%", "Planning optimisé"],
    featuresEn: ["Day-before reminder", "Automatic SMS", "−40% no-shows", "Optimised schedule"],
  },
  {
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=80",
    overlayA: "#003554F0", overlayB: "#0077B6D0",
    badgeFr: "Communication santé", badgeEn: "Health communication",
    BadgeIcon: Stethoscope,
    line1Fr: "Informez vos patients",    line1En: "Inform your patients",
    line2Fr: "en temps réel.",           line2En: "in real time.",
    ctaFr: "Démarrer maintenant",        ctaEn: "Get started now",
    featuresFr: ["Horaires & fermetures", "Campagnes vaccin", "Conseils santé", "Alertes urgence"],
    featuresEn: ["Hours & closures", "Vaccine campaigns", "Health tips", "Emergency alerts"],
  },
];

export function ClinicalHero() {
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
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a href={`${ROUTES.onboarding}?sector=clinical`} style={ctaButtonStyle} className="hover:scale-105">
              {locale === "fr" ? s.ctaFr : s.ctaEn}<ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-3">
          {(locale === "fr" ? s.featuresFr : s.featuresEn).map((f, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: `${ACCENT}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={14} color={ACCENT} />
              </div>
              <span className="text-white text-sm font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }} aria-label="Précédent"><ChevronLeft size={20} color="#fff" /></button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }} aria-label="Suivant"><ChevronRight size={20} color="#fff" /></button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (<button key={i} onClick={() => goTo(i)} style={i === current ? dotActiveStyle : dotInactiveStyle} />))}
      </div>
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
    </section>
  );
}