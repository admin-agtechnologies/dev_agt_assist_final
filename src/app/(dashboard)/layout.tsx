// src/app/(dashboard)/layout.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSector } from "@/hooks/useSector";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OnboardingPopup } from "@/components/OnboardingPopup";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Spinner } from "@/components/ui";
import { onboardingRepository } from "@/repositories";
import { SupportWidgets } from "@/components/SupportWidgets";

const INACTIVE_ALLOWED_ROUTES = ["/billing", "/tutorial", "/profile", "/help"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme: sectorTheme } = useSector();
  const { theme: uiTheme }     = useTheme();
  const { user, isLoading }    = useAuth();
  const pathname               = usePathname();
  const router                 = useRouter();

  const {
    onboardingData, isPopupOpen, closePopup,
    handleCta, recheckCurrentPage,
  } = useOnboarding();

  // ── Guard 1 – Redirect first-contact → /welcome ──────────────────────────
  useEffect(() => {
    if (!user) return;
    if (pathname === "/welcome") return;
    if (user.onboarding?.has_seen_welcome === false) {
      router.replace("/welcome");
    }
  }, [user, pathname, router]);

  // ── Guard 2 – Abonnement inactif → /billing si route non autorisée ────────
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

  // ── Recheck onboarding à chaque changement de route ──────────────────────
  useEffect(() => {
    if (!user?.onboarding?.has_seen_welcome) return;
    if (pathname === "/welcome") return;
    if (pathname === "/billing") return;
    recheckCurrentPage();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Style dynamique ───────────────────────────────────────────────────────
  // Mode clair  → fond sectoriel (theme.bg ex: #FDF8F4 restaurant)
  // Mode sombre → pas de backgroundColor inline, var(--bg) du ThemeProvider
  //               prend le relais (#0B1120) sans être écrasé
  const sectorVars = {
    "--color-primary": sectorTheme.primary,
    "--color-accent":  sectorTheme.accent,
    ...(uiTheme === "light" && { backgroundColor: sectorTheme.bg }),
  } as React.CSSProperties;

  // ── Auth en cours de résolution ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <Spinner />
      </div>
    );
  }

  // ── Handlers popup ────────────────────────────────────────────────────────
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

  // Sur /welcome : layout minimal
  if (pathname === "/welcome") {
    return (
      <div className="min-h-screen bg-[var(--bg)]" style={sectorVars}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]" style={sectorVars}>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <SubscriptionBanner />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

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