// ============================================================
// FICHIER : src/app/_components/sector/restaurant/RestaurantFeatures.tsx
// 5 features actives uniquement — pas de fidélité, pas de livraison.
// ============================================================
"use client";
import { CalendarDays, UtensilsCrossed, ShoppingCart, MessageSquare, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PRIMARY = "#F97316";
const ACCENT  = "#FDBA74";

const FEATURE_ICONS = [CalendarDays, UtensilsCrossed, ShoppingCart, MessageSquare, Phone];

export function RestaurantFeatures() {
  const { dictionary: d } = useLanguage();
  const t = d.restaurant;

  const features = [
    { key: "feature1", title: t.feature1Title, desc: t.feature1Desc },
    { key: "feature2", title: t.feature2Title, desc: t.feature2Desc },
    { key: "feature3", title: t.feature3Title, desc: t.feature3Desc },
    { key: "feature4", title: t.feature4Title, desc: t.feature4Desc },
    { key: "feature5", title: t.feature5Title, desc: t.feature5Desc },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-20">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
          style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}25` }}
        >
          <UtensilsCrossed className="w-3 h-3" />
          {t.featuresTag}
        </div>
        <h2 className="text-3xl font-black text-[var(--text)] mb-4">
          {t.featuresTitle}
        </h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          {t.featuresSubtitle}
        </p>
      </div>

      {/* Grille 5 features — 3 + 2 centré */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <div
              key={f.key}
              className={`card p-6 group hover:-translate-y-1 transition-all duration-300 ${
                i >= 3 ? "lg:col-start-auto" : ""
              }`}
              style={{ borderTop: `3px solid ${i < 3 ? PRIMARY : ACCENT}` }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ backgroundColor: `${PRIMARY}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
              <h3 className="font-bold text-[var(--text)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          );
        })}

        {/* Dernière cellule — CTA "votre secteur" */}
        <div
          className="card p-6 flex flex-col items-center justify-center text-center gap-3"
          style={{ background: `linear-gradient(135deg, ${PRIMARY}10 0%, ${ACCENT}10 100%)`, border: `1px dashed ${PRIMARY}40` }}
        >
          <p className="text-sm font-bold text-[var(--text)]">
            Votre secteur n'est pas restaurant ?
          </p>
          <a
            href="/"
            className="text-xs font-semibold underline"
            style={{ color: PRIMARY }}
          >
            Voir toutes les solutions →
          </a>
        </div>
      </div>
    </section>
  );
}