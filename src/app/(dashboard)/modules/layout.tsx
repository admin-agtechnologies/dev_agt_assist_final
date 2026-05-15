// src/app/(dashboard)/modules/layout.tsx
// Layout partagé pour /modules et /modules/[hub].
// S27 : sur la route racine /modules → pas de tab bar (marketplace).
//       Sur /modules/[hub] → tab bar dynamique des hubs actifs.
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { getFeatureLabel } from "@/lib/sector-labels";
import { getFeatureIcon } from "@/lib/feature-icon-map";
import { HUB_MODULES } from "@/lib/hub-modules";
import { cn } from "@/lib/utils";

// ── Tab bar dynamique (uniquement sur /modules/[hub]) ────────────────────────

function HubTabBar() {
  const pathname            = usePathname();
  const { locale }          = useLanguage();
  const { theme }           = useSector();
  const { features, isLoading } = useActiveFeatures();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 rounded-xl bg-[var(--border)] animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Ne montrer que les modules hub actifs
  const activeSlugs = new Set(features.filter((f) => f.is_active).map((f) => f.slug));
  const tabs = HUB_MODULES.filter((m) => activeSlugs.has(m.slug));

  if (tabs.length === 0) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((mod) => {
        const href    = `/modules/${mod.path}`;
        const isActive = pathname === href || pathname.startsWith(href + "/");
        const label   = locale === "fr" ? mod.labelFr : mod.labelEn;
        const Icon    = getFeatureIcon(mod.slug);

        return (
          <Link
            key={mod.slug}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap",
              "transition-all duration-150 flex-shrink-0 border",
              isActive
                ? "text-white border-transparent shadow-sm"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]",
            )}
            style={isActive ? { backgroundColor: mod.color, borderColor: mod.color } : {}}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sur la racine exacte /modules → marketplace sans chrome de hub
  const isMarketplaceRoot = pathname === "/modules";

  if (isMarketplaceRoot) {
    return (
      <div className="p-6">
        {children}
      </div>
    );
  }

  // Sur /modules/[hub] → layout complet avec tab bar + lien retour marketplace
  return (
    <div className="flex flex-col min-h-0">
      {/* Tab bar sticky */}
      <div className="sticky top-0 z-10 bg-[var(--bg)] border-b border-[var(--border)] px-6 py-3">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link
            href="/modules"
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            ← Tous les modules
          </Link>
        </div>
        <HubTabBar />
      </div>

      {/* Contenu hub */}
      <div className="p-6">{children}</div>
    </div>
  );
}