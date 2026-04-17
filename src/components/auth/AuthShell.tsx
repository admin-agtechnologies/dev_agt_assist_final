// src/components/auth/AuthShell.tsx
"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Sun, Moon, MessageSquare, Phone, CalendarDays, Zap } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ── Colonne gauche branded ────────────────────────────────────────────────────
export function AuthLeftPanel({ locale }: { locale: "fr" | "en" }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12
                    bg-gradient-to-br from-[#075E54] via-[#0a7a6e] to-[#128C7E]
                    text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[#25D366]/10 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10">
        <Link href={ROUTES.home} className="flex items-center gap-2.5 w-fit">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-white text-sm">A</div>
          <span className="font-black text-lg">AGT Platform</span>
        </Link>
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            {locale === "fr" ? "Votre assistant virtuel, disponible 24h/24." : "Your virtual assistant, available 24/7."}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            {locale === "fr"
              ? "Des milliers d'entreprises camerounaises font confiance à AGT Platform."
              : "Thousands of Cameroonian businesses trust AGT Platform."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, value: "50k+", label: locale === "fr" ? "Messages/jour" : "Messages/day" },
            { icon: Phone,         value: "99%",  label: locale === "fr" ? "Disponibilité" : "Uptime" },
            { icon: CalendarDays,  value: "5min", label: locale === "fr" ? "Pour démarrer" : "To start" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2 text-[#25D366]" />
              <p className="text-xl font-black">{value}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
          <p className="text-sm text-white/80 italic leading-relaxed mb-3">
            {locale === "fr"
              ? "« Depuis AGT, nos rendez-vous ont augmenté de 40%. L'assistant répond même la nuit. »"
              : "« Since AGT, our appointments increased by 40%. The assistant responds even at night. »"}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366]/30 flex items-center justify-center text-xs font-black">MN</div>
            <div>
              <p className="text-xs font-bold">Marie Ngo</p>
              <p className="text-[10px] text-white/50">Pharmacie du Centre, Yaoundé</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/20 border border-[#25D366]/30">
          <Zap className="w-3.5 h-3.5 text-[#25D366]" />
          <span className="text-white/80 text-xs">
            {locale === "fr" ? "10 000 FCFA offerts à l'inscription" : "10,000 XAF offered at registration"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Barre top ─────────────────────────────────────────────────────────────────
export function AuthTopBar() {
  const { locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center justify-between px-8 py-5">
      <Link href={ROUTES.home}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">
          {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors">
          {locale === "fr" ? "EN" : "FR"}
        </button>
        <button onClick={toggle}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Shell layout auth 2 colonnes ──────────────────────────────────────────────
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
          © {new Date().getFullYear()} AGT Technologies
        </div>
      </div>
    </div>
  );
}

// ── Bouton Google isolé ───────────────────────────────────────────────────────
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
    <button type="button" onClick={() => handleGoogleLogin()}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                 border border-[var(--border)] bg-[var(--bg-card)]
                 hover:bg-[var(--bg)] transition-colors text-sm font-semibold
                 text-[var(--text)] shadow-sm">
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </button>
  );
}

// ── Wrapper GoogleOAuthProvider ───────────────────────────────────────────────
export function WithGoogleOAuth({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      {children}
    </GoogleOAuthProvider>
  );
}