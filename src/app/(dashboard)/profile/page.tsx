// src/app/pme/profile/page.tsx
"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader, Spinner } from "@/components/ui";
import { usersRepository, tenantsRepository, secteursRepository } from "@/repositories";
import { initials, cn } from "@/lib/utils";
import type { EntrepriseInUser, SecteurActivite } from "@/types/api";
import { EntrepriseForm } from "@/components/shared/EntrepriseForm";
import { useSector } from "@/hooks/useSector";
import {
    User, Mail, Lock,
    Save, Eye, EyeOff,
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
    const { theme } = useSector();

    // ── Profil utilisateur ────────────────────────────────────────────────────
    const [profileName, setProfileName]       = useState(user?.name ?? "");
    const [isSavingProfile, startSaveProfile] = useTransition();

    // ── Mot de passe ──────────────────────────────────────────────────────────
    const [currentPwd, setCurrentPwd]         = useState("");
    const [newPwd, setNewPwd]                 = useState("");
    const [confirmPwd, setConfirmPwd]         = useState("");
    const [pwdError, setPwdError]             = useState("");
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd]         = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [isSavingPwd, startSavePwd]         = useTransition();

    // ── Entreprise ────────────────────────────────────────────────────────────
    const [entreprise, setEntreprise]               = useState<EntrepriseInUser>(user?.entreprise ?? EMPTY_ENTREPRISE);
    const [selectedSecteurId, setSelectedSecteurId] = useState<string>(user?.entreprise?.secteur?.id ?? "");
    const [secteurs, setSecteurs]                   = useState<SecteurActivite[]>([]);
    const [loadingSecteurs, setLoadingSecteurs]     = useState(true);
    const [isSavingTenant, startSaveTenant]         = useTransition();

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

    // ── Handlers ──────────────────────────────────────────────────────────────
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
                        name: entreprise.name,
                        description: entreprise.description,
                        whatsapp_number: entreprise.whatsapp_number,
                        phone_number: entreprise.phone_number,
                        email: entreprise.email,
                        site_web: entreprise.site_web,
                    });
                    setEntreprise(updated);
                } else {
                    await tenantsRepository.create({
                        name: entreprise.name, slug: "", sector: selectedSecteurId,
                        description: entreprise.description,
                        whatsapp_number: entreprise.whatsapp_number,
                        phone_number: entreprise.phone_number,
                        auth_user_id: user?.id ?? "", is_active: true,
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

                {/* ── Profil utilisateur ──────────────────────────────────── */}
                <div className="card p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
                        {t.editProfile}
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                            style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
                            >
                            {initials(user.name)}
                        </div>
                        <div>
                            <p className="font-bold text-[var(--text)]">{user.name}</p>
                            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                            <span
                                className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
                                >
                                {t.roles.pme}
                            </span>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="label-base">{t.name}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    required
                                    className="input-base pl-10"
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label-base">{t.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="input-base pl-10 opacity-50 cursor-not-allowed"
                                />
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

                {/* ── Entreprise (composant partagé) ──────────────────────── */}
                <EntrepriseForm
                    entreprise={entreprise}
                    setEntreprise={setEntreprise}
                    selectedSecteurId={selectedSecteurId}
                    setSelectedSecteurId={setSelectedSecteurId}
                    secteurs={secteurs}
                    loadingSecteurs={loadingSecteurs}
                    isSaving={isSavingTenant}
                    hasEntreprise={hasEntreprise}
                    onSave={handleSaveTenant}
                    d={d}
                    locale={locale}
                    disableSecteur={true}
                />
            </div>

            {/* ── Mot de passe ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
                        {t.changePassword}
                    </h2>
                    <form onSubmit={handleSavePassword} className="space-y-4">
                        {([
                            { label: t.currentPassword, value: currentPwd,  set: setCurrentPwd,  show: showCurrentPwd, toggle: () => setShowCurrentPwd(v => !v) },
                            { label: t.newPassword,     value: newPwd,      set: setNewPwd,      show: showNewPwd,     toggle: () => setShowNewPwd(v => !v) },
                            { label: t.confirmPassword, value: confirmPwd,  set: setConfirmPwd,  show: showConfirmPwd, toggle: () => setShowConfirmPwd(v => !v) },
                        ] as const).map(({ label, value, set, show, toggle }, i) => (
                            <div key={i}>
                                <label className="label-base">{label}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type={show ? "text" : "password"}
                                        required
                                        minLength={i > 0 ? 8 : undefined}
                                        className={cn("input-base pl-10 pr-10", i === 2 && pwdError && "border-red-400")}
                                        value={value}
                                        onChange={e => set(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggle}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#075E54] transition-colors"
                                    >
                                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {i === 2 && pwdError && <p className="text-xs text-red-500 mt-1">{pwdError}</p>}
                            </div>
                        ))}
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
        </div>
    );
}