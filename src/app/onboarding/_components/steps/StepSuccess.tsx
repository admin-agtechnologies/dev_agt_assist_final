"use client";
import { PartyPopper, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onFinish: () => void;
}

export function StepSuccess({ onFinish }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;

  return (
    <div className="animate-fade-in text-center">
      <div className="card p-12">
        <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black text-[var(--text)] mb-3">{t.successTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8 max-w-sm mx-auto">{t.successSubtitle}</p>
        <button onClick={onFinish} className="btn-primary px-8 py-3 text-base">
          {t.successBtn} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}