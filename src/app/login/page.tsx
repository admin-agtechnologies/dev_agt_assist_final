// src/app/login/page.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { Loader2 } from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { ApiError, tokenStorage } from "@/lib/api-client";
import { authRepository } from "@/repositories";
import { AuthShell, GoogleButton } from "@/components/auth/AuthShell";
import { setStoredSector, isValidSector } from "@/lib/sector-config";
import { redirectAfterAuth } from "@/lib/sector-redirect";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Tab = "password" | "magic";
type View = "login" | "forgot" | "forgotSent" | "magicSent" | "googleNotRegistered";

// ════════════════════════════════════════════════════════════════════════════
// PAGE LOGIN
// ════════════════════════════════════════════════════════════════════════════

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </GoogleOAuthProvider>
  );
}

// ── Formulaire login ──────────────────────────────────────────────────────────
function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { dictionary: d } = useLanguage();
  const t = d.auth;
  const router = useRouter();
  const { theme } = useSector();

  const [tab, setTab] = useState<Tab>("password");
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ── Connexion email/password ────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await login({ email, password });
        const params = new URLSearchParams(window.location.search);
        router.push(params.get("redirect") ?? ROUTES.dashboard);
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

  // ── Demande de magic link ────────────────────────────────────────────────
  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await authRepository.magicLinkRequest(email);
      } catch {
        // Réponse neutre
      }
      setView("magicSent");
    });
  };

  // ── Mot de passe oublié ──────────────────────────────────────────────────
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await authRepository.forgotPassword(email);
      } catch {
        // Réponse neutre
      }
      setView("forgotSent");
    });
  };

  // ── Google OAuth login ───────────────────────────────────────────────────
  // On appelle authRepository.google() directement (bypass AuthContext) pour
  // vérifier entreprise AVANT de stocker le token. Si l'user n'a pas encore
  // d'entreprise, c'est un nouvel utilisateur → on le redirige vers l'onboarding
  // sans jamais le connecter.
  const handleGoogleLogin = async (googleUser: { email: string; name: string; sub: string }) => {
    setError("");
    startTransition(async () => {
      try {
        const res = await authRepository.google({
          email: googleUser.email,
          name: googleUser.name,
          google_id: googleUser.sub,
        });

        // Nouvel user Google : pas d'entreprise créée → pas autorisé à se connecter ici
        if (!res.user.entreprise) {
          // Ne pas stocker le token : l'user n'est pas "connecté"
          tokenStorage.clear();
          setView("googleNotRegistered");
          return;
        }

        // User existant → stocker le token + rediriger vers son secteur
        tokenStorage.set(res.access, res.refresh);
        redirectAfterAuth(
          res.user.entreprise?.secteur?.slug ?? null,
          { access: res.access, refresh: res.refresh },
        );
      } catch {
        setError(t.loginError);
      }
    });
  };

  // ── Vue : Pas de compte Google ───────────────────────────────────────────
  if (view === "googleNotRegistered") {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {t.googleNotRegistered}
            </p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
              {t.googleNotRegisteredHint}
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.onboarding}
          className="w-full flex items-center justify-center py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.accent }}
        >
          {t.googleSignUpCta}
        </Link>

        <button
          onClick={() => setView("login")}
          className="w-full flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToLogin}
        </button>
      </div>
    );
  }

  // ── Vue : Mot de passe oublié — envoyé ───────────────────────────────────
  if (view === "forgotSent") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <p className="text-sm text-[var(--text-muted)]">{t.forgotPasswordSent}</p>
        <button onClick={() => setView("login")} className="text-sm font-semibold" style={{ color: theme.accent }}>
          {t.backToLogin}
        </button>
      </div>
    );
  }

  // ── Vue : Magic link — envoyé ────────────────────────────────────────────
  if (view === "magicSent") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <p className="text-sm text-[var(--text-muted)]">{t.magicLinkSent}</p>
        <button onClick={() => setView("login")} className="text-sm font-semibold" style={{ color: theme.accent }}>
          {t.backToLogin}
        </button>
      </div>
    );
  }

  // ── Vue : Mot de passe oublié ────────────────────────────────────────────
  if (view === "forgot") {
    return (
      <div className="space-y-6">
        <div>
          <button onClick={() => setView("login")} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6">
            <ArrowLeft className="w-4 h-4" /> {t.backToLogin}
          </button>
          <h1 className="text-2xl font-black text-[var(--text)]">{t.forgotPasswordTitle}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.forgotPasswordSubtitle}</p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t.email} required autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] outline-none focus:ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            />
          </div>
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.forgotPasswordBtn}
          </button>
        </form>
      </div>
    );
  }

  // ── Vue : Login principal ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text)]">{t.loginTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.loginSubtitle}</p>
      </div>

      {/* Tabs password / magic */}
      <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
        {(["password", "magic"] as Tab[]).map((tb) => (
          <button key={tb} onClick={() => setTab(tb)}
            className={cn("flex-1 py-2.5 text-sm font-semibold transition-colors",
              tab === tb ? "bg-[var(--bg-card)] text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {tb === "password" ? t.tabPassword : t.tabMagicLink}
          </button>
        ))}
      </div>

      {/* Erreur générique */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {tab === "password" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t.email} required autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] outline-none focus:ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder={t.password} required
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] outline-none focus:ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-right">
            <button type="button" onClick={() => { setView("forgot"); setError(""); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              {t.forgotPassword}
            </button>
          </div>
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.loginBtn}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t.magicLinkPlaceholder} required autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] outline-none focus:ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            />
          </div>
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.magicLinkBtn}
          </button>
        </form>
      )}

      {/* Google OAuth */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
        <div className="relative flex justify-center text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2">{t.orContinueWith}</div>
      </div>
      <GoogleButton
        onSuccess={handleGoogleLogin}
        onError={() => setError(t.loginError)}
        label={t.googleBtn}
      />

      {/* Lien inscription */}
      <p className="text-center text-sm text-[var(--text-muted)]">
        {t.noAccount}{" "}
        <Link href={ROUTES.onboarding} className="font-semibold hover:underline" style={{ color: theme.accent }}>
          {t.signUp}
        </Link>
      </p>
    </div>
  );
}