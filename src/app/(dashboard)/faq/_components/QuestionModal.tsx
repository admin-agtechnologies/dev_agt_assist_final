// src/app/(dashboard)/faq/_components/QuestionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { questionsRepository } from "@/repositories/catalogues.repository";
import { Spinner } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import type { CreateQuestionPayload } from "@/types/api";
import { fr } from "@/dictionaries/fr";
import { en } from "@/dictionaries/en";

interface QuestionModalProps {
  isOpen: boolean;
  itemId: string | null;
  faqId: string;
  onClose: () => void;
  onSave: () => void;
  lang: "fr" | "en";
}

const DEF: CreateQuestionPayload = {
  faq: "", question_fr: "", question_en: "",
  reponse_fr: "", reponse_en: "", categorie: "", is_active: true,
};

export function QuestionModal({
  isOpen, itemId, faqId, onClose, onSave, lang,
}: QuestionModalProps) {
  const d = lang === "fr" ? fr : en;
  const t = d.faq;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;

  const [form, setForm] = useState<CreateQuestionPayload>({ ...DEF, faq: faqId });
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (itemId) {
      setLoadingItem(true);
      questionsRepository.getList()
        .then((items) => {
          const found = items.find((q) => q.id === itemId);
          if (found) setForm({
            faq: found.faq, question_fr: found.question_fr,
            question_en: found.question_en, reponse_fr: found.reponse_fr,
            reponse_en: found.reponse_en, categorie: found.categorie,
            is_active: found.is_active,
          });
        })
        .catch(() => toast.error(d.common.error))
        .finally(() => setLoadingItem(false));
    } else {
      setForm({ ...DEF, faq: faqId });
    }
  }, [isOpen, itemId, faqId]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await questionsRepository.patch(itemId!, form);
      else await questionsRepository.create(form);
      toast.success(t.createSuccess);
      onSave();
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-2xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in"
      >
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {isEdit ? t.modal.editTitle : t.modal.createTitle}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loadingItem ? <Spinner /> : (
            <>
              <div>
                <label className="label-base">{tf.questionFr}</label>
                <input required className="input-base" value={form.question_fr}
                  onChange={(e) => setForm({ ...form, question_fr: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.answerFr}</label>
                <textarea required rows={4} className="input-base resize-none" value={form.reponse_fr}
                  onChange={(e) => setForm({ ...form, reponse_fr: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.questionEn}</label>
                <input className="input-base" value={form.question_en ?? ""}
                  onChange={(e) => setForm({ ...form, question_en: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.answerEn}</label>
                <textarea rows={4} className="input-base resize-none" value={form.reponse_en ?? ""}
                  onChange={(e) => setForm({ ...form, reponse_en: e.target.value })} />
              </div>
              <div>
                <label className="label-base">{tf.category}</label>
                <input className="input-base" value={form.categorie ?? ""}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            {d.common.cancel}
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? t.modal.btnUpdate : t.modal.btnCreate}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}