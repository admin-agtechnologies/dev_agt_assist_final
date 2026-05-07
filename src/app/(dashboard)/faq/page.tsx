// src/app/(dashboard)/faq/page.tsx
// Migration de src/app/pme/faq/page.tsx
// Adaptation : useLanguage hook + import direct fr/en
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  faqRepository,
  questionsRepository,
} from "@/repositories/catalogues.repository";
import {
  ActiveBadge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner,
} from "@/components/ui";
import { HelpCircle, Pencil, Trash2, Plus, ChevronDown } from "lucide-react";
import type { FAQ, QuestionFrequente } from "@/types/api";
import { fr } from "@/dictionaries/fr";
import { en } from "@/dictionaries/en";
import { cn } from "@/lib/utils";
import { QuestionModal } from "./_components/QuestionModal";

export default function FaqPage() {
  const { lang } = useLanguage();
  const d = lang === "fr" ? fr : en;
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
      } catch {
        toast.error(t.errorLoad);
      } finally {
        setLoading(false);
      }
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
    } catch {
      toast.error(t.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultFaqId = faqs[0]?.id ?? "";

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 card bg-[var(--bg)]" />
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title={t.title}
          subtitle={t.subtitle}
          action={
            <button
              onClick={() => { setEditingId(null); setModalOpen(true); }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />{t.newBtn}
            </button>
          }
        />

        <div className={cn("space-y-3 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
          {questions.length === 0 ? (
            <EmptyState message={t.noData} icon={HelpCircle} />
          ) : questions.map((q) => (
            <div key={q.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HelpCircle className="w-4 h-4 text-[#075E54] flex-shrink-0" />
                  <span className="text-sm font-semibold text-[var(--text)] truncate">
                    {q.question_fr}
                  </span>
                  {q.categorie && (
                    <span className="text-xs px-2 py-0.5 bg-[var(--bg)] rounded-full text-[var(--text-muted)] flex-shrink-0">
                      {q.categorie}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <ActiveBadge active={q.is_active} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(q.id); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(q.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                  >
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
        isOpen={modalOpen}
        itemId={editingId}
        faqId={defaultFaqId}
        onClose={() => setModalOpen(false)}
        onSave={fetchData}
        lang={lang}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete}
        message={t.confirmDelete}
      />
    </>
  );
}