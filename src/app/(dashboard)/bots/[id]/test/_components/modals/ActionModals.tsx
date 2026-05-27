"use client";
// src/app/(dashboard)/bots/[id]/test/_components/modals/ActionModals.tsx
// 7 modals métier déclenchés par les actions agent.
// Primitives partagées → ../_ui/modal-primitives

import { CalendarCheck, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import type { AIActionDeclenchee } from "@/types/api/agent.types";
import { Overlay, ModalHeader, DataRow, StatusBadge } from "../_ui/modal-primitives";

// ── Labels pour ModalConsultation ─────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  get_menu:                  "Menu consulté",
  get_catalogue:             "Catalogue",
  list_catalogue_items:      "Catalogue",
  get_trajets:               "Trajets",
  get_services:              "Services",
  get_agences:               "Agences",
  get_room_types:            "Types de chambres",
  get_specialites:           "Spécialités",
  get_programmes:            "Programmes",
  get_annonces:              "Annonces",
  get_services_publics:      "Services publics",
  get_services_conciergerie: "Conciergerie",
  get_produits_financiers:   "Produits financiers",
  update_context:            "Contexte",
  create_contact:            "Contact collecté",
  capture_prospect:          "Prospect",
  convert_prospect:          "Prospect converti",
  gestion_crm:               "CRM",
  transfer_to_human:         "Transfert humain",
  initiate_payment:          "Paiement",
};

// ── ModalReservation ──────────────────────────────────────────────────────────

export function ModalReservation({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, string | undefined>;
  const complete = action?.statut === "succes";
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Détail — Réservation créée" onClose={onClose} />
      <div className="m-4 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-emerald-200 dark:border-emerald-700">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-800 dark:text-emerald-200">
              <CalendarCheck className="w-4 h-4" /> RDV planifié
            </div>
            <div className="text-[9px] text-emerald-700/70 dark:text-emerald-300/70 mt-0.5 uppercase tracking-wider">
              {complete ? "Action exécutée" : "Infos manquantes"}
            </div>
          </div>
          {complete
            ? <CheckCircle   className="w-5 h-5 text-emerald-500" />
            : <AlertTriangle className="w-5 h-5 text-amber-500" />}
        </div>
        <div className="px-3 py-2 space-y-0.5">
          <DataRow label="👤 Client"    value={r.contact_nom ?? r.nom}     warn={!r.contact_nom && !r.nom} />
          <DataRow label="📞 Téléphone" value={r.contact_phone ?? r.phone} warn={!r.contact_phone && !r.phone} />
          <DataRow label="🕐 Date/heure" value={r.heure_debut ?? r.date}   warn={!r.heure_debut && !r.date} />
          <DataRow label="🔑 Ressource"  value={r.ressource_nom ?? r.type_ressource} />
          <DataRow label="📍 Agence"     value={r.agence_nom} />
          <DataRow label="📝 Notes"      value={r.notes} />
        </div>
        <div className="mx-3 mb-3 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          Mode test — aucun RDV réel enregistré.
        </div>
      </div>
    </Overlay>
  );
}

// ── ModalFAQ ──────────────────────────────────────────────────────────────────

