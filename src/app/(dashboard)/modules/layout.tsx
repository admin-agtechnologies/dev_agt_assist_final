// src/app/(dashboard)/modules/layout.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed, BedDouble, BookOpen, ShoppingCart, CalendarDays,
  Package, Wrench, Bus, GraduationCap, Building2, Sparkles, Bell, Target,
  Settings2,
} from "lucide-react";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { HUB_MODULES, HUB_SLUGS, type HubModule } from "@/lib/hub-modules";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, BedDouble, BookOpen, ShoppingCart, CalendarDays,
  Package, Wrench, Bus, GraduationCap, Building2, Sparkles, Bell, Target,
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  const { features } = useActiveFeatures();
  const pathname     = usePathname();
  const router       = useRouter();
  const { locale }   = useLanguage();

  const activeHubModules: HubModule[] = HUB_MODULES.filter(
    (m) => features.some((f) => f.slug === m.slug && f.is_active)
  );

  const currentPath = pathname.split("/modules/")[1] ?? "";

  // Redirect to first active module if on /modules root
  useEffect(() => {
    if (pathname === "/modules" && activeHubModules.length > 0) {
      router.replace(`/modules/${activeHubModules[0].path}`);
    }
  }, [pathname, activeHubModules, router]);

  return (
    <div className="space-y-0">
      {/* ── Tab bar ── */}
      {activeHubModules.length > 0 && (
        <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="flex items-center overflow-x-auto scrollbar-hide px-2">
            {activeHubModules.map((m) => {
              const Icon     = ICONS[m.iconName];
              const isActive = currentPath === m.path;
              const label    = locale === "fr" ? m.labelFr : m.labelEn;

              return (
                <button key={m.path}
                  onClick={() => router.push(`/modules/${m.path}`)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap",
                    "border-b-2 transition-all shrink-0",
                    isActive
                      ? "border-current text-[var(--text)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]/50"
                  )}
                  style={isActive ? { borderColor: m.color, color: m.color } : {}}>
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </button>
              );
            })}

            {/* Gérer mes modules */}
            <div className="ml-auto shrink-0 px-3 py-2 border-l border-[var(--border)]">
              <button onClick={() => router.push("/modules")}
                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <Settings2 className="w-3.5 h-3.5" />
                {locale === "fr" ? "Gérer" : "Manage"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="p-6">{children}</div>
    </div>
  );
}