"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, XCircle, Loader2 } from "lucide-react";
import { authRepository } from "@/repositories";
import { tokenStorage } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { dictionary: d } = useLanguage();
  const { refreshUser }   = useAuth();
  const t = d.verifyEmail;
  const [status, setStatus]   = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setErrorMsg(t.errorTitle); return; }

    authRepository.verifyEmail(token)
      .then(async (res) => {
        // 1. Stocker les tokens JWT
        tokenStorage.set(res.access, res.refresh ?? "");
        // 2. Charger le user (avec l'entreprise créée par le backend)
        //    dans le contexte global — évite un écran vide sur le dashboard
        await refreshUser();
        setStatus("success");
        // 3. Rediriger vers le dashboard après un court délai visuel
        setTimeout(() => router.push(ROUTES.dashboard), 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMsg(err?.message ?? t.errorTitle);
      });
  // refreshUser est stable (useCallback) — pas de boucle infinie
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">

        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#25D366] animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.loading}</h1>
            <p className="text-sm text-[var(--text-muted)]">{t.loadingSubtitle}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.successTitle}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{t.successSubtitle}</p>
            {/* Barre de progression vers le dashboard */}
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[#25D366] rounded-full animate-[grow_1.5s_ease-in-out_forwards]"
                style={{ width: "100%", transition: "width 1.5s ease-in-out" }} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">Redirection vers votre tableau de bord...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.errorTitle}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{errorMsg}</p>
            <button onClick={() => router.push(ROUTES.login)} className="btn-primary w-full justify-center py-3">
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
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}