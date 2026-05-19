// src/app/(dashboard)/knowledge/_components/tabs/FaqTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp,
  Loader2, HelpCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useLanguage }         from "@/contexts/LanguageContext";
import { useToast }            from "@/components/ui/Toast";
import { useSector }           from "@/hooks/useSector";
import { questionsRepository } from "@/repositories";
import type { QuestionFrequente } from "@/types/api";

const EMPTY = {
  question_fr: "", question_en: "",
  reponse_fr:  "", reponse_en:  "",
  categorie:   "", is_active: true, ordre: 0,
};

export function FaqTab() {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.faq;
  const toast             = useToast();

  const [questions, setQuestions] = useState<QuestionFrequente[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [adding, startAdd]        = useTransition();
  const [draft, setDraft]         = useState<typeof EMPTY | null>(null);

  useEffect(() => {
    questionsRepository.getList()
      .then(setQuestions)
      .catch(() => toast.error(t.loadError))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const toggleActive = async (q: QuestionFrequente) => {
    try {
      const updated = await questionsRepository.patch(q.id, { is_active: !q.is_active });
      setQuestions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch { toast.error(t.saveError); }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await questionsRepository.delete(id);
      setQuestions((prev) => prev.filter((x) => x.id !== id));
      toast.success(t.deleteSuccess);
    } catch { toast.error(t.deleteError); }
  };

  const saveQuestion = async (q: QuestionFrequente, patch: Partial<QuestionFrequente>) => {
    try {
      const updated = await questionsRepository.patch(q.id, patch);
      setQuestions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(t.saveSuccess);
    } catch { toast.error(t.saveError); }
  };

  const addQuestion = () => {
    if (!draft?.question_fr.trim() || !draft?.reponse_fr.trim()) {
      toast.error(t.requiredError); return;
    }
    startAdd(async () => {
      try {
        const faqId = questions[0]?.faq;
        if (!faqId) { toast.error(t.noFaqError); return; }
        const created = await questionsRepository.create({
          faq:         faqId,
          question_fr: draft.question_fr.trim(),
          question_en: draft.question_en.trim() || undefined,
          reponse_fr:  draft.reponse_fr.trim(),
          reponse_en:  draft.reponse_en.trim() || undefined,
          categorie:   draft.categorie.trim() || undefined,
          is_active:   true,
          ordre:       Number(draft.ordre) || 0,
        });
        setQuestions((prev) => [...prev, created]);
        setDraft(null);
        toast.success(t.addSuccess);
      } catch { toast.error(t.addError); }
    });
  };

  const fieldLabels = {
    qFr: t.fieldQuestionFr, rFr: t.fieldReponseFr,
    qEn: t.fieldQuestionEn, rEn: t.fieldReponseEn,
    cat: t.fieldCategorie,
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        {!draft && (
          <button type="button"
            onClick={() => setDraft({ ...EMPTY, ordre: questions.length })}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> {t.addBtn}
          </button>
        )}
      </div>

      {/* Formulaire nouvelle question */}
      {draft && (
        <div className="rounded-2xl border-2 p-5 space-y-3 bg-[var(--bg-card)]"
          style={{ borderColor: theme.primary }}>
          <p className="text-sm font-semibold text-[var(--text)]">{t.newTitle}</p>
          {[
            { label: t.fieldQuestionFr, key: "question_fr" as const },
            { label: t.fieldReponseFr,  key: "reponse_fr"  as const, textarea: true },
            { label: t.fieldQuestionEn, key: "question_en" as const },
            { label: t.fieldReponseEn,  key: "reponse_en"  as const, textarea: true },
            { label: t.fieldCategorie,  key: "categorie"   as const },
          ].map(({ label, key, textarea }) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                {label}
              </label>
              {textarea
                ? <textarea className="input-base resize-none" rows={3}
                    value={draft[key] as string}
                    onChange={(e) => setDraft((f) => f ? { ...f, [key]: e.target.value } : f)} />
                : <input className="input-base"
                    value={draft[key] as string}
                    onChange={(e) => setDraft((f) => f ? { ...f, [key]: e.target.value } : f)} />}
            </div>
          ))}
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
              Ordre
            </label>
            <input className="input-base w-24" type="number" min="0"
              value={draft.ordre}
              onChange={(e) => setDraft((f) => f ? { ...f, ordre: Number(e.target.value) } : f)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setDraft(null)}
              className="px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
              Annuler
            </button>
            <button type="button" onClick={addQuestion} disabled={adding}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {d.common.save}
            </button>
          </div>
        </div>
      )}

      {/* Liste questions */}
      {questions.length === 0 && !draft ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <HelpCircle className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              expanded={expanded === q.id}
              onToggleExpand={() => setExpanded((p) => (p === q.id ? null : q.id))}
              onToggleActive={() => toggleActive(q)}
              onDelete={() => deleteQuestion(q.id)}
              onSave={(patch) => saveQuestion(q, patch)}
              primaryColor={theme.primary}
              fieldLabels={fieldLabels}
              saveLabel={d.common.save}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRow({
  question, expanded, onToggleExpand, onToggleActive,
  onDelete, onSave, primaryColor, fieldLabels, saveLabel,
}: {
  question: QuestionFrequente;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSave: (p: Partial<QuestionFrequente>) => void;
  primaryColor: string;
  saveLabel: string;
  fieldLabels: { qFr: string; rFr: string; qEn: string; rEn: string; cat: string };
}) {
  const [form, setForm] = useState({
    question_fr: question.question_fr,
    reponse_fr:  question.reponse_fr,
    question_en: question.question_en ?? "",
    reponse_en:  question.reponse_en  ?? "",
    categorie:   question.categorie   ?? "",
    ordre:       String(question.ordre ?? 0),
  });

  const FIELDS = [
    { label: fieldLabels.qFr, key: "question_fr" as const },
    { label: fieldLabels.rFr, key: "reponse_fr"  as const, textarea: true },
    { label: fieldLabels.qEn, key: "question_en" as const },
    { label: fieldLabels.rEn, key: "reponse_en"  as const, textarea: true },
    { label: fieldLabels.cat, key: "categorie"   as const },
  ];

  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden
      ${!question.is_active ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onToggleActive} className="flex-shrink-0">
          {question.is_active
            ? <ToggleRight className="w-5 h-5" style={{ color: primaryColor }} />
            : <ToggleLeft  className="w-5 h-5 text-[var(--text-muted)]" />}
        </button>
        <button type="button" onClick={onToggleExpand}
          className="flex-1 text-left text-sm font-medium text-[var(--text)] truncate">
          {question.question_fr || "—"}
        </button>
        {question.categorie && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]">
            {question.categorie}
          </span>
        )}
        <span className="text-xs text-[var(--text-muted)]">#{question.ordre ?? 0}</span>
        <button type="button" onClick={onDelete}
          className="text-[var(--text-muted)] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={onToggleExpand}
          className="flex-shrink-0 text-[var(--text-muted)]">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
          {FIELDS.map(({ label, key, textarea }) => (
            <div key={key}>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                {label}
              </label>
              {textarea
                ? <textarea className="input-base resize-none" rows={3} value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                : <input className="input-base" value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />}
            </div>
          ))}
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
              Ordre
            </label>
            <input className="input-base w-24" type="number" min="0" value={form.ordre}
              onChange={(e) => setForm((f) => ({ ...f, ordre: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <button type="button"
              onClick={() => onSave({
                question_fr: form.question_fr,
                reponse_fr:  form.reponse_fr,
                question_en: form.question_en || undefined,
                reponse_en:  form.reponse_en  || undefined,
                categorie:   form.categorie   || undefined,
                ordre:       Number(form.ordre) || 0,
              })}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Save className="w-4 h-4" />{saveLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}