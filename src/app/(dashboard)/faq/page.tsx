// src/app/pme/faq/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { faqRepository, questionsRepository } from "@/repositories";
import { cn } from "@/lib/utils";
import { ActiveBadge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import { HelpCircle, Pencil, Trash2, Plus, ChevronDown } from "lucide-react";
import type { FAQ, QuestionFrequente, CreateQuestionPayload } from "@/types/api";

export default function PmeFaqPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.faq;
  const toast = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [questions, setQuestions] = useState<QuestionFrequente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    startTransition(async () => {
      try {
        const [faqRes, qRes] = await Promise.all([
          faqRepository.getList(),
          questionsRepository.getList(),
        ]);
        setFaqs(faqRes.results);
        setQuestions(qRes);
      } catch { toast.error(t.errorLoad); } finally { setLoading(false); }
    });
  }, [t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await questionsRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      fetchData();
    } catch { toast.error(t.deleteError); } finally { setIsDeleting(false); }
  };

  const defaultFaqId = faqs[0]?.id ?? "";

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
          {questions.length === 0 ? (
            <EmptyState message={t.noData} icon={HelpCircle} />
          ) : questions.map(q => (
            <div key={q.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HelpCircle className="w-4 h-4 text-[#075E54] flex-shrink-0" />
                  <span className="text-sm font-semibold text-[var(--text)] truncate">{q.question_fr}</span>
                  {q.categorie && (
                    <span className="text-xs px-2 py-0.5 bg-[var(--bg)] rounded-full text-[var(--text-muted)] flex-shrink-0">
                      {q.categorie}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <ActiveBadge active={q.is_active} />
                  <button onClick={e => { e.stopPropagation(); setEditingId(q.id); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)]">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteId(q.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={cn("w-4 h-4 text-[var(--text-muted)] transition-transform", expanded === q.id && "rotate-180")} />
                </div>
              </button>
              {expanded === q.id && (
                <div className="px-6 pb-5 border-t border-[var(--border)] pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] mb-1">FR</p>
                    <p className="text-sm text-[var(--text)] font-medium">{q.question_fr}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{q.reponse_fr}</p>
                  </div>
                  {q.question_en && (
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-1">EN</p>
                      <p className="text-sm text-[var(--text)] font-medium">{q.question_en}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{q.reponse_en}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <QuestionModal
        isOpen={modalOpen} itemId={editingId}
        faqId={defaultFaqId}
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

function QuestionModal({ isOpen, itemId, faqId, onClose, onSave }: {
  isOpen: boolean; itemId: string | null; faqId: string;
  onClose: () => void; onSave: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.faq;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;
  const DEF: CreateQuestionPayload = { faq: faqId, question_fr: "", question_en: "", reponse_fr: "", reponse_en: "", categorie: "", is_active: true };
  const [form, setForm] = useState<CreateQuestionPayload>(DEF);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (itemId) {
      setLoading(true);
      questionsRepository.getList()
        .then((items: QuestionFrequente[]) => {
          const found = items.find((q: QuestionFrequente) => q.id === itemId);
          if (found) setForm({
            faq: found.faq,
            question_fr: found.question_fr,
            question_en: found.question_en,
            reponse_fr: found.reponse_fr,
            reponse_en: found.reponse_en,
            categorie: found.categorie,
            is_active: found.is_active,
          });
        })
        .catch(() => toast.error(d.common.error))
        .finally(() => setLoading(false));
    } else setForm({ ...DEF, faq: faqId });
  }, [isOpen, itemId, faqId]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (isEdit) await questionsRepository.patch(itemId!, form);
      else await questionsRepository.create(form);
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
          {loading ? <Spinner /> : <>
            <div><label className="label-base">{tf.questionFr}</label><input required className="input-base" value={form.question_fr} onChange={e => setForm({ ...form, question_fr: e.target.value })} /></div>
            <div><label className="label-base">{tf.answerFr}</label><textarea required rows={4} className="input-base resize-none" value={form.reponse_fr} onChange={e => setForm({ ...form, reponse_fr: e.target.value })} /></div>
            <div><label className="label-base">{tf.questionEn}</label><input className="input-base" value={form.question_en ?? ""} onChange={e => setForm({ ...form, question_en: e.target.value })} /></div>
            <div><label className="label-base">{tf.answerEn}</label><textarea rows={4} className="input-base resize-none" value={form.reponse_en ?? ""} onChange={e => setForm({ ...form, reponse_en: e.target.value })} /></div>
            <div><label className="label-base">{tf.category}</label><input className="input-base" value={form.categorie ?? ""} onChange={e => setForm({ ...form, categorie: e.target.value })} /></div>
          </>}
        </div>
        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? t.modal.btnUpdate : t.modal.btnCreate}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}