"use client";
// src/components/agences/QuotaWarning.tsx
// Affiché quand l'entreprise approche ou atteint la limite d'agences de son plan

import { AlertTriangle, Lock } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";

interface QuotaWarningProps {
  current: number;
  limite: number;
  locale: Locale;
}

export function QuotaWarning({ current, limite, locale }: QuotaWarningProps) {
  const isBlocked = current >= limite;
  const isWarning = !isBlocked && current >= limite - 1;

  if (!isWarning && !isBlocked) return null;

  const LABELS = {
    fr: {
      blocked: `Limite atteinte — votre plan autorise ${limite} agence${limite > 1 ? "s" : ""}.`,
      warning: `Vous approchez de la limite (${current}/${limite} agence${limite > 1 ? "s" : ""}).`,
      upgrade: "Passer à un plan supérieur",
    },
    en: {
      blocked: `Limit reached — your plan allows ${limite} agency${limite > 1 ? "ies" : "y"}.`,
      warning: `You are approaching the limit (${current}/${limite} agenc${limite > 1 ? "ies" : "y"}).`,
      upgrade: "Upgrade your plan",
    },
  } as const;

  const t = LABELS[locale];

  return (
    <div
      className={[
        "flex items-start gap-3 p-4 rounded-xl border text-sm",
        isBlocked
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-orange-50 border-orange-200 text-orange-700",
      ].join(" ")}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {isBlocked ? <Lock size={16} /> : <AlertTriangle size={16} />}
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {isBlocked ? t.blocked : t.warning}
        </p>
        {isBlocked && (
          <a
            href="/billing"
            className="inline-block mt-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {t.upgrade}
          </a>
        )}
      </div>
    </div>
  );
}