"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/ActionCards.tsx
// Cartes inline affichées dans le chat après une action agent réussie.
// S65 — carte orange (infos manquantes) + emojis via i18n + champs enrichis.
// S69 — CardCommande · CardInscription · CardFinance · CardTransfert · ActionBadge.
//        CardReservation et CardEmail : zéro modification.

import {
  CalendarCheck, Mail, AlertTriangle, Eye, CheckCircle2,
  ShoppingCart, GraduationCap, Calculator, ArrowLeftRight,
  Search, Package, Bus, Users, Megaphone, Building2, BookOpen,
  Zap, HelpCircle, UserCheck, PhoneForwarded, FolderOpen,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AIActionDeclenchee } from "@/types/api/agent.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isCardComplete(r: Record<string, string | undefined>): boolean {
  return !!(r.contact_nom && (r.contact_phone || r.contact_email) && r.heure_debut);
}

// ── CardReservation — INCHANGÉE ───────────────────────────────────────────────

export function CardReservation({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  const complete = isCardComplete(r);

  const borderColor  = complete ? "border-emerald-200 dark:border-emerald-700" : "border-amber-200 dark:border-amber-700";
  const bgColor      = complete ? "bg-emerald-50 dark:bg-emerald-900/20"       : "bg-amber-50 dark:bg-amber-900/20";
  const headerBorder = complete ? "border-emerald-200 dark:border-emerald-700" : "border-amber-200 dark:border-amber-700";
  const titleColor   = complete ? "text-emerald-800 dark:text-emerald-200"     : "text-amber-800 dark:text-amber-200";
  const badgeColor   = complete ? "bg-emerald-500/20 text-emerald-500"         : "bg-amber-500/20 text-amber-500";
  const subtitleColor= complete ? "text-emerald-700/70"                        : "text-amber-700/70 dark:text-amber-400/70";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden max-w-[76%] self-start ml-10`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${headerBorder}`}>
        <div>
          <div className={`flex items-center gap-1.5 text-[12px] font-medium ${titleColor}`}>
            <CalendarCheck className="w-3.5 h-3.5 flex-shrink-0" />
            {r.ressource_nom ? `${t.testCardRdvPlanned} — ${r.ressource_nom}` : t.testCardRdvPlanned}
          </div>
          <div className={`text-[9px] ${subtitleColor} mt-0.5 uppercase tracking-wider`}>
            {complete ? t.testCardActionDone : t.testCardInfoMissing}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full ${badgeColor} flex items-center justify-center flex-shrink-0`}>
          {complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        <CardField label={t.testCardContactNom}   value={r.contact_nom}   missing={!r.contact_nom}   missingLabel={t.testCardFieldMissing} />
        <CardField label={t.testCardContactPhone} value={r.contact_phone} missing={!r.contact_phone} missingLabel={t.testCardFieldMissing} />
        {r.contact_email && (
          <CardField label={t.testCardContactEmail} value={r.contact_email} missing={false} missingLabel={t.testCardFieldMissing} />
        )}
        <CardField label={t.testCardDateTime} value={r.heure_debut} missing={!r.heure_debut} missingLabel={t.testCardFieldMissing} />
        {r.ressource_nom && <CardField label={t.testCardResource} value={r.ressource_nom} missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.agence_nom    && <CardField label={t.testCardLocation}  value={r.agence_nom}    missing={false} missingLabel={t.testCardFieldMissing} />}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>
      <button onClick={onClick} className={`w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline ${complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardEmail — INCHANGÉE ─────────────────────────────────────────────────────

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
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-800 dark:text-blue-200 min-w-0">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{(r.subject ?? t.testCardEmailDefaultSubject).slice(0, 35)}</span>
        </div>
        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ml-2">
          {t.testCardEmailSent}
        </span>
      </div>
      {r.to && (
        <p className="text-[10px] text-blue-700/70 dark:text-blue-300/70 px-3 pb-1">
          {t.testCardEmailTo} : {r.to}{r.subject ? ` — "${r.subject.slice(0, 30)}"` : ""}
        </p>
      )}
      <p className="px-3 pb-2.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewEmail}
      </p>
    </button>
  );
}

