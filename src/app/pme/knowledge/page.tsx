// src/app/pme/knowledge/page.tsx
"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader, Spinner, EmptyState, Badge } from "@/components/ui";
import {
    tenantKnowledgeRepository, businessHoursRepository,
    locationsRepository, servicesRepository, serviceKnowledgeRepository,
    faqRepository,
} from "@/repositories";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import type {
    TenantKnowledge, BusinessHours, DayHours,
    Location, Service, ServiceKnowledge, FAQ,
} from "@/types/api";
import {
    Building2, MapPin, Clock, BookOpen, Wrench,
    MessageSquare, Phone, Mail, Globe, Save, Plus,
    Trash2, ChevronDown, ChevronUp, X, Edit,
    Bot, Zap, Languages, AlertCircle,
} from "lucide-react";

// ── Constantes ────────────────────────────────────────────────────────────────
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type DayKey = typeof DAYS[number];

// ── Onglets ───────────────────────────────────────────────────────────────────
type Tab = "general" | "locations" | "faq" | "services";

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function PmeKnowledgePage() {
    const { user } = useAuth();
    const { dictionary: d, locale } = useLanguage();
    const t = d.knowledge;
    const [activeTab, setActiveTab] = useState<Tab>("general");

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "general", label: t.tabGeneral, icon: Building2 },
        { id: "locations", label: t.tabLocations, icon: MapPin },
        { id: "faq", label: t.tabFaq, icon: BookOpen },
        { id: "services", label: t.tabServices, icon: Wrench },
    ];

    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionHeader title={t.title} subtitle={t.subtitle} />

            {/* Onglets */}
            <div className="flex gap-1 p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)] w-fit">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                activeTab === tab.id
                                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                            )}>
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Contenu onglet */}
            {activeTab === "general" && <TabGeneral tenantId={user.tenant_id!} d={d} locale={locale} />}
            {activeTab === "locations" && <TabLocations tenantId={user.tenant_id!} d={d} />}
            {activeTab === "faq" && <TabFaq tenantId={user.tenant_id!} d={d} />}
            {activeTab === "services" && <TabServices tenantId={user.tenant_id!} d={d} />}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ONGLET 1 — INFOS GÉNÉRALES
