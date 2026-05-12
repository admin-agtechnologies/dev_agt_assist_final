// src/app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSector } from "@/hooks/useSector";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OnboardingPopup } from "@/components/OnboardingPopup";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { onboardingRepository } from "@/repositories";

// ── Shell sectorisé ───────────────────────────────────────────────────────────
// "use client" requis car useSector() lit NEXT_PUBLIC_SECTOR côté client
// AuthProvider + LanguageProvider sont déjà dans app/layout.tsx (root)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useSector();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const {
    onboardingData, isPopupOpen, closePopup,
    bannerData, isBannerOpen, closeBanner,
    handleCta, recheckCurrentPage,
  } = useOnboarding();

  // ── Redirect first-contact ────────────────────────────────────────────────
  // Si l'utilisateur n'a pas encore vu la welcome page, on l'y envoie une
  // seule fois. Source de vérité : user.onboarding.has_seen_welcome
  // (exposé par GET /auth/me/).
  useEffect(() => {
    if (!user) return;
    if (pathname === "/welcome") return;
    if (user.onboarding?.has_seen_welcome === false) {
      router.replace("/welcome");
    }
  }, [user, pathname, router]);

  const handlePopupCta = async (href?: string, action?: string) => {
    if (action === "CLAIM_BONUS") {
      try {
        await onboardingRepository.claimBonus();
      } catch {
        // silencieux
      }
      closePopup();
      await recheckCurrentPage();
      return;
    }
    if (action === "DISMISS") {
      closePopup();
      return;
    }
    closePopup();
    await handleCta(href);
  };

  const handleBannerCta = async (href?: string, action?: string) => {
    if (action === "DISMISS") {
      closeBanner();
      return;
    }
    await handleCta(href);
    // Pas de close auto : la bannière disparaîtra naturellement quand le
    // backend retournera NONE (i.e. quand l'étape sera complétée).
  };

  // Sur la page /welcome, on ne monte ni la sidebar ni les overlays onboarding.
  if (pathname === "/welcome") {
    return (
      <div
        className="min-h-screen"
        style={{
          "--color-primary": theme.primary,
          "--color-accent":  theme.accent,
          "--color-bg":      theme.bg,
          backgroundColor:   theme.bg,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        "--color-primary": theme.primary,
        "--color-accent":  theme.accent,
        "--color-bg":      theme.bg,
        backgroundColor:   theme.bg,
      } as React.CSSProperties}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Bannière de convergence (sticky, non-bloquante) */}
        {isBannerOpen && bannerData?.action === "SHOW_BANNER" && bannerData.payload && bannerData.popup_key && (
          <OnboardingBanner
            popupKey={bannerData.popup_key}
            payload={bannerData.payload}
            onClose={closeBanner}
            onCtaClick={handleBannerCta}
          />
        )}

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Popup modal d'onboarding (legacy + intros) */}
      {isPopupOpen && onboardingData?.action === "SHOW_POPUP" && onboardingData.payload && onboardingData.popup_key && (
        <OnboardingPopup
          popupKey={onboardingData.popup_key}
          payload={onboardingData.payload}
          onClose={closePopup}
          onCtaClick={handlePopupCta}
        />
      )}
    </div>
  );
}