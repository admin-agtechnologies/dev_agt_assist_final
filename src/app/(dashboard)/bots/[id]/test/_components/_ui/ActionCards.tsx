"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/ActionCards.tsx
// Cartes inline affichées dans le chat après une action agent réussie.
// S65 — carte orange (infos manquantes) + emojis via i18n + champs enrichis.

import { CalendarCheck, Mail, AlertTriangle, Eye, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AIActionDeclenchee } from "@/types/api/agent.types";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Détermine si la carte est complète (verte) ou incomplète (orange). */
function isCardComplete(r: Record<string, string | undefined>): boolean {
  // Au moins nom + (phone ou email) + heure = complète
  return !!(r.contact_nom && (r.contact_phone || r.contact_email) && r.heure_debut);
}

// ── CardReservation ────────────────────────────────────────────────────────────

export function CardReservation({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  const complete = isCardComplete(r);

  const borderColor = complete
    ? "border-emerald-200 dark:border-emerald-700"
    : "border-amber-200 dark:border-amber-700";
  const bgColor = complete
    ? "bg-emerald-50 dark:bg-emerald-900/20"
    : "bg-amber-50 dark:bg-amber-900/20";
  const headerBorder = complete
    ? "border-emerald-200 dark:border-emerald-700"
    : "border-amber-200 dark:border-amber-700";
  const titleColor = complete
    ? "text-emerald-800 dark:text-emerald-200"
    : "text-amber-800 dark:text-amber-200";
  const badgeColor = complete
    ? "bg-emerald-500/20 text-emerald-500"
    : "bg-amber-500/20 text-amber-500";
  const subtitleColor = complete
    ? "text-emerald-700/70"
    : "text-amber-700/70 dark:text-amber-400/70";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden max-w-[76%] self-start ml-10`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${headerBorder}`}>
        <div>
          <div className={`flex items-center gap-1.5 text-[12px] font-medium ${titleColor}`}>
            <CalendarCheck className="w-3.5 h-3.5 flex-shrink-0" />
            {r.ressource_nom
              ? `${t.testCardRdvPlanned} — ${r.ressource_nom}`
              : t.testCardRdvPlanned}
          </div>
          <div className={`text-[9px] ${subtitleColor} mt-0.5 uppercase tracking-wider`}>
            {complete ? t.testCardActionDone : t.testCardInfoMissing}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full ${badgeColor} flex items-center justify-center flex-shrink-0`}>
          {complete
            ? <CheckCircle2 className="w-3 h-3" />
            : <AlertTriangle className="w-3 h-3" />}
        </div>
      </div>

      {/* Corps — champs */}
      <div className="px-3 py-2 space-y-0.5">
        <CardField
          label={t.testCardContactNom}
          value={r.contact_nom}
          missing={!r.contact_nom}
          missingLabel={t.testCardFieldMissing}
        />
        <CardField
          label={t.testCardContactPhone}
          value={r.contact_phone}
          missing={!r.contact_phone}
          missingLabel={t.testCardFieldMissing}
        />
        {r.contact_email && (
          <CardField
            label={t.testCardContactEmail}
            value={r.contact_email}
            missing={false}
            missingLabel={t.testCardFieldMissing}
          />
        )}
        <CardField
          label={t.testCardDateTime}
          value={r.heure_debut}
          missing={!r.heure_debut}
          missingLabel={t.testCardFieldMissing}
        />
        {r.ressource_nom && (
          <CardField
            label={t.testCardResource}
            value={r.ressource_nom}
            missing={false}
            missingLabel={t.testCardFieldMissing}
          />
        )}
        {r.agence_nom && (
          <CardField
            label={t.testCardLocation}
            value={r.agence_nom}
            missing={false}
            missingLabel={t.testCardFieldMissing}
          />
        )}

        {/* Warning mode test */}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>

      {/* Footer — voir détail */}
      <button
        onClick={onClick}
        className={`w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline ${
          complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
        }`}
      >
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardEmail ──────────────────────────────────────────────────────────────────

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
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-800 dark:text-blue-200 min-w-0">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {(r.subject ?? t.testCardEmailDefaultSubject).slice(0, 35)}
          </span>
        </div>
        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ml-2">
          {t.testCardEmailSent}
        </span>
      </div>

      {/* Destinataire */}
      {r.to && (
        <p className="text-[10px] text-blue-700/70 dark:text-blue-300/70 px-3 pb-1">
          {t.testCardEmailTo} : {r.to}
          {r.subject ? ` — "${r.subject.slice(0, 30)}"` : ""}
        </p>
      )}

      {/* Voir contenu */}
      <p className="px-3 pb-2.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewEmail}
      </p>
    </button>
  );
}

// ── CardField (interne) ───────────────────────────────────────────────────────

function CardField({
  label,
  value,
  missing,
  missingLabel,
}: {
  label: string;
  value: string | undefined;
  missing: boolean;
  missingLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-[var(--text-muted)] flex-shrink-0 min-w-[70px]">{label}</span>
      {missing ? (
        <span className="text-amber-500 dark:text-amber-400 italic">{missingLabel}</span>
      ) : (
        <span className="text-[var(--text)] font-medium truncate">{value}</span>
      )}
    </div>
  );
}