// ════════════════════════════════════════════════════════════════════════════
function TabGeneral({ tenantId, d, locale }: { tenantId: string; d: ReturnType<typeof useLanguage>["dictionary"]; locale: string }) {
    const t = d.knowledge;
    const toast = useToast();
    const [knowledge, setKnowledge] = useState<TenantKnowledge | null>(null);
    const [hoursOpening, setHoursOpening] = useState<BusinessHours | null>(null);
    const [hoursAppt, setHoursAppt] = useState<BusinessHours | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, startSave] = useTransition();

    // Formulaire
    const [form, setForm] = useState({
        slogan: "", website: "", email: "",
        transfer_whatsapp: "", transfer_phone: "", transfer_email: "", transfer_message: "",
        welcome_message: "", bot_tone: "semi_formal" as TenantKnowledge["bot_tone"],
        bot_personality: "", bot_signature: "", extra_info: "",
        bot_languages: ["fr"] as string[],
    });

    const DAY_LABELS: Record<DayKey, string> = {
        monday: locale === "fr" ? "Lundi" : "Monday",
        tuesday: locale === "fr" ? "Mardi" : "Tuesday",
        wednesday: locale === "fr" ? "Mercredi" : "Wednesday",
        thursday: locale === "fr" ? "Jeudi" : "Thursday",
        friday: locale === "fr" ? "Vendredi" : "Friday",
        saturday: locale === "fr" ? "Samedi" : "Saturday",
        sunday: locale === "fr" ? "Dimanche" : "Sunday",
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);

        // ── 1. TenantKnowledge ─────────────────────────────────────────────────
        const k = await tenantKnowledgeRepository
            .getByTenant(tenantId)
            .catch(() => null);

        if (k) {
            setKnowledge(k);
            setForm({
                slogan: k.slogan,
                website: k.website,
                email: k.email,
                transfer_whatsapp: k.transfer_whatsapp,
                transfer_phone: k.transfer_phone,
                transfer_email: k.transfer_email,
                transfer_message: k.transfer_message,
                welcome_message: k.welcome_message,
                bot_tone: k.bot_tone,
                bot_personality: k.bot_personality,
                bot_signature: k.bot_signature,
                extra_info: k.extra_info,
                bot_languages: k.bot_languages,
            });
        }

        // ── 2. Horaires (indépendants — ne bloquent pas le formulaire) ─────────
        const [ho, ha] = await Promise.allSettled([
            businessHoursRepository.getByTenant(tenantId, "opening"),
            businessHoursRepository.getByTenant(tenantId, "appointments"),
        ]).then(([r1, r2]) => [
            r1.status === "fulfilled" ? r1.value : null,
            r2.status === "fulfilled" ? r2.value : null,
        ]);

        setHoursOpening(ho);
        setHoursAppt(ha);
        setLoading(false);
    }, [tenantId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        startSave(async () => {
            try {
                if (knowledge) {
                    await tenantKnowledgeRepository.patch(knowledge.id, form);
                } else {
                    await tenantKnowledgeRepository.create({
                        ...form,
                        tenant_id: tenantId,
                        appointment_duration_min: 30,
                        slot_buffer_min: 10,
                    });
                }
                toast.success(t.saveSuccess);
                fetchAll();
            } catch { toast.error(d.common.error); }
        });
    };

    const toggleDay = (hours: BusinessHours, setHours: (h: BusinessHours) => void, day: DayKey) => {
        setHours({ ...hours, [day]: { ...hours[day], open: !hours[day].open } });
    };

    const updateDayTime = (
        hours: BusinessHours, setHours: (h: BusinessHours) => void,
        day: DayKey, field: "start" | "end", value: string
    ) => {
        setHours({ ...hours, [day]: { ...hours[day], [field]: value } });
    };

    const saveHours = async (hours: BusinessHours) => {
        try {
            await businessHoursRepository.patch(hours.id, hours);
            toast.success(t.saveSuccess);
        } catch { toast.error(d.common.error); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-6">

            {/* ── Message d'accueil + Branding ─────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <Bot className="w-4 h-4" /> {t.botSection}
                </h3>

                <div>
                    <label className="label-base">{t.welcomeMessage}</label>
                    <textarea rows={3} className="input-base resize-none"
                        value={form.welcome_message}
                        onChange={e => setForm({ ...form, welcome_message: e.target.value })}
                        placeholder="Bonjour ! Bienvenue chez..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-base">{t.botTone}</label>
                        <select className="input-base" value={form.bot_tone}
                            onChange={e => setForm({ ...form, bot_tone: e.target.value as TenantKnowledge["bot_tone"] })}>
                            <option value="formal">{t.toneFormal}</option>
                            <option value="semi_formal">{t.toneSemiFormal}</option>
                            <option value="casual">{t.toneCasual}</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-base">{t.botPersonality}</label>
                        <input className="input-base" value={form.bot_personality}
                            onChange={e => setForm({ ...form, bot_personality: e.target.value })}
                            placeholder="Professionnel, rassurant..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-base flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5" /> {t.botLanguages}
                        </label>
                        <div className="flex gap-3 mt-2">
                            {["fr", "en"].map(lang => (
                                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.bot_languages.includes(lang)}
                                        onChange={e => setForm({
                                            ...form,
                                            bot_languages: e.target.checked
                                                ? [...form.bot_languages, lang]
                                                : form.bot_languages.filter(l => l !== lang)
                                        })} />
                                    <span className="text-sm font-semibold text-[var(--text)]">
                                        {lang === "fr" ? "Français" : "English"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.botSignature}</label>
                        <input className="input-base" value={form.bot_signature}
                            onChange={e => setForm({ ...form, bot_signature: e.target.value })}
                            placeholder="— L'équipe..." />
                    </div>
                </div>

                <div>
                    <label className="label-base">{t.slogan}</label>
                    <input className="input-base" value={form.slogan}
                        onChange={e => setForm({ ...form, slogan: e.target.value })}
                        placeholder="Votre slogan..." />
                </div>
            </div>

            {/* ── Contacts principaux ───────────────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {t.contactSection}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-base">{t.contactWhatsapp}</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input className="input-base pl-10" placeholder="+237..." value={form.transfer_whatsapp}
                                onChange={e => setForm({ ...form, transfer_whatsapp: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.contactPhone}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input className="input-base pl-10" placeholder="+237..." value={form.transfer_phone}
                                onChange={e => setForm({ ...form, transfer_phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.contactEmail}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input type="email" className="input-base pl-10" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.website}</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input className="input-base pl-10" placeholder="https://..." value={form.website}
                                onChange={e => setForm({ ...form, website: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Transfert vers humain ─────────────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> {t.transferSection}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{t.transferSubtitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-base">{t.transferWhatsapp}</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input className="input-base pl-10" placeholder="+237..." value={form.transfer_whatsapp}
                                onChange={e => setForm({ ...form, transfer_whatsapp: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label-base">{t.transferPhone}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input className="input-base pl-10" placeholder="+237..." value={form.transfer_phone}
                                onChange={e => setForm({ ...form, transfer_phone: e.target.value })} />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label-base">{t.transferEmail}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input type="email" className="input-base pl-10" value={form.transfer_email}
                                onChange={e => setForm({ ...form, transfer_email: e.target.value })} />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label-base">{t.transferMessage}</label>
                        <textarea rows={2} className="input-base resize-none" value={form.transfer_message}
                            onChange={e => setForm({ ...form, transfer_message: e.target.value })}
                            placeholder="Je vous transfère à notre équipe..." />
                    </div>
                </div>
            </div>

            {/* ── Infos supplémentaires ─────────────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {t.extraInfo}
                </h3>
                <textarea rows={4} className="input-base resize-none" value={form.extra_info}
                    onChange={e => setForm({ ...form, extra_info: e.target.value })}
                    placeholder="Parking disponible, accès PMR, langues parlées..." />
            </div>

            {/* ── Horaires d'ouverture ──────────────────────────────────────────── */}
            {hoursOpening && (
                <HoursEditor
                    title={t.hoursOpening} hours={hoursOpening}
                    dayLabels={DAY_LABELS}
                    onToggle={(day) => toggleDay(hoursOpening, setHoursOpening, day)}
                    onTimeChange={(day, field, val) => updateDayTime(hoursOpening, setHoursOpening, day, field, val)}
                    onSave={() => saveHours(hoursOpening)}
                    d={d}
                />
            )}

            {/* ── Horaires de réception RDV ─────────────────────────────────────── */}
            {hoursAppt && (
                <HoursEditor
                    title={t.hoursAppointments} hours={hoursAppt}
                    dayLabels={DAY_LABELS}
                    onToggle={(day) => toggleDay(hoursAppt, setHoursAppt, day)}
                    onTimeChange={(day, field, val) => updateDayTime(hoursAppt, setHoursAppt, day, field, val)}
                    onSave={() => saveHours(hoursAppt)}
                    d={d}
                />
            )}

            {/* Bouton sauvegarder */}
            <div className="flex justify-end">
                <button type="submit" disabled={isSaving} className="btn-primary px-8">
                    {isSaving
                        ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                        : <><Save className="w-4 h-4" /> {d.common.save}</>}
                </button>
            </div>
        </form>
    );
}

