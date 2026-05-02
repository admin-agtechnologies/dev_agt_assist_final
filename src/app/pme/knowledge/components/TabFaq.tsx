// src/app/pme/knowledge/components/TabFaq.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner, Badge } from "@/components/ui";
import { faqRepository, questionsRepository } from "@/repositories";
import { createPortal } from "react-dom";
import type { FAQ, QuestionFrequente, CreateQuestionPayload } from "@/types/api";
import {
    BookOpen, Save, Plus, Trash2,
    ChevronDown, ChevronUp, X, Edit2,
} from "lucide-react";

export function TabFaq({
    entrepriseId,
    d,
}: {
    entrepriseId: string;
    d: ReturnType<typeof useLanguage>["dictionary"];
}) {
    const t = d.knowledge;
    const toast = useToast();

    const [faqs, setFaqs]             = useState<FAQ[]>([]);
    const [questions, setQuestions]   = useState<QuestionFrequente[]>([]);
    const [loading, setLoading]       = useState(true);
    const [expanded, setExpanded]     = useState<string | null>(null);
    const [showQModal, setShowQModal] = useState(false);
    const [editQ, setEditQ]           = useState<QuestionFrequente | null>(null);
    const [savingQ, setSavingQ]       = useState(false);

    const [qForm, setQForm] = useState<CreateQuestionPayload>({
        faq: "", question_fr: "", reponse_fr: "",
    });

    const fetchAll = useCallback(async () => {
        try {
            const [fRes, qRes] = await Promise.all([
                faqRepository.getList(),
                questionsRepository.getList(),
            ]);
            setFaqs(Array.isArray(fRes) ? fRes : (fRes as { results?: FAQ[] }).results ?? []);
            setQuestions(Array.isArray(qRes) ? qRes : (qRes as { results?: QuestionFrequente[] }).results ?? []);
        } catch { toast.error(d.common.error); }
        finally { setLoading(false); }
    }, [d.common.error, toast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openNewQ = (faqId: string) => {
        setEditQ(null);
        setQForm({ faq: faqId, question_fr: "", question_en: "", reponse_fr: "", reponse_en: "", categorie: "" });
        setShowQModal(true);
    };

    const openEditQ = (q: QuestionFrequente) => {
        setEditQ(q);
        setQForm({
            faq: q.faq,
            question_fr: q.question_fr,
            question_en: q.question_en,
            reponse_fr:  q.reponse_fr,
            reponse_en:  q.reponse_en,
            categorie:   q.categorie,
        });
        setShowQModal(true);
    };

    const handleSaveQ = async () => {
        if (!qForm.question_fr.trim() || !qForm.reponse_fr.trim()) return;
        setSavingQ(true);
        try {
            if (editQ) await questionsRepository.patch(editQ.id, qForm);
            else await questionsRepository.create(qForm);
            toast.success(d.common.save + " ✓");
            setShowQModal(false);
            fetchAll();
        } catch { toast.error(d.common.error); }
        finally { setSavingQ(false); }
    };

    const handleDeleteQ = async (id: string) => {
        try {
            await questionsRepository.delete(id);
            toast.success("Question supprimée.");
            fetchAll();
        } catch { toast.error(d.common.error); }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    if (faqs.length === 0) {
        return (
            <div className="card p-8 text-center space-y-2">
                <BookOpen className="w-10 h-10 mx-auto opacity-20 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">Aucune FAQ configurée.</p>
                <p className="text-xs text-[var(--text-muted)]">Créez d&apos;abord une FAQ depuis l&apos;admin AGT.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {faqs.map(faq => {
                const faqQuestions = questions.filter(q => q.faq === faq.id);
                return (
                    <div key={faq.id} className="card overflow-hidden">
                        {/* Header FAQ — bouton Ajouter visible en permanence */}
                        <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg)] transition-colors">
                            {/* Partie gauche cliquable pour dérouler */}
                            <button
                                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                                className="flex items-center gap-3 flex-1 text-left"
                            >
                                <Badge variant={faq.is_active ? "green" : "slate"}>
                                    {faq.is_active ? d.common.active : d.common.inactive}
                                </Badge>
                                <p className="text-sm font-semibold text-[var(--text)]">{faq.titre}</p>
                                <span className="text-xs text-[var(--text-muted)]">
                                    ({faqQuestions.length} {t.faqCount})
                                </span>
                            </button>

                            {/* Partie droite : bouton Ajouter + chevron */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => openNewQ(faq.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#075E54] border border-[#075E54]/30 hover:bg-[#075E54]/5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Ajouter
                                </button>
                                <button
                                    onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                                    className="p-1"
                                >
                                    {expanded === faq.id
                                        ? <ChevronUp   className="w-4 h-4 text-[var(--text-muted)]" />
                                        : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                                </button>
                            </div>
                        </div>

                        {/* Contenu FAQ déroulé */}
                        {expanded === faq.id && (
                            <div className="px-5 pb-5 space-y-3">
                                {faqQuestions.length === 0 ? (
                                    <p className="text-xs text-[var(--text-muted)] italic py-2">
                                        Aucune question dans cette FAQ.
                                    </p>
                                ) : (
                                    faqQuestions.map(q => (
                                        <div key={q.id} className="bg-[var(--bg)] rounded-xl p-4 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-[var(--text)]">{q.question_fr}</p>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button onClick={() => openEditQ(q)}
                                                        className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)]">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteQ(q.id)}
                                                        className="p-1 rounded hover:bg-red-50 text-red-500">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)]">{q.reponse_fr}</p>
                                            {q.categorie && (
                                                <span className="text-[10px] bg-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                                                    {q.categorie}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Modal question */}
            {showQModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <h2 className="text-base font-black text-[var(--text)]">
                                {editQ ? "Modifier la question" : "Nouvelle question"}
                            </h2>
                            <button onClick={() => setShowQModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--border)]">
                                <X className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">Question (FR) *</label>
                                <textarea rows={2} className="input-base w-full resize-none"
                                    value={qForm.question_fr}
                                    onChange={e => setQForm({ ...qForm, question_fr: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">Réponse (FR) *</label>
                                <textarea rows={3} className="input-base w-full resize-none"
                                    value={qForm.reponse_fr}
                                    onChange={e => setQForm({ ...qForm, reponse_fr: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">Question (EN)</label>
                                <textarea rows={2} className="input-base w-full resize-none"
                                    value={qForm.question_en ?? ""}
                                    onChange={e => setQForm({ ...qForm, question_en: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">Réponse (EN)</label>
                                <textarea rows={3} className="input-base w-full resize-none"
                                    value={qForm.reponse_en ?? ""}
                                    onChange={e => setQForm({ ...qForm, reponse_en: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--text)]">Catégorie</label>
                                <input className="input-base w-full" placeholder="Ex: Horaires, Tarifs..."
                                    value={qForm.categorie ?? ""}
                                    onChange={e => setQForm({ ...qForm, categorie: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowQModal(false)} className="btn-ghost flex-1 text-sm">
                                    {d.common.cancel}
                                </button>
                                <button
                                    onClick={handleSaveQ}
                                    disabled={savingQ || !qForm.question_fr.trim() || !qForm.reponse_fr.trim()}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {savingQ
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
        </div>
    );
}