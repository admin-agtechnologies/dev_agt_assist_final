"use client";
// ============================================================
// FICHIER : src/components/onboarding/EmailCheckStep.tsx
// Étape 5 : Écran de vérification email post-inscription
// ============================================================

import { useState } from "react";
import { Mail, RotateCcw, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    title:     "Vérifiez votre email",
    subtitle:  (email: string) => `Un lien de confirmation a été envoyé à ${email}. Cliquez dessus pour activer votre compte.`,
    resend:    "Renvoyer l'email",
    resending: "Envoi…",
    resent:    "Email renvoyé !",
    spam:      "Vérifiez aussi vos spams si vous ne voyez rien.",
    change:    "Changer d'email",
  },
  en: {
    title:     "Check your email",
    subtitle:  (email: string) => `A confirmation link has been sent to ${email}. Click it to activate your account.`,
    resend:    "Resend email",
    resending: "Sending…",
    resent:    "Email resent!",
    spam:      "Check your spam folder if you don't see it.",
    change:    "Change email",
  },
} as const;

interface EmailCheckStepProps {
  email:       string;
  locale:      Locale;
  accentColor: string;
  onResend:    () => Promise<void>;
  onBack:      () => void;
}

export function EmailCheckStep({ email, locale, accentColor, onResend, onBack }: EmailCheckStepProps) {
  const t = LABELS[locale];
  const [loading, setLoading] = useState(false);
  const [resent,  setResent]  = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setResent(false);
    try {
      await onResend();
      setResent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      {/* Icône animée */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Mail size={36} style={{ color: accentColor }} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
          {t.subtitle(email)}
        </p>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{t.spam}</p>

      {/* Feedback renvoi */}
      {resent && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle size={16} />
          {t.resent}
        </div>
      )}

      {/* Bouton renvoi */}
      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:opacity-50"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {loading
          ? <LoadingSpinner size={14} />
          : <RotateCcw size={14} />
        }
        {loading ? t.resending : t.resend}
      </button>

      {/* Changer d'email */}
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)] transition-colors"
      >
        {t.change}
      </button>
    </div>
  );
}