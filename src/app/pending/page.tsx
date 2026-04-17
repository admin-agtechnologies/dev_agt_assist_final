// src/app/pending/page.tsx
"use client";
import { useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner } from "@/components/ui";
import { MailCheck, CheckCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { AuthShell } from "@/components/auth/AuthShell";

export default function PendingPage() {
  const { dictionary: d } = useLanguage();
  const t = d.pending;
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      await new Promise(r => setTimeout(r, 800));
      setSent(true);
    });
  };

  return (
    <AuthShell>
      <div className="animate-fade-in text-center">

        {/* Icône */}
        <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-black text-[var(--text)] mb-3">{t.title}</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 max-w-sm mx-auto">
          {t.subtitle}
        </p>

        {/* Bouton renvoyer */}
        {sent ? (
          <div className="flex items-center justify-center gap-2 text-[#25D366] font-semibold mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>{t.resendSuccess}</span>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isPending}
            className="btn-primary w-full justify-center py-3 mb-4">
            {isPending
              ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
              : t.resendBtn}
          </button>
        )}

        {/* Liens secondaires */}
        <div className="flex flex-col gap-3 mt-4">
          <Link href={ROUTES.login}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← {t.backToLogin}
          </Link>
          <a href="https://wa.me/237600000000"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-[#075E54] font-semibold hover:underline">
            <MessageCircle className="w-4 h-4" />
            {t.contactSupport}
          </a>
        </div>

      </div>
    </AuthShell>
  );
}