"use client";
// ============================================================
// FICHIER : src/app/not-found.tsx
// Page 404 sectorielle — i18n via useLanguage + couleur sectorielle
// BUG-019 : remplace le 404 Next.js générique
// ============================================================

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { SECTOR_COLORS } from "@/components/onboarding/SectorPicker";
import { ROUTES } from "@/lib/constants";

const SECTOR_NAMES: Record<string, { fr: string; en: string }> = {
  restaurant: { fr: "AGT-BOT Restaurant",       en: "AGT-BOT Restaurant" },
  hotel:      { fr: "AGT-BOT Hôtel",            en: "AGT-BOT Hotel" },
  ecommerce:  { fr: "AGT-BOT E-commerce",       en: "AGT-BOT E-commerce" },
  transport:  { fr: "AGT-BOT Transport",         en: "AGT-BOT Transport" },
  banking:    { fr: "AGT-BOT Banque & Finance",  en: "AGT-BOT Banking & Finance" },
  clinical:   { fr: "AGT-BOT Santé",             en: "AGT-BOT Health" },
  pme:        { fr: "AGT-BOT PME",               en: "AGT-BOT SME" },
  school:     { fr: "AGT-BOT Éducation",         en: "AGT-BOT Education" },
  public:     { fr: "AGT-BOT Service Public",    en: "AGT-BOT Public Service" },
  custom:     { fr: "AGT-BOT",                   en: "AGT-BOT" },
};

export default function NotFound() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.errors;

  const sector      = process.env.NEXT_PUBLIC_SECTOR ?? "";
  const accentColor = SECTOR_COLORS[sector] ?? "#25D366";
  const sectorName  = SECTOR_NAMES[sector]?.[locale] ?? "AGT-BOT";
  const logoLetter  = sectorName.charAt(sectorName.lastIndexOf(" ") + 1);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 text-center">

      {/* Logo lettre sectoriel */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 text-white font-black text-4xl"
        style={{ backgroundColor: accentColor }}
      >
        {logoLetter}
      </div>

      {/* Code 404 */}
      <p className="text-8xl font-black mb-4 leading-none" style={{ color: accentColor }}>
        404
      </p>

      {/* Texte i18n */}
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
        {t.notFoundTitle}
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-2 max-w-sm leading-relaxed">
        {t.notFoundSubtitle}
      </p>
      <p className="text-xs text-[var(--text-muted)] mb-8 font-medium">
        {sectorName}
      </p>

      {/* Actions i18n */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ROUTES.dashboard}
          className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          {t.notFoundDashboard}
        </Link>
        <Link
          href={ROUTES.login}
          className="px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-[var(--bg-200,#f9fafb)]"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {t.notFoundLogin}
        </Link>
      </div>

      <p className="mt-12 text-xs text-[var(--text-muted)]">
        {sectorName} &bull; AGT Technologies &bull; Cameroun
      </p>

    </div>
  );
}