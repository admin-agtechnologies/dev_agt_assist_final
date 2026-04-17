// src/app/error.tsx
"use client";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.errors;

  useEffect(() => {
    // Log vers un service de monitoring en production
    if (process.env.NODE_ENV === "production") {
      // ex: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-[var(--text)] mb-2">{t.errorTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">{t.errorSubtitle}</p>
        <button onClick={reset} className="btn-primary">
          {t.retryBtn}
        </button>
      </div>
    </div>
  );
}
