// src/app/onboarding/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { authRepository, tenantsRepository, plansRepository } from "@/repositories";
import { ROUTES } from "@/lib/constants";
import type { Plan } from "@/types/api";
import { OnboardingNavbar } from "./_components/OnboardingNavbar";
import { OnboardingStepper } from "./_components/OnboardingStepper";
import { StepAccount } from "./_components/steps/StepAccount";
import { StepEmailCheck } from "./_components/steps/StepEmailCheck";
import { StepProfile, type ProfileForm } from "./_components/steps/StepProfile";
import { StepPlan } from "./_components/steps/StepPlan";
import { StepPayment } from "./_components/steps/StepPayment";
import { StepSuccess } from "./_components/steps/StepSuccess";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Step = "account" | "email_check" | "profile" | "plan" | "payment" | "success";
const STEPS_MAP: Record<string, number> = { profile: 0, plan: 1, payment: 2, success: 3 };

export default function OnboardingPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      <OnboardingContent />
    </GoogleOAuthProvider>
  );
}

function OnboardingContent() {
  const { login, loginWithGoogle } = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t = d.onboarding;
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("account");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Compte
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountName, setAccountName] = useState("");

  // Profil
  const [profile, setProfile] = useState<ProfileForm>({
    name: "", sector: "", description: "", whatsapp_number: "", phone_number: "",
  });

  const plan = plans.find(p => p.id === selectedPlan) ?? null;
  const currentStepIndex = STEPS_MAP[step] ?? -1;

  useEffect(() => {
    plansRepository.getList().then(data => {
      setPlans(data);
      if (data.length > 0) setSelectedPlan(data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const verified = new URLSearchParams(window.location.search).get("verified");
    if (verified === "true") setStep("profile");
  }, []);

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (accountPassword !== accountConfirmPassword) {
      setError(locale === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await authRepository.register({
          email: accountEmail, password: accountPassword, name: accountName,
        });
        if (res.user.tenant_id && res.user.is_active) {
          toast.error(t.accountExistsActive);
          router.push(ROUTES.login);
          return;
        }
        if (res.user.tenant_id) {
          const tenant = await tenantsRepository.getById(res.user.tenant_id);
          setProfile({
            name: tenant.name, sector: tenant.sector, description: tenant.description,
            whatsapp_number: tenant.whatsapp_number, phone_number: tenant.phone_number,
          });
        }
        setStep("email_check");
      } catch {
        setError(d.common.error);
      }
    });
  };

  const handleGoogleSuccess = async (googleUser: { email: string; name: string; sub: string }) => {
    try {
      const res = await loginWithGoogle(googleUser);
      if (res?.user?.user_type === "entreprise" && res?.user?.is_email_verified) {
        router.push(ROUTES.dashboard);
        return;
      }
      setAccountEmail(googleUser.email);
      setAccountName(googleUser.name);
      setStep("profile");
    } catch {
      setError(d.common.error);
    }
  };

  const handlePayment = () => {
    startTransition(async () => {
      try {
        await new Promise(r => setTimeout(r, 1200));
        toast.success(t.paymentSuccess);
        setStep("success");
      } catch {
        toast.error(d.common.error);
      }
    });
  };

  void login; // login importé mais pas encore utilisé dans ce flow

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <OnboardingNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {currentStepIndex >= 0 && step !== "success" && (
          <OnboardingStepper labels={t.stepLabels} currentIndex={currentStepIndex} />
        )}
        {step === "account" && (
          <StepAccount
            email={accountEmail} password={accountPassword}
            confirmPassword={accountConfirmPassword} name={accountName}
            showPassword={showPassword} isPending={isPending} error={error}
            onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword}
            onConfirmPasswordChange={setAccountConfirmPassword} onNameChange={setAccountName}
            onTogglePassword={() => setShowPassword(p => !p)}
            onSubmit={handleAccountSubmit}
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={() => setError(d.common.error)}
          />
        )}
        {step === "email_check" && <StepEmailCheck email={accountEmail} />}
        {step === "profile" && (
          <StepProfile profile={profile} onChange={setProfile} onSubmit={e => { e.preventDefault(); setStep("plan"); }} />
        )}
        {step === "plan" && (
          <StepPlan plans={plans} selectedPlan={selectedPlan} onSelect={setSelectedPlan} onNext={() => setStep("payment")} />
        )}
        {step === "payment" && (
          <StepPayment plan={plan} isPending={isPending} onPay={handlePayment} onBack={() => setStep("plan")} />
        )}
        {step === "success" && <StepSuccess onFinish={() => router.push(ROUTES.dashboard)} />}
      </div>
    </div>
  );
}