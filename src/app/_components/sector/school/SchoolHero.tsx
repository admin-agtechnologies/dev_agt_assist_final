// ============================================================
// FICHIER : src/app/_components/sector/school/SchoolHero.tsx
// Carousel hero 4 slides — landing sectorielle school.
// Couleurs : primary #3A0CA3, accent #6D28D9
// Images : Unsplash éducation sélectionnées pour qualité
// ============================================================
"use client";
import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap, CalendarDays, Mail, BookOpen,
  ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

const PRIMARY = "#3A0CA3";
const ACCENT  = "#6D28D9";

interface SchoolSlide {
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

const SLIDES: SchoolSlide[] =[
  {
    // Étudiants sur le campus
    image:    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80",
    overlayA: "#1A054DF0", overlayB: "#3A0CA3D0",
    badgeFr: "Éducation & Formation", badgeEn: "Education & Training",
    BadgeIcon: GraduationCap,
    line1Fr: "L'école du futur,",             line1En: "The school of the future,",
    line2Fr: "connectée à chaque famille.",   line2En: "connected to every family.",
    ctaFr: "Créer mon assistant scolaire",    ctaEn: "Create my school assistant",
    featuresFr: ["Admissions 24/7", "Catalogue formations", "Multi-campus", "FAQ parents"],
    featuresEn: ["Admissions 24/7", "Course catalog", "Multi-campus", "Parents FAQ"],
  },
  {
    // Étudiant remplissant un dossier
    image:    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=80",
    overlayA: "#1A054DF0", overlayB: "#3A0CA3D0",
    badgeFr: "Inscriptions & Admissions", badgeEn: "Enrollment & Admissions",
    BadgeIcon: CalendarDays,
    line1Fr: "Gérez vos admissions",          line1En: "Manage your admissions",
    line2Fr: "simplement et sans papier.",    line2En: "simply and paperless.",
    ctaFr: "Activer les admissions",          ctaEn: "Enable admissions",
    featuresFr: ["Dépôt de dossier", "Prise de RDV", "Confirmation instantanée", "Rappels automatiques"],
    featuresEn: ["File submission", "Appointment booking", "Instant confirmation", "Auto reminders"],
  },
  {
    // Professeur et communication
    image:    "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1400&q=80",
    overlayA: "#120338F0", overlayB: "#3A0CA3D0",
    badgeFr: "Communication Établissement", badgeEn: "School Communication",
    BadgeIcon: Mail,
    line1Fr: "Informez les parents,",         line1En: "Inform the parents,",
    line2Fr: "en un seul clic par email.",    line2En: "in one click via email.",
    ctaFr: "Gérer la communication",          ctaEn: "Manage communication",
    featuresFr: ["Annonces globales", "Alertes absences", "Résultats scolaires", "Modèles d'emails"],
    featuresEn: ["Global announcements", "Absence alerts", "School grades", "Email templates"],
  },
  {
    // Bibliothèque / Catalogue
    image:    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&q=80",
    overlayA: "#1A054DF0", overlayB: "#6D28D9D0",
    badgeFr: "Catalogue Formations", badgeEn: "Course Catalog",
    BadgeIcon: BookOpen,
    line1Fr: "Toutes vos formations,",        line1En: "All your courses,",
    line2Fr: "accessibles à toute heure.",    line2En: "accessible around the clock.",
    ctaFr: "Créer mon catalogue",             ctaEn: "Create my catalog",
    featuresFr: ["Niveaux d'études", "Frais de scolarité", "Prérequis", "Débouchés"],
    featuresEn: ["Study levels", "Tuition fees", "Prerequisites", "Career opportunities"],
  },
];

export function SchoolHero() {
  const { locale } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const total = SLIDES.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  const s    = SLIDES[current];
  const isFr = locale === "fr";

  const sectionStyle: React.CSSProperties = { minHeight: "92vh" };

  const bgStyle: React.CSSProperties = { backgroundImage: `url(${s.image})` };

  const overlayStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${s.overlayA} 0%, ${s.overlayB} 100%)`,
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: `${ACCENT}20`,
    borderColor: `${ACCENT}50`,
    color: ACCENT,
  };

  const accentSpanStyle: React.CSSProperties = { color: ACCENT };

  const checkStyle: React.CSSProperties = { color: ACCENT };

  const ctaBtnStyle: React.CSSProperties = {
    backgroundColor: ACCENT,
    color: "#fff",
    boxShadow: `0 8px 24px ${ACCENT}40`,
  };

  const chevronStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.15)",
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={sectionStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={bgStyle}
      />

      {/* Overlay dégradé school */}
      <div className="absolute inset-0" style={overlayStyle} />

      {/* Contenu principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-20 flex flex-col justify-center min-h-[92vh]">
        <div className="max-w-2xl">

          {/* Badge secteur */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border"
            style={badgeStyle}
          >
            <s.BadgeIcon className="w-3.5 h-3.5" />
            {isFr ? s.badgeFr : s.badgeEn}
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            {isFr ? s.line1Fr : s.line1En}
            <br />
            <span style={accentSpanStyle}>
              {isFr ? s.line2Fr : s.line2En}
            </span>
          </h1>

          {/* Features checkées */}
          <ul className="flex flex-wrap gap-3 mb-8">
            {(isFr ? s.featuresFr : s.featuresEn).map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-sm text-white/80">
                <Check className="w-4 h-4 flex-shrink-0" style={checkStyle} />
                {f}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`${ROUTES.onboarding}?sector=school`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
              style={ctaBtnStyle}
            >
              {isFr ? s.ctaFr : s.ctaEn}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={ROUTES.login}
              className="text-sm text-white/60 hover:text-white transition-colors self-center underline underline-offset-2"
            >
              {isFr ? "J'ai déjà un compte" : "I already have an account"}
            </a>
          </div>

        </div>
      </div>

      {/* Chevron gauche */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={chevronStyle}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Chevron droit */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={chevronStyle}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots indicateurs */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => {
          const dotStyle: React.CSSProperties = {
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? ACCENT : "rgba(255,255,255,0.32)",
            boxShadow: i === current ? `0 0 10px ${ACCENT}80` : "none",
            transition: "all 0.3s",
          };
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={dotStyle}
            />
          );
        })}
      </div>

      {/* Compteur slides */}
      <div className="absolute bottom-10 right-6 z-20 text-white/30 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

    </section>
  );
}