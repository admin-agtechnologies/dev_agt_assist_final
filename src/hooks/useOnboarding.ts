// src/hooks/useOnboarding.ts
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingRepository, botsRepository } from "@/repositories";
import type { OnboardingResponse } from "@/types/onboarding";

// Mapping route complète → slug envoyé au backend
const ROUTE_TO_PAGE_SLUG: Record<string, string> = {
  "/pme/dashboard": "dashboard",
  "/pme/bots": "bots",
  "/pme/knowledge": "knowledge",
  "/pme/billing": "billing",
  "/pme/appointments": "appointments",
  "/pme/services": "services",
  "/pme/tutorial": "tutorial",
  "/pme/help": "help",
  "/pme/feedback": "feedback",
  "/pme/bug": "bug",
  "/pme/profile": "profile",
  "/dashboard": "dashboard",
};

export function useOnboarding() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [onboardingData, setOnboardingData] =
    useState<OnboardingResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Mécanisme de déduplication par session.
  // Reset automatique si l'utilisateur change (déco/reco).
  const checkedSlugs = useRef<Set<string>>(new Set());
  const lastUserId = useRef<string | null>(null);

  // Reset si l'utilisateur change
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId !== lastUserId.current) {
      checkedSlugs.current = new Set();
      lastUserId.current = currentId;
    }
  }, [user]);

  // Résoudre un pathname en slug backend
  const resolveSlug = useCallback((path: string): string | undefined => {
    for (const [route, pageSlug] of Object.entries(ROUTE_TO_PAGE_SLUG)) {
      if (path === route || path.startsWith(route + "/")) return pageSlug;
    }
    return undefined;
  }, []);

  // Appel effectif à l'API et application de la réponse
  const applyCheck = useCallback(
    async (slug: string): Promise<OnboardingResponse> => {
      const response = await onboardingRepository.check({ page: slug });

      if (response.action === "SHOW_POPUP") {
        setOnboardingData(response);
        setIsPopupOpen(true);
      } else {
        // action: "NONE" — lever un popup bloquant éventuel
        setIsPopupOpen(false);
        setOnboardingData(null);
      }

      return response;
    },
    [],
  );

  // Check déclenché par le changement de pathname (avec déduplication)
  const checkOnboarding = useCallback(
    async (path: string) => {
      if (!user) return;

      const slug = resolveSlug(path);
      if (!slug) return;

      // Déduplication : skip si déjà checké, sauf "billing" (UPGRADE_PLAN peut bloquer)
      if (checkedSlugs.current.has(slug) && slug !== "billing") return;

      try {
        const response = await applyCheck(slug);
        // Marquer comme checké seulement si non bloquant
        if (response.popup_key !== "UPGRADE_PLAN") {
          checkedSlugs.current.add(slug);
        }
      } catch {
        // Silencieux — l'onboarding ne doit jamais bloquer la navigation
      }
    },
    [user, resolveSlug, applyCheck],
  );

  // Re-check forcé de la page courante — appelé après chaque action CTA.
  // Bypass la déduplication pour obtenir l'état frais du backend.
  const recheckCurrentPage =
    useCallback(async (): Promise<OnboardingResponse | null> => {
      if (!user) return null;
      const slug = resolveSlug(pathname);
      if (!slug) return null;

      try {
        const response = await applyCheck(slug);
        // Invalider la déduplication pour ce slug après un re-check forcé
        checkedSlugs.current.delete(slug);
        return response;
      } catch {
        return null;
      }
    }, [user, pathname, resolveSlug, applyCheck]);

  // Déclencher à chaque changement de pathname
  useEffect(() => {
    checkOnboarding(pathname);
  }, [pathname, checkOnboarding]);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setOnboardingData(null);
  }, []);

  const handleCta = useCallback(
    async (href?: string) => {
      // Résoudre le template {first_bot_id} si présent
      if (href?.includes("{first_bot_id}")) {
        try {
          const res = await botsRepository.getList();
          const firstBot = res.results[0];
          href = firstBot
            ? href.replace("{first_bot_id}", firstBot.id)
            : "/pme/bots";
        } catch {
          href = "/pme/bots";
        }
      }

      if (href) router.push(href);
    },
    [router],
  );

  return {
    onboardingData,
    isPopupOpen,
    closePopup,
    handleCta,
    recheckCurrentPage,
  };
}
