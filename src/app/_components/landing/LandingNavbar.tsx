// ============================================================
// FICHIER : src/app/_components/landing/LandingNavbar.tsx
// Navbar partagée hub + landings sectorielles.
// Props optionnelles :
//   - primaryColor : couleur CTA + accent nav
//   - logoSvg      : SVG transparent (prioritaire) — s'adapte à tout fond
//   - logoLight    : PNG fond clair (fallback rétrocompat)
//   - logoDark     : PNG fond sombre (fallback rétrocompat)
//   - backHref     : si défini → affiche "Voir les autres secteurs"
// Sans props → hub par défaut (SVG central transparent).
// ============================================================
"use client";
import Link from "next/link";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ROUTES } from "@/lib/constants";
import { getLogoAssets } from "@/lib/logo-config";

const DEFAULT_PRIMARY = "#075E54";
const centralLogo     = getLogoAssets("hub");

interface LandingNavbarProps {
  primaryColor?: string;
  /** SVG transparent — prioritaire sur logoLight/logoDark */
  logoSvg?:      string;
  /** PNG fond clair — utilisé si logoSvg absent (rétrocompat) */
  logoLight?:    string;
  /** PNG fond sombre — utilisé si logoSvg absent (rétrocompat) */
  logoDark?:     string;
  /** Si défini, affiche "Voir les autres secteurs" dans le menu */
  backHref?:     string;
}

export function LandingNavbar({
  primaryColor = DEFAULT_PRIMARY,
  logoSvg      = centralLogo.darkSvg,
  logoLight    = centralLogo.light,
  logoDark     = centralLogo.dark,
  backHref,
}: LandingNavbarProps) {
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.landing;

  // Priorité : SVG transparent > PNG selon thème
  const currentLogo = logoSvg ?? (theme === "dark" ? logoDark : logoLight);

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href={ROUTES.home} className="flex items-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLogo}
            alt="AGT-BOT"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Nav desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
          <a href="#features"     className="hover:text-[var(--text)] transition-colors">{t.navFeatures}</a>
          <a href="#demo"         className="hover:text-[var(--text)] transition-colors">{t.navDemo}</a>
          <a href="#testimonials" className="hover:text-[var(--text)] transition-colors">{t.navTestimonials}</a>

          {/* Hub : "Nos solutions" | Secteur : "Voir les autres secteurs" */}
          {!backHref ? (
            <a
              href="#secteurs"
              className="flex items-center gap-1 font-semibold transition-colors"
              style={{ color: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "fr" ? "Nos solutions" : "Our solutions"}
            </a>
          ) : (
            <Link
              href={ROUTES.home}
              className="flex items-center gap-1 font-semibold transition-colors"
              style={{ color: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "fr" ? "Voir les autres secteurs" : "Other solutions"}
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors text-xs font-bold"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
            aria-label="Basculer le thème"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href={ROUTES.login}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          >
            {locale === "fr" ? "Se connecter" : "Log in"}
          </Link>
          <Link
            href={ROUTES.onboarding}
            className="px-3 sm:px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{ backgroundColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40` }}
          >
            <span className="hidden sm:inline">
              {locale === "fr" ? "Créer mon assistant" : "Create my assistant"}
            </span>
            <span className="sm:hidden">
              {locale === "fr" ? "Démarrer" : "Start"}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// END OF FILE: src/app/_components/landing/LandingNavbar.tsx