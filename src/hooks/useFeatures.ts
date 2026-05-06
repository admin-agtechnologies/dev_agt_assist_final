// src/hooks/useFeatures.ts
import { useEffect, useState, useCallback } from "react";
import {
  featuresRepository,
} from "@/repositories/features.repository";
import type { ActiveFeature } from "@/repositories/features.repository";

interface UseFeaturesReturn {
  features: ActiveFeature[];
  isLoading: boolean;
  hasFeature: (slug: string) => boolean;
  refetch: () => void;
}

export function useActiveFeatures(): UseFeaturesReturn {
  const [features, setFeatures] = useState<ActiveFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    featuresRepository
      .getActive()
      .then((res) => setFeatures(res.features))
      .catch(() => setFeatures([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    features,
    isLoading,
    hasFeature: (slug: string) =>
      features.some((f) => f.slug === slug && f.is_active),
    refetch: load,
  };
}