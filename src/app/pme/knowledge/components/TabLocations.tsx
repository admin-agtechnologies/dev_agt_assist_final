// src/app/pme/knowledge/components/TabLocations.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner, EmptyState, Badge } from "@/components/ui";
import { agencesRepository } from "@/repositories";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Agence } from "@/types/api";
import { servicesRepository } from "@/repositories";
import type { Service } from "@/types/api";
import {
    MapPin, Phone, Mail, Save, Plus,
    Trash2, X, Edit2, AlertCircle,
} from "lucide-react";

export function TabLocations({
    entrepriseId,
    d,
}: {
    entrepriseId: string;
    d: ReturnType<typeof useLanguage>["dictionary"];
}) {
    const t = d.knowledge;
    const toast = useToast();

    const [agences, setAgences]   = useState<Agence[]>([]);
    const [loading, setLoading]   = useState(true);
    const [editId, setEditId]     = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving]     = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [form, setForm] = useState({
        nom: "", adresse: "", ville: "", whatsapp: "", telephone: "", email: "",
    });

    const fetchAgences = useCallback(async () => {
        try {
            const res = await agencesRepository.getList();
            const list = Array.isArray(res) ? res : (res as { results?: Agence[] }).results ?? [];
            setAgences(list);
        } catch { toast.error(d.common.error); }
        finally { setLoading(false); }
    }, [d.common.error, toast]);

    const fetchServices = useCallback(async () => {
        try {
            const res = await servicesRepository.getList();
            const list = Array.isArray(res) ? res : (res as { results?: Service[] }).results ?? [];
            setAvailableServices(list);
        } catch { /* erreur silencieuse */ }
    }, []);

    useEffect(() => { 
        fetchAgences(); 
        fetchServices();
    }, [fetchAgences, fetchServices]);


   const openEdit = (ag: Agence) => {
        setEditId(ag.id);
        setForm({ nom: ag.nom, adresse: ag.adresse, ville: ag.ville, whatsapp: ag.whatsapp, telephone: ag.telephone, email: ag.email });
        // On pré-remplit avec les IDs déjà présents dans l'objet agence
        setSelectedServices(ag.service_ids || []);
        setShowForm(true);
    };

    const openNew = () => {
        setEditId(null);
        setForm({ nom: "", adresse: "", ville: "", whatsapp: "", telephone: "", email: "" });
        setSelectedServices([]);
        setShowForm(true);
    };

    const handleSave = async () => {
            setSaving(true);
            try {
                const payload = { ...form, service_ids: selectedServices };
                if (editId) await agencesRepository.patch(editId, payload);
                else await agencesRepository.create(payload);
                toast.success(d.common.save + " ✓");
                setShowForm(false);
                fetchAgences();
            } catch { toast.error(d.common.error); }
            finally { setSaving(false); }
        };

    const handleDelete = async (id: string) => {
        try {
            await agencesRepository.delete(id);
            toast.success(t.locationDeleted);
            fetchAgences();
        } catch { toast.error(d.common.error); }
        finally { setDeleteId(null); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> {t.addLocation}
                </button>
            </div>

            {agences.length === 0 ? (
                <EmptyState icon={MapPin} message={t.noLocations} />
            ) : (
                <div className="space-y-3">
                    {agences.map(ag => (
                        <div key={ag.id} className="card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-bold text-[var(--text)]">{ag.nom}</p>
                                        {ag.is_siege && (
                                            <span className="text-[9px] font-black bg-[#075E54]/15 text-[#075E54] px-1.5 py-0.5 rounded-full">
                                                SIÈGE
                                            </span>
                                        )}
                                        <Badge variant={ag.is_active ? "green" : "slate"}>
                                            {ag.is_active ? d.common.active : d.common.inactive}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                                        {ag.adresse && (
                                            <p className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {ag.adresse}{ag.ville ? `, ${ag.ville}` : ""}
                                            </p>
                                        )}
                                        {ag.telephone && (
                                            <p className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {ag.telephone}
                                            </p>
                                        )}
                                        {ag.email && (
                                            <p className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {ag.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => openEdit(ag)}
                                        className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    {!ag.is_siege && (
                                        <button onClick={() => setDeleteId(ag.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal formulaire agence */}
            {showForm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="card w-full max-w-md animate-fade-in">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <h2 className="text-base font-black text-[var(--text)]">
                                {editId ? t.editLocation : t.addLocation}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[var(--border)]">
                                <X className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {([
                                { key: "nom",       label: t.locationName,    placeholder: "Agence Centre-ville" },
                                { key: "adresse",   label: t.locationAddress, placeholder: "123 Rue principale" },
                                { key: "ville",     label: "Ville",           placeholder: "Yaoundé" },
                                { key: "telephone", label: d.profile.phone,   placeholder: "+237 6XX XXX XXX" },
                                { key: "whatsapp",  label: "WhatsApp",        placeholder: "+237 6XX XXX XXX" },
                                { key: "email",     label: d.profile.email ?? "Email", placeholder: "agence@..." },
                            ] as { key: keyof typeof form; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text)]">{label}</label>
                                    <input className="input-base w-full" placeholder={placeholder}
                                        value={form[key]}
                                        onChange={e => setForm({ ...form, [key]: e.target.value })} />
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text)]">{t.locationServicesLabel}</label>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-[var(--border)] rounded-xl bg-[var(--bg)]">
                                    {availableServices.map(svc => (
                                        <label key={svc.id} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-card)] rounded-lg cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-[var(--border)] text-[#075E54] focus:ring-[#075E54]"
                                                checked={selectedServices.includes(svc.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedServices([...selectedServices, svc.id]);
                                                    else setSelectedServices(selectedServices.filter(id => id !== svc.id));
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-[var(--text)] truncate">{svc.nom}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">{Number(svc.prix).toLocaleString()} XAF</p>
                                            </div>
                                        </label>
                                    ))}
                                    {availableServices.length === 0 && (
                                        <p className="text-[10px] text-[var(--text-muted)] italic text-center py-2">{t.noServicesCreated}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 text-sm">
                                    {d.common.cancel}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.nom.trim()}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {saving
                                        ? <Spinner className="border-white/30 border-t-white w-3 h-3" />
                                        : <Save className="w-3.5 h-3.5" />}
                                    {d.common.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Confirmation suppression */}
            {deleteId && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="card w-full max-w-sm p-6 space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                            <h3 className="font-bold">{t.locationDeleteConfirm}</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 text-sm">
                                {d.common.cancel}
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                                {d.common.delete}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}