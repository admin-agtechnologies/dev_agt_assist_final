// src/components/welcome/WelcomeScreen3.tsx
// Écran 3 : 3 CTA finaux. Quel que soit le clic, on marque welcome_seen
// et la convergence (bannière sticky) prend le relais.
"use client";
import { ArrowLeft, Rocket, Settings as SettingsIcon, BookOpen } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import type { Locale } from "@/contexts/LanguageContext";

interface Props {
  locale: Locale;
  onBack: () => void;
  onChoice: (href: string) => void;
  submitting: boolean;
}

export function WelcomeScreen3({ locale, onBack, onChoice, submitting }: Props) {
  const { theme } = useSector();

  const cards = [
    {
      icon: Rocket,
      title:    locale === "fr" ? "Tester mon assistant" : "Test my assistant",
      subtitle: locale === "fr" ? "Voir comment il répond à vos clients" : "See how it responds to customers",
      href:     "/bots",
      color:    theme.primary,
    },
    {
      icon: SettingsIcon,
      title:    locale === "fr" ? "Configurer" : "Configure",
      subtitle: locale === "fr" ? "Personnaliser la base de connaissance" : "Customize the knowledge base",
      href:     "/faq",
      color:    theme.accent,
    },
    {
      icon: BookOpen,
      title:    locale === "fr" ? "Voir le tutoriel" : "View tutorial",
      subtitle: locale === "fr" ? "Tour complet en 2 minutes" : "Full 2-minute tour",
      href:     "/tutorial",
      color:    theme.primary,
    },
  ];

  return (
    <div className="card p-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[var(--text)]">
          {locale === "fr" ? "Par où commencer ?" : "Where to start?"}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {locale === "fr"
            ? "Choisissez votre point d'entrée. Vous reviendrez aux autres étapes via la bannière en haut du dashboard."
            : "Choose your entry point. You'll come back to the other steps via the banner at the top of your dashboard."}
        </p>
      </div>

      {/* 3 CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={i}
              onClick={() => onChoice(c.href)}
              disabled={submitting}
              className="card p-5 text-center space-y-3 transition-all hover:scale-105 active:scale-100 disabled:opacity-50 disabled:scale-100 group"
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)` }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)] leading-tight">
                  {c.title}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug">
                  {c.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-start pt-4 border-t border-[var(--border)]">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "fr" ? "Retour" : "Back"}
        </button>
      </div>
    </div>
  );
}