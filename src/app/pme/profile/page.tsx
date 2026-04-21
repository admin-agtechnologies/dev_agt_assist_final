// src/app/pme/profile/page.tsx
"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader, Spinner } from "@/components/ui";
import { tenantsRepository } from "@/repositories";
import { initials, cn } from "@/lib/utils";
import type { Tenant } from "@/types/api";
import {
  User, Mail, Shield, Lock, Building2,
  Phone, MessageSquare, FileText, Save,
} from "lucide-react";

// ── Secteurs (dupliqués depuis onboarding pour autonomie) ─────────────────────
const SECTORS_FR: Record<string, string> = {
  sante: "Santé", juridique: "Juridique", beaute: "Beauté & Bien-être",
  restauration: "Restauration", commerce: "Commerce & Distribution",
  education: "Éducation & Formation", immobilier: "Immobilier",
  transport: "Transport & Logistique", finance: "Finance & Assurance", autre: "Autre",
};
const SECTORS_EN: Record<string, string> = {
  sante: "Healthcare", juridique: "Legal", beaute: "Beauty & Wellness",
  restauration: "Food & Restaurants", commerce: "Commerce & Retail",
  education: "Education & Training", immobilier: "Real Estate",
  transport: "Transport & Logistics", finance: "Finance & Insurance", autre: "Other",
};

export default function PmeProfilePage() {
  const { user } = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t = d.profile;
  const toast = useToast();

  // ── État profil utilisateur ──────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [isSavingProfile, startSaveProfile] = useTransition();

  // ── État mot de passe ────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [isSavingPwd, startSavePwd] = useTransition();

  // ── État entreprise ──────────────────────────────────────────────────────
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantSector, setTenantSector] = useState("");
  const [tenantDesc, setTenantDesc] = useState("");
  const [tenantWa, setTenantWa] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [isSavingTenant, startSaveTenant] = useTransition();
  const [loadingTenant, setLoadingTenant] = useState(false);

  const sectors = locale === "fr" ? SECTORS_FR : SECTORS_EN;

  // ── Charger tenant ───────────────────────────────────────────────────────
  const fetchTenant = useCallback(async () => {
    if (!user?.tenant_id) return;
    setLoadingTenant(true);
    try {
      const t = await tenantsRepository.getById(user.tenant_id);
      setTenant(t);
      setTenantName(t.name);
      setTenantSector(t.sector);
      setTenantDesc(t.description);
      setTenantWa(t.whatsapp_number);
      setTenantPhone(t.phone_number);
    } catch { /* silencieux */ }
    finally { setLoadingTenant(false); }
  }, [user?.tenant_id]);

  useEffect(() => { fetchTenant(); }, [fetchTenant]);

  // ── Sauvegarder profil ───────────────────────────────────────────────────
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startSaveProfile(async () => {
      try {
        // Mock : simule PATCH /api/v1/users/:id
        await new Promise(r => setTimeout(r, 800));
        toast.success(t.saveSuccess);
      } catch {
        toast.error(t.saveError);
      }
    });
  };

  // ── Changer mot de passe ─────────────────────────────────────────────────
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPwd === currentPwd) { setPwdError(t.passwordSameAsOld); return; }
    if (newPwd !== confirmPwd) { setPwdError(t.passwordMismatch); return; }
    startSavePwd(async () => {
      try {
        await new Promise(r => setTimeout(r, 800));
        toast.success(t.passwordSuccess);
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } catch {
        toast.error(t.saveError);
      }
    });
  };

  // ── Sauvegarder entreprise ───────────────────────────────────────────────
  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    startSaveTenant(async () => {
      try {
        await tenantsRepository.patch(tenant.id, {
          name: tenantName,
          sector: tenantSector,
          description: tenantDesc,
          whatsapp_number: tenantWa,
          phone_number: tenantPhone,
        });
        toast.success(t.companySaved);
        fetchTenant();
      } catch {
        toast.error(t.companyError);
      }
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title={t.title} subtitle={t.subtitle} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — Profil utilisateur
      ════════════════════════════════════════════════════════════════════ */}
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
              <input type="email" required className="input-base pl-10"
                value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSavingProfile} className="btn-primary">
              {isSavingProfile
                ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                : <><Save className="w-4 h-4" /> {d.common.save}</>}
            </button>
          </div>
        </form>
      </div>

       {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Changer le mot de passe
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
          {t.changePassword}
        </h2>
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="label-base">{t.currentPassword}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="password" required minLength={6} className="input-base pl-10"
                value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                <input type="password" required minLength={8} className="input-base pl-10"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              </div>
            </div>
          </div>
          {pwdError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {pwdError}
            </p>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={isSavingPwd} className="btn-primary">
              {isSavingPwd
                ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                : <><Save className="w-4 h-4" /> {t.changePassword}</>}
            </button>
          </div>
        </form>
      </div>

    </div>


     

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Mon entreprise
      ════════════════════════════════════════════════════════════════════ */}
      {user.tenant_id && (
        <div className="card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
            {t.companySection}
          </h2>

          {loadingTenant ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSaveTenant} className="space-y-4">
              <div>
                <label className="label-base">{t.name}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input required className="input-base pl-10"
                    value={tenantName} onChange={e => setTenantName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label-base">{t.sector}</label>
                <select className="input-base" value={tenantSector}
                  onChange={e => setTenantSector(e.target.value)}>
                  <option value="">—</option>
                  {Object.entries(sectors).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-base">{t.description}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
                  <textarea rows={3} className="input-base pl-10 resize-none"
                    value={tenantDesc} onChange={e => setTenantDesc(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">{t.whatsapp}</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input required className="input-base pl-10" placeholder="+237..."
                      value={tenantWa} onChange={e => setTenantWa(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label-base">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input className="input-base pl-10" placeholder="+237..."
                      value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Infos non éditables */}
              <div className={cn(
                "flex items-center gap-2 py-3 px-4 rounded-xl",
                "bg-[var(--bg)] border border-[var(--border)]"
              )}>
                <Shield className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                <span className="text-xs text-[var(--text-muted)]">
                  {t.role} : <span className="font-semibold text-[var(--text)]">{t.roles.pme}</span>
                </span>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSavingTenant} className="btn-primary">
                  {isSavingTenant
                    ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                    : <><Save className="w-4 h-4" /> {d.common.save}</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}