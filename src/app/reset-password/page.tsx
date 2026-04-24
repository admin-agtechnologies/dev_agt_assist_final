"use client";
import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, XCircle, Lock, CheckCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { authRepository } from "@/repositories";
import { tokenStorage, ApiError } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

type View = "form" | "success" | "error";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
          <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary: d } = useLanguage();
  const t = d.resetPassword;

  const token = searchParams.get("token") ?? "";

  const [view, setView] = useState<View>(token ? "form" : "error");
  const [errorMsg, setErrorMsg] = useState(token ? "" : t.errorMissingToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password.length < 8) {
      setValidationError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t.passwordsMismatch);
      return;
    }

    startTransition(async () => {
      try {
        const res = await authRepository.resetPassword(token, password);
        tokenStorage.set(res.access, res.refresh);
        setView("success");
        setTimeout(() => router.push(ROUTES.dashboard), 2000);
      } catch (err) {
        const msg =
          err instanceof ApiError && typeof err.message === "string"
            ? err.message
            : t.errorGeneric;
        setErrorMsg(msg);
        setView("error");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-12 max-w-md w-full">
        {view === "form" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <KeyRound className="w-10 h-10 text-[#25D366]" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2 text-center">
              {t.title}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-8 text-center">
              {t.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-base">{t.newPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="input-base pl-10 pr-10"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#075E54] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-base">{t.confirmPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="input-base pl-10 pr-10"
                    placeholder={t.passwordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#075E54] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {validationError && (
                <p className="text-sm text-red-500">{validationError}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full justify-center py-3"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t.submitBtn
                )}
              </button>

              <Link
                href={ROUTES.login}
                className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors pt-2"
              >
                <ArrowLeft className="w-4 h-4" /> {t.backToLogin}
              </Link>
            </form>
          </>
        )}

        {view === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle
                className="w-10 h-10 text-[#25D366]"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              {t.successTitle}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {t.successSubtitle}
            </p>
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[#25D366] rounded-full w-full transition-all duration-[2000ms]" />
            </div>
          </div>
        )}

        {view === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              {t.errorTitle}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{errorMsg}</p>
            <button
              onClick={() => router.push(ROUTES.login)}
              className="btn-primary w-full justify-center py-3"
            >
              {t.backToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}