// ── CardCommande — S69 ────────────────────────────────────────────────────────

export function CardCommande({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  const hasId    = !!r.commande_id;
  const complete = hasId;

  return (
    <div className={`rounded-xl border overflow-hidden max-w-[76%] self-start ml-10 ${
      complete
        ? "border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
        : "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
    }`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        complete ? "border-emerald-200 dark:border-emerald-700" : "border-amber-200 dark:border-amber-700"
      }`}>
        <div>
          <div className={`flex items-center gap-1.5 text-[12px] font-medium ${
            complete ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"
          }`}>
            <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
            Commande créée
          </div>
          <div className={`text-[9px] mt-0.5 uppercase tracking-wider ${
            complete ? "text-emerald-700/70" : "text-amber-700/70 dark:text-amber-400/70"
          }`}>
            {complete ? t.testCardActionDone : t.testCardInfoMissing}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          complete ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
        }`}>
          {complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.numero_commande && (
          <CardField label="N° commande" value={String(r.numero_commande)} missing={false} missingLabel={t.testCardFieldMissing} />
        )}
        {r.nb_items !== undefined && (
          <CardField label="Articles" value={`${String(r.nb_items)} article(s)`} missing={false} missingLabel={t.testCardFieldMissing} />
        )}
        {r.montant_total !== undefined && (
          <CardField label="Total" value={`${String(r.montant_total)} XAF`} missing={false} missingLabel={t.testCardFieldMissing} />
        )}
        {r.statut && (
          <CardField label="Statut" value={String(r.statut)} missing={false} missingLabel={t.testCardFieldMissing} />
        )}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>
      <button onClick={onClick} className={`w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline ${
        complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      }`}>
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardInscription — S69 ─────────────────────────────────────────────────────

export function CardInscription({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  const complete = !!r.inscription_id;

  return (
    <div className={`rounded-xl border overflow-hidden max-w-[76%] self-start ml-10 ${
      complete
        ? "border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
        : "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
    }`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        complete ? "border-emerald-200 dark:border-emerald-700" : "border-amber-200 dark:border-amber-700"
      }`}>
        <div>
          <div className={`flex items-center gap-1.5 text-[12px] font-medium ${
            complete ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"
          }`}>
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
            Inscription créée
          </div>
          <div className={`text-[9px] mt-0.5 uppercase tracking-wider ${
            complete ? "text-emerald-700/70" : "text-amber-700/70 dark:text-amber-400/70"
          }`}>
            {complete ? t.testCardActionDone : t.testCardInfoMissing}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          complete ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
        }`}>
          {complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.filiere  && <CardField label="Filière" value={String(r.filiere)}  missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.niveau   && <CardField label="Niveau"  value={String(r.niveau)}   missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.statut   && <CardField label="Statut"  value={String(r.statut)}   missing={false} missingLabel={t.testCardFieldMissing} />}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>
      <button onClick={onClick} className={`w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline ${
        complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      }`}>
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardFinance — S69 ─────────────────────────────────────────────────────────

export function CardFinance({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;
  const complete = !!(r.mensualite ?? r.simulation_id);

  return (
    <div className={`rounded-xl border overflow-hidden max-w-[76%] self-start ml-10 ${
      complete
        ? "border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20"
        : "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
    }`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        complete ? "border-violet-200 dark:border-violet-700" : "border-amber-200 dark:border-amber-700"
      }`}>
        <div>
          <div className={`flex items-center gap-1.5 text-[12px] font-medium ${
            complete ? "text-violet-800 dark:text-violet-200" : "text-amber-800 dark:text-amber-200"
          }`}>
            <Calculator className="w-3.5 h-3.5 flex-shrink-0" />
            Simulation crédit
          </div>
          <div className={`text-[9px] mt-0.5 uppercase tracking-wider ${
            complete ? "text-violet-700/70" : "text-amber-700/70 dark:text-amber-400/70"
          }`}>
            {complete ? t.testCardActionDone : t.testCardInfoMissing}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          complete ? "bg-violet-500/20 text-violet-500" : "bg-amber-500/20 text-amber-500"
        }`}>
          {complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.montant      && <CardField label="Montant"     value={`${String(r.montant)} XAF`}      missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.mensualite   && <CardField label="Mensualité"  value={`${String(r.mensualite)} XAF`}   missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.duree_mois   && <CardField label="Durée"       value={`${String(r.duree_mois)} mois`}  missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.taux         && <CardField label="Taux"        value={`${String(r.taux)}%`}            missing={false} missingLabel={t.testCardFieldMissing} />}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          {t.testCardTestMode}
        </div>
      </div>
      <button onClick={onClick} className="w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline text-violet-600 dark:text-violet-400">
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── CardTransfert — S69 ───────────────────────────────────────────────────────

export function CardTransfert({ action, onClick }: {
  action: AIActionDeclenchee;
  onClick: () => void;
}) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const r = (action.response_recue ?? {}) as Record<string, string | undefined>;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 overflow-hidden max-w-[76%] self-start ml-10">
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200 dark:border-amber-700">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-amber-800 dark:text-amber-200">
            <ArrowLeftRight className="w-3.5 h-3.5 flex-shrink-0" />
            Transfert humain
          </div>
          <div className="text-[9px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 uppercase tracking-wider">
            {t.testCardActionDone}
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-3 h-3" />
        </div>
      </div>
      <div className="px-3 py-2 space-y-0.5">
        {r.motif         && <CardField label="Motif"   value={String(r.motif)}   missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.statut        && <CardField label="Statut"  value={String(r.statut)}  missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.contact_nom   && <CardField label={t.testCardContactNom}   value={String(r.contact_nom)}   missing={false} missingLabel={t.testCardFieldMissing} />}
        {r.contact_phone && <CardField label={t.testCardContactPhone} value={String(r.contact_phone)} missing={false} missingLabel={t.testCardFieldMissing} />}
      </div>
      <button onClick={onClick} className="w-full text-left px-3 pb-2.5 flex items-center gap-1 text-[10px] hover:underline text-amber-600 dark:text-amber-400">
        <Eye className="w-2.5 h-2.5 flex-shrink-0" />
        {t.testCardViewDetail}
      </button>
    </div>
  );
}

// ── ActionBadge — S69 — pour actions lecture seule (non-cliquable) ────────────

const BADGE_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  search_faq:                  { icon: BookOpen,       label: "FAQ consultée",         color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300" },
  get_menu:                    { icon: Package,        label: "Menu chargé",           color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  list_catalogue_items:        { icon: Package,        label: "Catalogue chargé",      color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_item_detail:             { icon: Package,        label: "Article consulté",      color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_services:                { icon: Zap,            label: "Services consultés",    color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_agences:                 { icon: Building2,      label: "Agences consultées",    color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_trajets:                 { icon: Bus,            label: "Trajets consultés",     color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_commande_statut:         { icon: Search,         label: "Commande suivie",       color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_inscription_statut:      { icon: GraduationCap,  label: "Inscription consultée", color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_dossier_statut:          { icon: FolderOpen,     label: "Dossier consulté",      color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_catalogue_fin:           { icon: Calculator,     label: "Produits financiers",   color: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300" },
  manage_contact:              { icon: Users,          label: "Contact mis à jour",    color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  create_contact:              { icon: UserCheck,      label: "Contact créé",          color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  create_prospect:             { icon: UserCheck,      label: "Prospect capturé",      color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  update_context:              { icon: UserCheck,      label: "Contexte mis à jour",   color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  get_annonces:                { icon: Megaphone,      label: "Annonces consultées",   color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
  pay_en_ligne:                { icon: Calculator,     label: "Paiement initié",       color: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300" },
  init_conversation:           { icon: HelpCircle,     label: "Conversation initiée",  color: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" },
};

export function ActionBadge({ action }: { action: AIActionDeclenchee }) {
  const meta = BADGE_META[action.action_slug];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div className="flex justify-start ml-10">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${meta.color}`}>
        <Icon className="w-2.5 h-2.5 flex-shrink-0" />
        {meta.label}
      </div>
    </div>
  );
}

// ── CardField (interne) ───────────────────────────────────────────────────────

function CardField({
  label, value, missing, missingLabel,
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