export function ModalFAQ({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const results = ((action?.response_recue?.results ?? []) as Array<{ question?: string; reponse?: string }>);
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Détail — FAQ consultée" onClose={onClose} />
      <div className="mx-4 mt-3 mb-2 text-[10px] text-[var(--text-muted)] bg-[var(--bg)] px-3 py-2 rounded-lg border border-[var(--border)] flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {results.length > 0
          ? `${results.length} question${results.length > 1 ? "s" : ""} traitée${results.length > 1 ? "s" : ""} durant cette session`
          : "Aucun résultat trouvé pour cette requête"}
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2">
        {results.length === 0 && (
          <p className="text-[11px] text-[var(--text-muted)] italic">
            Le bot a cherché dans la FAQ mais n&apos;a rien trouvé de correspondant.
          </p>
        )}
        {results.map((item, i) => (
          <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-start gap-2 px-3 py-2.5 bg-[var(--bg)] text-[12px] font-medium text-[var(--text)]">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              {item.question ?? "Question"}
            </div>
            <div className="flex items-start gap-2 px-3 py-2.5 text-[12px] text-[var(--text-muted)] leading-relaxed">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
              {item.reponse ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </Overlay>
  );
}

// ── ModalEmail ────────────────────────────────────────────────────────────────

export function ModalEmail({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, string | undefined>;
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Contenu de l'email envoyé" onClose={onClose} />
      <div className="px-4 py-3 space-y-3">
        <p className="text-[11px] text-[var(--text-muted)]">
          De : {r.from_email ?? "bot@agt-platform.com"}&nbsp;·&nbsp;À : {r.to ?? r.recipient ?? "—"}
        </p>
        <p className="text-[13px] font-medium text-[var(--text)] pb-2 border-b border-[var(--border)]">
          {r.subject ?? r.sujet ?? "(pas de sujet)"}
        </p>
        <div className="text-[12px] text-[var(--text)] leading-relaxed whitespace-pre-line">
          {r.body ?? r.contenu ?? "(pas de contenu)"}
        </div>
      </div>
    </Overlay>
  );
}

// ── ModalCommande ─────────────────────────────────────────────────────────────

export function ModalCommande({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r     = (action?.response_recue ?? {}) as Record<string, unknown>;
  const items = (r.items ?? []) as Array<{ nom?: string; quantite?: number; prix?: number }>;
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Détail — Commande" onClose={onClose} />
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <StatusBadge statut={action?.statut ?? "succes"} />
          {action?.duree_ms && <span className="text-[10px] text-[var(--text-muted)]">{action.duree_ms} ms</span>}
        </div>
        <DataRow label="Référence" value={String(r.reference ?? r.commande_id ?? "")} />
        <DataRow label="Statut"    value={String(r.statut ?? r.statut_commande ?? "")} />
        <DataRow label="Montant"   value={r.montant_total ? `${r.montant_total} XAF` : undefined} />
        <DataRow label="Client"    value={String(r.contact_nom ?? r.client_nom ?? "")} />
        {items.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Articles</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-[12px]">
                <span className="text-[var(--text)]">{item.nom ?? "Article"}</span>
                <span className="text-[var(--text-muted)]">
                  {item.quantite ? `×${item.quantite}` : ""}{item.prix ? ` · ${item.prix} XAF` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ── ModalInscriptionDossier ───────────────────────────────────────────────────

export function ModalInscriptionDossier({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, string | undefined>;
  const isInscription = action?.action_slug?.includes("inscription");
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title={isInscription ? "Détail — Inscription" : "Détail — Dossier"} onClose={onClose} />
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge statut={action?.statut ?? "succes"} />
        </div>
        <DataRow label="Référence"       value={r.reference} />
        <DataRow label="Statut"          value={r.statut} />
        <DataRow label="Programme"       value={r.programme_nom} />
        <DataRow label="Type"            value={r.type_demande} />
        <DataRow label="Candidat"        value={r.candidat_nom ?? r.nom} />
        <DataRow label="Téléphone"       value={r.phone} />
        <DataRow label="Email"           value={r.email} />
        <DataRow label="Niveau"          value={r.niveau} />
        <DataRow label="Filière"         value={r.filiere} />
        <DataRow label="Prochaine étape" value={r.prochaine_etape} />
      </div>
    </Overlay>
  );
}

// ── ModalFinance ──────────────────────────────────────────────────────────────

export function ModalFinance({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r    = (action?.response_recue ?? {}) as Record<string, unknown>;
  const docs = (r.documents ?? []) as Array<{ nom?: string; statut?: string; fourni?: boolean }>;
  const title = action?.action_slug === "simulate_credit" ? "Simulation de crédit"
    : action?.action_slug?.includes("document")          ? "Documents requis"
    : "Détail financier";
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title={title} onClose={onClose} />
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge statut={action?.statut ?? "succes"} />
        </div>
        <DataRow label="Mensualité"   value={r.mensualite ? `${r.mensualite} XAF/mois` : undefined} />
        <DataRow label="Durée"        value={r.duree_mois ? `${r.duree_mois} mois`      : undefined} />
        <DataRow label="Montant"      value={r.montant    ? `${r.montant} XAF`           : undefined} />
        <DataRow label="Taux"         value={r.taux       ? `${r.taux}%`                 : undefined} />
        <DataRow label="Solde"        value={r.solde      ? `${r.solde} XAF`             : undefined} />
        <DataRow label="Bénéficiaire" value={String(r.beneficiaire ?? "")} />
        <DataRow label="Type produit" value={String(r.type_produit  ?? "")} />
        {docs.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Documents ({docs.length})
            </p>
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-[12px]">
                <span className="text-[var(--text)]">{doc.nom ?? `Document ${i + 1}`}</span>
                <span className={doc.fourni ? "text-emerald-500" : "text-[var(--text-muted)]"}>
                  {doc.fourni ? "✓ Fourni" : doc.statut ?? "En attente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ── ModalConsultation ─────────────────────────────────────────────────────────

export function ModalConsultation({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  if (!action) return null;
  const r    = action.response_recue ?? {};
  const meta = action.action_slug;
  const items = (
    (r.items ?? r.agences ?? r.services ?? r.trajets ??
     r.specialites ?? r.programmes ?? r.produits ?? []) as Array<Record<string, unknown>>
  );
  const count = (r.count ?? r.nb ?? items.length) as number;

  return (
    <Overlay open={open} onClose={onClose} width="w-[400px]">
      <ModalHeader title={`Détail — ${ACTION_LABELS[meta] ?? meta}`} onClose={onClose} />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge statut={action.statut} />
          {count > 0 && (
            <span className="text-[11px] text-[var(--text-muted)]">{count} résultat{count > 1 ? "s" : ""}</span>
          )}
          {action.duree_ms && (
            <span className="text-[10px] text-[var(--text-muted)] ml-auto">{action.duree_ms} ms</span>
          )}
        </div>
        {items.length === 0 && (
          <p className="text-[12px] text-[var(--text-muted)] italic">Aucun élément retourné.</p>
        )}
        {items.slice(0, 8).map((item, i) => (
          <div key={i} className="py-2 border-b border-[var(--border)] last:border-0">
            <p className="text-[12px] font-medium text-[var(--text)]">
              {String(item.nom ?? item.name ?? item.titre ?? item.ville_depart ?? `Élément ${i + 1}`)}
            </p>
            {(item.description ?? item.prix ?? item.adresse ?? item.statut) != null && (
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {[
                  item.description != null ? String(item.description) : null,
                  item.prix        != null ? `${item.prix} XAF`        : null,
                  item.adresse     != null ? String(item.adresse)      : null,
                  item.statut      != null ? String(item.statut)       : null,
                ].filter(Boolean).join(" · ").slice(0, 80)}
              </p>
            )}
          </div>
        ))}
        {items.length > 8 && (
          <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center italic">
            + {items.length - 8} autres éléments
          </p>
        )}
      </div>
    </Overlay>
  );
}