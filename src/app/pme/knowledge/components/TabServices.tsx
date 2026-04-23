// src/app/pme/knowledge/components/TabServices.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner, EmptyState, Badge } from "@/components/ui";
import { servicesRepository } from "@/repositories";
import { createPortal } from "react-dom";
import type { Service } from "@/types/api";
import {
    Wrench, Save, Plus, Trash2,
    ChevronDown, ChevronUp, X, Edit2, AlertCircle,
} from "lucide-react";

export function TabServices({
    entrepriseId,
    d,
}: {
    entrepriseId: string;
    d: ReturnType<typeof useLanguage>["dictionary"];
}) {
    const t = d.knowledge;
    const toast = useToast();

    const [services, setServices]   = useState<Service[]>([]);
    const [loading, setLoading]     = useState(true);
    const [expanded, setExpanded]   = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editSvc, setEditSvc]     = useState<Service | null>(null);
    const [saving, setSaving]       = useState(false);
    const [deleteId, setDeleteId]   = useState<string | null>(null);

    const [form, setForm] = useState({
        nom: "", description: "", prix: 0, duree_min: 30, is_active: true,
    });

    const fetchServices = useCallback(async () => {
        try {
            const res = await servicesRepository.getList();
            const list = Array.isArray(res) ? res : (res as { results?: Service[] }).results ?? [];
            setServices(list);
        } catch { toast.error(d.common.error); }
        finally { setLoading(false); }
    }, [d.common.error, toast]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const openNew = () => {
        setEditSvc(null);
        setForm({ nom: "", description: "", prix: 0, duree_min: 30, is_active: true });
        setShowModal(true);
    };

    const openEdit = (svc: Service) => {
        setEditSvc(svc);
        setForm({
            nom:         svc.nom,
            description: svc.description ?? "",
            prix:        Number(svc.prix),
            duree_min:   svc.duree_min ?? 30,
            is_active:   svc.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.nom.trim()) return;
        setSaving(true);
        try {
            if (editSvc) await servicesRepository.patch(editSvc.id, form);
            else await servicesRepository.create(form);
            toast.success(editSvc ? t.serviceUpdated : t.serviceCreated);
            setShowModal(false);
            fetchServices();
        } catch { toast.error(d.common.error); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await servicesRepository.delete(id);
            toast.success(t.serviceDeleted);
            fetchServices();
        } catch { toast.error(d.common.error); }
        finally { setDeleteId(null); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> {t.newService}
                </button>
            </div>

            {services.length === 0 ? (
                <EmptyState icon={Wrench} message="Aucun service configuré." />
            ) : (
                <div className="space-y-3">
                    {services.map(svc => (
                        <div key={svc.id} className="card overflow-hidden">
                            <button
                                onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg)] transition-colors text-left"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge variant={svc.is_active ? "green" : "slate"}>
                                        {svc.is_active ? d.common.active : d.common.inactive}
                                    </Badge>
                                    <p className="text-sm font-semibold text-[var(--text)] truncate">{svc.nom}</p>
                                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                                        {Number(svc.prix).toLocaleString()} XAF · {svc.duree_min}min
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                    <button
                                        onClick={e => { e.stopPropagation(); openEdit(svc); }}
                                        className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setDeleteId(svc.id); }}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {expanded === svc.id
                                        ? <ChevronUp   className="w-4 h-4 text-[var(--text-muted)]" />
                                        : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                                </div>
                            </button>

                            {expanded === svc.id && svc.description && (
                                <div className="px-5 pb-4">
                                    <p className="text-xs text-[var(--text-muted)]">{svc.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal service */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="card w-full max-w-md animate-fade-in">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <h2 className="text-base font-black text-[var(--text)]">
                                {editSvc ? t.editService : t.newService}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--border)]">
                                <X className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">{t.serviceName} *</label>
                                <input className="input-base w-full" placeholder="Consultation, Massage..."
                                    value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text)]">{t.servicePrice}</label>
                                    <input type="number" min={0} className="input-base w-full"
                                        value={form.prix} onChange={e => setForm({ ...form, prix: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text)]">{t.serviceDuration}</label>
                                    <input type="number" min={5} step={5} className="input-base w-full"
                                        value={form.duree_min} onChange={e => setForm({ ...form, duree_min: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">{t.serviceDescription}</label>
                                <textarea rows={3} className="input-base w-full resize-none"
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    className="rounded" />
                                <span className="text-xs font-semibold text-[var(--text)]">{t.serviceActive}</span>
                            </label>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 text-sm">
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
                            <h3 className="font-bold">{t.deleteService}</h3>
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