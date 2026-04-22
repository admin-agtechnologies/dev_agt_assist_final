"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader, Spinner } from "@/components/ui";
import { usersRepository, tenantsRepository, secteursRepository } from "@/repositories";
import { initials, cn } from "@/lib/utils";
import type { EntrepriseInUser, SecteurActivite } from "@/types/api";
import {
  User, Mail, Lock, Building2, Phone, MessageSquare,
  FileText, Save, Eye, EyeOff, Globe, ChevronDown,
} from "lucide-react";

const EMPTY_ENTREPRISE: EntrepriseInUser = {
  id: "", name: "", slug: "", secteur: null, description: "",
  whatsapp_number: "", phone_number: "", email: "", site_web: "",
  logo: null, is_active: true, created_at: "", updated_at: "",
};

export default function PmeProfilePage() {
  const { user, refreshUser } = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t = d.profile;
  const toast = useToast();

  const [profileName, setProfileName]       = useState(user?.name ?? "");
  const [isSavingProfile, startSaveProfile] = useTransition();

  const [currentPwd, setCurrentPwd]         = useState("");
  const [newPwd, setNewPwd]                 = useState("");
  const [confirmPwd, setConfirmPwd]         = useState("");
  const [pwdError, setPwdError]             = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd]         = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSavingPwd, startSavePwd]         = useTransition();

  const [entreprise, setEntreprise]         = useState<EntrepriseInUser>(user?.entreprise ?? EMPTY_ENTREPRISE);
  const [selectedSecteurId, setSelectedSecteurId] = useState<string>(user?.entreprise?.secteur?.id ?? "");
  const [secteurs, setSecteurs]             = useState<SecteurActivite[]>([]);
  const [loadingSecteurs, setLoadingSecteurs] = useState(true);
  const [isSavingTenant, startSaveTenant]   = useTransition();

  useEffect(() => {
    setProfileName(user?.name ?? "");
    const e = user?.entreprise ?? EMPTY_ENTREPRISE;
    setEntreprise(e);
    setSelectedSecteurId(e.secteur?.id ?? "");
  }, [user]);

  useEffect(() => {
    secteursRepository.getList()
      .then(setSecteurs)
      .catch(() => {})
      .finally(() => setLoadingSecteurs(false));
  }, []);

  const handleSaveProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    startSaveProfile(async () => {
      try {
        await usersRepository.updateMe({ name: profileName });
        await refreshUser();
        toast.success(t.saveSuccess);
      } catch { toast.error(t.saveError); }
    });
  }, [profileName, t, toast, refreshUser]);

  const handleSavePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPwd === currentPwd) { setPwdError(t.passwordSameAsOld); return; }
    if (newPwd !== confirmPwd) { setPwdError(t.passwordMismatch); return; }
    startSavePwd(async () => {
      try {
        await usersRepository.changePassword({ old_password: currentPwd, new_password: newPwd });
        toast.success(t.passwordSuccess);
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } catch { toast.error(t.saveError); }
    });
  }, [currentPwd, newPwd, confirmPwd, t, toast]);

  const handleSaveTenant = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    startSaveTenant(async () => {
      try {
        if (user?.entreprise) {
          const updated = await tenantsRepository.meUpdate({
            name: entreprise.name, description: entreprise.description,
            whatsapp_number: entreprise.whatsapp_number, phone_number: entreprise.phone_number,
            email: entreprise.email, site_web: entreprise.site_web,
            ...(selectedSecteurId ? { secteur_id: selectedSecteurId } : {}),
          });
          setEntreprise(updated);
        } else {
          await tenantsRepository.create({
            name: entreprise.name, slug: "", sector: selectedSecteurId,
            description: entreprise.description, whatsapp_number: entreprise.whatsapp_number,
            phone_number: entreprise.phone_number, auth_user_id: user?.id ?? "", is_active: true,
          });
        }
        await refreshUser();
        toast.success(t.companySaved);
      } catch { toast.error(t.companyError); }
    });
  }, [entreprise, selectedSecteurId, user, t, toast, refreshUser]);

  if (!user) return null;
  const hasEntreprise = !!user.entreprise;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Profil ── */}
        <div className="card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">{t.editProfile}</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-xl font-black flex-shrink-0">
              {initials(user.name)}
            </div>
            <div>
              <p className="font-bold text-[var(--text)]">{user.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#25D366]/10 text-[#075E54] rounded-full text-xs font-bold">{t.roles.pme}</span>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label-base">{t.name}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="text" required className="input-base pl-10" value={profileName} onChange={e => setProfileName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-base">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="email" disabled value={user.email} className="input-base pl-10 opacity-50 cursor-not-allowed" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingProfile} className="btn-primary flex items-center gap-2">
                {isSavingProfile ? <Spinner className="border-white/30 border-t-white" /> : <><Save className="w-4 h-4" /> {d.common.save}</>}
              </button>
            </div>
          </form>
        </div>

        {/* ── Entreprise ── */}
        <div className="card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">{t.companySection}</h2>
          <form onSubmit={handleSaveTenant} className="space-y-4">

            <div>
              <label className="label-base">{t.name}</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="text" required className="input-base pl-10" placeholder="Nom de votre entreprise"
                  value={entreprise.name} onChange={e => setEntreprise(p => ({ ...p, name: e.target.value }))} />
              </div>
            </div>

            {/* Secteur d'activité — liste déroulante depuis le backend */}
            <div>
              <label className="label-base">{t.sector}</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <select
                  className="input-base appearance-none pr-10"
                  value={selectedSecteurId}
                  onChange={e => setSelectedSecteurId(e.target.value)}
                  disabled={loadingSecteurs}
                >
                  <option value="">
                    {loadingSecteurs ? "Chargement..." : "— Sélectionner un secteur —"}
                  </option>
                  {secteurs.map(s => (
                    <option key={s.id} value={s.id}>
                      {locale === "fr" ? s.label_fr : s.label_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base">{t.whatsapp}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="tel" className="input-base pl-10" placeholder="+237..."
                    value={entreprise.whatsapp_number} onChange={e => setEntreprise(p => ({ ...p, whatsapp_number: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label-base">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="tel" className="input-base pl-10" placeholder="+237..."
                    value={entreprise.phone_number} onChange={e => setEntreprise(p => ({ ...p, phone_number: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="email" className="input-base pl-10" placeholder="contact@..."
                    value={entreprise.email} onChange={e => setEntreprise(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label-base">Site web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="url" className="input-base pl-10" placeholder="https://..."
                    value={entreprise.site_web} onChange={e => setEntreprise(p => ({ ...p, site_web: e.target.value }))} />
                </div>
              </div>
            </div>

            <div>
              <label className="label-base">{t.description}</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
                <textarea rows={3} className="input-base pl-10 resize-none" placeholder="Décrivez votre activité..."
                  value={entreprise.description} onChange={e => setEntreprise(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {!hasEntreprise && (
                <p className="text-xs text-[var(--text-muted)] italic flex-1">
                  Remplissez et enregistrez pour créer votre entreprise.
                </p>
              )}
              <button type="submit" disabled={isSavingTenant}
                className={cn("btn-primary flex items-center gap-2", !hasEntreprise ? "" : "ml-auto")}>
                {isSavingTenant ? <Spinner className="border-white/30 border-t-white" /> : <><Save className="w-4 h-4" /> {d.common.save}</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Mot de passe ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">{t.changePassword}</h2>
          <form onSubmit={handleSavePassword} className="space-y-4">
            {(
              [
                { label: t.currentPassword, value: currentPwd,  set: setCurrentPwd,  show: showCurrentPwd, toggle: () => setShowCurrentPwd(v => !v) },
                { label: t.newPassword,     value: newPwd,      set: setNewPwd,      show: showNewPwd,     toggle: () => setShowNewPwd(v => !v) },
                { label: t.confirmPassword, value: confirmPwd,  set: setConfirmPwd,  show: showConfirmPwd, toggle: () => setShowConfirmPwd(v => !v) },
              ] as const
            ).map(({ label, value, set, show, toggle }, i) => (
              <div key={i}>
                <label className="label-base">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type={show ? "text" : "password"} required minLength={i > 0 ? 8 : undefined}
                    className={cn("input-base pl-10 pr-10", i === 2 && pwdError && "border-red-400")}
                    value={value} onChange={e => set(e.target.value)} />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#075E54] transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {i === 2 && pwdError && <p className="text-xs text-red-500 mt-1">{pwdError}</p>}
              </div>
            ))}
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingPwd} className="btn-primary flex items-center gap-2">
                {isSavingPwd ? <Spinner className="border-white/30 border-t-white" /> : <><Lock className="w-4 h-4" /> {t.changePassword}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}