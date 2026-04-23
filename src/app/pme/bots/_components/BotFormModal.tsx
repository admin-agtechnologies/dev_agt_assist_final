// src/app/pme/bots/_components/BotFormModal.tsx
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { botsRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CreateBotPayload } from "@/types/api";

// ── Props ─────────────────────────────────────────────────────────────────────
interface BotFormModalProps {
  editId: string | null;
  onClose: () => void;
  onSave: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function BotFormModal({ editId, onClose, onSave }: BotFormModalProps) {
  const { dictionary: d } = useLanguage();
  const t   = d.bots;
  const tf  = t.modal.fields;
  const tm  = t.modal;
  const toast  = useToast();
  const isEdit = !!editId;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateBotPayload>({
    nom:             "",
    message_accueil: "",
    personnalite:    "",
    langues:         ["fr"],
    is_active:       true,
    bot_type:        "whatsapp",
  });

  useEffect(() => {
    if (editId) {
      botsRepository.getById(editId).then(bot => {
        setForm({
          nom:             bot.nom,
          message_accueil: bot.message_accueil,
          personnalite:    bot.personnalite,
          langues:         bot.langues,
          is_active:       bot.is_active,
          bot_type:        bot.bot_type,
          statut:          bot.statut,
        });
      }).catch(() => null);
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await botsRepository.patch(editId!, { ...form });
      } else {
        await botsRepository.create({ ...form });
      }
      toast.success(t.createSuccess);
      onSave();
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-modal border border-[var(--border)] animate-zoom-in max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--bg-card)] z-10">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {isEdit ? tm.editTitle : tm.createTitle}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-4">
          <div>
            <label className="label-base">{tf.name}</label>
            <input className="input-base" required value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label className="label-base">{tf.welcome}</label>
            <textarea className="input-base resize-none" rows={3}
              value={form.message_accueil}
              onChange={e => setForm({ ...form, message_accueil: e.target.value })} />
          </div>
          <div>
            <label className="label-base">{tf.personality}</label>
            <textarea className="input-base resize-none" rows={2}
              value={form.personnalite}
              onChange={e => setForm({ ...form, personnalite: e.target.value })} />
          </div>
          {/* Toggle is_active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={cn("relative w-10 h-6 rounded-full transition-colors",
              form.is_active ? "bg-[#25D366]" : "bg-[var(--border)]")}>
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                form.is_active ? "translate-x-4" : "translate-x-0",
              )} />
            </div>
            <span className="text-sm font-medium text-[var(--text)]">{tf.isActive}</span>
            <input type="checkbox" className="sr-only" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          </label>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3 sticky bottom-0 bg-[var(--bg-card)]">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving && <Spinner className="border-white/30 border-t-white w-3 h-3" />}
            {isEdit ? tm.btnUpdate : tm.btnCreate}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}