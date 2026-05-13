// ============================================================
// FICHIER : src/app/_components/sector/banking/BankingFeatures.tsx
// Grille 6 features — landing sectorielle banking.
// Couleurs : primary #1B4332, accent #1B7B47
// ============================================================
"use client";
import Link from "next/link";
import {
  CalendarDays, Landmark, Building2,
  MessageCircle, Mic, BookOpen,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PRIMARY = "#1B4332";
const ACCENT  = "#1B7B47";

const ICONS = [CalendarDays, Landmark, Building2, MessageCircle, Mic, BookOpen];

export function BankingFeatures() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.banking;
  const isFr = locale === "fr";

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc, Icon: ICONS[0] },
    { title: t.feature2Title, desc: t.feature2Desc, Icon: ICONS[1] },
    { title: t.feature3Title, desc: t.feature3Desc, Icon: ICONS[2] },
    { title: t.feature4Title, desc: t.feature4Desc, Icon: ICONS[3] },
    { title: t.feature5Title, desc: t.feature5Desc, Icon: ICONS[4] },
    { title: t.feature6Title, desc: t.feature6Desc, Icon: ICONS[5] },
  ];

  const tagStyle: React.CSSProperties = {
    backgroundColor: `${ACCENT}18`,
    color: ACCENT,
    border: `1px solid ${ACCENT}40`,
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
          style={tagStyle}
        >
          {t.featuresTag}
        </div>
        <h2 className="text-3xl font-black text-[var(--text)] mb-3">
          {t.featuresTitle}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          {t.featuresSubtitle}
        </p>
      </div>

      {/* Grille 3 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.Icon;
          const iconBg: React.CSSProperties = { backgroundColor: `${PRIMARY}12` };
          const iconColor: React.CSSProperties = { color: PRIMARY };
          const borderTop: React.CSSProperties = {
            borderTop: `3px solid ${i < 3 ? PRIMARY : ACCENT}`,
          };
          return (
            <div
              key={i}
              className="card p-6 group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              style={borderTop}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={iconBg}
              >
                <Icon className="w-6 h-6" style={iconColor} />
              </div>
              <h3 className="font-bold text-[var(--text)] mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CTA bas — centré, plus élégant */}
      <div className="flex justify-center mt-10">
        <div
          className="inline-flex flex-col sm:flex-row items-center gap-3 px-8 py-5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY}0A 0%, ${ACCENT}0A 100%)`,
            border: `1px dashed ${PRIMARY}30`,
          }}
        >
          <p className="text-sm font-semibold text-[var(--text)]">
            {isFr
              ? "Votre activité n'est pas bancaire ?"
              : "Your business isn't banking?"}
          </p>
          <Link
            href="/"
            className="text-sm font-bold underline underline-offset-2 whitespace-nowrap"
            style={{ color: PRIMARY }}
          >
            {isFr ? "Voir toutes les solutions →" : "See all solutions →"}
          </Link>
        </div>
      </div>
    </section>
  );
}