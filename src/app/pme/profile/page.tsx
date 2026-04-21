// src/app/pme/profile/page.tsx
"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader, Spinner } from "@/components/ui";
import { usersRepository, tenantsRepository } from "@/repositories";
import { initials, cn } from "@/lib/utils";
import type { EntrepriseInUser } from "@/types/api";
import {
  User, Mail, Lock, Building2,
  Phone, MessageSquare, FileText, Save,
} from "lucide-react";

export default function PmeProfilePage() {
  const { user, refreshUser } = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t = d.profile;
  const toast = useToast();

  // ── État profil utilisateur ──────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [isSavingProfile, startSaveProfile] = useTransition();

  // ── État mot de passe ────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [isSavingPwd, startSavePwd] = useTransition();

  // ── État entreprise ──────────────────────────────────────────────────────
  const [entreprise, setEntreprise] = useState<EntrepriseInUser | null>(
    user?.entreprise ?? null
  );
  const [isSavingTenant, startSaveTenant] = useTransition();

  // Sync quand user change
  useEffect(() => {
    setProfileName(user?.name ?? "");
    setEntreprise(user?.entreprise ?? null);
  }, [user]);

  // ── Sauvegarder profil ───────────────────────────────────────────────────
  const handleSaveProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    startSaveProfile(async () => {
      try {
        await usersRepository.updateMe({ name: profileName });
        await refreshUser();
        toast.success(t.saveSuccess);
      } catch {
        toast.error(t.saveError);
      }
    });
  }, [profileName, t, toast, refreshUser]);

  // ── Changer mot de passe ─────────────────────────────────────────────────
  const handleSavePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPwd === currentPwd) { setPwdError(t.passwordSameAsOld); return; }
    if (newPwd !== confirmPwd) { setPwdError(t.passwordMismatch); return; }
    startSavePwd(async () => {
      try {
        await usersRepository.changePassword({
          old_password: currentPwd,
          new_password: newPwd,
        });
        toast.success(t.passwordSuccess);
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } catch {
        toast.error(t.saveError);
      }
    });
  }, [currentPwd, newPwd, confirmPwd, t, toast]);

  // ── Sauvegarder entreprise ───────────────────────────────────────────────
  const handleSaveTenant = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise) return;
    startSaveTenant(async () => {
      try {
        const updated = await tenantsRepository.meUpdate({
          name: entreprise.name,
          description: entreprise.description,
          whatsapp_number: entreprise.whatsapp_number,
          phone_number: entreprise.phone_number,
        });
        setEntreprise(updated);
        await refreshUser();
        toast.success(t.companySaved);
      } catch {
        toast.error(t.companyError);
      }
    });
  }, [entreprise, t, toast, refreshUser]);

  if (!user) return null;

  const sectorLabel = locale === "fr"
    ? (entreprise?.secteur?.label_fr ?? "")
    : (entreprise?.secteur?.label_en ?? "");

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title={t.title} subtitle={t.subtitle} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Colonne gauche : profil + mot de passe ──────────────────────── */}
        <div className="space-y-6">

          {/* Profil utilisateur */}
          <div className="card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
              {t.editProfile}
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-xl font-black flex-shrink-0">
                {initials(user.name)}
              </div>
              <div>
                <p className="font-bold text-[var(--text)]">{user.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#25D366]/10 text-[#075E54] rounded-full text-xs font-bold">
                  {t.roles.pme}
                </span>
              </div>
            </div>

            {/* Formulaire profil */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="label-base">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="text" required className="input-base pl-10"
                    value={profileName} onChange={e => setProfileName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="email" disabled className="input-base pl-10 opacity-50 cursor-not-allowed"
                    value={user.email} />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingProfile} className="btn-primary flex items-center gap-2">
                  {isSavingProfile
                    ? <Spinner className="border-white/30 border-t-white" />
                    : <><Save className="w-4 h-4" /> {d.common.save}</>}
                </button>
              </div>
            </form>
          </div>

          {/* Mot de passe */}
          <div className="card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
              {t.changePassword}
            </h2>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="label-base">{t.currentPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="password" required className="input-base pl-10"
                    value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.newPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="password" required minLength={8} className="input-base pl-10"
                    value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.confirmPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="password" required minLength={8}
                    className={cn("input-base pl-10", pwdError && "border-red-400")}
                    value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                </div>
                {pwdError && <p className="text-xs text-red-500 mt-1">{pwdError}</p>}
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingPwd} className="btn-primary flex items-center gap-2">
                  {isSavingPwd
                    ? <Spinner className="border-white/30 border-t-white" />
                    : <><Lock className="w-4 h-4" /> {t.changePassword}</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Colonne droite : entreprise ─────────────────────────────────── */}
        {entreprise && (
          <div className="card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
              {t.companySection}
            </h2>
            {sectorLabel && (
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {t.sector} : <span className="font-medium text-[var(--text)]">{sectorLabel}</span>
              </p>
            )}
            <form onSubmit={handleSaveTenant} className="space-y-4">
              <div>
                <label className="label-base">{t.name}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="text" required className="input-base pl-10"
                    value={entreprise.name}
                    onChange={e => setEntreprise(prev => prev ? { ...prev, name: e.target.value } : prev)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.whatsapp}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="tel" className="input-base pl-10"
                    value={entreprise.whatsapp_number}
                    onChange={e => setEntreprise(prev => prev ? { ...prev, whatsapp_number: e.target.value } : prev)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="tel" className="input-base pl-10"
                    value={entreprise.phone_number}
                    onChange={e => setEntreprise(prev => prev ? { ...prev, phone_number: e.target.value } : prev)} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.description}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
                  <textarea rows={4} className="input-base pl-10 resize-none"
                    value={entreprise.description}
                    onChange={e => setEntreprise(prev => prev ? { ...prev, description: e.target.value } : prev)} />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingTenant} className="btn-primary flex items-center gap-2">
                  {isSavingTenant
                    ? <Spinner className="border-white/30 border-t-white" />
                    : <><Save className="w-4 h-4" /> {d.common.save}</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}