// ── Composant éditeur d'horaires ──────────────────────────────────────────────
function HoursEditor({ title, hours, dayLabels, onToggle, onTimeChange, onSave, d }: {
    title: string;
    hours: BusinessHours;
    dayLabels: Record<DayKey, string>;
    onToggle: (day: DayKey) => void;
    onTimeChange: (day: DayKey, field: "start" | "end", val: string) => void;
    onSave: () => void;
    d: ReturnType<typeof useLanguage>["dictionary"];
}) {
    return (
        <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {title}
                </h3>
                <button type="button" onClick={onSave} className="btn-primary py-1.5 text-xs">
                    <Save className="w-3.5 h-3.5" /> {d.common.save}
                </button>
            </div>
            <div className="space-y-2">
                {DAYS.map(day => {
                    const dh = hours[day] as DayHours;
                    return (
                        <div key={day} className="flex items-center gap-4 py-2 border-b border-[var(--border)] last:border-0">
                            <span className="w-24 text-sm font-semibold text-[var(--text)] flex-shrink-0">
                                {dayLabels[day]}
                            </span>
                            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                                <div onClick={() => onToggle(day)}
                                    className={cn(
                                        "w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer",
                                        dh.open ? "bg-[#25D366]" : "bg-[var(--border)]"
                                    )}>
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full shadow transition-transform",
                                        dh.open ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </div>
                                <span className="text-xs text-[var(--text-muted)]">
                                    {dh.open ? (d.common.active) : (d.common.inactive)}
                                </span>
                            </label>
                            {dh.open && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <input type="time" value={dh.start}
                                        onChange={e => onTimeChange(day, "start", e.target.value)}
                                        className="input-base py-1.5 text-sm w-32" />
                                    <span className="text-[var(--text-muted)] text-sm">→</span>
                                    <input type="time" value={dh.end}
                                        onChange={e => onTimeChange(day, "end", e.target.value)}
                                        className="input-base py-1.5 text-sm w-32" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ONGLET 2 — AGENCES
// ════════════════════════════════════════════════════════════════════════════
function TabLocations({ tenantId, d }: { tenantId: string; d: ReturnType<typeof useLanguage>["dictionary"] }) {
    const t = d.knowledge;
    const toast = useToast();
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const DEF_FORM = {
        name: "", address: "", whatsapp: "", phone: "", email: "",
        transfer_whatsapp: "", transfer_phone: "", extra_info: "", is_active: true,
    };
    const [form, setForm] = useState(DEF_FORM);
    const [isSaving, startSave] = useTransition();

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await locationsRepository.getByTenant(tenantId);
            setLocations(data);
        } catch { /* silencieux */ }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchLocations(); }, [fetchLocations]);

    const openCreate = () => { setForm(DEF_FORM); setEditingId(null); setModalOpen(true); };
    const openEdit = (loc: Location) => {
        setForm({
            name: loc.name,
            address: loc.address,
            whatsapp: loc.whatsapp ?? "",
            phone: loc.phone ?? "",
            email: loc.email ?? "",
            transfer_whatsapp: loc.transfer_whatsapp ?? "",
            transfer_phone: loc.transfer_phone ?? "",
            extra_info: loc.extra_info ?? "",
            is_active: loc.is_active ?? false // Pour le booléen, on met false par défaut
        });
        setEditingId(loc.id); setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        startSave(async () => {
            try {
                if (editingId) {
                    await locationsRepository.patch(editingId, form);
                } else {
                    await locationsRepository.create({ ...form, tenant_id: tenantId, hours: null });
                }
                toast.success(t.saveSuccess);
                setModalOpen(false);
                fetchLocations();
            } catch { toast.error(d.common.error); }
        });
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await locationsRepository.delete(deleteId);
            toast.success(t.locationDeleted);
            setDeleteId(null);
            fetchLocations();
        } catch { toast.error(d.common.error); }
        finally { setIsDeleting(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>;

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-end">
                    <button onClick={openCreate} className="btn-primary">
                        <Plus className="w-4 h-4" /> {t.addLocation}
                    </button>
                </div>

                {locations.length === 0 ? (
                    <div className="card">
                        <EmptyState message={t.noLocations} icon={MapPin} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {locations.map(loc => (
                            <div key={loc.id} className="card p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-[#25D366]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text)]">{loc.name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{loc.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(loc)}
                                            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteId(loc.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                                    {loc.whatsapp && <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" />{loc.whatsapp}</span>}
                                    {loc.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{loc.phone}</span>}
                                    {loc.email && <span className="flex items-center gap-1.5 col-span-2"><Mail className="w-3 h-3" />{loc.email}</span>}
                                </div>
                                {loc.extra_info && (
                                    <p className="text-xs text-[var(--text-muted)] bg-[var(--bg)] rounded-lg px-3 py-2">
                                        {loc.extra_info}
                                    </p>
                                )}
                                <Badge variant={loc.is_active ? "green" : "slate"}>
                                    {loc.is_active ? d.common.active : d.common.inactive}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modale agence */}
            {mounted && modalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="absolute inset-0" onClick={() => !isSaving && setModalOpen(false)} />
                    <form onSubmit={handleSave}
                        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">
                        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[var(--text)]">
                                {editingId ? t.editLocation : t.addLocation}
                            </h2>
                            <button type="button" onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <label className="label-base">{t.locationName}</label>
                                <input required className="input-base" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-base">{t.locationAddress}</label>
                                <input required className="input-base" value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-base">{t.contactWhatsapp}</label>
                                    <input className="input-base" placeholder="+237..." value={form.whatsapp}
                                        onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-base">{t.contactPhone}</label>
                                    <input className="input-base" placeholder="+237..." value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label-base">{t.contactEmail}</label>
                                <input type="email" className="input-base" value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-base">{t.transferWhatsapp}</label>
                                    <input className="input-base" placeholder="+237..." value={form.transfer_whatsapp}
                                        onChange={e => setForm({ ...form, transfer_whatsapp: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-base">{t.transferPhone}</label>
                                    <input className="input-base" placeholder="+237..." value={form.transfer_phone}
                                        onChange={e => setForm({ ...form, transfer_phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label-base">{t.extraInfo}</label>
                                <textarea rows={2} className="input-base resize-none" value={form.extra_info}
                                    onChange={e => setForm({ ...form, extra_info: e.target.value })} />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                    className={cn("w-10 h-6 rounded-full p-1 transition-colors cursor-pointer",
                                        form.is_active ? "bg-[#25D366]" : "bg-[var(--border)]")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform",
                                        form.is_active ? "translate-x-4" : "translate-x-0")} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text)]">{d.common.active}</span>
                            </label>
                        </div>
                        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
                            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">{d.common.cancel}</button>
                            <button type="submit" disabled={isSaving} className="btn-primary">
                                {isSaving ? <Spinner className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
                                {editingId ? d.common.save : t.addLocation}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {/* Modale suppression */}
            {mounted && deleteId && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => !isDeleting && setDeleteId(null)} />
                    <div className="relative bg-[var(--bg-card)] rounded-3xl p-6 w-full max-w-sm border border-[var(--border)] shadow-2xl">
                        <h3 className="font-bold text-[var(--text)] mb-2">{d.common.confirmTitle}</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6">{t.locationDeleteConfirm}</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteId(null)} className="btn-ghost">{d.common.cancel}</button>
                            <button onClick={handleDelete} disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2">
                                {isDeleting ? <Spinner className="border-white/30 border-t-white" /> : <Trash2 className="w-4 h-4" />}
                                {d.common.delete}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ONGLET 3 — FAQ
// ════════════════════════════════════════════════════════════════════════════
function TabFaq({ tenantId, d }: { tenantId: string; d: ReturnType<typeof useLanguage>["dictionary"] }) {
    const t = d.knowledge;
    const toast = useToast();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await faqRepository.getList(tenantId);
            setFaqs(data.results);
        } catch { /* silencieux */ }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

    if (loading) return <div className="flex justify-center py-12"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-[var(--text-muted)]">{faqs.length} {t.faqCount}</p>
                <a href="/pme/faq" className="btn-primary text-sm">
                    <Plus className="w-4 h-4" /> {t.manageFaq}
                </a>
            </div>
            {faqs.length === 0 ? (
                <div className="card"><EmptyState message={d.faq.noData} icon={BookOpen} /></div>
            ) : (
                <div className="card divide-y divide-[var(--border)]">
                    {faqs.map(faq => (
                        <div key={faq.id}>
                            <button
                                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg)] transition-colors text-left">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge variant={faq.is_active ? "green" : "slate"}>
                                        {faq.is_active ? d.common.active : d.common.inactive}
                                    </Badge>
                                    <p className="text-sm font-semibold text-[var(--text)] truncate">{faq.question_fr}</p>
                                </div>
                                {expanded === faq.id
                                    ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />}
                            </button>
                            {expanded === faq.id && (
                                <div className="px-5 pb-4 space-y-2">
                                    <div className="bg-[var(--bg)] rounded-xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">FR</p>
                                        <p className="text-sm text-[var(--text)]">{faq.answer_fr}</p>
                                    </div>
                                    {faq.answer_en && (
                                        <div className="bg-[var(--bg)] rounded-xl p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">EN</p>
                                            <p className="text-sm text-[var(--text)]">{faq.answer_en}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ONGLET 4 — SERVICES & TARIFS (CRUD complet + knowledge)
// ════════════════════════════════════════════════════════════════════════════
function TabServices({ tenantId, d }: { tenantId: string; d: ReturnType<typeof useLanguage>["dictionary"] }) {
    const t = d.knowledge;
    const toast = useToast();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [knowledgeMap, setKnowledgeMap] = useState<Record<string, ServiceKnowledge>>({});
    const [savingKnowledgeId, setSavingKnowledgeId] = useState<string | null>(null);
    const [knowledgeForms, setKnowledgeForms] = useState<Record<string, Partial<ServiceKnowledge>>>({});
    const [mounted, setMounted] = useState(false);

    // ── Modal création/édition service ────────────────────────────────────────
    const [serviceModal, setServiceModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingService, startSaveService] = useTransition();

    const DEF_SERVICE_FORM = {
        name: "", description: "", price: 0,
        duration_min: 0 as number | null, is_active: true,
    };
    const [serviceForm, setServiceForm] = useState(DEF_SERVICE_FORM);

    useEffect(() => { setMounted(true); }, []);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await servicesRepository.getList({ tenant_id: tenantId });
            setServices(data.results);
            const map: Record<string, ServiceKnowledge> = {};
            const formInit: Record<string, Partial<ServiceKnowledge>> = {};
            await Promise.all(
                data.results.map(async svc => {
                    const k = await serviceKnowledgeRepository.getByService(svc.id).catch(() => null);
                    if (k) {
                        map[svc.id] = k;
                        formInit[svc.id] = {
                            welcome_message: k.welcome_message, bot_description: k.bot_description,
                            bot_tone: k.bot_tone, conditions: k.conditions,
                            confirmation_message: k.confirmation_message, extra_info: k.extra_info,
                        };
                    } else {
                        formInit[svc.id] = {
                            welcome_message: "", bot_description: "", bot_tone: "inherit",
                            conditions: "", confirmation_message: "", extra_info: "",
                        };
                    }
                })
            );
            setKnowledgeMap(map);
            setKnowledgeForms(formInit);
        } catch { /* silencieux */ }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Ouvrir modale ─────────────────────────────────────────────────────────
    const openCreate = () => {
        setServiceForm(DEF_SERVICE_FORM);
        setEditingService(null);
        setServiceModal(true);
    };

    const openEdit = (svc: Service) => {
        setServiceForm({
            name: svc.name, description: svc.description,
            price: svc.price, duration_min: svc.duration_min,
            is_active: svc.is_active,
        });
        setEditingService(svc);
        setServiceModal(true);
    };

    // ── Sauvegarder service ───────────────────────────────────────────────────
    const handleSaveService = (e: React.FormEvent) => {
        e.preventDefault();
        startSaveService(async () => {
            try {
                if (editingService) {
                    await servicesRepository.patch(editingService.id, serviceForm);
                    toast.success(t.serviceUpdated);
                } else {
                    await servicesRepository.create({ ...serviceForm, tenant_id: tenantId });
                    toast.success(t.serviceCreated);
                }
                setServiceModal(false);
                fetchAll();
            } catch { toast.error(d.common.error); }
        });
    };

    // ── Supprimer service ─────────────────────────────────────────────────────
    const handleDeleteService = async () => {
        if (!deleteServiceId) return;
        setIsDeleting(true);
        try {
            await servicesRepository.delete(deleteServiceId);
            toast.success(t.serviceDeleted);
            setDeleteServiceId(null);
            if (expanded === deleteServiceId) setExpanded(null);
            fetchAll();
        } catch { toast.error(d.common.error); }
        finally { setIsDeleting(false); }
    };

    // ── Knowledge form ────────────────────────────────────────────────────────
    const updateKnowledgeForm = (serviceId: string, field: string, value: string) => {
        setKnowledgeForms(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], [field]: value } }));
    };

    const handleSaveKnowledge = async (svc: Service) => {
        setSavingKnowledgeId(svc.id);
        try {
            const formData = knowledgeForms[svc.id] ?? {};
            const existing = knowledgeMap[svc.id];
            if (existing) {
                await serviceKnowledgeRepository.patch(existing.id, formData);
            } else {
                await serviceKnowledgeRepository.create({
                    ...formData as Omit<ServiceKnowledge, "id">,
                    service_id: svc.id, tenant_id: tenantId,
                });
            }
            toast.success(t.saveSuccess);
            fetchAll();
        } catch { toast.error(d.common.error); }
        finally { setSavingKnowledgeId(null); }
    };

    if (loading) return (
        <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" />
        </div>
    );

    return (
        <>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--text-muted)]">
                        {services.length} {services.length > 1 ? "services" : "service"}
                    </p>
                    <button onClick={openCreate} className="btn-primary">
                        <Plus className="w-4 h-4" /> {t.newService}
                    </button>
                </div>

                {/* Liste services */}
                {services.length === 0 ? (
                    <div className="card">
                        <EmptyState message={d.services.noData} icon={Wrench} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {services.map(svc => {
                            const kForm = knowledgeForms[svc.id] ?? {};
                            const isExpanded = expanded === svc.id;
                            const isSavingK = savingKnowledgeId === svc.id;

                            return (
                                <div key={svc.id} className="card overflow-hidden">
                                    {/* ── En-tête service ── */}
                                    <div className="px-5 py-4 flex items-center gap-3">
                                        {/* Icône + infos */}
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(isExpanded ? null : svc.id)}
                                            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                                            <div className="w-9 h-9 rounded-xl bg-[#6C3CE1]/10 flex items-center justify-center flex-shrink-0">
                                                <Wrench className="w-4 h-4 text-[#6C3CE1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-[var(--text)] truncate">{svc.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {svc.price === 0 ? d.services.free : `${svc.price.toLocaleString()} XAF`}
                                                    {svc.duration_min ? ` · ${svc.duration_min} min` : ""}
                                                </p>
                                            </div>
                                            <Badge variant={svc.is_active ? "green" : "slate"}>
                                                {svc.is_active ? d.common.active : d.common.inactive}
                                            </Badge>
                                            {isExpanded
                                                ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                                                : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />}
                                        </button>

                                        {/* Actions */}
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => openEdit(svc)}
                                                className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteServiceId(svc.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Section knowledge (expandable) ── */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)] pt-4 animate-fade-in">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                                                <Bot className="w-3.5 h-3.5" /> {t.knowledgeSection}
                                            </p>

                                            <div>
                                                <label className="label-base">{t.serviceWelcomeMessage}</label>
                                                <textarea rows={2} className="input-base resize-none"
                                                    value={kForm.welcome_message ?? ""}
                                                    onChange={e => updateKnowledgeForm(svc.id, "welcome_message", e.target.value)}
                                                    placeholder="Pour ce service..." />
                                            </div>

                                            <div>
                                                <label className="label-base">{t.serviceBotDescription}</label>
                                                <textarea rows={2} className="input-base resize-none"
                                                    value={kForm.bot_description ?? ""}
                                                    onChange={e => updateKnowledgeForm(svc.id, "bot_description", e.target.value)}
                                                    placeholder="Description que le bot utilisera..." />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-base">{t.botTone}</label>
                                                    <select className="input-base" value={kForm.bot_tone ?? "inherit"}
                                                        onChange={e => updateKnowledgeForm(svc.id, "bot_tone", e.target.value)}>
                                                        <option value="inherit">{t.toneInherit}</option>
                                                        <option value="formal">{t.toneFormal}</option>
                                                        <option value="semi_formal">{t.toneSemiFormal}</option>
                                                        <option value="casual">{t.toneCasual}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-base">{t.serviceConditions}</label>
                                                    <input className="input-base"
                                                        value={kForm.conditions ?? ""}
                                                        onChange={e => updateKnowledgeForm(svc.id, "conditions", e.target.value)}
                                                        placeholder="Apporter ordonnance..." />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="label-base">{t.serviceConfirmationMessage}</label>
                                                <textarea rows={2} className="input-base resize-none"
                                                    value={kForm.confirmation_message ?? ""}
                                                    onChange={e => updateKnowledgeForm(svc.id, "confirmation_message", e.target.value)}
                                                    placeholder="Votre RDV est confirmé..." />
                                            </div>

                                            <div>
                                                <label className="label-base">{t.extraInfo}</label>
                                                <textarea rows={2} className="input-base resize-none"
                                                    value={kForm.extra_info ?? ""}
                                                    onChange={e => updateKnowledgeForm(svc.id, "extra_info", e.target.value)}
                                                    placeholder="Infos supplémentaires..." />
                                            </div>

                                            <div className="flex justify-end">
                                                <button type="button" onClick={() => handleSaveKnowledge(svc)}
                                                    disabled={isSavingK} className="btn-primary">
                                                    {isSavingK
                                                        ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                                                        : <><Save className="w-4 h-4" /> {d.common.save}</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Modale création/édition service ────────────────────────────────── */}
            {mounted && serviceModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="absolute inset-0" onClick={() => !isSavingService && setServiceModal(false)} />
                    <form onSubmit={handleSaveService}
                        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] flex flex-col animate-zoom-in">
                        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[var(--text)]">
                                {editingService ? t.editService : t.newService}
                            </h2>
                            <button type="button" onClick={() => setServiceModal(false)}
                                className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="label-base">{t.serviceName}</label>
                                <input required className="input-base"
                                    value={serviceForm.name}
                                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="label-base">{t.serviceDescription}</label>
                                <textarea rows={2} className="input-base resize-none"
                                    value={serviceForm.description}
                                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-base">{t.servicePrice}</label>
                                    <input type="number" min={0} className="input-base"
                                        value={serviceForm.price}
                                        onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="label-base">{t.serviceDuration}</label>
                                    <input type="number" min={0} className="input-base"
                                        value={serviceForm.duration_min ?? ""}
                                        onChange={e => setServiceForm({ ...serviceForm, duration_min: e.target.value ? Number(e.target.value) : null })} />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <div onClick={() => setServiceForm({ ...serviceForm, is_active: !serviceForm.is_active })}
                                    className={cn("w-10 h-6 rounded-full p-1 transition-colors cursor-pointer",
                                        serviceForm.is_active ? "bg-[#25D366]" : "bg-[var(--border)]")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform",
                                        serviceForm.is_active ? "translate-x-4" : "translate-x-0")} />
                                </div>
                                <span className="text-sm font-medium text-[var(--text)]">{t.serviceActive}</span>
                            </label>
                        </div>

                        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
                            <button type="button" onClick={() => setServiceModal(false)} className="btn-ghost">
                                {d.common.cancel}
                            </button>
                            <button type="submit" disabled={isSavingService} className="btn-primary">
                                {isSavingService
                                    ? <><Spinner className="border-white/30 border-t-white" /> {d.common.loading}</>
                                    : <><Save className="w-4 h-4" /> {d.common.save}</>}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {/* ── Modale suppression service ──────────────────────────────────────── */}
            {mounted && deleteServiceId && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => !isDeleting && setDeleteServiceId(null)} />
                    <div className="relative bg-[var(--bg-card)] rounded-3xl p-6 w-full max-w-sm border border-[var(--border)] shadow-2xl">
                        <h3 className="font-bold text-[var(--text)] mb-2">{d.common.confirmTitle}</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6">{t.deleteService}</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteServiceId(null)} className="btn-ghost">{d.common.cancel}</button>
                            <button onClick={handleDeleteService} disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2">
                                {isDeleting
                                    ? <Spinner className="border-white/30 border-t-white" />
                                    : <Trash2 className="w-4 h-4" />}
                                {d.common.delete}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}