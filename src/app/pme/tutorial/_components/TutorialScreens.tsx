// src/app/pme/tutorial/_components/TutorialScreens.tsx
"use client";
import { useRouter } from "next/navigation";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { TABS } from "./tutorial.types";

interface TutorialDictionary {
  title: string;
  subtitle: string;
  startBtn: string;
  sections: string;
  tabs: Record<string, string>;
  steps: Record<string, { title: string; desc: string }>;
  finishBtn: string;
  nextBtn: string;
  prevBtn: string;
  skipBtn: string;
  stepOf: string;
  goToSection: string;
}

export function LoadingScreen() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#075E54] border-t-transparent animate-spin" />
    </div>
  );
}

export function CompletedScreen({ t, onRestart }: { t: TutorialDictionary; onRestart: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-[#25D366]" />
        </div>
        <h1 className="text-3xl font-black text-[var(--text)]">{t.finishBtn} !</h1>
        <p className="text-[var(--text-muted)]">
          Vous maîtrisez maintenant toutes les fonctionnalités d&apos;AGT Platform.
        </p>
        <button
          onClick={() => router.push(ROUTES.dashboard)}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm mx-auto transition-all hover:scale-105 shadow-lg"
          style={{ backgroundColor: "#075E54" }}
        >
          {t.goToSection}
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onRestart} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          Revoir le tutoriel
        </button>
      </div>
    </div>
  );
}

export function WelcomeScreen({ t, onStart }: { t: TutorialDictionary; onStart: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-[#075E54]/10 flex items-center justify-center mx-auto">
          <Zap className="w-10 h-10 text-[#075E54]" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text)]">{t.title}</h1>
          <p className="text-[var(--text-muted)] leading-relaxed">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TABS.map((tab) => {
            const tabT = t.tabs[tab.key];
            return (
              <div key={tab.key} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-center space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: tab.color + "20", color: tab.color }}>
                  {tab.icon}
                </div>
                <p className="text-xs font-bold text-[var(--text)]">{tabT}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{tab.steps.length} {t.sections}</p>
              </div>
            );
          })}
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm mx-auto transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{ backgroundColor: "#075E54" }}
        >
          {t.startBtn}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}