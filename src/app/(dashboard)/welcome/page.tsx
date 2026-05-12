// src/app/(dashboard)/welcome/page.tsx
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingRepository } from "@/repositories";
import { WelcomeScreen1 } from "@/components/welcome/WelcomeScreen1";
import { WelcomeScreen2, MODULES_KEY } from "@/components/welcome/WelcomeScreen2";
import { WelcomeScreen3 } from "@/components/welcome/WelcomeScreen3";
import { WelcomeScreen4 } from "@/components/welcome/WelcomeScreen4";

type Screen = 1 | 2 | 3 | 4;

function loadStoredSlugs(): string[] {
  try { return JSON.parse(localStorage.getItem(MODULES_KEY) ?? "[]") as string[]; }
  catch { return []; }
}

export default function WelcomePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { locale } = useLanguage();

  const [screen,        setScreen]        = useState<Screen>(1);
  const [submitting,    setSubmitting]     = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(loadStoredSlugs);

  const goNext = useCallback(() => setScreen(s => Math.min(s + 1, 4) as Screen), []);
  const goBack = useCallback(() => setScreen(s => Math.max(s - 1, 1) as Screen), []);

  const handleSlugsChange = useCallback((slugs: string[]) => setSelectedSlugs(slugs), []);

  // Screen 3 → 4 : paiement OK
  const handlePaymentSuccess = useCallback(() => {
    try { localStorage.removeItem(MODULES_KEY); } catch { /* noop */ }
    setScreen(4);
  }, []);

  // Screen 4 : choix final → marquer welcome vu + naviguer
  const handleFinalChoice = useCallback(async (href: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onboardingRepository.markWelcomeSeen();
      await refreshUser();
    } catch { /* silencieux — la nav doit aller au bout */ }
    finally { router.push(href); }
  }, [router, submitting, refreshUser]);

  const entrepriseName = user?.entreprise?.name ?? "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {screen === 1 && <WelcomeScreen1 entrepriseName={entrepriseName} locale={locale} onContinue={goNext} />}
        {screen === 2 && (
          <WelcomeScreen2
            selectedSlugs={selectedSlugs}
            onSlugsChange={handleSlugsChange}
            locale={locale}
            onBack={goBack}
            onContinue={goNext}
          />
        )}
        {screen === 3 && (
          <WelcomeScreen3
            selectedSlugs={selectedSlugs}
            locale={locale}
            onBack={goBack}
            onSuccess={handlePaymentSuccess}
          />
        )}
        {screen === 4 && (
          <WelcomeScreen4
            locale={locale}
            onBack={goBack}
            onChoice={handleFinalChoice}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}