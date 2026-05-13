// ============================================================
// FICHIER : src/app/_components/sector/public/PublicFeatures.tsx
// Grille 6 features — landing sectorielle public.
// Couleurs : primary #2D3561, accent #DC2626
// Pattern identique à EcommerceFeatures.tsx
// ============================================================
"use client";
import {
  Users, Inbox, CalendarCheck,
  Megaphone, FolderOpen, Building2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PRIMARY = "#2D3561";
const ACCENT  = "#DC2626";

const FEATURES = [
  { icon: Users,        titleKey: "feature1Title" as const, descKey: "feature1Desc" as const },
  { icon: Inbox,        titleKey: "feature2Title" as const, descKey: "feature2Desc" as const },
  { icon: CalendarCheck,titleKey: "feature3Title" as const, descKey: "feature3Desc" as const },
  { icon: Megaphone,    titleKey: "feature4Title" as const, descKey: "feature4Desc" as const },
  { icon: FolderOpen,   titleKey: "feature5Title" as const, descKey: "feature5Desc" as const },
  { icon: Building2,    titleKey: "feature6Title" as const, descKey: "feature6Desc" as const },
];

export function PublicFeatures() {
  const { dictionary: d } = useLanguage();
  const t = d.public_;

  const sectionStyle: React.CSSProperties = { backgroundColor: "var(--bg)", padding: "5rem 0" };
  const tagStyle: React.CSSProperties = { backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, color: ACCENT, display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "1rem" };
  const iconWrapStyle: React.CSSProperties = { width: 48, height: 48, borderRadius: "0.75rem", backgroundColor: `${PRIMARY}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", flexShrink: 0 };

  return (
    <section id="features" style={sectionStyle}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div style={tagStyle}><Building2 size={12} />{t.featuresTag}</div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] mb-4">{t.featuresTitle}</h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm leading-relaxed">{t.featuresSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, titleKey, descKey }) => {
            const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card, var(--bg))", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem", transition: "box-shadow 0.2s, border-color 0.2s" };
            return (
              <div key={titleKey} style={cardStyle} className="hover:shadow-md group"
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${PRIMARY}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}>
                <div style={iconWrapStyle}><Icon size={22} style={{ color: PRIMARY }} /></div>
                <h3 className="text-base font-black text-[var(--text)] mb-2">{t[titleKey]}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t[descKey]}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <a href="/" className="text-sm font-semibold transition-colors" style={{ color: PRIMARY }}>
            {"Votre activité n'est pas dans le secteur public ? → Voir toutes les solutions →"}
          </a>
        </div>
      </div>
    </section>
  );
}