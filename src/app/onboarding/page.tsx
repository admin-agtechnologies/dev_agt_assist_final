// src/app/onboarding/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { authRepository, tenantsRepository } from "@/repositories";
import { PLANS_CONFIG, ROUTES, WELCOME_BONUS_XAF } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { PlanSlug } from "@/lib/constants";
import {
  Check, Gift, Building2, CreditCard, PartyPopper,
  ChevronRight, Star, Mail, Lock, User, MailCheck,
  Sun, Moon, ArrowLeft, Eye, EyeOff,
} from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "account" | "email_check" | "profile" | "plan" | "payment" | "success";

interface ProfileForm {
  name: string; sector: string;
  description: string; whatsapp_number: string; phone_number: string;
}

const STEP_ICONS = [Building2, Star, CreditCard, PartyPopper];

// ── Wrapper Google OAuth ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder"}>
      <OnboardingContent />
    </GoogleOAuthProvider>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
function OnboardingContent() {
  const { login, loginWithGoogle } = useAuth();
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const t = d.onboarding;
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("account");
  const [selectedPlan, setSelectedPlan] = useState<PlanSlug>("starter");
  const [walletBalance] = useState(WELCOME_BONUS_XAF);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // ── Compte
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountName, setAccountName] = useState("");

  // ── Profil entreprise
  const [profile, setProfile] = useState<ProfileForm>({
    name: "", sector: "", description: "", whatsapp_number: "", phone_number: "",
  });

  const plan = PLANS_CONFIG.find(p => p.slug === selectedPlan)!;
  const canPay = walletBalance >= plan.price;

  // ── Stepper visuel (seulement pour profile/plan/payment)
  const STEPS_LABELS = t.stepLabels; // ["Votre entreprise", "Votre abonnement", "Paiement", "Confirmation"]
  const STEPS_MAP: Record<string, number> = { profile: 0, plan: 1, payment: 2, success: 3 };
  const currentStepIndex = STEPS_MAP[step] ?? -1;

  // ── Étape compte → création ou login ────────────────────────────────────
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
          email: accountEmail,
          password: accountPassword,
          name: accountName,
        });
        // Si compte existant ET actif (tenant_id présent) → redirect login
        if (res.user.tenant_id && res.user.is_active) {
          toast.error(t.accountExistsActive);
          router.push(ROUTES.login);
          return;
        }
        // Sinon → charger profil si existant + passer validation email
        if (res.user.tenant_id) {
          // Compte existe mais pas encore validé → charger données existantes
          const tenant = await tenantsRepository.getById(res.user.tenant_id);
          setProfile({
            name: tenant.name, sector: tenant.sector,
            description: tenant.description,
            whatsapp_number: tenant.whatsapp_number,
            phone_number: tenant.phone_number,
          });
        }
        setStep("email_check");
      } catch {
        setError(d.common.error);
      }
    });
  };

  // ── Google OAuth onboarding ──────────────────────────────────────────────
  const handleGoogleSuccess = async (googleUser: { email: string; name: string; sub: string }) => {
    try {
      const res = await loginWithGoogle(googleUser);
      // Google est trusted — pas de vérification email
      if (res?.user?.user_type === "entreprise" && res?.user?.is_email_verified) {
        // Compte existant et vérifié → dashboard
        router.push(ROUTES.dashboard);
        return;
      }
      // Nouveau compte Google → skip email_check, aller direct au profil
      setAccountEmail(googleUser.email);
      setAccountName(googleUser.name);
      setStep("profile");
    } catch {
      setError(d.common.error);
    }
  };

  // ── Vérification email — NE RIEN FAIRE ICI
  //   // L'utilisateur clique sur le lien reçu par email → /verify-email?token=xxx
  //   // Cette page vérifie le token, stocke les tokens JWT, redirige vers /onboarding?verified=true
  //   // Le useEffect ci-dessous détecte ?verified=true et passe à l'étape profile
  useEffect(() => {
    const verified = new URLSearchParams(window.location.search).get("verified");
    // Si l'email est vérifié, on saute directement à l'étape du profil entreprise
    if (verified === "true") {
      setStep("profile");
    }
  }, []); // On ne l'exécute qu'une fois au montage du composant

  // ── Profil → Plan ────────────────────────────────────────────────────────
  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("plan");
  };

  // ── Plan → Paiement ──────────────────────────────────────────────────────
  const handlePlanNext = () => setStep("payment");

  // ── Paiement → Succès ────────────────────────────────────────────────────
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

  // ── Succès → Dashboard ───────────────────────────────────────────────────
  const handleFinish = () => router.push(ROUTES.dashboard);

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Navbar onboarding ──────────────────────────────────────────────── */}
      <nav className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#075E54] flex items-center justify-center text-white font-black text-xs">A</div>
            <span className="font-black text-sm text-[var(--text)]">AGT Platform</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
              {locale === "fr" ? "EN" : "FR"}
            </button>
            <button onClick={toggle}
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Stepper (visible seulement à partir de profile) ──────────────── */}
        {currentStepIndex >= 0 && step !== "success" && (
          <div className="flex items-center gap-2 mb-10">
            {STEPS_LABELS.slice(0, 3).map((label, i) => {
              const Icon = STEP_ICONS[i];
              const done = i < currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    done ? "bg-[#25D366] text-white" : active ? "bg-[#075E54] text-white" : "bg-[var(--border)] text-[var(--text-muted)]"
                  )}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn("text-xs font-semibold hidden sm:block",
                    active ? "text-[var(--text)]" : "text-[var(--text-muted)]")}>
                    {label}
                  </span>
                  {i < 2 && <div className="flex-1 h-px bg-[var(--border)] ml-2" />}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : COMPTE
        ════════════════════════════════════════════════════════════════════ */}
        {step === "account" && (
          <div className="animate-fade-in">
            {/* Cadeau bienvenue */}
            <div className="card p-4 mb-6 flex items-center gap-4 border border-[#25D366]/30 bg-[#25D366]/5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[var(--text)] text-sm">{t.welcomeGiftTitle}</p>
                <p className="text-xs text-[var(--text-muted)]">{t.welcomeGiftDesc}</p>
              </div>
              <p className="text-lg font-black text-[#25D366] flex-shrink-0">{formatCurrency(WELCOME_BONUS_XAF)}</p>
            </div>

            <div className="card p-8">
              <h1 className="text-2xl font-black text-[var(--text)] mb-1">{t.accountTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-6">{t.accountSubtitle}</p>

              {/* Google OAuth */}
              {GOOGLE_CLIENT_ID && (
                <>
                  <GoogleSignupButton
                    label={t.googleBtn}
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError(d.common.error)}
                  />
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-xs text-[var(--text-muted)] font-medium">{t.orContinueWith}</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>
                </>
              )}

              {/* Formulaire email/password */}
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <label className="label-base">{t.fields.fullName}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="text" required className="input-base pl-10"
                      value={accountName} onChange={e => setAccountName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label-base">{t.fields.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="email" required autoComplete="email" className="input-base pl-10"
                      value={accountEmail} onChange={e => setAccountEmail(e.target.value)} />
                  </div>
                </div>
                {/* Mot de passe */}
                <div>
                  <label className="label-base">{t.fields.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required minLength={8} autoComplete="new-password"
                      className="input-base pl-10 pr-10"
                      value={accountPassword} onChange={e => setAccountPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation Mot de passe */}
                {/* Confirmation Mot de passe */}
                <div>
                  <label className="label-base">{t.fields.confirmPassword}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required minLength={8}
                      className="input-base pl-10 pr-10"
                      value={accountConfirmPassword} onChange={e => setAccountConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
                )}
                <button type="submit" disabled={isPending} className="btn-primary w-full justify-center py-3">
                  {isPending
                    ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                    : <>{d.common.continue} <ChevronRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                {d.landing.loginCta}{" "}
                <Link href={ROUTES.login} className="text-[#075E54] font-semibold hover:underline">
                  {d.landing.loginLink}
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : VALIDATION EMAIL
        ════════════════════════════════════════════════════════════════════ */}
        {step === "email_check" && (
          <div className="animate-fade-in">
            <div className="card p-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-black text-[var(--text)] mb-2">{t.emailCheckTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-2">{t.emailCheckSubtitle}</p>
              <p className="font-bold text-[#075E54] mb-8">{accountEmail}</p>

              {/* Barre de progression simulée */}
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#25D366] rounded-full animate-progress" />
              </div>
              <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                <Spinner className="w-3 h-3 border-[#25D366] border-t-transparent" />
                {t.emailCheckWaiting}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await authRepository.resendVerification(accountEmail);
                  toast.success("Email renvoyé !");
                } catch {
                  toast.error("Erreur lors de l'envoi.");
                }
              }}
              className="text-sm text-[#075E54] underline hover:opacity-75 mt-4"
            >
              Renvoyer l'email de vérification
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : PROFIL ENTREPRISE
        ════════════════════════════════════════════════════════════════════ */}
        {step === "profile" && (
          <div className="animate-fade-in">
            {/* Cadeau bienvenue */}
            <div className="card p-4 mb-6 flex items-center gap-4 border border-[#25D366]/30 bg-[#25D366]/5">
              <Gift className="w-5 h-5 text-[#25D366] flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-[var(--text)] text-sm">{t.welcomeGiftTitle}</p>
                <p className="text-xs text-[var(--text-muted)]">{t.welcomeGiftDesc} {t.welcomeGiftSub}</p>
              </div>
              <p className="text-lg font-black text-[#25D366] flex-shrink-0">{formatCurrency(WELCOME_BONUS_XAF)}</p>
            </div>

            <div className="card p-8">
              <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t.profileTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-6">{t.profileSubtitle}</p>
              <form onSubmit={handleProfileNext} className="space-y-4">
                <div>
                  <label className="label-base">{t.fields.companyName}</label>
                  <input required className="input-base" value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label className="label-base">{t.fields.sector}</label>
                  <select required className="input-base" value={profile.sector}
                    onChange={e => setProfile({ ...profile, sector: e.target.value })}>
                    <option value="">—</option>
                    {Object.entries(t.sectors).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-base">{t.fields.description}</label>
                  <textarea rows={3} className="input-base resize-none" value={profile.description}
                    onChange={e => setProfile({ ...profile, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">{t.fields.whatsapp}</label>
                    <input required className="input-base" placeholder="+237..."
                      value={profile.whatsapp_number}
                      onChange={e => setProfile({ ...profile, whatsapp_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base">{t.fields.phone}</label>
                    <input className="input-base" placeholder="+237..."
                      value={profile.phone_number}
                      onChange={e => setProfile({ ...profile, phone_number: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-2">
                  {d.common.continue} <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : SÉLECTION PLAN
        ════════════════════════════════════════════════════════════════════ */}
        {step === "plan" && (
          <div className="animate-fade-in">
            <div className="card p-8">
              <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t.planTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-6">{t.planSubtitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {PLANS_CONFIG.map(pl => (
                  <button key={pl.slug} type="button"
                    onClick={() => setSelectedPlan(pl.slug)}
                    className={cn(
                      "text-left p-5 rounded-2xl border-2 transition-all",
                      selectedPlan === pl.slug
                        ? "border-[#25D366] bg-[#25D366]/5"
                        : "border-[var(--border)] hover:border-[var(--text-muted)]"
                    )}>
                    {pl.highlight && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block mb-1">
                        ★ {d.common.recommended}
                      </span>
                    )}
                    <p className="font-black text-[var(--text)]">{pl.name}</p>
                    <p className="text-2xl font-black text-[#075E54] mt-1">
                      {formatCurrency(pl.price)}
                      <span className="text-xs font-normal text-[var(--text-muted)]">{d.common.perMonth}</span>
                    </p>
                    <ul className="mt-3 space-y-1">
                      {pl.features_keys.slice(0, 3).map(key => {
                        const k = key.split(".")[2] as keyof typeof d.plans.features;
                        return (
                          <li key={key} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <Check className="w-3 h-3 text-[#25D366] flex-shrink-0" />
                            {d.plans.features[k]}
                          </li>
                        );
                      })}
                    </ul>
                  </button>
                ))}
              </div>
              <button onClick={handlePlanNext} className="btn-primary w-full justify-center">
                {d.common.continue} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : PAIEMENT
        ════════════════════════════════════════════════════════════════════ */}
        {step === "payment" && (
          <div className="animate-fade-in">
            <div className="card p-8">
              <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t.paymentTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-6">{t.paymentSubtitle}</p>

              <div className="bg-[var(--bg)] rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.selectedPlan}</span>
                  <span className="font-bold text-[var(--text)]">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.walletBalance}</span>
                  <span className="font-bold text-[#25D366]">{formatCurrency(walletBalance)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                  <span className="font-bold text-[var(--text)]">{t.toPay}</span>
                  <span className="font-black text-xl text-[var(--text)]">{formatCurrency(plan.price)}</span>
                </div>
              </div>

              {!canPay && (
                <p className="text-sm text-red-500 mb-4 text-center">{t.paymentInsufficient}</p>
              )}

              <div className="space-y-3">
                <button onClick={handlePayment}
                  disabled={!canPay || isPending}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPending
                    ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                    : t.paymentWalletBtn}
                </button>
                {!canPay && (
                  <button className="w-full py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
                    {t.paymentRechargeBtn}
                  </button>
                )}
              </div>

              <button onClick={() => setStep("plan")}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text)] mt-4 transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> {d.common.prev}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ÉTAPE : SUCCÈS
        ════════════════════════════════════════════════════════════════════ */}
        {step === "success" && (
          <div className="animate-fade-in text-center">
            <div className="card p-12">
              <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-[var(--text)] mb-3">{t.successTitle}</h1>
              <p className="text-sm text-[var(--text-muted)] mb-8 max-w-sm mx-auto">{t.successSubtitle}</p>
              <button onClick={handleFinish} className="btn-primary px-8 py-3 text-base">
                {t.successBtn} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Bouton Google signup isolé ────────────────────────────────────────────────
function GoogleSignupButton({ onSuccess, onError, label }: {
  onSuccess: (user: { email: string; name: string; sub: string }) => Promise<void>;
  onError: () => void;
  label: string;
}) {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json() as { email: string; name: string; sub: string };
        await onSuccess(googleUser);
      } catch { onError(); }
    },
    onError,
  });

  return (
    <button type="button" onClick={() => handleGoogleLogin()}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                 border border-[var(--border)] bg-[var(--bg-card)]
                 hover:bg-[var(--bg)] transition-colors text-sm font-semibold text-[var(--text)] shadow-sm">
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  );
}