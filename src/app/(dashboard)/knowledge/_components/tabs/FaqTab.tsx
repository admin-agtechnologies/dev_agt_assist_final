// src/app/(dashboard)/knowledge/_components/tabs/FaqTab.tsx
// S71 — Toggle switch iOS/Android sur QuestionRow (remplace pill actif/inactif)
"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp,
  Loader2, HelpCircle,
} from "lucide-react";
import { useLanguage }         from "@/contexts/LanguageContext";
import { useToast }            from "@/components/ui/Toast";
import { useSector }           from "@/hooks/useSector";
import { questionsRepository } from "@/repositories";
import { FaqSkeleton }         from "../KnowledgeSkeleton";
import { cn }                  from "@/lib/utils";
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
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [adding,    startAdd]     = useTransition();
  const [draft,     setDraft]     = useState<typeof EMPTY | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    questionsRepository.getList()
      .then(setQuestions)
      .catch(() => toast.error(t.loadError))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const categories = useMemo(() => {
    return [...new Set(questions.map((q) => q.categorie).filter(Boolean))] as string[];
  }, [questions]);

  const filtered = useMemo(() => {
    if (!filterCat) return questions;
    return questions.filter((q) => q.categorie === filterCat);
  }, [questions, filterCat]);

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
          reponse_en:  draft.reponse_en.trim()  || undefined,
          categorie:   draft.categorie.trim()   || undefined,
          is_active:   true,
          ordre:       Number(draft.ordre) || 0,
        });
        setQuestions((prev) => [...prev, created]);
        setDraft(null);
        toast.success(t.addSuccess);
      } catch { toast.error(t.addError); }
    });
  };

  if (loading) return <FaqSkeleton />;

  return (
    <div className="space-y-4">

      {/* ── Header + bouton ajouter ── */}
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

      {/* ── Pills filtre catégorie ── */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button"
            onClick={() => setFilterCat(null)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all",
              !filterCat
                ? "text-white shadow-sm"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
            style={!filterCat ? { backgroundColor: theme.primary } : undefined}>
            {t.filterAll} ({questions.length})
          </button>
          {categories.map((cat) => {
            const count    = questions.filter((q) => q.categorie === cat).length;
            const isActive = filterCat === cat;
            return (
              <button key={cat} type="button"
                onClick={() => setFilterCat(isActive ? null : cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
                style={isActive ? { backgroundColor: theme.primary } : undefined}>
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Formulaire nouvelle question ── */}
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
              {t.fieldOrdre}
            </label>
            <input className="input-base w-24" type="number" min="0"
              value={draft.ordre}
              onChange={(e) => setDraft((f) => f ? { ...f, ordre: Number(e.target.value) } : f)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setDraft(null)}
              className="px-4 py-2 text-sm rounded-xl border border-[var(--border)]
                hover:bg-[var(--bg)] text-[var(--text-muted)]">
              {d.common.cancel}
            </button>
            <button type="button" onClick={addQuestion} disabled={adding}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {d.common.save}
            </button>
          </div>
        </div>
      )}

      {/* ── État vide ── */}
      {questions.length === 0 && !draft ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${theme.primary} 10%, transparent)` }}>
            <HelpCircle className="w-7 h-7" style={{ color: theme.primary }} />
          </div>
          <p className="text-sm text-[var(--text-muted)] max-w-xs">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              expanded={expanded === q.id}
              onToggleExpand={() => setExpanded((p) => (p === q.id ? null : q.id))}
              onToggleActive={() => toggleActive(q)}
              onDelete={() => deleteQuestion(q.id)}
              onSave={(patch) => saveQuestion(q, patch)}
              primaryColor={theme.primary}
              t={t}
              saveLabel={d.common.save}
              cancelLabel={d.common.cancel}
            />
          ))}
          {filterCat && filtered.length === 0 && (
            <p className="text-sm text-center text-[var(--text-muted)] py-8">
              Aucune question dans cette catégorie.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── ToggleSwitch — composant iOS/Android réutilisable ─────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  primaryColor,
  labelOn,
  labelOff,
}: {
  checked:      boolean;
  onChange:     () => void;
  primaryColor: string;
  labelOn:      string;
  labelOff:     string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 flex-shrink-0 group"
      aria-pressed={checked}
    >
      {/* Track */}
      <span
        className="relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none"
        style={{
          backgroundColor: checked ? primaryColor : "var(--border)",
        }}
      >
        {/* Curseur */}
        <span
          className={cn(
            "inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm",
            "transform transition-transform duration-200 ease-in-out",
            checked ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </span>
      {/* Label */}
      <span
        className="text-[10px] font-semibold transition-colors duration-200"
        style={{ color: checked ? primaryColor : "var(--text-muted)" }}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}

// ── QuestionRow ───────────────────────────────────────────────────────────────

function QuestionRow({
  question, expanded, onToggleExpand, onToggleActive,
  onDelete, onSave, primaryColor, t, saveLabel, cancelLabel,
}: {
  question:       QuestionFrequente;
  expanded:       boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onDelete:       () => void;
  onSave:         (p: Partial<QuestionFrequente>) => void;
  primaryColor:   string;
  t:              Record<string, string>;
  saveLabel:      string;
  cancelLabel:    string;
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
    { label: t.fieldQuestionFr, key: "question_fr" as const },
    { label: t.fieldReponseFr,  key: "reponse_fr"  as const, textarea: true },
    { label: t.fieldQuestionEn, key: "question_en" as const },
    { label: t.fieldReponseEn,  key: "reponse_en"  as const, textarea: true },
    { label: t.fieldCategorie,  key: "categorie"   as const },
  ];

  return (
    <div className={cn(
      "rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      !question.is_active && "opacity-60",
    )}>
      <div className="flex items-center gap-3 px-4 py-3">

        {/* ── Toggle switch iOS/Android ── */}
        <ToggleSwitch
          checked={question.is_active}
          onChange={onToggleActive}
          primaryColor={primaryColor}
          labelOn={t.active   ?? "Actif"}
          labelOff={t.inactive ?? "Inactif"}
        />

        {/* Question (cliquable pour expand) */}
        <button type="button" onClick={onToggleExpand}
          className="flex-1 text-left text-sm font-medium text-[var(--text)] truncate">
          {question.question_fr || "—"}
        </button>

        {/* Badge catégorie */}
        {question.categorie && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              background: `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
              color:      primaryColor,
            }}>
            {question.categorie}
          </span>
        )}

        <span className="text-xs text-[var(--text-muted)]">#{question.ordre ?? 0}</span>

        <button type="button" onClick={onDelete}
          className="text-[var(--text-muted)] hover:text-[var(--status-danger-text)]
            hover:bg-[var(--status-danger-bg)] p-1 rounded-lg transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>

        <button type="button" onClick={onToggleExpand}
          className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Panneau édition */}
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
              {t.fieldOrdre}
            </label>
            <input className="input-base w-24" type="number" min="0" value={form.ordre}
              onChange={(e) => setForm((f) => ({ ...f, ordre: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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