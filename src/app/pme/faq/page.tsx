// src/app/pme/faq/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { faqRepository } from "@/repositories";
import { cn } from "@/lib/utils";
import { ActiveBadge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import { HelpCircle, Pencil, Trash2, Plus, ChevronDown } from "lucide-react";
import type { FAQ, CreateFAQPayload } from "@/types/api";

export default function PmeFaqPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.faq;
  const toast = useToast();
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const res = await faqRepository.getList(user.tenant_id!);
        setItems(res.results);
      } catch { toast.error(t.errorLoad); } finally { setLoading(false); }
    });
  }, [user?.tenant_id, t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await faqRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      fetchData();
    } catch { toast.error(t.deleteError); } finally { setIsDeleting(false); }
  };

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 card bg-[var(--bg)]" />)}
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

        <div className={cn("space-y-3 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
          {items.length === 0 ? (
            <EmptyState message={t.noData} icon={HelpCircle} />
          ) : items.map(faq => (
            <div key={faq.id} className="card overflow-hidden">
              {/* Header accordéon */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ActiveBadge active={faq.is_active} />
                  <span className="text-sm font-semibold text-[var(--text)] truncate">{faq.question_fr}</span>
                  {faq.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] font-medium flex-shrink-0">
                      {faq.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button onClick={e => { e.stopPropagation(); setEditingId(faq.id); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteId(faq.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={cn("w-4 h-4 text-[var(--text-muted)] transition-transform", expanded === faq.id && "rotate-180")} />
                </div>
              </button>

              {/* Contenu accordéon */}
              {expanded === faq.id && (
                <div className="px-6 pb-5 border-t border-[var(--border)] pt-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">🇫🇷 FR</p>
                    <p className="text-sm text-[var(--text)] font-medium">{faq.question_fr}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{faq.answer_fr}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">🇬🇧 EN</p>
                    <p className="text-sm text-[var(--text)] font-medium">{faq.question_en}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{faq.answer_en}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <FaqModal
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

// ── FaqModal ──────────────────────────────────────────────────────────────────
function FaqModal({ isOpen, itemId, tenantId, onClose, onSave }: {
  isOpen: boolean; itemId: string | null; tenantId: string;
  onClose: () => void; onSave: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.faq;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;
  const DEF: CreateFAQPayload = { question_fr: "", question_en: "", answer_fr: "", answer_en: "", category: "", is_active: true };
  const [form, setForm] = useState<CreateFAQPayload>(DEF);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (itemId) {
      setLoading(true);
      faqRepository.getList(tenantId)
        .then(res => {
          const found = res.results.find(f => f.id === itemId);
          if (found) setForm({ question_fr: found.question_fr, question_en: found.question_en, answer_fr: found.answer_fr, answer_en: found.answer_en, category: found.category, is_active: found.is_active });
        })
        .catch(() => toast.error(d.common.error))
        .finally(() => setLoading(false));
    } else setForm(DEF);
  }, [isOpen, itemId]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (isEdit) await faqRepository.patch(itemId!, form);
      else await faqRepository.create({ ...form, tenant_id: tenantId });
      toast.success(t.createSuccess); onSave(); onClose();
    } catch { toast.error(d.common.error); } finally { setSaving(false); }
  };

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit} className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-2xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">{isEdit ? t.modal.editTitle : t.modal.createTitle}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading
            ? <div className="flex justify-center py-8"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>
            : <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">🇫🇷 Français</p>
                  <div><label className="label-base">{tf.questionFr}</label><input required className="input-base" value={form.question_fr} onChange={e => setForm({ ...form, question_fr: e.target.value })} /></div>
                  <div><label className="label-base">{tf.answerFr}</label><textarea required rows={4} className="input-base resize-none" value={form.answer_fr} onChange={e => setForm({ ...form, answer_fr: e.target.value })} /></div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">🇬🇧 English</p>
                  <div><label className="label-base">{tf.questionEn}</label><input required className="input-base" value={form.question_en} onChange={e => setForm({ ...form, question_en: e.target.value })} /></div>
                  <div><label className="label-base">{tf.answerEn}</label><textarea required rows={4} className="input-base resize-none" value={form.answer_en} onChange={e => setForm({ ...form, answer_en: e.target.value })} /></div>
                </div>
              </div>
              <div><label className="label-base">{tf.category}</label><input className="input-base" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
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
