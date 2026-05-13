"use client";
// ============================================================
// FICHIER : src/app/(auth)/onboarding/page.tsx  — v6
// Fix build : Suspense wrapper pour useSearchParams (Next.js 14)
// Fix runtime : déclarations router + searchParams manquantes
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { google: any } }

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { secteursRepository } from "@/repositories";
import { publicFeaturesRepository, type PublicFeature } from "@/repositories/public-features.repository";
import { authRepository } from "@/repositories/auth.repository";
import { tenantsRepository } from "@/repositories/tenants.repository";
import { featuresRepository } from "@/repositories/features.repository";
import { SectorPicker } from "@/components/onboarding/SectorPicker";
import { SECTOR_THEMES } from "@/lib/sector-theme";
import { setStoredSector, isValidSector } from "@/lib/sector-config";
import { IdentityStep } from "@/components/onboarding/IdentityStep";
import { FeaturePicker } from "@/components/onboarding/FeaturePicker";
import { AccountStep } from "@/components/onboarding/AccountStep";
import { EmailCheckStep } from "@/components/onboarding/EmailCheckStep";
import { LoadingPage } from "@/components/data/LoadingSpinner";
import { ROUTES } from "@/lib/constants";
import type { SecteurActivite } from "@/types/api";

type Step = "sector" | "identity" | "features" | "account" | "email_check" | "finalize";
const ORDERED: Step[] = ["sector", "identity", "features", "account"];

interface Draft {
  sector_slug:   string;
  sector_id:     string;
  company_name:  string;
  feature_slugs: string[];
}

const DRAFT_KEY      = "agt_ob_draft";
const EMPTY: Draft   = { sector_slug: "", sector_id: "", company_name: "", feature_slugs: [] };
const FALLBACK_ACCENT = "#075E54";

const saveDraft  = (d: Partial<Draft>) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...getDraft(), ...d })); } catch {} };
const getDraft   = (): Draft => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") }; } catch { return EMPTY; } };
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

const STEP_LABELS = {
  fr: ["Secteur", "Entreprise", "Fonctionnalités", "Compte"],
  en: ["Sector",  "Business",   "Features",        "Account"],
};

function resolveAccent(slug: string): string {
  return isValidSector(slug) ? SECTOR_THEMES[slug].accent : FALLBACK_ACCENT;
}

