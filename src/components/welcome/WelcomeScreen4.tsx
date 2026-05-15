// src/components/welcome/WelcomeScreen4.tsx
"use client";
import { useState } from "react";
import { Bot, Settings, BookOpen, Loader2 } from "lucide-react";

interface Props {
  locale: string;
  onBack: () => void;
  onChoice: (href: string) => Promise<void>;
  submitting: boolean;
}

const T = {
  fr: {
    title: "Par où commencer ?",
    subtitle: "Choisissez votre point d'entrée. Les autres sections restent accessibles depuis le dashboard.",
    testBot: { label: "Tester mon assistant", sub: "Voir comment il répond à vos clients" },
    configure: { label: "Configurer", sub: "Personnaliser la base de connaissance" },
    tutorial: { label: "Voir le tutoriel", sub: "Tour complet en 2 minutes" },
    back: "Retour",
  },
  en: {
    title: "Where to start?",
    subtitle: "Choose your entry point. Other sections remain accessible from the dashboard.",
    testBot: { label: "Test my assistant", sub: "See how it responds to clients" },
    configure: { label: "Configure", sub: "Customize the knowledge base" },
    tutorial: { label: "View tutorial", sub: "Full tour in 2 minutes" },
    back: "Back",
  },
};




export function WelcomeScreen4({ locale, onBack, onChoice, submitting }: Props) {
  const t = T[locale as keyof typeof T] ?? T.fr;
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const choices = [
    { icon: Bot,      color: "var(--color-primary)", href: "/bots",     ...t.testBot   },
    { icon: Settings, color: "var(--color-accent)",  href: "/faq",      ...t.configure },
    { icon: BookOpen, color: "#6366f1",              href: "/tutorial", ...t.tutorial  },
  ];
  const handleClick = async (href: string) => {
  setActiveHref(href);
  await onChoice(href);
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {choices.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.href} onClick={() => handleClick(c.href)} disabled={submitting || activeHref !== null}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--color-primary)]/40 bg-[var(--bg)] hover:bg-[var(--bg-card)] transition text-left disabled:opacity-60 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                {activeHref === c.href ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-[var(--text)]">{c.label}</p>
                <p className="text-sm text-[var(--text-muted)]">{c.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={onBack} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition">
        ← {t.back}
      </button>
    </div>
  );
}