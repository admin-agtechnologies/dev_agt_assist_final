"use client";
// src/app/(auth)/onboarding/page.tsx
// Tunnel d'onboarding sectoriel — sélection du secteur puis des features
// Utilisé quand une entreprise existe mais n'a pas encore configuré ses features

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { secteursRepository } from "@/repositories";
import { featuresRepository } from "@/repositories/features.repository";
import { SectorPicker } from "@/components/onboarding/SectorPicker";
import { FeaturePicker } from "@/components/onboarding/FeaturePicker";
import { LoadingPage } from "@/components/data/LoadingSpinner";
import { ROUTES } from "@/lib/constants";
import type { SecteurActivite } from "@/types/api";
import type { Feature } from "@/types/api/feature.types";

type Step = "sector" | "features";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<Step>("sector");
  const [secteurs, setSecteurs] = useState<SecteurActivite[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [loading, setLoading] = useState(true);

  // Redirect si déjà configuré
  useEffect(() => {
    if (user?.entreprise?.secteur) {
      router.replace(ROUTES.dashboard);
    }
  }, [user, router]);

  useEffect(() => {
    secteursRepository.getList()
      .then(setSecteurs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSectorConfirm = async () => {
    if (!selectedSector) return;
    setLoading(true);
    try {
      const res = await featuresRepository.getActive();
      // Cast vers Feature[] — ActiveFeature est compatible structurellement
      setFeatures(res.features as unknown as Feature[]);
      setStep("features");
    } catch {
      // On passe quand même à l'étape features avec une liste vide
      setFeatures([]);
      setStep("features");
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturesConfirm = async (slugs: string[]) => {
    // Activer chaque feature sélectionnée
    await Promise.allSettled(
      slugs.map((slug) => featuresRepository.toggle(slug, true))
    );
    router.replace(ROUTES.dashboard);
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {step === "sector" && (
          <SectorPicker
            secteurs={secteurs}
            selected={selectedSector}
            locale={locale}
            onSelect={setSelectedSector}
            onConfirm={handleSectorConfirm}
          />
        )}
        {step === "features" && (
          <FeaturePicker
            features={features}
            locale={locale}
            onConfirm={handleFeaturesConfirm}
          />
        )}
      </div>
    </div>
  );
}