// ── Composant interne — contient tous les hooks client ────────────────────────
function OnboardingContent() {
  const router        = useRouter();          // ✅ déclaré ici
  const searchParams  = useSearchParams();    // ✅ déclaré ici (exige Suspense parent)
  const { user, refreshUser } = useAuth();
  const { locale }            = useLanguage();

  const [step,        setStep]        = useState<Step>("sector");
  const [secteurs,    setSecteurs]    = useState<SecteurActivite[]>([]);
  const [features,    setFeatures]    = useState<PublicFeature[]>([]);
  const [allFeatures, setAllFeatures] = useState<PublicFeature[]>([]);
  const [draft,       setDraftState]  = useState<Draft>(EMPTY);
  const [loading,     setLoading]     = useState(true);
  const [regError,    setRegError]    = useState("");
  const [email,       setEmail]       = useState("");

  const accentColor = resolveAccent(draft.sector_slug);

  useEffect(() => {
    if (user?.entreprise?.secteur) router.replace(ROUTES.dashboard);
  }, [user, router]);

  useEffect(() => {
    const stored     = getDraft();
    const presetSlug = searchParams.get("sector") ?? stored.sector_slug ?? "";
    setDraftState({ ...stored, sector_slug: presetSlug });
    if (presetSlug && isValidSector(presetSlug)) setStoredSector(presetSlug);
    secteursRepository.getList().then(setSecteurs).catch(() => {}).finally(() => setLoading(false));
    if (user && !user.entreprise?.secteur && stored.sector_id) setStep("finalize");
  }, [searchParams, user]);

  const patchDraft = useCallback((patch: Partial<Draft>) => {
    setDraftState(prev => { const next = { ...prev, ...patch }; saveDraft(patch); return next; });
  }, []);

  const handleSectorSelect = useCallback((slug: string) => {
    patchDraft({ sector_slug: slug });
    if (isValidSector(slug)) setStoredSector(slug);
  }, [patchDraft]);

  const goBack = () => {
    const idx = ORDERED.indexOf(step as Step);
    if (idx > 0) setStep(ORDERED[idx - 1]);
  };

  const handleSectorConfirm = async (slug: string) => {
    const found = secteurs.find(s => s.slug === slug);
    patchDraft({ sector_slug: slug, sector_id: found?.id ?? "" });
    if (isValidSector(slug)) setStoredSector(slug);
    setLoading(true);
    try {
      const [sectorFeats, customFeats] = await Promise.all([
        publicFeaturesRepository.getBySector(slug),
        publicFeaturesRepository.getBySector("custom"),
      ]);
      setFeatures(sectorFeats);
      setAllFeatures(customFeats);
    } catch {
      setFeatures([]);
      setAllFeatures([]);
    } finally {
      setLoading(false);
    }
    setStep("identity");
  };

  const handleIdentityConfirm = (companyName: string) => {
    patchDraft({ company_name: companyName });
    setStep("features");
  };

  const handleFeaturesConfirm = async (slugs: string[]) => {
    patchDraft({ feature_slugs: slugs });
    setStep("account");
  };

  const handleAccountConfirm = async (name: string, emailVal: string, password: string) => {
    setRegError("");
    setLoading(true);
    try {
      await authRepository.register({
        name, email: emailVal, password,
        company_name:  draft.company_name  || undefined,
        sector_slug:   draft.sector_slug   || undefined,
        feature_slugs: draft.feature_slugs.length ? draft.feature_slugs : undefined,
      });
      setEmail(emailVal);
      clearDraft();
      setStep("email_check");
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Erreur lors de la création du compte.");
    } finally { setLoading(false); }
  };

  const handleGoogleClick = useCallback(() => {
    saveDraft(draft);
    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      console.warn("[onboarding] Google Identity Services non chargé.");
      return;
    }
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      callback: async (response: { credential: string }) => {
        try {
          const payload = JSON.parse(atob(response.credential.split(".")[1]));
          const result  = await authRepository.google({ email: payload.email, name: payload.name ?? "", google_id: payload.sub ?? "" });
          if (result?.access) {
            localStorage.setItem("agt_access_token",  result.access);
            localStorage.setItem("agt_refresh_token", result.refresh ?? "");
          }
          await refreshUser?.();
          setStep("finalize");
        } catch { setRegError("Connexion Google échouée. Réessayez."); }
      },
    });
    window.google.accounts.id.prompt();
  }, [draft, refreshUser]);

  const handleResend = async () => { await authRepository.resendVerification(email); };

  const handleFinalize = useCallback(async () => {
    const { sector_id, company_name, feature_slugs } = getDraft();
    if (!sector_id) { router.replace(ROUTES.dashboard); return; }
    try {
      await tenantsRepository.meUpdate({ name: company_name || undefined, secteur_id: sector_id });
      await Promise.allSettled(feature_slugs.map(s => featuresRepository.toggle(s, true)));
      clearDraft();
      await refreshUser?.();
    } catch {}
    router.replace(ROUTES.dashboard);
  }, [router, refreshUser]);

  useEffect(() => { if (step === "finalize") handleFinalize(); }, [step, handleFinalize]);

  const stepIndex = ORDERED.indexOf(step as Step);
  const labels    = STEP_LABELS[locale];

  if (loading && step !== "features") return <LoadingPage />;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={ROUTES.home ?? "/"} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0">
            <Home size={14} />
            <span className="hidden sm:inline">{locale === "fr" ? "Accueil" : "Home"}</span>
          </Link>

          {stepIndex >= 0 && (
            <div className="flex items-center gap-1 flex-1">
              {labels.map((label, i) => (
                <div key={label} className="flex items-center gap-1 flex-1">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                      style={i <= stepIndex
                        ? { backgroundColor: accentColor, color: "#fff" }
                        : { backgroundColor: "var(--border,#e5e7eb)", color: "var(--text-muted,#9ca3af)" }}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block font-medium ${i <= stepIndex ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                      {label}
                    </span>
                  </div>
                  {i < labels.length - 1 && (
                    <div className="h-px flex-1 mx-1 transition-colors"
                      style={{ backgroundColor: i < stepIndex ? accentColor : "var(--border,#e5e7eb)" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="bg-[var(--bg-card,var(--bg))] rounded-2xl border border-[var(--border,#e5e7eb)] p-6 sm:p-8 shadow-sm">
          {ORDERED.indexOf(step as Step) > 0 && (
            <button type="button" onClick={goBack}
              className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-5">
              <ChevronLeft size={16} />
              {locale === "fr" ? "Retour" : "Back"}
            </button>
          )}

          {step === "sector" && (
            <SectorPicker secteurs={secteurs} selected={draft.sector_slug} locale={locale}
              onSelect={handleSectorSelect}
              onConfirm={() => handleSectorConfirm(draft.sector_slug)} />
          )}
          {step === "identity" && (
            <IdentityStep initialName={draft.company_name} locale={locale}
              accentColor={accentColor} onConfirm={handleIdentityConfirm} />
          )}
          {step === "features" && (
            <FeaturePicker
              features={features}
              allFeatures={allFeatures}
              locale={locale}
              accentColor={accentColor}
              onConfirm={handleFeaturesConfirm}
            />
          )}
          {step === "account" && (
            <AccountStep locale={locale} accentColor={accentColor} loading={loading}
              error={regError} onConfirm={handleAccountConfirm} onGoogleClick={handleGoogleClick} />
          )}
          {step === "email_check" && (
            <EmailCheckStep email={email} locale={locale} accentColor={accentColor}
              onResend={handleResend} onBack={() => setStep("account")} />
          )}
          {step === "finalize" && <LoadingPage />}
        </div>
      </div>
    </div>
  );
}

// ── Export par défaut — Suspense requis par Next.js 14 pour useSearchParams ───
export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <OnboardingContent />
    </Suspense>
  );
}

// END OF FILE: src/app/(auth)/onboarding/page.tsx