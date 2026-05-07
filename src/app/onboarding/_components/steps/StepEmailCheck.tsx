"use client";
import { MailCheck } from "lucide-react";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { authRepository } from "@/repositories";
import { useToast } from "@/components/ui/Toast";

interface Props {
  email: string;
}

export function StepEmailCheck({ email }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;
  const toast = useToast();

  const handleResend = async () => {
    try {
      await authRepository.resendVerification(email);
      toast.success("Email renvoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.emailCheckTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-2">{t.emailCheckSubtitle}</p>
        <p className="font-bold text-[#075E54] mb-8">{email}</p>
        <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#25D366] rounded-full animate-progress" />
        </div>
        <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Spinner className="w-3 h-3 border-[#25D366] border-t-transparent" />
          {t.emailCheckWaiting}
        </p>
      </div>
      <button onClick={handleResend} className="text-sm text-[#075E54] underline hover:opacity-75 mt-4">
        Renvoyer l&apos;email de vérification
      </button>
    </div>
  );
}