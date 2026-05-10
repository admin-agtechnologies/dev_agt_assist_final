"use client";
// ============================================================
// FICHIER : src/app/not-found.tsx
// Page 404 sectorielle — i18n via useLanguage + couleur via useSector()
// BUG-019 : 404 sectoriel
// BUG-020 : useSector() (env > localStorage > subdomain)
// Logo : vrai logo sectoriel via getLogoAssets (cohérence visuelle totale)
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { getLogoAssets } from "@/lib/logo-config";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  const { dictionary: d, locale } = useLanguage();
  const { sector, theme } = useSector();
  const t = d.errors;

  const accentColor = theme.accent;
  const sectorLabel = locale === "fr" ? theme.labelFr : theme.labelEn;
  const sectorName  = sector === "central" ? "AGT-BOT" : `AGT-BOT ${sectorLabel}`;
  const logo        = getLogoAssets(sector);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 text-center">
      {/* Logo sectoriel — fond blanc pour cohérence avec versions claires */}
      <div className="w-28 h-28 rounded-3xl bg-white shadow-md flex items-center justify-center mb-8 p-3 border border-[var(--border)]">
        <Image
          src={logo.lightSvg ?? logo.light}
          alt={sectorName}
          width={88}
          height={88}
          className="object-contain"
          priority
        />
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
        {sectorName} &bull; AG Technologies &bull; Cameroun
      </p>
    </div>
  );
}

// END OF FILE: src/app/not-found.tsx