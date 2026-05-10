// src/app/login/page.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { Spinner } from "@/components/ui";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import { authRepository } from "@/repositories";
import { AuthShell, GoogleButton } from "@/components/auth/AuthShell";
import { setStoredSector, isValidSector } from "@/lib/sector-config";
import { redirectAfterAuth } from "@/lib/sector-redirect";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Tab = "password" | "magic";
type View = "login" | "forgot" | "forgotSent" | "magicSent";

// ═════════════════════════════════════════════════════════════════════════════
// PAGE LOGIN
// ═════════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </GoogleOAuthProvider>
  );
}

// ── Formulaire login ─────────────────────────────────────────────────────────
function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { dictionary: d } = useLanguage();
  const { theme } = useSector();
  const t = d.auth;
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("password");
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  /** Persiste le secteur de l'entreprise après auth réussie. */
  const persistSectorFromMe = (sectorSlug?: string | null) => {
    if (sectorSlug && isValidSector(sectorSlug)) setStoredSector(sectorSlug);
  };

  // ── Connexion email/password ──────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await login({ email, password });
        const me = await authRepository.me();
        const sectorSlug = me?.entreprise?.secteur?.slug;
        persistSectorFromMe(sectorSlug);
        const redirected = redirectAfterAuth(sectorSlug);
        if (!redirected) {
          const params = new URLSearchParams(window.location.search);
          router.push(params.get("redirect") ?? ROUTES.dashboard);
        }
      } catch (err) {
        if (err instanceof ApiError && err.isEmailNotVerified()) {
          const em = err.getEmail() ?? email;
          router.push(`${ROUTES.pending}?email=${encodeURIComponent(em)}`);
          return;
        }
        setError(t.loginError);
      }
    });
  };

  // ── Demande de magic link (réponse neutre côté backend) ──────────────────
  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try { await authRepository.magicLinkRequest(email); } catch { /* neutre */ }
      setView("magicSent");
    });
  };

  // ── Mot de passe oublié (réponse neutre côté backend) ────────────────────
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try { await authRepository.forgotPassword(email); } catch { /* neutre */ }
      setView("forgotSent");
    });
  };

  // ── Vue : mot de passe oublié ────────────────────────────────────────────
  if (view === "forgot" || view === "forgotSent") {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setView("login")}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToLogin}
        </button>
        {view === "forgotSent" ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: theme.accent }} />
            <h2 className="text-lg font-bold text-[var(--text)] mb-2">{t.forgotPasswordSent}</h2>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-[var(--text)] mb-1">{t.forgotPasswordTitle}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">{t.forgotPasswordSubtitle}</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="label-base">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="email" required className="input-base pl-10"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full justify-center py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: theme.accent }}
              >
                {isPending
                  ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                  : t.forgotPasswordBtn}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Vue : magic link envoyé ──────────────────────────────────────────────
  if (view === "magicSent") {
    return (
      <div className="text-center py-8 animate-fade-in">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: theme.accent }} />
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">{t.magicLinkSent}</h2>
        <button onClick={() => setView("login")}
          className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          {t.backToLogin}
        </button>
      </div>
    );
  }

  // ── Vue principale ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--text)] mb-1">{t.loginTitle}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t.loginSubtitle}</p>
      </div>

      {/* Bouton Google — visible uniquement si Client ID configuré */}
      {GOOGLE_CLIENT_ID && (
        <>
          <GoogleButton
            label={t.googleBtn}
            onError={() => setError(t.loginError)}
            onSuccess={async (googleUser) => {
              try {
                await loginWithGoogle(googleUser);
                const me = await authRepository.me();
                const sectorSlug = me?.entreprise?.secteur?.slug;
                persistSectorFromMe(sectorSlug);
                const redirected = redirectAfterAuth(sectorSlug);
                if (!redirected) router.push(ROUTES.dashboard);
              } catch {
                setError(t.loginError);
              }
            }}
          />
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium">{t.orContinueWith}</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
        </>
      )}

      {/* Onglets mot de passe / magic link */}
      <div className="flex gap-1 p-1 bg-[var(--bg)] rounded-xl mb-6 border border-[var(--border)]">
        {(["password", "magic"] as Tab[]).map(tb => (
          <button key={tb} type="button" onClick={() => setTab(tb)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === tb
                ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}>
            {tb === "password" ? t.tabPassword : t.tabMagicLink}
          </button>
        ))}
      </div>

      {/* Form mot de passe */}
      {tab === "password" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label-base">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="email" required autoComplete="email"
                className="input-base pl-10" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-base mb-0">{t.password}</label>
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-xs hover:underline font-medium"
                style={{ color: theme.primary }}
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="input-base pl-10 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors"
                style={{ color: showPassword ? theme.primary : undefined }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full justify-center py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending
              ? <><Spinner className="border-white/30 border-t-white" /> {t.loggingIn}</>
              : t.loginBtn}
          </button>
        </form>
      )}

      {/* Form magic link */}
      {tab === "magic" && (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="label-base">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="email" required placeholder={t.magicLinkPlaceholder}
                className="input-base pl-10" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full justify-center py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending
              ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
              : t.magicLinkBtn}
          </button>
        </form>
      )}

      {/* Lien inscription */}
      <p className="text-center text-sm text-[var(--text-muted)] mt-8">
        {t.noAccount}{" "}
        <Link
          href={ROUTES.onboarding}
          className="font-semibold hover:underline"
          style={{ color: theme.primary }}
        >
          {t.signUp}
        </Link>
      </p>
    </div>
  );
}

// END OF FILE: src/app/login/page.tsx