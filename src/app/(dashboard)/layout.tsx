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
import { onboardingRepository } from "@/repositories";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme }    = useSector();
  const { user }     = useAuth();
  const pathname     = usePathname();
  const router       = useRouter();

  const {
    onboardingData, isPopupOpen, closePopup,
    handleCta, recheckCurrentPage,
  } = useOnboarding();

  // ── Redirect first-contact ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (pathname === "/welcome") return;
    if (user.onboarding?.has_seen_welcome === false) router.replace("/welcome");
  }, [user, pathname, router]);

  // ── Recheck onboarding à chaque changement de route (post-welcome) ─────────
  // Déclenche le popup d'abonnement si pas de souscription active.
  // Pas de recheck sur /welcome (géré par le flow welcome lui-même).
  useEffect(() => {
    if (!user?.onboarding?.has_seen_welcome) return;
    if (pathname === "/welcome") return;
    if (pathname === "/billing") return; 
    recheckCurrentPage();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const sectorStyle = {
    "--color-primary": theme.primary,
    "--color-accent":  theme.accent,
    "--color-bg":      theme.bg,
    backgroundColor:   theme.bg,
  } as React.CSSProperties;

  // Sur /welcome : layout minimal, zéro overlay
  if (pathname === "/welcome") {
    return <div className="min-h-screen" style={sectorStyle}>{children}</div>;
  }

  return (
    <div className="flex min-h-screen" style={sectorStyle}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
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
    </div>
  );
}