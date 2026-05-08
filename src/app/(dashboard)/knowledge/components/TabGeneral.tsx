// src/app/pme/knowledge/components/TabGeneral.tsx
"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
    tenantKnowledgeRepository,
    horairesRepository,
    agencesRepository,
    tenantsRepository,
    secteursRepository,
} from "@/repositories";
import { MessageSquare, Phone, Mail, Save, Bot } from "lucide-react";
import type {
    TenantKnowledge, HorairesOuverture, DaySchedule,
    EntrepriseInUser, SecteurActivite,
} from "@/types/api";
import { HoursEditor, type DayKey } from "./HoursEditor";
import { EntrepriseForm } from "@/components/shared/EntrepriseForm";

const EMPTY_ENTREPRISE: EntrepriseInUser = {
    id: "", name: "", slug: "", secteur: null, description: "",
    whatsapp_number: "", phone_number: "", email: "", site_web: "",
    logo: null, is_active: true, created_at: "", updated_at: "",
};

export function TabGeneral({
    entrepriseId,
    d,
    locale,
}: {
    entrepriseId: string;
    d: ReturnType<typeof useLanguage>["dictionary"];
    locale: string;
}) {
    const t = d.knowledge;
    const toast = useToast();
    const { user, refreshUser } = useAuth();

    // ── Knowledge ─────────────────────────────────────────────────────────────
    const [knowledge, setKnowledge]       = useState<TenantKnowledge | null>(null);
    const [hoursOpening, setHoursOpening] = useState<HorairesOuverture | null>(null);
    const [hoursAppt, setHoursAppt]       = useState<HorairesOuverture | null>(null);
    const [loading, setLoading]           = useState(true);

    // ── Entreprise ────────────────────────────────────────────────────────────
    const [entreprise, setEntreprise]               = useState<EntrepriseInUser>(user?.entreprise ?? EMPTY_ENTREPRISE);
    const [selectedSecteurId, setSelectedSecteurId] = useState<string>(user?.entreprise?.secteur?.id ?? "");
    const [secteurs, setSecteurs]                   = useState<SecteurActivite[]>([]);
    const [loadingSecteurs, setLoadingSecteurs]     = useState(true);
    const [isSavingTenant, startSaveTenant]         = useTransition();

    // ── Transfert ─────────────────────────────────────────────────────────────
    const [transfer, setTransfer] = useState({
        transfer_whatsapp: "", transfer_phone: "",
        transfer_email: "", transfer_message: "",
    });
    const [savingTransfer, startTransfer] = useTransition();

    // ── Assistant ─────────────────────────────────────────────────────────────
    const [assistant, setAssistant] = useState({
        message_accueil: "", bot_tone: "semi_formel",
        bot_personality: "", bot_signature: "", bot_languages: ["fr"] as string[],
    });
    const [savingAssistant, startAssistant] = useTransition();

    // ── Extra ─────────────────────────────────────────────────────────────────
    const [extra, setExtra] = useState({ extra_info: "" });
    const [savingExtra, startExtra] = useTransition();

    const DAY_LABELS: Record<DayKey, string> = {
        lundi:    locale === "fr" ? "Lundi"    : "Monday",
        mardi:    locale === "fr" ? "Mardi"    : "Tuesday",
        mercredi: locale === "fr" ? "Mercredi" : "Wednesday",
        jeudi:    locale === "fr" ? "Jeudi"    : "Thursday",
        vendredi: locale === "fr" ? "Vendredi" : "Friday",
        samedi:   locale === "fr" ? "Samedi"   : "Saturday",
        dimanche: locale === "fr" ? "Dimanche" : "Sunday",
    };

    // ── Fetch initial ─────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const kn = await tenantKnowledgeRepository.getMine();
            setKnowledge(kn);
            if (kn) {
                setTransfer({
                    transfer_whatsapp: kn.transfer_whatsapp ?? "",
                    transfer_phone:    kn.transfer_phone ?? "",
                    transfer_email:    kn.transfer_email ?? "",
                    transfer_message:  kn.transfer_message ?? "",
                });
                setAssistant({
                    message_accueil: kn.message_accueil ?? "",
                    bot_tone:        kn.bot_tone ?? "semi_formel",
                    bot_personality: kn.bot_personality ?? "",
                    bot_signature:   kn.bot_signature ?? "",
                    bot_languages:   kn.bot_languages ?? ["fr"],
                });
                setExtra({ extra_info: kn.extra_info ?? "" });
            }

            const siege = await agencesRepository.getSiege();
            const horaires = await horairesRepository.getListByAgence(siege.id);
            setHoursOpening(horaires.find(h => h.type === "ouverture")    ?? null);
            setHoursAppt(horaires.find(h => h.type === "rendez_vous") ?? null);
        } catch {
            // Silencieux si pas de siège configuré
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        secteursRepository.getList()
            .then(setSecteurs)
            .catch(() => {})
            .finally(() => setLoadingSecteurs(false));
    }, []);

    useEffect(() => {
        const e = user?.entreprise ?? EMPTY_ENTREPRISE;
        setEntreprise(e);
        setSelectedSecteurId(e.secteur?.id ?? "");
    }, [user]);

    // ── PATCH knowledge générique ─────────────────────────────────────────────
    const patchKnowledge = async (payload: Partial<TenantKnowledge>) => {
        try {
            if (knowledge) {
                await tenantKnowledgeRepository.patch(knowledge.id, payload);
            } else {
                const created = await tenantKnowledgeRepository.create({
                    ...payload,
                    entreprise: user?.entreprise?.id ?? entrepriseId,
                });
                setKnowledge(created);
            }
            toast.success(t.saveSuccess);
        } catch {
            toast.error(d.common.error);
        }
    };

    // ── Save entreprise ───────────────────────────────────────────────────────
    const handleSaveTenant = (e: React.FormEvent) => {
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
                        ...(selectedSecteurId ? { secteur_id: selectedSecteurId } : {}),
                    });
                    setEntreprise(updated);
                }
                await refreshUser();
                toast.success(d.profile.companySaved);
            } catch {
                toast.error(d.common.error);
            }
        });
    };

    // ── Helpers horaires ──────────────────────────────────────────────────────
    const toggleDay = (
        hours: HorairesOuverture,
        setHours: (h: HorairesOuverture) => void,
        day: DayKey,
    ) => {
        const current = hours[day] as DaySchedule;
        setHours({ ...hours, [day]: { ...current, open: !current.open } });
    };

    const updateDayTime = (
        hours: HorairesOuverture,
        setHours: (h: HorairesOuverture) => void,
        day: DayKey,
        field: "start" | "end",
        value: string,
    ) => {
        const current = hours[day] as DaySchedule;
        setHours({ ...hours, [day]: { ...current, [field]: value } });
    };

    const saveHours = async (hours: HorairesOuverture) => {
        try {
            await horairesRepository.patch(hours.id, hours);
            toast.success(t.saveSuccess);
        } catch {
            toast.error(d.common.error);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="space-y-6">

            {/* ── Profil entreprise (composant partagé avec /pme/profile) ── */}
            <EntrepriseForm
                entreprise={entreprise}
                setEntreprise={setEntreprise}
                selectedSecteurId={selectedSecteurId}
                setSelectedSecteurId={setSelectedSecteurId}
                secteurs={secteurs}
                loadingSecteurs={loadingSecteurs}
                isSaving={isSavingTenant}
                hasEntreprise={!!user?.entreprise}
                onSave={handleSaveTenant}
                d={d}
                locale={locale}
            />

            {/* ── Transfert vers un humain ────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {t.transferSection}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{t.transferSubtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {t.transferWhatsapp}
                        </label>
                        <input className="input-base w-full" placeholder="+237 6XX XXX XXX"
                            value={transfer.transfer_whatsapp}
                            onChange={e => setTransfer({ ...transfer, transfer_whatsapp: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {t.transferPhone}
                        </label>
                        <input className="input-base w-full" placeholder="+237 6XX XXX XXX"
                            value={transfer.transfer_phone}
                            onChange={e => setTransfer({ ...transfer, transfer_phone: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {t.transferEmail}
                        </label>
                        <input className="input-base w-full" placeholder="transfert@..."
                            value={transfer.transfer_email}
                            onChange={e => setTransfer({ ...transfer, transfer_email: e.target.value })} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[var(--text)]">{t.transferMessage}</label>
                        <textarea rows={2} className="input-base w-full resize-none"
                            placeholder="Je vous transfère à notre équipe..."
                            value={transfer.transfer_message}
                            onChange={e => setTransfer({ ...transfer, transfer_message: e.target.value })} />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => startTransfer(() => patchKnowledge(transfer))}
                        disabled={savingTransfer}
                        className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4"
                    >
                        {savingTransfer ? <Spinner className="border-white/30 border-t-white w-3 h-3" /> : <Save className="w-3.5 h-3.5" />}
                        {d.common.save}
                    </button>
                </div>
            </div>

            {/* ── Assistant virtuel & branding ────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <Bot className="w-4 h-4" /> {t.botSection}
                </h3>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">{t.welcomeMessage}</label>
                    <textarea rows={3} className="input-base w-full resize-none"
                        placeholder="Bienvenue ! Comment puis-je vous aider ?"
                        value={assistant.message_accueil}
                        onChange={e => setAssistant({ ...assistant, message_accueil: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">{t.botTone}</label>
                    <div className="flex gap-2 flex-wrap">
                        {(["formel", "semi_formel", "decontracte"] as const).map(tone => (
                            <button key={tone} type="button"
                                onClick={() => setAssistant({ ...assistant, bot_tone: tone })}
                                className={cn(
                                    "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                                    assistant.bot_tone === tone
                                        ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30"
                                )}>
                                {tone === "formel" ? t.toneFormal : tone === "semi_formel" ? t.toneSemiFormal : t.toneCasual}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">{t.botPersonality}</label>
                    <textarea rows={2} className="input-base w-full resize-none"
                        placeholder="Professionnel, chaleureux et efficace..."
                        value={assistant.bot_personality}
                        onChange={e => setAssistant({ ...assistant, bot_personality: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">{t.botSignature}</label>
                    <input className="input-base w-full" placeholder="— L'équipe [Votre entreprise]"
                        value={assistant.bot_signature}
                        onChange={e => setAssistant({ ...assistant, bot_signature: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text)]">{t.botLanguages}</label>
                    <div className="flex gap-2 flex-wrap">
                        {[["fr", "Français"], ["en", "English"]].map(([code, label]) => {
                            const active = assistant.bot_languages.includes(code);
                            return (
                                <button key={code} type="button"
                                    onClick={() => setAssistant({
                                        ...assistant,
                                        bot_languages: active
                                            ? assistant.bot_languages.filter(l => l !== code)
                                            : [...assistant.bot_languages, code],
                                    })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                                        active
                                            ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30"
                                    )}>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => startAssistant(() => patchKnowledge(assistant))}
                        disabled={savingAssistant}
                        className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4"
                    >
                        {savingAssistant ? <Spinner className="border-white/30 border-t-white w-3 h-3" /> : <Save className="w-3.5 h-3.5" />}
                        {d.common.save}
                    </button>
                </div>
            </div>

            {/* ── Infos supplémentaires ───────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {t.extraInfo}
                </h3>
                <textarea rows={4} className="input-base w-full resize-none"
                    value={extra.extra_info}
                    onChange={e => setExtra({ extra_info: e.target.value })}
                    placeholder="Parking disponible, accès PMR, langues parlées..." />
                <div className="flex justify-end">
                    <button
                        onClick={() => startExtra(() => patchKnowledge(extra))}
                        disabled={savingExtra}
                        className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4"
                    >
                        {savingExtra ? <Spinner className="border-white/30 border-t-white w-3 h-3" /> : <Save className="w-3.5 h-3.5" />}
                        {d.common.save}
                    </button>
                </div>
            </div>

            {/* ── Horaires d'ouverture ────────────────────────────────────── */}
            {hoursOpening && (
                <HoursEditor
                    title={t.hoursOpening}
                    hours={hoursOpening}
                    dayLabels={DAY_LABELS}
                    onToggle={day => toggleDay(hoursOpening, setHoursOpening, day)}
                    onTimeChange={(day, field, val) => updateDayTime(hoursOpening, setHoursOpening, day, field, val)}
                    onSave={() => saveHours(hoursOpening)}
                    d={d}
                />
            )}

            {/* ── Horaires de réception RDV ───────────────────────────────── */}
            {hoursAppt && (
                <HoursEditor
                    title={t.hoursAppointments}
                    hours={hoursAppt}
                    dayLabels={DAY_LABELS}
                    onToggle={day => toggleDay(hoursAppt, setHoursAppt, day)}
                    onTimeChange={(day, field, val) => updateDayTime(hoursAppt, setHoursAppt, day, field, val)}
                    onSave={() => saveHours(hoursAppt)}
                    d={d}
                />
            )}
        </div>
    );
}