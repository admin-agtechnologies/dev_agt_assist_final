// src/app/pme/tutorial/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { tutorialRepository } from "@/repositories";
import { ChevronRight, ChevronLeft, CheckCircle, ArrowRight, X } from "lucide-react";
import { TABS, toGlobalStep, fromGlobalStep, type StepKey } from "./_components/tutorial.types";
import { LoadingScreen, CompletedScreen, WelcomeScreen } from "./_components/TutorialScreens";

export default function PmeTutorialPage() {
  const { dictionary: d } = useLanguage();
  const t = d.tutorial;
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<Set<number>>(new Set());
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    tutorialRepository.getProgress()
      .then(res => {
        if (res.has_completed_tutorial) {
          setTutorialCompleted(true);
          setStarted(true);
        } else if (res.last_step > 0) {
          const { tabIdx, stepIdx } = fromGlobalStep(res.last_step);
          setActiveTab(tabIdx);
          setActiveStep(stepIdx);
          setStarted(true);
          const done = new Set<number>();
          for (let i = 0; i < tabIdx; i++) done.add(i);
          setCompletedTabs(done);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProgress(false));
  }, []);

  const tab = TABS[activeTab];
  const step = tab.steps[activeStep];
  const stepT = t.steps[step.key as StepKey];
  const isLastStepOfTab = activeStep === tab.steps.length - 1;
  const isLastTab = activeTab === TABS.length - 1;
  const isVeryLast = isLastStepOfTab && isLastTab;
  const isFirst = activeTab === 0 && activeStep === 0;

  useEffect(() => {
    if (started && isLastStepOfTab) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab, activeStep, started, isLastStepOfTab]);

  const handleNext = () => {
    if (isVeryLast) {
      tutorialRepository.complete().catch(() => {});
      setTutorialCompleted(true);
      router.push(ROUTES.dashboard);
    } else {
      let nextTab = activeTab;
      let nextStep = activeStep;
      if (isLastStepOfTab) {
        nextTab = activeTab + 1;
        nextStep = 0;
        setActiveTab(nextTab);
        setActiveStep(0);
      } else {
        nextStep = activeStep + 1;
        setActiveStep(nextStep);
      }
      tutorialRepository.saveStep(toGlobalStep(nextTab, nextStep)).catch(() => {});
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(s => s - 1);
    else if (activeTab > 0) {
      const prevTab = activeTab - 1;
      setActiveTab(prevTab);
      setActiveStep(TABS[prevTab].steps.length - 1);
    }
  };

  if (loadingProgress) return <LoadingScreen />;
  if (tutorialCompleted) return (
    <CompletedScreen
      t={t}
      onRestart={() => { setTutorialCompleted(false); setActiveTab(0); setActiveStep(0); setStarted(true); }}
    />
  );
  if (!started) return <WelcomeScreen t={t} onStart={() => setStarted(true)} />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-5">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tb, idx) => {
          const tabT = t.tabs[tb.key as keyof typeof t.tabs];
          const isActive = idx === activeTab;
          const isDone = completedTabs.has(idx);
          return (
            <button
              key={tb.key}
              onClick={() => { setActiveTab(idx); setActiveStep(0); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                isActive ? "text-white shadow-md" : isDone ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]"
              )}
              style={isActive ? { backgroundColor: tb.color } : {}}
            >
              {isDone && !isActive ? <CheckCircle className="w-4 h-4" /> : <span style={{ color: isActive ? "white" : tb.color }}>{tb.icon}</span>}
              <span>{tabT}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {tab.steps.map((s, idx) => {
          const isStepActive = idx === activeStep;
          const isStepDone = idx < activeStep || (completedTabs.has(activeTab) && !isStepActive);
          return (
            <button key={s.key} onClick={() => setActiveStep(idx)} className={cn("flex items-center justify-center transition-all", isStepActive ? "flex-1" : "w-8 flex-shrink-0")}>
              <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full", isStepActive ? "text-white shadow-md" : isStepDone ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]")} style={isStepActive ? { backgroundColor: s.color } : {}}>
                {isStepDone && !isStepActive ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <span className="flex-shrink-0" style={{ color: isStepActive ? "white" : s.color }}>{s.icon}</span>}
                {isStepActive && <span className="text-xs font-bold text-white truncate">{stepT.title}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">{activeStep + 1} {t.stepOf} {tab.steps.length}</p>

      <div className={cn("rounded-3xl border border-[var(--border)] overflow-hidden bg-gradient-to-br shadow-sm", step.bg)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[360px]">
          <div className="p-8 flex flex-col justify-center space-y-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: step.color }}>{step.icon}</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-[var(--text)]">{stepT.title}</h2>
              <p className="text-[var(--text-muted)] leading-relaxed text-sm">{stepT.desc}</p>
            </div>
            <button onClick={() => router.push(step.route)} className="flex items-center gap-2 text-sm font-bold transition-colors self-start" style={{ color: step.color }}>
              {t.goToSection}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 flex items-center justify-center min-h-[200px]">
            <div className="w-full max-w-sm">{step.illustration}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={isFirst} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all", isFirst ? "opacity-0 pointer-events-none" : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]")}>
          <ChevronLeft className="w-4 h-4" />
          {t.prevBtn}
        </button>
        <button onClick={() => router.push(ROUTES.dashboard)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
          <X className="w-3 h-3" />
          {t.skipBtn}
        </button>
        <button onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: step.color }}>
          {isVeryLast ? t.finishBtn : t.nextBtn}
          {isVeryLast ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}