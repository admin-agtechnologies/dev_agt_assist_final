// src/components/layout/SidebarDynamicNav.tsx
// Navigation sectorielle dynamique — modules actifs selon features du tenant.
// Responsabilité unique : filtrer les features actives, dédoublonner les routes,
// afficher les liens vers les modules.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { getFeatureLabel } from "@/lib/sector-labels";
import { FEATURE_TO_ROUTE } from "./Sidebar.config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  locale: Locale;
  onClose?: () => void;
}

interface ModuleItem {
  href: string;
  label: string;
}

export function SidebarDynamicNav({ locale, onClose }: Props) {
  const pathname = usePathname();
  const { features, isLoading } = useActiveFeatures();

  // Construire la liste des modules en dédoublonnant par route.
  // Plusieurs features peuvent pointer vers la même route (ex: tous les
  // catalogues → /modules/catalogue). On garde le label de la première feature.
  const seen = new Set<string>();
  const moduleItems: ModuleItem[] = features
    .filter((f) => f.is_active && FEATURE_TO_ROUTE[f.slug])
    .reduce<ModuleItem[]>((acc, f) => {
      const href = FEATURE_TO_ROUTE[f.slug];
      if (seen.has(href)) return acc;
      seen.add(href);
      acc.push({ href, label: getFeatureLabel(f.slug, locale).nav });
      return acc;
    }, []);

  if (isLoading) {
    return (
      <div className="px-5 py-2">
        <div className="h-3 w-24 rounded bg-[var(--border)] animate-pulse mb-2" />
        <div className="h-3 w-20 rounded bg-[var(--border)] animate-pulse" />
      </div>
    );
  }

  if (moduleItems.length === 0) return null;

  return (
    <div className="px-4 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1 mb-1">
        {locale === 'fr' ? 'Modules' : 'Modules'}
      </p>
      <div className="space-y-0.5">
        {moduleItems.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}