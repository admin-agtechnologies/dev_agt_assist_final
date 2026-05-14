// src/components/shared/EntrepriseForm.tsx
"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { EntrepriseInUser, SecteurActivite } from "@/types/api";
import {
    Building2, Phone, MessageSquare,
    Mail, Save, Globe, ChevronDown, FileText,
} from "lucide-react";

interface EntrepriseFormProps {
    entreprise: EntrepriseInUser;
    setEntreprise: (e: EntrepriseInUser) => void;
    selectedSecteurId: string;
    setSelectedSecteurId: (id: string) => void;
    secteurs: SecteurActivite[];
    loadingSecteurs: boolean;
    isSaving: boolean;
    hasEntreprise: boolean;
    onSave: (e: React.FormEvent) => void;
    d: ReturnType<typeof useLanguage>["dictionary"];
    locale: string;
    disableSecteur?: boolean;
}

export function EntrepriseForm({
    entreprise,
    setEntreprise,
    selectedSecteurId,
    setSelectedSecteurId,
    secteurs,
    loadingSecteurs,
    isSaving,
    hasEntreprise,
    onSave,
    d,
    locale,
    disableSecteur = false,
}: EntrepriseFormProps) {
    const t = d.profile;

    return (
        <div className="card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">
                {t.companySection}
            </h2>
            <form onSubmit={onSave} className="space-y-4">

                <div>
                    <label className="label-base">{t.name}</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            required
                            className="input-base pl-10"
                            placeholder="Nom de votre entreprise"
                            value={entreprise.name}
                            onChange={e => setEntreprise({ ...entreprise, name: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="label-base">{t.sector}</label>
                    <div className="relative">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                        <select
                            className="input-base appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={selectedSecteurId}
                            onChange={e => setSelectedSecteurId(e.target.value)}
                            disabled={loadingSecteurs || disableSecteur}
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
                            <input
                                type="tel"
                                className="input-base pl-10"
                                placeholder="+237..."
                                value={entreprise.whatsapp_number}
                                onChange={e => setEntreprise({ ...entreprise, whatsapp_number: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.phone}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="tel"
                                className="input-base pl-10"
                                placeholder="+237..."
                                value={entreprise.phone_number}
                                onChange={e => setEntreprise({ ...entreprise, phone_number: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-base">{t.email}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="email"
                                className="input-base pl-10"
                                placeholder="contact@..."
                                value={entreprise.email}
                                onChange={e => setEntreprise({ ...entreprise, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">Site web</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="url"
                                className="input-base pl-10"
                                placeholder="https://..."
                                value={entreprise.site_web}
                                onChange={e => setEntreprise({ ...entreprise, site_web: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label-base">{t.description}</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
                        <textarea
                            rows={3}
                            className="input-base pl-10 resize-none"
                            placeholder="Décrivez votre activité..."
                            value={entreprise.description}
                            onChange={e => setEntreprise({ ...entreprise, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    {!hasEntreprise && (
                        <p className="text-xs text-[var(--text-muted)] italic flex-1">
                            Remplissez et enregistrez pour créer votre entreprise.
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={cn("btn-primary flex items-center gap-2", hasEntreprise ? "ml-auto" : "")}
                    >
                        {isSaving
                            ? <Spinner className="border-white/30 border-t-white" />
                            : <><Save className="w-4 h-4" /> {d.common.save}</>}
                    </button>
                </div>
            </form>
        </div>
    );
}