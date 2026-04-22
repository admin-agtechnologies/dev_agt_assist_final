// src/app/pme/services/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { servicesRepository } from "@/repositories";
import { formatCurrency, cn } from "@/lib/utils";
import { ActiveBadge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import { ConciergeBell, Pencil, Trash2, Plus } from "lucide-react";
import type { Service, CreateServicePayload } from "@/types/api";

export default function PmeServicesPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.services;
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const res = await servicesRepository.getList();
        setServices(res.results);
      } catch { toast.error(t.errorLoad); } finally { setLoading(false); }
    });
  }, [user?.tenant_id, t.errorLoad, toast]);

  useEffect(() => { fetchServices(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await servicesRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      fetchServices();
    } catch { toast.error(t.deleteError); } finally { setIsDeleting(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 card bg-[var(--bg)]" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <SectionHeader title={t.title} subtitle={t.subtitle} action={
          <button onClick={() => { setEditingId(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" />{t.newBtn}
          </button>
        } />

        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
          {services.length === 0 ? (
            <div className="col-span-3"><EmptyState message={t.noData} icon={ConciergeBell} /></div>
          ) : services.map(svc => (
            <div key={svc.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--text)]">{svc.nom}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{svc.description}</p>
                </div>
                <ActiveBadge active={svc.is_active} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div>
                  <p className="text-lg font-black text-[#075E54]">
                    {svc.prix === 0 ? t.free : formatCurrency(svc.prix)}
                  </p>
                  {svc.duree_min && (
                    <p className="text-[10px] text-[var(--text-muted)]">{svc.duree_min} min</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(svc.id); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(svc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ServiceModal
        isOpen={modalOpen} itemId={editingId} tenantId={user?.tenant_id ?? ""}
        onClose={() => setModalOpen(false)} onSave={fetchServices}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId} isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete} message={t.confirmDelete}
      />
    </>
  );
}

// ── ServiceModal ──────────────────────────────────────────────────────────────
function ServiceModal({ isOpen, itemId, tenantId, onClose, onSave }: {
  isOpen: boolean; itemId: string | null; tenantId: string;
  onClose: () => void; onSave: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.services;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;
  const DEF: CreateServicePayload = { nom: "", description: "", prix: 0, duree_min: null, is_active: true };
  const [form, setForm] = useState<CreateServicePayload>(DEF);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (itemId) {
      setLoading(true);
      servicesRepository.getById(itemId)
        .then(s => setForm({ nom: s.nom, description: s.description, prix: s.prix, duree_min: s.duree_min, is_active: s.is_active }))
        .catch(() => toast.error(d.common.error))
        .finally(() => setLoading(false));
    } else setForm(DEF);
  }, [isOpen, itemId]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (isEdit) await servicesRepository.patch(itemId!, form);
      else await servicesRepository.create(form);
      toast.success(t.createSuccess); onSave(); onClose();
    } catch { toast.error(d.common.error); } finally { setSaving(false); }
  };

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit} className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">{isEdit ? t.modal.editTitle : t.modal.createTitle}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading
            ? <div className="flex justify-center py-8"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>
            : <>
              <div><label className="label-base">{tf.name}</label><input required className="input-base" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div><label className="label-base">{tf.description}</label><textarea rows={3} className="input-base resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-base">{tf.price}</label><input type="number" min={0} className="input-base" value={form.prix} onChange={e => setForm({ ...form, prix: Number(e.target.value) })} /></div>
                <div><label className="label-base">{tf.duration}</label><input type="number" min={1} className="input-base" value={form.duree_min ?? ""} onChange={e => setForm({ ...form, duree_min: e.target.value ? Number(e.target.value) : null })} /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-11 h-6 rounded-full p-1 transition-colors ${form.is_active ? "bg-[#25D366]" : "bg-[var(--border)]"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <input type="checkbox" className="hidden" checked={form.is_active!} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <span className="text-sm font-medium text-[var(--text)]">{tf.isActive}</span>
              </label>
            </>
          }
        </div>
        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? t.modal.btnUpdate : t.modal.btnCreate}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
