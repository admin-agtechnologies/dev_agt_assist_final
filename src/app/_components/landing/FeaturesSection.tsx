// ============================================================
// FICHIER : src/app/_components/landing/FeaturesSection.tsx
// Section 6 fonctionnalités — icônes depuis FEATURE_ICONS.
// Textes depuis d.landing (dictionnaire existant).
// ============================================================
"use client";
import { Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FEATURE_ICONS } from "./LandingData";

export function FeaturesSection() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.landing;

  const features = [
    { key: "feature1", titleFr: t.feature1Title, titleEn: t.feature1Title, descFr: t.feature1Desc, descEn: t.feature1Desc },
    { key: "feature2", titleFr: t.feature2Title, titleEn: t.feature2Title, descFr: t.feature2Desc, descEn: t.feature2Desc },
    { key: "feature3", titleFr: t.feature3Title, titleEn: t.feature3Title, descFr: t.feature3Desc, descEn: t.feature3Desc },
    { key: "feature4", titleFr: t.feature4Title, titleEn: t.feature4Title, descFr: t.feature4Desc, descEn: t.feature4Desc },
    { key: "feature5", titleFr: t.feature5Title, titleEn: t.feature5Title, descFr: t.feature5Desc, descEn: t.feature5Desc },
    { key: "feature6", titleFr: t.feature6Title, titleEn: t.feature6Title, descFr: t.feature6Desc, descEn: t.feature6Desc },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-20">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#075E54]/10 border border-[#075E54]/20 text-[#075E54] text-xs font-bold mb-4 uppercase tracking-widest">
          <Zap className="w-3 h-3" />
          {locale === "fr" ? "Fonctionnalités" : "Features"}
        </div>
        <h2 className="text-3xl font-black text-[var(--text)] mb-4">
          {t.featuresTitle}
        </h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          {locale === "fr"
            ? "AGT Platform regroupe toutes les fonctionnalités essentielles pour automatiser votre service client."
            : "AGT Platform includes all the essential features to automate your customer service."}
        </p>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => {
          const Icon = FEATURE_ICONS[f.key];
          return (
            <div
              key={f.key}
              className="card p-6 group hover:border-[#25D366]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/20 group-hover:scale-110 transition-all">
                {Icon && <Icon className="w-5 h-5 text-[#075E54]" />}
              </div>
              <h3 className="font-bold text-[var(--text)] mb-2">
                {locale === "fr" ? f.titleFr : f.titleEn}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {locale === "fr" ? f.descFr : f.descEn}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}