"use client";
import { Gift, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { WELCOME_BONUS_XAF } from "@/lib/constants";

export interface ProfileForm {
  name: string;
  sector: string;
  description: string;
  whatsapp_number: string;
  phone_number: string;
}

interface Props {
  profile: ProfileForm;
  onChange: (profile: ProfileForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepProfile({ profile, onChange, onSubmit }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.onboarding;

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...profile, [field]: e.target.value });

  return (
    <div className="animate-fade-in">
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label-base">{t.fields.companyName}</label>
            <input required className="input-base" value={profile.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label-base">{t.fields.sector}</label>
            <select required className="input-base" value={profile.sector} onChange={set("sector")}>
              <option value="">—</option>
              {Object.entries(t.sectors).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">{t.fields.description}</label>
            <textarea rows={3} className="input-base resize-none" value={profile.description} onChange={set("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">{t.fields.whatsapp}</label>
              <input required className="input-base" placeholder="+237..." value={profile.whatsapp_number} onChange={set("whatsapp_number")} />
            </div>
            <div>
              <label className="label-base">{t.fields.phone}</label>
              <input className="input-base" placeholder="+237..." value={profile.phone_number} onChange={set("phone_number")} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2">
            {d.common.continue} <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}