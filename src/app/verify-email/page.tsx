"use client";
// ============================================================
// FICHIER : src/app/verify-email/page.tsx
// Couleur sectorielle via useSector() (env > localStorage > subdomain)
// BUG-018 : barre progression accentColor
// BUG-020 : si ?sector=xxx présent, écriture localStorage pour persistance
// ============================================================

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, XCircle, Loader2 } from "lucide-react";
import { authRepository } from "@/repositories";
import { tokenStorage } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { useSector } from "@/hooks/useSector";
import { setStoredSector, isValidSector } from "@/lib/sector-config";
import { redirectAfterAuth } from "@/lib/sector-redirect";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const router            = useRouter();
  const searchParams      = useSearchParams();
  const { dictionary: d } = useLanguage();
  const { refreshUser }   = useAuth();
  const t = d.verifyEmail;

  const [status,   setStatus]   = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Si l'email contient ?sector=xxx, persister AVANT le rendu sectoriel.
  useEffect(() => {
    const sectorParam = searchParams.get("sector");
    if (sectorParam && isValidSector(sectorParam)) {
      setStoredSector(sectorParam);
    }
  }, [searchParams]);

  const { theme } = useSector();
  const accentColor = theme.accent;

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setErrorMsg(t.errorTitle); return; }

    authRepository.verifyEmail(token)
      .then(async (res) => {
        tokenStorage.set(res.access, res.refresh ?? "");
        const sectorSlug = res.user?.entreprise?.secteur?.slug;
        // Persister le secteur de l'entreprise (cas Google OAuth ou direct).
        if (sectorSlug && isValidSector(sectorSlug)) setStoredSector(sectorSlug);
        await refreshUser();
        setStatus("success");
        setTimeout(() => {
          const redirected = redirectAfterAuth(sectorSlug);
          if (!redirected) router.push(ROUTES.dashboard);
        }, 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMsg(err?.message ?? t.errorTitle);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">

        {/* ── Loading ── */}
        {status === "loading" && (
          <>
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${accentColor}1a` }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: accentColor }} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.loading}</h1>
            <p className="text-sm text-[var(--text-muted)]">{t.loadingSubtitle}</p>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${accentColor}1a` }}
            >
              <MailCheck className="w-10 h-10" strokeWidth={1.5} style={{ color: accentColor }} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.successTitle}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{t.successSubtitle}</p>

            {/* Barre de progression sectorielle — BUG-018 */}
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full w-full transition-all duration-[1500ms]"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Redirection vers votre tableau de bord...
            </p>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.errorTitle}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{errorMsg}</p>
            <button
              onClick={() => router.push(ROUTES.login)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              {t.backToLogin}
            </button>
            <p className="text-xs text-[var(--text-muted)] mt-4">{t.errorSubtitle}</p>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>;
}

// END OF FILE: src/app/verify-email/page.tsx