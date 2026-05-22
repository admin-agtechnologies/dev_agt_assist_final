"use client";
// src/app/(dashboard)/bots/[id]/test/_components/ConversationPanel.tsx
// Panneau droit : 4 accordéons (données, actions, config IA, sessions) + footer.
// S50 : accordéon actions utilise actions_declenchees (AIActionLog réels).

import { useState, useCallback, useEffect } from "react";
import {
  User, Phone, Mail, Zap, ChevronDown, ChevronUp,
  Database, AlertTriangle, Settings, Clock, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { ChatbotConfig } from "@/types/api";
import type { AIConversation, AIActionDeclenchee } from "@/types/api/agent.types";
import { getActionMeta, summarizePayload, getModalType } from "./action-helpers";
import {
  ModalReservation, ModalFAQ, ModalEmail, ModalCommande,
  ModalInscriptionDossier, ModalFinance, ModalConsultation,
  ModalConfigIA,
} from "./ActionModals";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  conversation: AIConversation | null;
  botId: string;
  config: ChatbotConfig | null;
  onConfigSaved: (c: ChatbotConfig) => void;
}

// ── Accordéon générique ───────────────────────────────────────────────────────

function Accordion({ icon, title, badge, defaultOpen = false, children }: {
  icon: React.ReactNode; title: string; badge?: string | number;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg)] transition-colors"
      >
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge !== undefined && badge !== 0 && (
            <span className="text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {open
            ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" />
            : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
        </div>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function ConversationPanel({ conversation, botId, config, onConfigSaved }: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();

  // Modal ouvert
  const [activeAction, setActiveAction] = useState<AIActionDeclenchee | null>(null);
  const [configOpen, setConfigOpen]     = useState(false);

  // Données conversation
  const contexte  = conversation?.contexte ?? {};
  const contact   = (contexte.contact ?? {}) as Record<string, string>;
  const summary   = contexte.summary as string | undefined;
  const iterCount = contexte.iteration_count as number | undefined;
  const actions   = conversation?.actions_declenchees ?? [];
  const hasTransfer = conversation?.statut === "transferee";

  // Config IA — état local pour affichage dans accordéon
  const [savedConfig, setSavedConfig] = useState(config);
  useEffect(() => { setSavedConfig(config); }, [config]);

  const handleConfigSaved = useCallback((c: ChatbotConfig) => {
    setSavedConfig(c);
    onConfigSaved(c);
    toast.success(t.testConfigSaved);
  }, [onConfigSaved, t, toast]);

  // Ouvrir le bon modal selon le type d'action
  const openModal = (action: AIActionDeclenchee) => setActiveAction(action);
  const closeModal = () => setActiveAction(null);
  const modalType = activeAction ? getModalType(activeAction.action_slug) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">

        {/* ── Accordéon 1 : Données collectées ── */}
        <Accordion
          icon={<Database className="w-3 h-3" />}
          title={t.testCollectedData}
          defaultOpen
        >
          {!conversation ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">{t.testSessionsEmpty}</p>
          ) : (
            <div className="space-y-1 pt-1">
              {/* Statut */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)]">Statut</span>
                <Badge variant={conversation.statut === "active" ? "green" : conversation.statut === "transferee" ? "amber" : "slate"}>
                  {conversation.statut === "active" ? "Active" : conversation.statut === "transferee" ? "Transférée" : "Terminée"}
                </Badge>
              </div>
              {/* Contact */}
              {contact.nom && (
                <div className="flex items-center gap-2 text-[12px]">
                  <User className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="font-medium text-[var(--text)]">{contact.nom}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Phone className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text)]">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Mail className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text)]">{contact.email}</span>
                </div>
              )}
              {!contact.nom && !contact.phone && !contact.email && (
                <p className="text-[11px] text-[var(--text-muted)] italic">Aucune donnée collectée pour l&apos;instant.</p>
              )}
              {/* Itération */}
              {iterCount !== undefined && (
                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--text-muted)]">Itération</span>
                  <span className="text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                    {iterCount} message{iterCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {/* Résumé */}
              {summary && (
                <div className="mt-2 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {summary}
                </div>
              )}
              {/* Alerte transfert */}
              {hasTransfer && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">{t.testHandoffAlert}</p>
                </div>
              )}
            </div>
          )}
        </Accordion>

        {/* ── Accordéon 2 : Actions effectuées ── */}
        <Accordion
          icon={<Zap className="w-3 h-3" />}
          title="Actions effectuées"
          badge={actions.length}
          defaultOpen
        >
          {actions.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">
              Aucune action déclenchée pour l&apos;instant.
            </p>
          ) : (
            <div className="pt-1">
              {actions.map(action => {
                const meta  = getActionMeta(action.action_slug);
                const Icon  = meta.icon;
                const summ  = summarizePayload(action.action_slug, action.response_recue);
                const isOk  = action.statut === "succes";
                return (
                  <button
                    key={action.id}
                    onClick={() => openModal(action)}
                    className="w-full flex items-center gap-2 py-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors rounded text-left"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                      isOk ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
                    )}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-medium text-[var(--text)] truncate">{meta.label}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {action.duree_ms && (
                            <span className="text-[9px] text-[var(--text-muted)]">{action.duree_ms}ms</span>
                          )}
                          <span className={cn(
                            "text-[9px] font-bold px-1 py-0.5 rounded-full",
                            isOk ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500",
                          )}>
                            {isOk ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                      {summ && (
                        <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{summ}</p>
                      )}
                    </div>
                    <Eye className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </Accordion>

        {/* ── Accordéon 3 : Configuration IA ── */}
        <Accordion
          icon={<Settings className="w-3 h-3" />}
          title={t.testConfigTitle}
        >
          {savedConfig ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Statut</span>
                <Badge variant={savedConfig.is_deployed ? "green" : "slate"}>
                  {savedConfig.is_deployed ? t.testPublishedBadge : t.testUnpublishedBadge}
                </Badge>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">{t.testConfigTemperature}</span>
                <span className="font-medium text-[var(--text)]">{savedConfig.temperature}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">{t.testConfigMaxTokens}</span>
                <span className="font-medium text-[var(--text)]">{savedConfig.max_tokens.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">Configuration non chargée.</p>
          )}
        </Accordion>

        {/* ── Accordéon 4 : Sessions de test ── */}
        <Accordion
          icon={<Clock className="w-3 h-3" />}
          title="Sessions de test"
          badge={conversation ? 1 : 0}
        >
          <p className="text-[11px] text-[var(--text-muted)] pt-1">
            {conversation ? "1 session active" : "Aucune session en cours."}
          </p>
        </Accordion>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={() => setConfigOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--border)] text-[12px] text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Ajuster la configuration
        </button>
      </div>

      {/* ── Modals actions ── */}
      <ModalReservation       open={modalType === "reservation"}      onClose={closeModal} action={activeAction} />
      <ModalFAQ               open={modalType === "faq"}              onClose={closeModal} action={activeAction} />
      <ModalEmail             open={modalType === "email"}            onClose={closeModal} action={activeAction} />
      <ModalCommande          open={modalType === "commande"}         onClose={closeModal} action={activeAction} />
      <ModalInscriptionDossier open={modalType === "inscription_dossier"} onClose={closeModal} action={activeAction} />
      <ModalFinance           open={modalType === "finance"}          onClose={closeModal} action={activeAction} />
      <ModalConsultation      open={modalType === "consultation"}     onClose={closeModal} action={activeAction} />

      {/* ── Modal config IA ── */}
      <ModalConfigIA
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        config={savedConfig}
        botId={botId}
        onSaved={handleConfigSaved}
      />
    </div>
  );
}