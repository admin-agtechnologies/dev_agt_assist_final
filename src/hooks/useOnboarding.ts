// src/hooks/useOnboarding.ts
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingRepository, botsRepository } from "@/repositories";
import type { OnboardingResponse } from "@/types/onboarding";

// Mapping route complète → slug envoyé au backend
const ROUTE_TO_PAGE_SLUG: Record<string, string> = {
  "/dashboard": "dashboard",
  "/bots": "bots",
  "/knowledge": "knowledge",
  "/billing": "billing",
  "/appointments": "appointments",
  "/services": "services",
  "/tutorial": "tutorial",
  "/help": "help",
  "/feedback": "feedback",
  "/bug": "bug",
  "/profile": "profile",
};

export function useOnboarding() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // État popup modal (SHOW_POPUP)
  const [onboardingData, setOnboardingData] =
    useState<OnboardingResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // État bannière sticky (SHOW_BANNER) — séparé pour ne pas casser le popup
  const [bannerData, setBannerData] = useState<OnboardingResponse | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  // Mécanisme de déduplication par session (popup uniquement)
  const checkedSlugs = useRef<Set<string>>(new Set());
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId !== lastUserId.current) {
      checkedSlugs.current = new Set();
      lastUserId.current = currentId;
    }
  }, [user]);

  const resolveSlug = useCallback((path: string): string | undefined => {
    for (const [route, pageSlug] of Object.entries(ROUTE_TO_PAGE_SLUG)) {
      if (path === route || path.startsWith(route + "/")) return pageSlug;
    }
    return undefined;
  }, []);

  // Appel effectif à l'API — dispatch popup vs banner selon action
  const applyCheck = useCallback(
    async (slug: string): Promise<OnboardingResponse> => {
      const response = await onboardingRepository.check({ page: slug });

      if (response.action === "SHOW_POPUP") {
        setOnboardingData(response);
        setIsPopupOpen(true);
        // Banner reste tel quel — un popup ne ferme pas la bannière
      } else if (response.action === "SHOW_BANNER") {
        setBannerData(response);
        setIsBannerOpen(true);
        // Popup reste tel quel
      } else {
        // NONE — fermer la bannière (mais pas le popup, qui doit être fermé manuellement)
        setBannerData(null);
        setIsBannerOpen(false);
      }

      return response;
    },
    [],
  );

  const checkOnboarding = useCallback(
    async (path: string) => {
      if (!user) return;

      const slug = resolveSlug(path);
      if (!slug) return;

      // Déduplication : skip si déjà checké, sauf "billing" (UPGRADE_PLAN peut bloquer)
      // Les SHOW_BANNER ne sont jamais dédoupliqués — la bannière doit rester sticky.
      if (checkedSlugs.current.has(slug) && slug !== "billing") {
        // On rappelle quand même pour rafraîchir la bannière (peut avoir disparu)
        try { await applyCheck(slug); } catch {}
        return;
      }

      try {
        const response = await applyCheck(slug);
        if (response.action === "SHOW_POPUP" && response.popup_key !== "UPGRADE_PLAN") {
          checkedSlugs.current.add(slug);
        } else if (response.action === "NONE") {
          checkedSlugs.current.add(slug);
        }
        // SHOW_BANNER : jamais dédupliqué
      } catch {
        // Silencieux — l'onboarding ne doit jamais bloquer la navigation
      }
    },
    [user, resolveSlug, applyCheck],
  );

  const recheckCurrentPage =
    useCallback(async (): Promise<OnboardingResponse | null> => {
      if (!user) return null;
      const slug = resolveSlug(pathname);
      if (!slug) return null;

      try {
        const response = await applyCheck(slug);
        checkedSlugs.current.delete(slug);
        return response;
      } catch {
        return null;
      }
    }, [user, pathname, resolveSlug, applyCheck]);

  useEffect(() => {
    checkOnboarding(pathname);
  }, [pathname, checkOnboarding]);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setOnboardingData(null);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
    setBannerData(null);
  }, []);

  const handleCta = useCallback(
    async (href?: string) => {
      if (href?.includes("{first_bot_id}")) {
        try {
          const res = await botsRepository.getList();
          const firstBot = res.results[0];
          href = firstBot
            ? href.replace("{first_bot_id}", firstBot.id)
            : "/bots";
        } catch {
          href = "/bots";
        }
      }
      if (href) router.push(href);
    },
    [router],
  );

  return {
    // Popup (SHOW_POPUP)
    onboardingData,
    isPopupOpen,
    closePopup,
    // Banner (SHOW_BANNER)
    bannerData,
    isBannerOpen,
    closeBanner,
    // Shared
    handleCta,
    recheckCurrentPage,
  };
}