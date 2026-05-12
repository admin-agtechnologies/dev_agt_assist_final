// src/components/layout/SidebarPinnedModules.tsx
// Section "Modules épinglés" dans la sidebar.
// Affiche les TenantFeatures où is_pinned=true, avec barre de quota colorée
// selon le pourcentage utilisé (vert → orange → rouge).
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pin } from "lucide-react";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { getFeatureLabel } from "@/lib/sector-labels";
import { FEATURE_TO_ROUTE } from "./Sidebar.config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  locale: Locale;
  onClose?: () => void;
}

function quotaBarColor(used: number, quota: number): string {
  if (quota <= 0) return "var(--text-muted)";
  const ratio = used / quota;
  if (ratio >= 1) return "#dc2626";       // rouge
  if (ratio >= 0.85) return "#ea580c";    // orange
  if (ratio >= 0.6) return "#ca8a04";     // jaune
  return "#16a34a";                       // vert
}

export function SidebarPinnedModules({ locale, onClose }: Props) {
  const pathname = usePathname();
  const { features, isLoading } = useActiveFeatures();

  if (isLoading) return null;

  const pinned = features.filter(
    (f) => f.is_pinned && f.is_active && FEATURE_TO_ROUTE[f.slug],
  );

  if (pinned.length === 0) return null;

  return (
    <div className="px-4 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1 mb-1 flex items-center gap-1">
        <Pin className="w-3 h-3" />
        {locale === "fr" ? "Épinglés" : "Pinned"}
      </p>
      <div className="space-y-0.5">
        {pinned.map((f) => {
          const href = FEATURE_TO_ROUTE[f.slug];
          const active = pathname === href || pathname.startsWith(href + "/");
          const label = getFeatureLabel(f.slug, locale).nav;
          const isUnlimited = f.is_unlimited || f.quota == null;
          const used = f.used ?? 0;
          const quota = f.quota ?? 0;
          const quotaReached = !isUnlimited && quota > 0 && used >= quota;
          const ratio = isUnlimited ? 0 : Math.min(used / (quota || 1), 1);

          return (
            <Link
              key={f.slug}
              href={href}
              onClick={onClose}
              className={cn(
                "block px-3 py-2 rounded-xl text-sm transition-all",
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-xs">{label}</span>
                {isUnlimited ? (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">∞</span>
                ) : quotaReached ? (
                  <span className="text-[10px] font-bold text-red-600">🔒</span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {used}/{quota}
                  </span>
                )}
              </div>
              {!isUnlimited && quota > 0 && (
                <div className="mt-1 h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${ratio * 100}%`,
                      backgroundColor: quotaBarColor(used, quota),
                    }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}