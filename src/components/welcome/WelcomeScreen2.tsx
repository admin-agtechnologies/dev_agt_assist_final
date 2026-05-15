// src/components/welcome/WelcomeScreen2.tsx
"use client";
import { useCallback, useEffect, useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDesiredFeatures, useSectorFeatures } from "@/hooks/useFeatures";
import { Spinner } from "@/components/ui";

export const MODULES_KEY = "AGT_WELCOME_MODULES";

interface Props {
  selectedSlugs: string[];
  onSlugsChange: (slugs: string[]) => void;
  locale: string;
  onBack: () => void;
  onContinue: () => void;
}

const T = {
  fr: { title: "Vos modules", subtitle: "Sélectionnez les modules à activer sur votre compte.", back: "Retour", next: "C'est parti →", selected: (n: number) => `${n} sélectionné${n > 1 ? "s" : ""}` },
  en: { title: "Your modules", subtitle: "Select the modules to activate on your account.", back: "Back", next: "Let's go →", selected: (n: number) => `${n} selected` },
};

export function WelcomeScreen2({ selectedSlugs, onSlugsChange, locale, onBack, onContinue }: Props) {
  const { user } = useAuth();
  const sectorSlug = user?.entreprise?.secteur?.slug ?? "";
  const { features: desired, isLoading: loadingD } = useDesiredFeatures();
  const { features: sector, isLoading: loadingS }  = useSectorFeatures(sectorSlug);
  const { features: allSector, isLoading: loadingAll } = useSectorFeatures("custom");
 const t = T[locale as keyof typeof T] ?? T.fr;

  // Slugs obligatoires — source fiable : SectorFeature (is_mandatory garanti boolean)
  const mandatorySet = useMemo(
    () => new Set([
      ...sector.filter(f => f.is_mandatory).map(f => f.slug),
      ...allSector.filter(f => f.is_mandatory).map(f => f.slug),
    ]),
    [sector, allSector],
  );

  // Initialisation depuis les features désirées (choisies à l'inscription)
  useEffect(() => {
    if (!loadingD && desired.length > 0 && selectedSlugs.length === 0) {
      onSlugsChange(desired.map(f => f.slug));
    }
  }, [loadingD]); // eslint-disable-line

  // Fusion desired + sector sans doublons

  // Fusion desired + sector sans doublons — desired en premier
  const allFeatures = [
   ...desired,
   ...sector
     .filter(sf => !desired.some(d => d.slug === sf.slug))
     .map(sf => ({ ...sf, is_active: false, is_desired: false })),
   ...allSector
     .filter(af =>
       !desired.some(d => d.slug === af.slug) &&
       !sector.some(s => s.slug === af.slug)
     )
     .map(af => ({ ...af, is_active: false, is_desired: false })),
 ];

  const selectedSet = new Set(selectedSlugs);

  const toggle = useCallback((slug: string, mandatory: boolean) => {
    if (mandatory) return;
    const next = new Set(selectedSet);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    const slugs = Array.from(next);
    onSlugsChange(slugs);
    try { localStorage.setItem(MODULES_KEY, JSON.stringify(slugs)); } catch { /* noop */ }
  }, [selectedSet, onSlugsChange]);

  if (loadingD || loadingS || loadingAll) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
        {allFeatures.map(f => {
          const selected  = selectedSet.has(f.slug);
          const mandatory = mandatorySet.has(f.slug);
          return (
            <button key={f.slug} onClick={() => toggle(f.slug, !!mandatory)} disabled={!!mandatory}
              className={["flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                         : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--color-primary)]/50",
                mandatory ? "cursor-default opacity-90" : "",
              ].filter(Boolean).join(" ")}>
              <div className={["w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--border)]",
              ].join(" ")}>
                {mandatory ? <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                           : selected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text)] truncate">{f.nom_fr}</p>
                {f.is_desired && !mandatory && (
                  <span className="text-[10px] text-[var(--color-accent)] font-semibold">Votre choix</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition">
          ← {t.back}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{t.selected(selectedSet.size)}</span>
          <button onClick={onContinue} disabled={selectedSet.size === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition disabled:opacity-40">
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}