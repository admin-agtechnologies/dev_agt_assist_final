"use client";
import Link from "next/link";
import { Gift, User, Mail, Lock, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui";
import { GoogleSignupButton } from "../GoogleSignupButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { ROUTES, WELCOME_BONUS_XAF } from "@/lib/constants";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface Props {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  showPassword: boolean;
  isPending: boolean;
  error: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSuccess: (user: { email: string; name: string; sub: string }) => Promise<void>;
  onGoogleError: () => void;
}

export function StepAccount({
  email, password, confirmPassword, name,
  showPassword, isPending, error,
  onEmailChange, onPasswordChange, onConfirmPasswordChange,
  onNameChange, onTogglePassword, onSubmit,
  onGoogleSuccess, onGoogleError,
}: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;

  return (
    <div className="animate-fade-in">
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

        {GOOGLE_CLIENT_ID && (
          <>
            <GoogleSignupButton label={t.googleBtn} onSuccess={onGoogleSuccess} onError={onGoogleError} />
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--text-muted)] font-medium">{t.orContinueWith}</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label-base">{t.fields.fullName}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" required className="input-base pl-10" value={name} onChange={e => onNameChange(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-base">{t.fields.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="email" required autoComplete="email" className="input-base pl-10" value={email} onChange={e => onEmailChange(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-base">{t.fields.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password"
                className="input-base pl-10 pr-10" value={password} onChange={e => onPasswordChange(e.target.value)} />
              <button type="button" onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label-base">{t.fields.confirmPassword}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type={showPassword ? "text" : "password"} required minLength={8}
                className="input-base pl-10 pr-10" value={confirmPassword} onChange={e => onConfirmPasswordChange(e.target.value)} />
              <button type="button" onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
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
  );
}