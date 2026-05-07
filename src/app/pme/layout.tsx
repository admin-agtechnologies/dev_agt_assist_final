"use client";
import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSector } from "@/hooks/useSector";
import { OnboardingPopup } from "@/components/OnboardingPopup";
import { SupportWidgets } from "@/components/SupportWidgets";
import { onboardingRepository, tutorialRepository } from "@/repositories";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { PmeSidebarNav } from "./_components/PmeSidebarNav";
import { PmeMobileHeader } from "./_components/PmeMobileHeader";

export default function PmeLayout({ children }: { children: ReactNode }) {
  const { dictionary: d } = useLanguage();
  const { theme: sectorTheme } = useSector();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(true);

  useEffect(() => {
    tutorialRepository.getProgress()
      .then(res => setTutorialDone(res.has_completed_tutorial))
      .catch(() => {});
  }, []);

  const { onboardingData, isPopupOpen, closePopup, handleCta, recheckCurrentPage } = useOnboarding();

  const handleCtaWithActions = async (href?: string, action?: string) => {
    if (action === "DISMISS") { closePopup(); return; }

    if (action === "CLAIM_BONUS") {
      try {
        const res = await onboardingRepository.claimBonus();
        if (!res.already_claimed) {
          toast.success(
            d.common.bonusCredited
              .replace("{amount}", res.montant.toLocaleString("fr-FR"))
              .replace("{devise}", res.devise),
          );
          if (pathname === ROUTES.billing || pathname.startsWith(ROUTES.billing + "/")) {
            router.refresh();
          }
        }
        await recheckCurrentPage();
      } catch {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
      return;
    }

    await recheckCurrentPage();
    await handleCta(href);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-[var(--bg)]"
      style={{
        "--color-primary": sectorTheme.primary,
        "--color-accent": sectorTheme.accent,
        "--color-bg": sectorTheme.bg,
      } as React.CSSProperties}
    >
      {/* Sidebar desktop */}
      <aside className="w-64 hidden lg:flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border)]">
        <PmeSidebarNav sectorTheme={sectorTheme} tutorialDone={tutorialDone} />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={cn("relative z-10 w-64 flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border)]")}>
            <PmeSidebarNav sectorTheme={sectorTheme} tutorialDone={tutorialDone} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PmeMobileHeader
          isOpen={sidebarOpen}
          sectorTheme={sectorTheme}
          onToggle={() => setSidebarOpen(p => !p)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>

      <SupportWidgets />

      {isPopupOpen && onboardingData?.payload && (
        <OnboardingPopup
          popupKey={onboardingData.popup_key!}
          payload={onboardingData.payload}
          onClose={closePopup}
          onCtaClick={handleCtaWithActions}
        />
      )}
    </div>
  );
}