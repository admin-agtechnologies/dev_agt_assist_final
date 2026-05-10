"use client";
// ============================================================
// FICHIER : src/components/onboarding/AccountStep.tsx
// Ajout : confirmation mot de passe
// ============================================================

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";

const LABELS = {
  fr: {
    title:           "Votre compte",
    subtitle:        "Créez votre accès sécurisé. Votre email servira à vérifier votre identité.",
    nameLabel:       "Votre prénom / nom",
    namePlaceholder: "Jean Dupont",
    emailLabel:      "Adresse email",
    emailPh:         "vous@exemple.cm",
    passLabel:       "Mot de passe",
    passPh:          "8 caractères minimum",
    confirmLabel:    "Confirmer le mot de passe",
    confirmPh:       "Répétez votre mot de passe",
    confirm:         "Créer mon compte",
    loading:         "Création…",
    orGoogle:        "ou continuer avec",
    errors: {
      name:    "Votre nom est requis.",
      email:   "Email invalide.",
      pass:    "Minimum 8 caractères.",
      confirm: "Les mots de passe ne correspondent pas.",
    },
  },
  en: {
    title:           "Your account",
    subtitle:        "Create your secure access. Your email will be used to verify your identity.",
    nameLabel:       "Your name",
    namePlaceholder: "John Doe",
    emailLabel:      "Email address",
    emailPh:         "you@example.cm",
    passLabel:       "Password",
    passPh:          "At least 8 characters",
    confirmLabel:    "Confirm password",
    confirmPh:       "Repeat your password",
    confirm:         "Create my account",
    loading:         "Creating…",
    orGoogle:        "or continue with",
    errors: {
      name:    "Your name is required.",
      email:   "Invalid email.",
      pass:    "Minimum 8 characters.",
      confirm: "Passwords do not match.",
    },
  },
} as const;

interface AccountStepProps {
  locale:        Locale;
  accentColor:   string;
  onConfirm:     (name: string, email: string, password: string) => Promise<void>;
  onGoogleClick: () => void;
  loading?:      boolean;
  error?:        string;
}

export function AccountStep({
  locale, accentColor, onConfirm, onGoogleClick, loading, error: externalError,
}: AccountStepProps) {
  const t = LABELS[locale];

  const [name,        setName]     = useState("");
  const [email,       setEmail]    = useState("");
  const [password,    setPass]     = useState("");
  const [confirm,     setConfirm]  = useState("");
  const [showPass,    setShowPass] = useState(false);
  const [showConf,    setShowConf] = useState(false);
  const [errors,      setErrors]   = useState<Partial<Record<"name"|"email"|"pass"|"confirm", string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim())                                e.name    = t.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  e.email   = t.errors.email;
    if (password.length < 8)                         e.pass    = t.errors.pass;
    if (password !== confirm)                        e.confirm = t.errors.confirm;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onConfirm(name.trim(), email.trim(), password);
  };

  const inputClass = (err?: string) =>
    `w-full py-3 rounded-xl border-2 bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] outline-none transition-colors ${err ? "border-red-400" : "border-[var(--border)]"}`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      {/* Nom */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">
          {t.nameLabel}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={t.namePlaceholder} autoComplete="name"
            className={`${inputClass(errors.name)} pl-9 pr-4`} />
        </div>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">
          {t.emailLabel}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t.emailPh} autoComplete="email"
            className={`${inputClass(errors.email)} pl-9 pr-4`} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">
          {t.passLabel}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type={showPass ? "text" : "password"} value={password}
            onChange={e => setPass(e.target.value)} placeholder={t.passPh} autoComplete="new-password"
            className={`${inputClass(errors.pass)} pl-9 pr-10`} />
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.pass && <p className="text-xs text-red-500">{errors.pass}</p>}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">
          {t.confirmLabel}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type={showConf ? "text" : "password"} value={confirm}
            onChange={e => setConfirm(e.target.value)} placeholder={t.confirmPh} autoComplete="new-password"
            className={`${inputClass(errors.confirm)} pl-9 pr-10`} />
          <button type="button" onClick={() => setShowConf(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
      </div>

      {externalError && <p className="text-xs text-red-500 font-medium">{externalError}</p>}

      {/* CTA */}
      <button type="button" onClick={handleSubmit} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: accentColor }}>
        {loading && <LoadingSpinner size={14} className="text-white" />}
        {loading ? t.loading : t.confirm}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)]">{t.orGoogle}</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <button type="button" onClick={onGoogleClick} disabled={loading}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm font-semibold hover:bg-[var(--bg-200,#f9fafb)] transition-colors disabled:opacity-50">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Google
      </button>
    </div>
  );
}