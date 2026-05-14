// src/app/(dashboard)/knowledge/_components/tabs/EntrepriseTab.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { Globe, Mail, Facebook, Instagram, Linkedin, Link2, Save, Loader2 } from "lucide-react";
import { useAuth }     from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast }    from "@/components/ui/Toast";
import { tenantKnowledgeRepository } from "@/repositories";
import type {
  ProfilEntrepriseKnowledge,
  UpdateProfilKnowledgePayload,
  ReseauxSociaux,
} from "@/types/api/agence.types";

const SECTION = "text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3";
const CARD    = "bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-4";

export function EntrepriseTab() {
  const { user }               = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t                      = d.knowledge.entreprise;
  const toast                  = useToast();

  const [profil, setProfil]    = useState<ProfilEntrepriseKnowledge | null>(null);
  const [loading, setLoading]  = useState(true);
  const [saving, startSaving]  = useTransition();

  const [form, setForm] = useState({
    slogan: "", site_web: "", email_contact: "", extra_info: "",
  });
  const [reseaux, setReseaux] = useState<ReseauxSociaux>({
    facebook: "", instagram: "", linkedin: "", tiktok: "",
  });

  useEffect(() => {
    tenantKnowledgeRepository.getMine().then((p) => {
      if (p) {
        const pk = p as unknown as ProfilEntrepriseKnowledge;
        setProfil(pk);
        setForm({
          slogan:        pk.slogan        ?? "",
          site_web:      pk.site_web      ?? "",
          email_contact: pk.email_contact ?? "",
          extra_info:    pk.extra_info    ?? "",
        });
        const rs = pk.reseaux_sociaux ?? {};
        setReseaux({
          facebook: rs.facebook ?? "", instagram: rs.instagram ?? "",
          linkedin: rs.linkedin ?? "", tiktok: rs.tiktok ?? "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = () =>
    startSaving(async () => {
      try {
        const payload: UpdateProfilKnowledgePayload = { ...form, reseaux_sociaux: reseaux };
        if (profil) {
          await tenantKnowledgeRepository.patch(
            profil.id,
            payload as Parameters<typeof tenantKnowledgeRepository.patch>[1],
          );
        } else {
          const created = await tenantKnowledgeRepository.create({
            ...payload, entreprise: user?.entreprise?.id ?? "",
          } as Parameters<typeof tenantKnowledgeRepository.create>[0]);
          setProfil(created as unknown as ProfilEntrepriseKnowledge);
        }
        toast.success(t.saveSuccess);
      } catch { toast.error(t.saveError); }
    });

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
    </div>
  );

  const companyLabel = locale === "fr" ? "Nom de l'entreprise" : "Company name";
  const sectorLabel  = locale === "fr" ? "Secteur" : "Sector";
  const profileNote  = locale === "fr" ? "Pour modifier ces champs, rendez-vous dans" : "To edit, go to";

  return (
    <div className="space-y-6">
      <div className={CARD}>
        <p className={SECTION}>{t.sectionIdentity}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={companyLabel} value={user?.entreprise?.name ?? ""} readOnly />
          <Field label={sectorLabel}  value={user?.entreprise?.secteur?.label_fr ?? ""} readOnly />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {profileNote}{" "}
          <a href="/profile" className="underline">{t.profileLink}</a>.
        </p>
      </div>

      <div className={CARD}>
        <p className={SECTION}>{t.sectionOnline}</p>
        <Field label={t.slogan}>
          <input className="input-base" value={form.slogan}
            onChange={(e) => setForm((f) => ({ ...f, slogan: e.target.value }))}
            placeholder={t.sloganPlaceholder} />
        </Field>
        <Field label={t.website} icon={<Globe className="w-4 h-4" />}>
          <input className="input-base" type="url" value={form.site_web}
            onChange={(e) => setForm((f) => ({ ...f, site_web: e.target.value }))}
            placeholder="https://..." />
        </Field>
        <Field label={t.emailContact} icon={<Mail className="w-4 h-4" />}>
          <input className="input-base" type="email" value={form.email_contact}
            onChange={(e) => setForm((f) => ({ ...f, email_contact: e.target.value }))}
            placeholder="contact@..." />
        </Field>
      </div>

      <div className={CARD}>
        <p className={SECTION}>{t.sectionSocial}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {([
            { icon: <Facebook className="w-4 h-4 text-blue-600" />,  label: "Facebook",  key: "facebook" as const },
            { icon: <Instagram className="w-4 h-4 text-pink-500" />, label: "Instagram", key: "instagram" as const },
            { icon: <Linkedin className="w-4 h-4 text-blue-700" />,  label: "LinkedIn",  key: "linkedin" as const },
            { icon: <Link2 className="w-4 h-4 text-[var(--text-muted)]" />, label: "TikTok", key: "tiktok" as const },
          ] as const).map(({ icon, label, key }) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                {icon} {label}
              </label>
              <input className="input-base" type="url"
                value={reseaux[key] ?? ""}
                onChange={(e) => setReseaux((r) => ({ ...r, [key]: e.target.value }))}
                placeholder="https://..." />
            </div>
          ))}
        </div>
      </div>

      <div className={CARD}>
        <p className={SECTION}>{t.sectionExtra}</p>
        <p className="text-xs text-[var(--text-muted)] -mt-2">{t.extraHint}</p>
        <textarea className="input-base resize-none w-full" rows={5}
          value={form.extra_info}
          onChange={(e) => setForm((f) => ({ ...f, extra_info: e.target.value }))}
          placeholder={t.extraPlaceholder} />
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {d.common.save}
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon, children, value, readOnly }: {
  label: string; icon?: React.ReactNode;
  children?: React.ReactNode; value?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1">
        {icon}{label}
      </label>
      {readOnly
        ? <p className="text-sm text-[var(--text)] font-medium py-2 px-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">{value || "—"}</p>
        : children}
    </div>
  );
}