// src/app/pme/appointments/components/RdvModal.tsx
"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, Plus, User, Building2 } from "lucide-react";
import { rendezVousRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Agence, Agenda, RendezVous, CreateRendezVousPayload } from "@/types/api";
import { type AppointmentStatus } from "../types";

// ─────────────────────────────────────────────────────────────────────────────

interface RdvModalProps {
  /** Toutes les agences de l'entreprise */
  agences: Agence[];
  /** Tous les agendas de l'entreprise — filtrés dynamiquement selon l'agence choisie */
  agendas: Agenda[];
  /** Agence pré-sélectionnée (celle active en haut de la page, ou "" si aucune) */
  defaultAgenceId: string;
  rdv?: RendezVous | null;
  prefillDate?: Date | null;
  prefillTime?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

type FormState = {
  agenceId: string;
  agenda: string;
  client_nom: string;
  client_telephone: string;
  client_email: string;
  scheduled_at: string;
  notes: string;
  canal: "whatsapp" | "vocal" | "manuel";
  statut: AppointmentStatus;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildDefaultStr(prefillDate?: Date | null, prefillTime?: string | null): string {
  const def = prefillDate ?? new Date();
  return `${def.getFullYear()}-${pad(def.getMonth() + 1)}-${pad(def.getDate())}T${prefillTime ?? "09:00"}`;
}

/** Retourne les agendas appartenant à une agence donnée. */
function agendasPourAgence(agendas: Agenda[], agenceId: string): Agenda[] {
  if (!agenceId) return agendas;
  return agendas.filter((a) => a.agence === agenceId);
}

// ─────────────────────────────────────────────────────────────────────────────

export function RdvModal({
  agences,
  agendas,
  defaultAgenceId,
  rdv,
  prefillDate,
  prefillTime,
  onClose,
  onSaved,
}: RdvModalProps) {
  const { dictionary: d } = useLanguage();
  const toast = useToast();
  const isEdit = !!rdv;

  // Agence initiale : celle du RDV en édition, sinon la pré-sélectionnée, sinon la première
  const initAgenceId = rdv?.agence ?? defaultAgenceId ?? agences[0]?.id ?? "";
  const initAgendas  = agendasPourAgence(agendas, initAgenceId);
  const initAgendaId = rdv?.agenda ?? initAgendas[0]?.id ?? agendas[0]?.id ?? "";

  const [form, setForm] = useState<FormState>({
    agenceId:         initAgenceId,
    agenda:           initAgendaId,
    client_nom:       rdv?.client_nom       ?? "",
    client_telephone: rdv?.client_telephone ?? "",
    client_email:     "",
    scheduled_at:     rdv
      ? rdv.scheduled_at.slice(0, 16)
      : buildDefaultStr(prefillDate, prefillTime),
    notes:  rdv?.notes  ?? "",
    canal:  (rdv?.canal  ?? "manuel") as "whatsapp" | "vocal" | "manuel",
    statut: (rdv?.statut ?? "en_attente") as AppointmentStatus,
  });

  const [saving, setSaving] = useState(false);

  // Agendas filtrés sur l'agence actuellement sélectionnée
  const agencasDispos = agendasPourAgence(agendas, form.agenceId);

  // Changer l'agence → reset de l'agenda sur le premier de la nouvelle agence
  const handleAgenceChange = (newAgenceId: string) => {
    const nextAgendas  = agendasPourAgence(agendas, newAgenceId);
    const nextAgendaId = nextAgendas[0]?.id ?? "";
    setForm({ ...form, agenceId: newAgenceId, agenda: nextAgendaId });
  };

  const ok =
    form.agenceId &&
    form.agenda &&
    form.client_nom.trim().length >= 2 &&
    form.scheduled_at;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    setSaving(true);
    try {
      const payload: CreateRendezVousPayload & { statut?: string } = {
        agenda:           form.agenda,
        agence:           form.agenceId || undefined,
        client_nom:       form.client_nom.trim(),
        client_telephone: form.client_telephone.trim(),
        client_email:     form.client_email.trim() || undefined,
        scheduled_at:     new Date(form.scheduled_at).toISOString(),
        notes:            form.notes.trim(),
        canal:            form.canal,
      };
      if (isEdit && rdv) {
        await rendezVousRepository.patch(rdv.id, { ...payload, statut: form.statut });
      } else {
        await rendezVousRepository.create(payload);
      }
      toast.success(isEdit ? "RDV mis à jour ✓" : "RDV créé ✓");
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { body?: { scheduled_at?: string[] } })?.body?.scheduled_at?.[0];
      toast.error(msg ?? d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="text-base font-black text-[var(--text)]">
            {isEdit ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Agence */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#075E54]" />
              Agence <span className="text-red-500">*</span>
            </label>
            {agences.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">Aucune agence disponible.</p>
            ) : (
              <select
                className="input-base w-full"
                value={form.agenceId}
                onChange={(e) => handleAgenceChange(e.target.value)}
              >
                {agences.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nom}{ag.is_siege ? " (Siège)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Agenda filtré sur l'agence */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">
              Agenda <span className="text-red-500">*</span>
            </label>
            {agencasDispos.length === 0 ? (
              <p className="text-xs text-amber-500 italic">
                Aucun agenda configuré pour cette agence.
              </p>
            ) : (
              <select
                className="input-base w-full"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              >
                {agencasDispos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
            )}
          </div>

          {/* Client */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">
              Nom du client <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input className="input-base w-full pl-9" placeholder="Jean Dupont"
                value={form.client_nom}
                onChange={(e) => setForm({ ...form, client_nom: e.target.value })} />
            </div>
          </div>

          {/* Téléphone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Téléphone</label>
              <input className="input-base w-full" placeholder="+237 6XX XXX XXX"
                value={form.client_telephone}
                onChange={(e) => setForm({ ...form, client_telephone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Email</label>
              <input className="input-base w-full" placeholder="optionnel"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
            </div>
          </div>

          {/* Date & heure */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">
              Date &amp; heure <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" className="input-base w-full"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          </div>

          {/* Canal */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">Canal</label>
            <div className="flex gap-2">
              {(["whatsapp", "vocal", "manuel"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, canal: c })}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all capitalize",
                    form.canal === c
                      ? "border-[#075E54] bg-[#075E54]/5 text-[#075E54]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30",
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Statut (édition uniquement) */}
          {isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Statut</label>
              <select className="input-base w-full" value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value as AppointmentStatus })}>
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmé</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">Notes</label>
            <textarea className="input-base w-full resize-none text-sm" rows={2}
              placeholder="Informations complémentaires…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={saving || !ok}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {saving
                ? <Spinner className="border-white/30 border-t-white w-3 h-3" />
                : isEdit ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {isEdit ? "Enregistrer" : "Créer le RDV"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}