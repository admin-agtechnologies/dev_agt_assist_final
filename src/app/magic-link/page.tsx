"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, XCircle, Loader2 } from "lucide-react";
import { authRepository } from "@/repositories";
import { tokenStorage } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

type Status = "loading" | "success" | "error";

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
          <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
        </div>
      }
    >
      <MagicLinkVerifier />
    </Suspense>
  );
}

function MagicLinkVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary: d } = useLanguage();
  const t = d.magicLink;

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg(t.errorMissingToken);
      return;
    }

    authRepository
      .magicLinkVerify(token)
      .then((res) => {
        tokenStorage.set(res.access, res.refresh);
        setStatus("success");
        setTimeout(() => router.push(ROUTES.dashboard), 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMsg(err?.message ?? t.errorGeneric);
      });
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#25D366] animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              {t.loading}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{t.loadingSubtitle}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles
                className="w-10 h-10 text-[#25D366]"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              {t.successTitle}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {t.successSubtitle}
            </p>
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[#25D366] rounded-full w-full transition-all duration-[1500ms]" />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              {t.errorTitle}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{errorMsg}</p>
            <button
              onClick={() => router.push(ROUTES.login)}
              className="btn-primary w-full justify-center py-3"
            >
              {t.backToLogin}
            </button>
            <p className="text-xs text-[var(--text-muted)] mt-4">
              {t.errorSubtitle}
            </p>
          </>
        )}
      </div>
    </div>
  );
}