"use client";
// ============================================================
// FICHIER : src/app/pending/page.tsx
// Page d'attente vérification email — sectorielle (BUG-020)
// ============================================================

import { Suspense, useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { Spinner } from "@/components/ui";
import { MailCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { AuthShell } from "@/components/auth/AuthShell";
import { authRepository } from "@/repositories";
import { useToast } from "@/components/ui/Toast";

function PendingContent() {
  const { dictionary: d } = useLanguage();
  const { theme }         = useSector();
  const t = d.pending;
  const toast = useToast();
  const searchParams = useSearchParams();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const email = searchParams.get("email") ?? "";

  const handleResend = () => {
    if (!email) { toast.error(t.emailMissing); return; }
    startTransition(async () => {
      try {
        await authRepository.resendVerification(email);
        setSent(true);
        toast.success(t.resendSuccess);
      } catch {
        toast.error(t.resendError);
      }
    });
  };

  return (
    <AuthShell>
      <div className="animate-fade-in text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${theme.accent}1a` }}
        >
          <MailCheck
            className="w-10 h-10"
            strokeWidth={1.5}
            style={{ color: theme.accent }}
          />
        </div>

        <h1 className="text-3xl font-black text-[var(--text)] mb-3">{t.title}</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 max-w-sm mx-auto">
          {t.subtitle}
        </p>

        {email && (
          <p className="font-bold mb-6" style={{ color: theme.primary }}>
            {email}
          </p>
        )}

        {sent ? (
          <div
            className="flex items-center justify-center gap-2 font-semibold mb-6"
            style={{ color: theme.accent }}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{t.resendSuccess}</span>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isPending}
            className="w-full justify-center py-3 mb-4 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            {isPending
              ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
              : t.resendBtn}
          </button>
        )}

        <Link
          href={ROUTES.login}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] underline"
        >
          {t.backToLogin}
        </Link>
      </div>
    </AuthShell>
  );
}

export default function PendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}

// END OF FILE: src/app/pending/page.tsx