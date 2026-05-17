// src/app/(dashboard)/knowledge/_components/agences/AgenceDetailPanel.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { MapPin, Clock, ArrowRightLeft, ChevronDown, ChevronUp, Save, Loader2 } from "lucide-react";
import { useLanguage }       from "@/contexts/LanguageContext";
import { useSector }         from "@/hooks/useSector";
import { useToast }          from "@/components/ui/Toast";
import { agencesRepository } from "@/repositories/agences.repository";
import { HorairesEditor }    from "./HorairesEditor";
import type { AgenceKnowledge, HorairesAgence } from "@/types/api/agence.types";

type Section = "infos" | "horaires" | "transfert" | null;

interface Props {
  agence:    AgenceKnowledge;
  onUpdated: (updated: AgenceKnowledge) => void;
}

function buildForm(a: AgenceKnowledge) {
  return {
    nom:                a.nom,
    email:              a.email,
    phone:              a.phone,
    whatsapp:           a.whatsapp,
    adresse:            a.adresse,
    ville:              a.ville,
    pays:               a.pays,
    whatsapp_transfert: a.whatsapp_transfert,
    phone_transfert:    a.phone_transfert,
    email_transfert:    a.email_transfert,
    message_transfert:  a.message_transfert,
  };
}

export function AgenceDetailPanel({ agence, onUpdated }: Props) {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.agences;
  const toast             = useToast();

  const [openSection, setOpenSection] = useState<Section>("infos");
  const [form, setForm]               = useState(buildForm(agence));
  const [horaires, setHoraires]       = useState<HorairesAgence>(agence.horaires);

  // Reset quand l'agence sélectionnée change
  useEffect(() => {
    setForm(buildForm(agence));
    setHoraires(agence.horaires);
    setOpenSection("infos");
  }, [agence.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [savingInfos,     startInfos]     = useTransition();
  const [savingHoraires,  startHoraires]  = useTransition();
  const [savingTransfert, startTransfert] = useTransition();

  const toggle = (s: Section) => setOpenSection((p) => (p === s ? null : s));
  const set    = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveInfos = () => startInfos(async () => {
    try {
      onUpdated(await agencesRepository.update(agence.id, {
        nom: form.nom, email: form.email, phone: form.phone,
        whatsapp: form.whatsapp, adresse: form.adresse,
        ville: form.ville, pays: form.pays,
      }));
      toast.success(t.saveSuccess);
    } catch { toast.error(t.saveError); }
  });

  const saveHoraires = () => startHoraires(async () => {
    try {
      onUpdated(await agencesRepository.setHoraires(agence.id, horaires));
      toast.success(t.horairesSuccess);
    } catch { toast.error(t.saveError); }
  });

  const saveTransfert = () => startTransfert(async () => {
    try {
      onUpdated(await agencesRepository.update(agence.id, {
        whatsapp_transfert: form.whatsapp_transfert,
        phone_transfert:    form.phone_transfert,
        email_transfert:    form.email_transfert,
        message_transfert:  form.message_transfert,
      }));
      toast.success(t.transfertSuccess);
    } catch { toast.error(t.saveError); }
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
      {/* En-tête de l'agence */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: `2px solid ${theme.primary}` }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text)] truncate">{agence.nom}</h3>
          {agence.ville && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {agence.ville}{agence.pays ? `, ${agence.pays}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {agence.est_siege && (
            <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: theme.primary }}>
              {t.badge_siege}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            agence.est_active ? "bg-green-100 text-green-700" : "bg-[var(--bg)] text-[var(--text-muted)]"
          }`}>
            {agence.est_active ? d.common.active : d.common.inactive}
          </span>
        </div>
      </div>

      {/* Sections accordéon */}
      <div className="divide-y divide-[var(--border)]">
        {/* Coordonnées */}
        <SectionToggle icon={<MapPin className="w-4 h-4" />} label={t.sectionCoords}
          open={openSection === "infos"} onToggle={() => toggle("infos")} />
        {openSection === "infos" && (
          <div className="px-5 py-4 space-y-3">
            <Row label={t.nom}><input className="input-base" value={form.nom} onChange={set("nom")} /></Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label={t.email}><input className="input-base" type="email" value={form.email} onChange={set("email")} /></Row>
              <Row label={t.phone}><input className="input-base" value={form.phone} onChange={set("phone")} /></Row>
            </div>
            <Row label={t.whatsapp}><input className="input-base" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+237..." /></Row>
            <Row label={t.adresse}><input className="input-base" value={form.adresse} onChange={set("adresse")} /></Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label={t.ville}><input className="input-base" value={form.ville} onChange={set("ville")} /></Row>
              <Row label={t.pays}><input className="input-base" value={form.pays} onChange={set("pays")} /></Row>
            </div>
            <SaveBtn loading={savingInfos} onClick={saveInfos} label={d.common.save} />
          </div>
        )}

        {/* Horaires */}
        <SectionToggle icon={<Clock className="w-4 h-4" />} label={t.sectionHoraires}
          open={openSection === "horaires"} onToggle={() => toggle("horaires")} />
        {openSection === "horaires" && (
          <div className="px-5 py-4 space-y-4">
            <HorairesEditor horaires={horaires} onChange={setHoraires} disabled={savingHoraires} />
            <SaveBtn loading={savingHoraires} onClick={saveHoraires} label={d.common.save} />
          </div>
        )}

        {/* Transfert humain */}
        <SectionToggle icon={<ArrowRightLeft className="w-4 h-4" />} label={t.sectionTransfert}
          open={openSection === "transfert"} onToggle={() => toggle("transfert")} />
        {openSection === "transfert" && (
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">{t.transfertHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <Row label={t.whatsappTransfert}><input className="input-base" value={form.whatsapp_transfert} onChange={set("whatsapp_transfert")} placeholder="+237..." /></Row>
              <Row label={t.phoneTransfert}><input className="input-base" value={form.phone_transfert} onChange={set("phone_transfert")} /></Row>
            </div>
            <Row label={t.emailTransfert}><input className="input-base" type="email" value={form.email_transfert} onChange={set("email_transfert")} /></Row>
            <Row label={t.messageTransfert}>
              <textarea className="input-base resize-none" rows={3}
                value={form.message_transfert} onChange={set("message_transfert")}
                placeholder={t.messageTransfertPlaceholder} />
            </Row>
            <SaveBtn loading={savingTransfert} onClick={saveTransfert} label={d.common.save} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composants locaux ────────────────────────────────────────────────

function SectionToggle({ icon, label, open, onToggle }: {
  icon: React.ReactNode; label: string; open: boolean; onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--bg)] transition-colors">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
        <span className="text-[var(--text-muted)]">{icon}</span>{label}
      </div>
      {open
        ? <ChevronUp   className="w-4 h-4 text-[var(--text-muted)]" />
        : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
    </button>
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

function SaveBtn({ loading, onClick, label }: {
  loading: boolean; onClick: () => void; label: string;
}) {
  return (
    <div className="flex justify-end pt-1">
      <button type="button" onClick={onClick} disabled={loading}
        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {label}
      </button>
    </div>
  );
}