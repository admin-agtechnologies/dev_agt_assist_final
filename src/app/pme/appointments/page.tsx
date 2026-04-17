// src/app/pme/appointments/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { appointmentsRepository, servicesRepository } from "@/repositories";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import { CalendarDays, Pencil, Trash2, Plus } from "lucide-react";
import type { Appointment, CreateAppointmentPayload, AppointmentStatus, Service } from "@/types/api";

type StatusColor = "green" | "amber" | "blue" | "slate";
const STATUS_COLOR: Record<AppointmentStatus, StatusColor> = {
  confirmed: "green", pending: "amber", done: "blue", cancelled: "slate",
};

export default function PmeAppointmentsPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.appointments;
  const toast = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const res = await appointmentsRepository.getList({ tenant_id: user.tenant_id!, status: filterStatus || undefined });
        setItems(res.results);
      } catch { toast.error(t.errorLoad); } finally { setLoading(false); }
    });
  }, [user?.tenant_id, filterStatus, t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, [filterStatus]); // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await appointmentsRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      fetchData();
    } catch { toast.error(t.deleteError); } finally { setIsDeleting(false); }
  };

  const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "done", "cancelled"];

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => <div key={i} className="h-20 card bg-[var(--bg)]" />)}
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

        {/* Filtres statut */}
        <div className="card p-4 flex flex-wrap gap-2">
          <button onClick={() => setFilterStatus("")}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-colors", filterStatus === "" ? "bg-[#075E54] text-white" : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]")}>
            {d.common.all}
          </button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-colors", filterStatus === s ? "bg-[#075E54] text-white" : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]")}>
              {t.statuses[s]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={cn("card overflow-hidden transition-opacity", isPending && "opacity-50 pointer-events-none")}>
          {items.length === 0 ? <EmptyState message={t.noData} icon={CalendarDays} /> : (
            <>
              <div className="hidden md:grid grid-cols-5 px-6 py-3 bg-[var(--bg)] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                <span>{t.table.client}</span>
                <span>{t.table.service}</span>
                <span>{t.table.date}</span>
                <span>{t.table.channel}</span>
                <span>{t.table.status}</span>
              </div>
              {items.map(apt => (
                <div key={apt.id} className="grid grid-cols-1 md:grid-cols-5 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{apt.client_name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{apt.client_phone}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{apt.service_id}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDateTime(apt.scheduled_at)}</p>
                  <Badge variant={apt.channel === "whatsapp" ? "green" : "violet"}>
                    {t.channels[apt.channel] ?? apt.channel}
                  </Badge>
                  <div className="flex items-center justify-between md:justify-start gap-3">
                    <Badge variant={STATUS_COLOR[apt.status]}>{t.statuses[apt.status]}</Badge>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(apt.id); setModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(apt.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <AppointmentModal
        isOpen={modalOpen} itemId={editingId} tenantId={user?.tenant_id ?? ""}
        onClose={() => setModalOpen(false)} onSave={fetchData}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId} isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete} message={t.confirmDelete}
      />
    </>
  );
}

// ── AppointmentModal ──────────────────────────────────────────────────────────
function AppointmentModal({ isOpen, itemId, tenantId, onClose, onSave }: {
  isOpen: boolean; itemId: string | null; tenantId: string;
  onClose: () => void; onSave: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.appointments;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;
  const DEF: CreateAppointmentPayload = { service_id: "", client_name: "", client_phone: "", scheduled_at: "", status: "pending", notes: "" };
  const [form, setForm] = useState<CreateAppointmentPayload>(DEF);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    servicesRepository.getList({ tenant_id: tenantId }).then(r => setServices(r.results));
    if (itemId) {
      setLoading(true);
      appointmentsRepository.getById(itemId)
        .then(a => setForm({ service_id: a.service_id, client_name: a.client_name, client_phone: a.client_phone, scheduled_at: a.scheduled_at.slice(0, 16), status: a.status, notes: a.notes }))
        .finally(() => setLoading(false));
    } else setForm(DEF);
  }, [isOpen, itemId]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, scheduled_at: new Date(form.scheduled_at).toISOString() };
      if (isEdit) await appointmentsRepository.patch(itemId!, payload);
      else await appointmentsRepository.create({ ...payload, tenant_id: tenantId });
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
              <div><label className="label-base">{tf.service}</label>
                <select required className="input-base" value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
                  <option value="">—</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label-base">{tf.clientName}</label><input required className="input-base" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><label className="label-base">{tf.clientPhone}</label><input required className="input-base" value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} /></div>
              <div><label className="label-base">{tf.scheduledAt}</label><input required type="datetime-local" className="input-base" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></div>
              <div><label className="label-base">{tf.status}</label>
                <select className="input-base" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as AppointmentStatus })}>
                  {(["pending", "confirmed", "done", "cancelled"] as AppointmentStatus[]).map(s => (
                    <option key={s} value={s}>{t.statuses[s]}</option>
                  ))}
                </select>
              </div>
              <div><label className="label-base">{tf.notes}</label><textarea rows={2} className="input-base resize-none" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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
