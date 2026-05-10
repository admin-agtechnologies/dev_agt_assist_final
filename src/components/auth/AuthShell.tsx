// src/components/auth/AuthShell.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useSector } from "@/hooks/useSector";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Sun, Moon, Zap } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getSectorContent } from "@/lib/sector-content";
import { getLogoAssets } from "@/lib/logo-config";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ── Colonne gauche branded — sectorielle ──────────────────────────────────────
export function AuthLeftPanel({ locale }: { locale: "fr" | "en" }) {
  const { sector, theme } = useSector();
  const content = getSectorContent(sector);
  const logo = getLogoAssets(sector);

  // Titre :
  //   - central → "AGT-BOT" seul
  //   - secteur → "AGT-BOT {labelFr/labelEn}"
  const title = sector === "central"
    ? "AGT-BOT"
    : `AGT-BOT ${locale === "fr" ? theme.labelFr : theme.labelEn}`;

  // Gradient sectoriel : primary → accent
  const gradient = `linear-gradient(180deg, ${theme.primary} 0%, ${theme.accent} 100%)`;
  // Couches sombre (lisibilité) au-dessus du gradient et de l'image
  const overlay = `linear-gradient(180deg, ${theme.primary}99 0%, ${theme.primary}E6 100%)`;

  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Image de fond générique avec overlay */}
      <Image
        src="/images/hero/image-login.png"
        alt=""
        fill
        sizes="50vw"
        priority
        className="object-cover opacity-40 mix-blend-overlay"
      />
      <div className="absolute inset-0" style={{ background: overlay }} />

      {/* Header — logo sectoriel + titre */}
      <div className="relative z-10">
        <Link href={ROUTES.home} className="flex items-center gap-2.5 w-fit">
          <div className="w-10 h-10 rounded-xl bg-white/95 flex items-center justify-center overflow-hidden p-1">
            <Image
              src={logo.lightSvg ?? logo.light}
              alt={title}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-black text-lg">{title}</span>
        </Link>
      </div>

      {/* Centre — tagline + stats + témoignage */}
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            {locale === "fr" ? content.taglineFr : content.taglineEn}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            {locale === "fr" ? content.descriptionFr : content.descriptionEn}
          </p>
        </div>

        {/* 3 stats sectorielles */}
        <div className="grid grid-cols-3 gap-4">
          {content.stats.map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-[10px] text-white/70 mt-1 leading-tight">
                {locale === "fr" ? stat.labelFr : stat.labelEn}
              </p>
            </div>
          ))}
        </div>

        {/* Témoignage sectoriel */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
          <p className="text-sm text-white/85 italic leading-relaxed mb-3">
            « {locale === "fr" ? content.testimonial.quoteFr : content.testimonial.quoteEn} »
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
              style={{ backgroundColor: `${theme.accent}55` }}
            >
              {content.testimonial.initials}
            </div>
            <p className="text-[11px] text-white/80 font-medium">
              {content.testimonial.author}
            </p>
          </div>
        </div>
      </div>

      {/* Footer — badge bonus */}
      <div className="relative z-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            backgroundColor: `${theme.accent}33`,
            borderColor: `${theme.accent}55`,
          }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span className="text-white/90 text-xs">
            {locale === "fr" ? content.badgeFr : content.badgeEn}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Barre top ────────────────────────────────────────────────────────────────
export function AuthTopBar() {
  const { locale, setLocale } = useLanguage();
  const { theme: uiTheme, toggle } = useTheme();
  return (
    <div className="flex items-center justify-between px-8 py-5">
      <Link
        href={ROUTES.home}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">
          {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
        >
          {locale === "fr" ? "EN" : "FR"}
        </button>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
        >
          {uiTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Shell layout auth 2 colonnes ─────────────────────────────────────────────
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <AuthLeftPanel locale={locale} />
      <div className="flex-1 flex flex-col">
        <AuthTopBar />
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="px-8 py-5 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} AG Technologies
        </div>
      </div>
    </div>
  );
}

// ── Bouton Google isolé ──────────────────────────────────────────────────────
export function GoogleButton({ onSuccess, onError, label }: {
  onSuccess: (user: { email: string; name: string; sub: string }) => Promise<void>;
  onError: () => void;
  label: string;
}) {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json() as { email: string; name: string; sub: string };
        await onSuccess(googleUser);
      } catch { onError(); }
    },
    onError,
  });

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                 border border-[var(--border)] bg-[var(--bg-card)]
                 hover:bg-[var(--bg)] transition-colors text-sm font-semibold
                 text-[var(--text)] shadow-sm"
    >
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  );
}

// ── Wrapper GoogleOAuthProvider ──────────────────────────────────────────────
export function WithGoogleOAuth({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      {children}
    </GoogleOAuthProvider>
  );
}

// END OF FILE: src/components/auth/AuthShell.tsx