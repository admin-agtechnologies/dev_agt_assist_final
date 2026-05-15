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
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Spinner } from "@/components/ui";
import { onboardingRepository } from "@/repositories";
import { SupportWidgets } from "@/components/SupportWidgets";

// Pages accessibles sans abonnement actif (suspendu, résilié, ou null).
// Aligné sur FREE_PLAN_ALLOWED_PAGES dans apps/onboarding/engine.py.
const INACTIVE_ALLOWED_ROUTES = ["/billing", "/tutorial", "/profile", "/help"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme }           = useSector();
  const { user, isLoading } = useAuth();
  const pathname            = usePathname();
  const router              = useRouter();

  const {
    onboardingData, isPopupOpen, closePopup,
    handleCta, recheckCurrentPage,
  } = useOnboarding();

  // ── Guard 1 — Redirect first-contact → /welcome ───────────────────────────
  useEffect(() => {
    if (!user) return;
    if (pathname === "/welcome") return;
    if (user.onboarding?.has_seen_welcome === false) {
      router.replace("/welcome");
    }
  }, [user, pathname, router]);

  // ── Guard 2 — Abonnement inactif → /billing si route non autorisée ────────
  useEffect(() => {
    if (!user) return;
    if (pathname === "/welcome") return;
    if (!user.onboarding?.has_seen_welcome) return;
    if (user.onboarding?.abonnement_statut === "actif") return;

    const isAllowed = INACTIVE_ALLOWED_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/"),
    );
    if (!isAllowed) router.replace("/billing");
  }, [user, pathname, router]);

  // ── Recheck onboarding à chaque changement de route ───────────────────────
  useEffect(() => {
    if (!user?.onboarding?.has_seen_welcome) return;
    if (pathname === "/welcome") return;
    if (pathname === "/billing") return;
    recheckCurrentPage();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectorStyle = {
    "--color-primary": theme.primary,
    "--color-accent":  theme.accent,
    "--color-bg":      theme.bg,
    backgroundColor:   theme.bg,
  } as React.CSSProperties;

  // ── Auth en cours de résolution → écran opaque, zéro flash ───────────────
  // isLoading = true pendant GET /auth/me/ au premier rendu.
  // Aucun contenu dashboard n'est affiché avant que le user soit connu.
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={sectorStyle}
      >
        <Spinner />
      </div>
    );
  }

  // ── Handlers popup ─────────────────────────────────────────────────────────
  const handlePopupCta = async (href?: string, action?: string) => {
    if (action === "CLAIM_BONUS") {
      try { await onboardingRepository.claimBonus(); } catch { /* silencieux */ }
      closePopup();
      await recheckCurrentPage();
      return;
    }
    if (action === "DISMISS") { closePopup(); return; }
    closePopup();
    await handleCta(href);
  };

  // Sur /welcome : layout minimal, zéro overlay ni bannière
  if (pathname === "/welcome") {
    return <div className="min-h-screen" style={sectorStyle}>{children}</div>;
  }

  return (
    <div className="flex min-h-screen" style={sectorStyle}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {/* Bannière sticky si abonnement suspendu ou résilié */}
        <SubscriptionBanner />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Popup central unique — abonnement + bonus + convergence */}
      {isPopupOpen && onboardingData &&
        !(onboardingData.popup_key === "UPGRADE_PLAN" && pathname === "/billing") && (
          <OnboardingPopup
            popupKey={onboardingData.popup_key!}
            payload={onboardingData.payload!}
            onClose={closePopup}
            onCtaClick={handlePopupCta}
          />
        )}

      <SupportWidgets />
    </div>
  );
}