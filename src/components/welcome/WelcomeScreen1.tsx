// src/components/welcome/WelcomeScreen1.tsx
// Écran 1 : Bienvenue + logo sectoriel + nom entreprise.
"use client";
import { ArrowRight, PartyPopper } from "lucide-react";
import Image from "next/image";
import { useSector } from "@/hooks/useSector";
import { getLogoAssets } from "@/lib/logo-config";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  entrepriseName: string;
  locale: Locale;
  onContinue: () => void;
}

export function WelcomeScreen1({ entrepriseName, locale, onContinue }: Props) {
  const { sector, theme } = useSector();
  const logo = getLogoAssets(sector);

  return (
    <div className="card p-8 md:p-12 text-center space-y-6">
      {/* Logo sectoriel */}
      <div className="flex justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md overflow-hidden bg-white p-3"
          style={{ boxShadow: `0 4px 12px ${theme.primary}33` }}
        >
          {logo?.light ? (
            <Image
              src={logo.lightSvg ?? logo.light}
              alt={theme.label ?? "AGT"}
              width={64}
              height={64}
              className="object-contain"
            />
          ) : (
            <PartyPopper className="w-10 h-10" style={{ color: theme.primary }} />
          )}
        </div>
      </div>

      {/* Titre */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">
          {locale === "fr" ? "Bienvenue" : "Welcome"}
          {entrepriseName && (
            <>
              {", "}
              <span style={{ color: theme.primary }}>{entrepriseName}</span>
            </>
          )}{" "}
          <span aria-hidden>🎉</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
          {locale === "fr"
            ? "Votre assistant virtuel est prêt. Faisons connaissance avec votre nouvel espace en quelques étapes."
            : "Your virtual assistant is ready. Let's get familiar with your new space in a few steps."}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
        style={{ backgroundColor: theme.primary }}
      >
        {locale === "fr" ? "Commencer" : "Get started"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}