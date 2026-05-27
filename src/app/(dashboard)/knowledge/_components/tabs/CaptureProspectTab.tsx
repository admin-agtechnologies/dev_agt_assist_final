// src/app/(dashboard)/knowledge/_components/tabs/CaptureProspectTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Target, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useSector }                        from "@/hooks/useSector";
import { useLanguage }                      from "@/contexts/LanguageContext";
import { useToast }                         from "@/components/ui/Toast";
import { scenarioProspectionRepository }    from "@/repositories/knowledge.repository";
import { KnowledgeCardSkeleton }            from "../KnowledgeSkeleton";
import { cn }                               from "@/lib/utils";
import type {
  ScenarioProspection,
  CreateScenarioProspectionPayload,
  ScenarioDeclencheur,
} from "@/types/api/knowledge.types";

const DECLENCHEUR_KEYS: ScenarioDeclencheur[] = ["premier_message", "mot_cle", "toujours"];

const EMPTY: CreateScenarioProspectionPayload = {
  nom: "", questions: [], declencheur: "premier_message", mots_cles: [], is_active: true,
};

export function CaptureProspectTab() {
  const { theme }                       = useSector();
  const { dictionary: d }               = useLanguage();
  const t                               = d.knowledge.captureProspect;
  const tCommon                         = d.common;
  const toast                           = useToast();
  const [items, setItems]               = useState<ScenarioProspection[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [form, setForm]                 = useState(EMPTY);
  const [saving, startSave]             = useTransition();
  const [questionsRaw, setQuestionsRaw] = useState("");

  useEffect(() => {
    scenarioProspectionRepository.getList()
      .then(setItems)
      .catch(() => toast.error(t.errorLoad))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: keyof CreateScenarioProspectionPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY); setQuestionsRaw(""); setEditId(null); setShowAdd(true);
  };

  const openEdit = (item: ScenarioProspection) => {
    setForm({
      nom:         item.nom,
      questions:   item.questions,
      declencheur: item.declencheur,
      mots_cles:   item.mots_cles,
      is_active:   item.is_active,
    });
    setQuestionsRaw(item.questions.map((q) => `${q.question} → ${q.champ_cible}`).join("\n"));
    setEditId(item.id);
    setShowAdd(true);
  };

  const parseQuestions = (raw: string) =>
    raw.split("\n").filter(Boolean).map((line, i) => {
      const [question, champ_cible] = line.split("→").map((s) => s.trim());
      return { ordre: i + 1, question: question ?? line.trim(), champ_cible: champ_cible ?? "info" };
    });

  const handleSave = () => {
    startSave(async () => {
      const payload = { ...form, questions: parseQuestions(questionsRaw) };
      if (editId) {
        const updated = await scenarioProspectionRepository.patch(editId, payload);
        setItems((prev) => prev.map((x) => (x.id === editId ? updated : x)));
        toast.success(t.updateSuccess);
      } else {
        const created = await scenarioProspectionRepository.create(payload);
        setItems((prev) => [...prev, created]);
        toast.success(t.createSuccess);
      }
      setShowAdd(false);
    });
  };

  const handleDelete = (id: string) => {
    scenarioProspectionRepository.delete(id)
      .then(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
        toast.success(t.deleteSuccess);
      })
      .catch(() => toast.error(t.errorDelete));
  };

  const handleToggle = (item: ScenarioProspection) => {
    scenarioProspectionRepository.patch(item.id, { is_active: !item.is_active })
      .then((updated) => setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x))))
      .catch(() => toast.error(tCommon.error));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <KnowledgeCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {items.length} {items.length !== 1 ? "scénarios" : "scénario"}
        </p>
        {!showAdd && (
          <button type="button" onClick={openAdd}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="w-3 h-3" /> {t.newBtn}
          </button>
        )}
      </div>

      {/* Formulaire ajout/édition */}
      {showAdd && (
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] space-y-4">
          <Row label={t.nomLabel}>
            <input className="input-base" placeholder={t.nomPlaceholder}
              value={form.nom} onChange={set("nom")} />
          </Row>
          <Row label={t.declencheurLabel}>
            <select className="input-base" value={form.declencheur} onChange={set("declencheur")}>
              {DECLENCHEUR_KEYS.map((key) => (
                <option key={key} value={key}>{t.declencheurs[key]}</option>
              ))}
            </select>
          </Row>
          <Row label={t.questionsLabel}>
            <textarea
              className="input-base min-h-[90px] font-mono text-xs"
              placeholder={t.questionsPlaceholder}
              value={questionsRaw}
              onChange={(e) => setQuestionsRaw(e.target.value)}
            />
          </Row>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] text-[var(--text-muted)]">
              <X className="w-4 h-4" /> {tCommon.cancel}
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !form.nom.trim()}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Check className="w-4 h-4" />}
              {tCommon.save}
            </button>
          </div>
        </div>
      )}

      {/* État vide */}
      {items.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
          bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Target className="w-8 h-8 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}
            className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">{item.nom}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t.declencheurs[item.declencheur]}
                  {" · "}
                  {item.questions.length} question{item.questions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => handleToggle(item)}
                  className={cn(
                    "text-[var(--text-muted)] hover:text-[var(--text)]",
                    item.is_active && "text-green-500 hover:text-green-600",
                  )}>
                  {item.is_active
                    ? <ToggleRight className="w-5 h-5" />
                    : <ToggleLeft  className="w-5 h-5" />}
                </button>
                <button type="button" onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}