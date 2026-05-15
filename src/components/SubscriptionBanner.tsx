// src/components/SubscriptionBanner.tsx
"use client";
import { useRouter } from "next/navigation";
import { AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type InactiveStatut = "suspendu" | "resilie";

interface BannerConfig {
  Icon: typeof AlertTriangle;
  wrapperClass: string;
  iconClass: string;
  titleClass: string;
  descClass: string;
  btnClass: string;
  titleKey: "bannerSuspendedTitle" | "bannerCancelledTitle";
  descKey:  "bannerSuspendedDesc"  | "bannerCancelledDesc";
  ctaKey:   "bannerSuspendedCta"   | "bannerCancelledCta";
}

const CONFIG: Record<InactiveStatut, BannerConfig> = {
  suspendu: {
    Icon: AlertTriangle,
    wrapperClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
    iconClass:    "text-amber-500",
    titleClass:   "text-amber-800 dark:text-amber-300",
    descClass:    "text-amber-700 dark:text-amber-400",
    btnClass:     "bg-amber-500 hover:bg-amber-600 text-white",
    titleKey: "bannerSuspendedTitle",
    descKey:  "bannerSuspendedDesc",
    ctaKey:   "bannerSuspendedCta",
  },
  resilie: {
    Icon: XCircle,
    wrapperClass: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
    iconClass:    "text-red-500",
    titleClass:   "text-red-800 dark:text-red-300",
    descClass:    "text-red-700 dark:text-red-400",
    btnClass:     "bg-red-500 hover:bg-red-600 text-white",
    titleKey: "bannerCancelledTitle",
    descKey:  "bannerCancelledDesc",
    ctaKey:   "bannerCancelledCta",
  },
};

export function SubscriptionBanner() {
  const { user }              = useAuth();
  const { dictionary: d }     = useLanguage();
  const router                = useRouter();
  const t                     = d.billing;

  const statut = user?.onboarding?.abonnement_statut;

  // Rien à afficher si actif ou si abonnement absent (nouveau user → géré par /welcome)
  if (!statut || statut === "actif") return null;
  if (statut !== "suspendu" && statut !== "resilie") return null;

  const cfg  = CONFIG[statut];
  const Icon = cfg.Icon;

  return (
    <div className={`flex items-start gap-3 px-6 py-4 border-b ${cfg.wrapperClass}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.iconClass}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${cfg.titleClass}`}>
          {t[cfg.titleKey]}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed ${cfg.descClass}`}>
          {t[cfg.descKey]}
        </p>
      </div>

      <button
        onClick={() => router.push("/billing")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
                    transition-colors shrink-0 ${cfg.btnClass}`}
      >
        {t[cfg.ctaKey]}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}