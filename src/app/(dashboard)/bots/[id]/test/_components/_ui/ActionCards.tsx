"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/ActionCards.tsx
// Cartes inline affichées dans le chat après une action agent réussie.
// Présentation pure — réutilisables par WhatsAppSimulator et VoiceSimulator.

import { CalendarCheck, Mail, AlertTriangle, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AIActionDeclenchee } from "@/types/api/agent.types";

// ── CardReservation ───────────────────────────────────────────────────────────

export function CardReservation({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 overflow-hidden max-w-[76%] self-start ml-10">
      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-200 dark:border-emerald-700">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-800 dark:text-emerald-200">
            <CalendarCheck className="w-3.5 h-3.5" />
            {r.ressource_nom ? `${t.testCardRdvPlanned} — ${r.ressource_nom}` : t.testCardRdvPlanned}
          </div>
          <div className="text-[9px] text-emerald-700/70 mt-0.5 uppercase tracking-wider">
            {t.testCardActionDone}
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-500 text-[11px]">✓</span>
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.contact_nom   && <p className="text-[11px] text-[var(--text)]">👤 {r.contact_nom}</p>}
        {r.contact_phone && <p className="text-[11px] text-[var(--text)]">📞 {r.contact_phone}</p>}
        {r.heure_debut   && <p className="text-[11px] text-[var(--text)]">🕐 {r.heure_debut}</p>}
        {r.agence_nom    && <p className="text-[11px] text-[var(--text)]">📍 {r.agence_nom}</p>}
        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>
      <button
        onClick={onClick}
        className="w-full text-left px-3 pb-2 flex items-center gap-1 text-[10px] text-emerald-600 hover:underline"
      >
        <Eye className="w-2.5 h-2.5" /> {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardEmail ─────────────────────────────────────────────────────────────────

export function CardEmail({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 max-w-[76%] self-start ml-10 text-left hover:opacity-90 transition-opacity overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-800 dark:text-blue-200">
          <Mail className="w-3.5 h-3.5" />
          {(r.subject ?? t.testCardEmailDefaultSubject).slice(0, 35)}
        </div>
        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">
          {t.testCardEmailSent}
        </span>
      </div>
      {r.to && (
        <p className="text-[10px] text-blue-700/70 dark:text-blue-300/70 px-3 pb-1">
          {t.testCardEmailTo} : {r.to}{r.subject ? ` — "${r.subject.slice(0, 30)}"` : ""}
        </p>
      )}
      <p className="px-3 pb-2.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
        <Eye className="w-2.5 h-2.5" /> {t.testCardViewEmail}
      </p>
    </button>
  );
}