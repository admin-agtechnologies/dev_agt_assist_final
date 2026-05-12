// src/hooks/useFeatures.ts
import { useState, useEffect, useCallback } from "react";
import { featuresRepository, type ActiveFeature, type SectorFeature } from "@/repositories/features.repository";

interface FeaturesState {
  features: ActiveFeature[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function makeFeaturesHook(loader: () => Promise<{ features: ActiveFeature[] }>): () => FeaturesState {
  return function () {
    const [features, setFeatures] = useState<ActiveFeature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
      setIsLoading(true);
      try {
        const { features: f } = await loader();
        setFeatures(f);
        setError(null);
      } catch {
        setError("Erreur chargement features");
      } finally {
        setIsLoading(false);
      }
    }, []); // eslint-disable-line

    useEffect(() => { load(); }, [load]);
    return { features, isLoading, error, refetch: load };
  };
}

export const useActiveFeatures  = makeFeaturesHook(featuresRepository.getActive);
export const useDesiredFeatures = makeFeaturesHook(featuresRepository.getDesired);

interface SectorFeaturesState { features: SectorFeature[]; isLoading: boolean; }

export function useSectorFeatures(sectorSlug: string): SectorFeaturesState {
  const [features, setFeatures] = useState<SectorFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sectorSlug) { setIsLoading(false); return; }
    setIsLoading(true);
    featuresRepository.getSectorFeatures(sectorSlug)
      .then(setFeatures)
      .finally(() => setIsLoading(false));
  }, [sectorSlug]);

  return { features, isLoading };
}