"use client";
// src/app/(dashboard)/bots/[id]/test/_components/ActionModals.tsx
// 7 modals métier lisibles : FAQ, Réservation, Email, Commande,
// Inscription/Dossier, Finance, Consultation.
// + Modal Config IA + Modal Vidéo Démo.

import { X, CalendarCheck, CheckCircle, AlertTriangle, HelpCircle, Play } from "lucide-react";
import type { AIActionDeclenchee } from "@/types/api/agent.types";
import type { ChatbotConfig, UpdateChatbotConfigPayload } from "@/types/api";

// ── Helpers internes ──────────────────────────────────────────────────────────

function Overlay({ open, onClose, children, width = "w-[400px]" }: {
  open: boolean; onClose: () => void;
  children: React.ReactNode; width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50"
      onClick={onClose}>
      <div className={`${width} max-h-[560px] overflow-y-auto bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xl`}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-card)] z-10">
      <span className="text-[13px] font-medium text-[var(--text)]">{title}</span>
      <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function DataRow({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 py-1.5 text-[12px]">
      <span className="text-[var(--text-muted)] w-24 flex-shrink-0">{label}</span>
      <span className={warn ? "text-amber-600 dark:text-amber-400 font-medium" : "text-[var(--text)] font-medium"}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ statut }: { statut: AIActionDeclenchee["statut"] }) {
  const ok = statut === "succes";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
         : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    }`}>
      {ok ? "SUCCÈS" : statut.toUpperCase().replace("_", " ")}
    </span>
  );
}

// ── 1. Modal Réservation ──────────────────────────────────────────────────────

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
            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
            : <AlertTriangle className="w-5 h-5 text-amber-500" />}
        </div>
        <div className="px-3 py-2 space-y-0.5">
          <DataRow label="👤 Client"   value={r.contact_nom ?? r.nom} warn={!r.contact_nom && !r.nom} />
          <DataRow label="📞 Téléphone" value={r.contact_phone ?? r.phone} warn={!r.contact_phone && !r.phone} />
          <DataRow label="🕐 Date/heure" value={r.heure_debut ?? r.date} warn={!r.heure_debut && !r.date} />
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

// ── 2. Modal FAQ ──────────────────────────────────────────────────────────────

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

// ── 3. Modal Email ────────────────────────────────────────────────────────────

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

// ── 4. Modal Commande ─────────────────────────────────────────────────────────

export function ModalCommande({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, unknown>;
  const items = (r.items ?? []) as Array<{ nom?: string; quantite?: number; prix?: number }>;
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Détail — Commande" onClose={onClose} />
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <StatusBadge statut={action?.statut ?? "succes"} />
          {action?.duree_ms && <span className="text-[10px] text-[var(--text-muted)]">{action.duree_ms} ms</span>}
        </div>
        <DataRow label="Référence"  value={String(r.reference ?? r.commande_id ?? "")} />
        <DataRow label="Statut"     value={String(r.statut ?? r.statut_commande ?? "")} />
        <DataRow label="Montant"    value={r.montant_total ? `${r.montant_total} XAF` : undefined} />
        <DataRow label="Client"     value={String(r.contact_nom ?? r.client_nom ?? "")} />
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

// ── 5. Modal Inscription / Dossier ────────────────────────────────────────────

export function ModalInscriptionDossier({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, string | undefined>;
  const isInscription = action?.action_slug?.includes("inscription");
  const title = isInscription ? "Détail — Inscription" : "Détail — Dossier";
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title={title} onClose={onClose} />
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge statut={action?.statut ?? "succes"} />
        </div>
        <DataRow label="Référence"   value={r.reference} />
        <DataRow label="Statut"      value={r.statut} />
        <DataRow label="Programme"   value={r.programme_nom} />
        <DataRow label="Type"        value={r.type_demande} />
        <DataRow label="Candidat"    value={r.candidat_nom ?? r.nom} />
        <DataRow label="Téléphone"   value={r.phone} />
        <DataRow label="Email"       value={r.email} />
        <DataRow label="Niveau"      value={r.niveau} />
        <DataRow label="Filière"     value={r.filiere} />
        <DataRow label="Prochaine étape" value={r.prochaine_etape} />
      </div>
    </Overlay>
  );
}

// ── 6. Modal Finance ──────────────────────────────────────────────────────────

export function ModalFinance({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  const r = (action?.response_recue ?? {}) as Record<string, unknown>;
  const docs = (r.documents ?? []) as Array<{ nom?: string; statut?: string; fourni?: boolean }>;
  const title = action?.action_slug === "simulate_credit" ? "Simulation de crédit"
    : action?.action_slug?.includes("document") ? "Documents requis"
    : "Détail financier";
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title={title} onClose={onClose} />
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge statut={action?.statut ?? "succes"} />
        </div>
        <DataRow label="Mensualité"  value={r.mensualite ? `${r.mensualite} XAF/mois` : undefined} />
        <DataRow label="Durée"       value={r.duree_mois ? `${r.duree_mois} mois` : undefined} />
        <DataRow label="Montant"     value={r.montant ? `${r.montant} XAF` : undefined} />
        <DataRow label="Taux"        value={r.taux ? `${r.taux}%` : undefined} />
        <DataRow label="Solde"       value={r.solde ? `${r.solde} XAF` : undefined} />
        <DataRow label="Bénéficiaire" value={String(r.beneficiaire ?? "")} />
        <DataRow label="Type produit" value={String(r.type_produit ?? "")} />
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

// ── 7. Modal Consultation (catalogue, services, agences, etc.) ────────────────

export function ModalConsultation({ open, onClose, action }: {
  open: boolean; onClose: () => void; action: AIActionDeclenchee | null;
}) {
  if (!action) return null;
  const r = action.response_recue ?? {};
  const meta = action.action_slug;

  // Extraire les items si présents (catalogue, agences, services, trajets...)
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
                  item.prix != null ? `${item.prix} XAF` : null,
                  item.adresse != null ? String(item.adresse) : null,
                  item.statut != null ? String(item.statut) : null,
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

// Labels courts pour le titre du modal consultation
const ACTION_LABELS: Record<string, string> = {
  get_menu: "Menu consulté", get_catalogue: "Catalogue",
  list_catalogue_items: "Catalogue", get_trajets: "Trajets",
  get_services: "Services", get_agences: "Agences",
  get_room_types: "Types de chambres", get_specialites: "Spécialités",
  get_programmes: "Programmes", get_annonces: "Annonces",
  get_services_publics: "Services publics", get_services_conciergerie: "Conciergerie",
  get_produits_financiers: "Produits financiers", update_context: "Contexte",
  create_contact: "Contact collecté", capture_prospect: "Prospect",
  convert_prospect: "Prospect converti", gestion_crm: "CRM",
  transfer_to_human: "Transfert humain", initiate_payment: "Paiement",
};

// ── Modal Configuration IA ────────────────────────────────────────────────────

interface ModalConfigProps {
  open: boolean; onClose: () => void;
  config: ChatbotConfig | null;
  botId: string;
  onSaved: (c: ChatbotConfig) => void;
}

export function ModalConfigIA({ open, onClose, config, botId, onSaved }: ModalConfigProps) {
  const [prompt, setPrompt] = React.useState(config?.system_prompt ?? "");
  const [temp, setTemp]     = React.useState(config?.temperature ?? 0.7);
  const [tokens, setTokens] = React.useState(config?.max_tokens ?? 1000);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (config) { setPrompt(config.system_prompt); setTemp(config.temperature); setTokens(config.max_tokens); }
  }, [config?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true);
    try {
      const { chatbotRepository } = await import("@/repositories");
      const payload: UpdateChatbotConfigPayload = { system_prompt: prompt, temperature: temp, max_tokens: tokens };
      const updated = await chatbotRepository.updateChatbotConfig(botId, payload);
      onSaved(updated);
      onClose();
    } catch { /* toast géré par l'appelant */ }
    finally { setSaving(false); }
  };

  return (
    <Overlay open={open} onClose={onClose} width="w-[420px]">
      <ModalHeader title="Configuration du bot" onClose={onClose} />
      <div className="px-4 py-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Prompt système
          </label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
            className="w-full resize-none bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[12px] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
        </div>
        <details className="group">
          <summary className="text-[11px] text-[var(--text-muted)] cursor-pointer list-none flex items-center gap-1.5 hover:text-[var(--text)] transition-colors select-none">
            <span className="transition-transform group-open:rotate-90 inline-block">›</span>
            Paramètres avancés (température, tokens)
          </summary>
          <div className="mt-3 space-y-3 pl-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Température</label>
                <span className="text-[11px] font-bold text-[var(--color-primary)]">{temp.toFixed(1)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.1} value={temp}
                onChange={e => setTemp(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
                <span>0 = déterministe</span><span>1 = créatif</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Tokens max</label>
              <input type="number" min={100} max={4000} step={100} value={tokens}
                onChange={e => setTokens(parseInt(e.target.value, 10))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[12px] text-[var(--text)] focus:outline-none" />
            </div>
          </div>
        </details>
      </div>
      <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
        <button onClick={() => { onClose(); window.location.href = window.location.href.replace("/test", "/configuration"); }}
          className="text-[11px] text-[var(--color-primary)] flex items-center gap-1.5 hover:underline">
          ← Retourner à la configuration du bot
        </button>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="text-[11px] px-3 py-1.5 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
            Annuler
          </button>
          <button onClick={() => void save()} disabled={saving}
            className="text-[11px] px-3 py-1.5 rounded-lg btn-primary disabled:opacity-50">
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Modal Vidéo Démo ──────────────────────────────────────────────────────────

export function ModalVideoDemo({ open, onClose, secteurNom }: {
  open: boolean; onClose: () => void; secteurNom?: string;
}) {
  return (
    <Overlay open={open} onClose={onClose} width="w-[380px]">
      <ModalHeader title="Démo — Assistant Vocal AGT" onClose={onClose} />
      <div className="aspect-video bg-neutral-900 flex flex-col items-center justify-center gap-3 px-5">
        <Play className="w-10 h-10 text-white/30" />
        {secteurNom && (
          <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full">{secteurNom}</span>
        )}
        <p className="text-[11px] text-white/40 text-center leading-relaxed">
          Vidéo de démo adaptée à votre secteur<br />chargée dynamiquement
        </p>
      </div>
      <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
        L&apos;assistant vocal AGT s&apos;adapte à votre secteur, votre catalogue et votre langue.
        Disponible prochainement.
      </div>
    </Overlay>
  );
}

// Import React pour les hooks dans ModalConfigIA
import React from "react";