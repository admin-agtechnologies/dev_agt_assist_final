// src/app/(dashboard)/welcome/page.tsx
// Page "First Contact" — 3 écrans séquentiels.
// Affichée une seule fois après inscription (has_seen_welcome=False).
// Marquée vue dès qu'un CTA final est cliqué (tous les chemins).
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { onboardingRepository } from "@/repositories";
import { WelcomeScreen1 } from "@/components/welcome/WelcomeScreen1";
import { WelcomeScreen2 } from "@/components/welcome/WelcomeScreen2";
import { WelcomeScreen3 } from "@/components/welcome/WelcomeScreen3";
import { Spinner } from "@/components/ui";

type Screen = 1 | 2 | 3;

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const { features, isLoading, refetch } = useActiveFeatures();

  const [screen, setScreen] = useState<Screen>(1);
  const [submitting, setSubmitting] = useState(false);

  const goNext = useCallback(() => {
    setScreen((s) => (s === 1 ? 2 : 3) as Screen);
  }, []);

  const goBack = useCallback(() => {
    setScreen((s) => (s === 3 ? 2 : 1) as Screen);
  }, []);

  // Tous les clics du dernier écran convergent ici : marquer vu + rediriger.
  // La convergence (test/config/tuto) sera gérée par la bannière post-welcome.
  const handleFinalChoice = useCallback(
    async (href: string) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await onboardingRepository.markWelcomeSeen();
      } catch {
        // Silencieux : la nav doit aller au bout
      } finally {
        router.push(href);
      }
    },
    [router, submitting],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  const entrepriseName = user?.entreprise?.name ?? "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {screen === 1 && (
          <WelcomeScreen1
            entrepriseName={entrepriseName}
            locale={locale}
            onContinue={goNext}
          />
        )}
        {screen === 2 && (
          <WelcomeScreen2
            features={features.filter((f) => f.is_active)}
            locale={locale}
            onBack={goBack}
            onContinue={goNext}
            onFeaturesChanged={refetch}
          />
        )}
        {screen === 3 && (
          <WelcomeScreen3
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