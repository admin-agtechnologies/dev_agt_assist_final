"use client";
// src/app/(dashboard)/bots/[id]/test/_components/ConversationPanel.tsx
// Panneau droit : 4 accordéons (données, actions, config bot, sessions) + footer.
// S59 — accordéon 4 enrichi : charge les sessions passées via AIConversation(mode=test).

import { useState, useCallback, useEffect } from "react";
import {
  User, Phone, Mail, Zap,
  Database, AlertTriangle, Settings, Clock,
  MessageSquare,
} from "lucide-react";
import { Badge }        from "@/components/ui";
import { useToast }     from "@/components/ui/Toast";
import { useLanguage }  from "@/contexts/LanguageContext";
import { useSector }    from "@/hooks/useSector";
import { agentRepository } from "@/repositories/agent.repository";
import type { ChatbotConfig } from "@/types/api";
import type { AIConversation, AIActionDeclenchee } from "@/types/api/agent.types";
import type { BotPair } from "../../../_components/bots.types";
import { getModalType }    from "./action-helpers";
import { PanelAccordion }  from "./_ui/PanelAccordion";
import { ActionsLog }      from "./_ui/ActionsLog";
import { BotConfigSections } from "../../../_components/tabs/_ui/BotConfigSections";
import {
  ModalReservation, ModalFAQ, ModalEmail, ModalCommande,
  ModalInscriptionDossier, ModalFinance, ModalConsultation,
} from "./modals/ActionModals";
import { ModalConfigIA } from "./modals/SystemModals";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  conversation: AIConversation | null;
  /** Paire de bots — nécessaire pour ModalConfigIA (BotConfigSections) */
  pair:         BotPair;
  config:       ChatbotConfig | null;
  onConfigSaved: (c: ChatbotConfig) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSessionContact(conv: AIConversation): string {
  const ctx = (conv.contexte ?? {}) as Record<string, unknown>;
  const contact = ctx.contact as Record<string, string> | undefined;
  const nom = contact?.nom ?? (conv.contact as { nom?: string } | null)?.nom;
  return nom ?? "Client";
}

function getSessionLastMsg(conv: AIConversation): string {
  const msgs = conv.messages ?? [];
  const last = [...msgs].reverse().find(
    (m) => m.role === "user" || m.role === "assistant",
  );
  return last?.contenu?.slice(0, 60) ?? "—";
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ConversationPanel({ conversation, pair, config, onConfigSaved }: Props) {
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const toast = useToast();
  const { theme } = useSector();

  const [activeAction, setActiveAction] = useState<AIActionDeclenchee | null>(null);
  const [configOpen,   setConfigOpen]   = useState(false);

  // Sessions passées (mode=test, bot courant)
  const [pastSessions,     setPastSessions]     = useState<AIConversation[]>([]);
  const [loadingSessions,  setLoadingSessions]  = useState(false);

  const contexte    = conversation?.contexte ?? {};
  const contact     = (contexte.contact ?? {}) as Record<string, string>;
  const summary     = contexte.summary as string | undefined;
  const iterCount   = contexte.iteration_count as number | undefined;
  const actions     = conversation?.actions_declenchees ?? [];
  const hasTransfer = conversation?.statut === "transferee";

  const [savedConfig, setSavedConfig] = useState(config);
  useEffect(() => { setSavedConfig(config); }, [config]);

  // Charger les sessions passées dès qu'on connaît le bot
  const botId = pair.waBot?.id;
  const loadPastSessions = useCallback(async () => {
    if (!botId) return;
    setLoadingSessions(true);
    try {
      const res = await agentRepository.listConversations({ bot_id: botId, mode: "test" });
      const all = (res as { results?: AIConversation[] }).results ?? [];
      // Exclure la session active en cours
      const past = conversation
        ? all.filter((s) => s.id !== conversation.id)
        : all;
      setPastSessions(past);
    } catch {
      // silencieux — non bloquant
    } finally {
      setLoadingSessions(false);
    }
  }, [botId, conversation]);

  useEffect(() => { void loadPastSessions(); }, [loadPastSessions]);

  const handleConfigSaved = useCallback((c: ChatbotConfig) => {
    setSavedConfig(c);
    onConfigSaved(c);
    toast.success(t.testConfigSaved);
  }, [onConfigSaved, t, toast]);

  const modalType = activeAction ? getModalType(activeAction.action_slug) : null;
  const closeModal = () => setActiveAction(null);

  // Nombre de sessions : session active + sessions passées
  const sessionCount = (conversation ? 1 : 0) + pastSessions.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">

        {/* ── Accordéon 1 : Données collectées ── */}
        <PanelAccordion icon={<Database className="w-3 h-3" />} title={t.testCollectedData} defaultOpen>
          {!conversation ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">{t.testSessionsEmpty}</p>
          ) : (
            <div className="space-y-1 pt-1">
              {/* Statut */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)]">Statut</span>
                <Badge variant={
                  conversation.statut === "active"     ? "green" :
                  conversation.statut === "transferee" ? "amber" : "slate"
                }>
                  {conversation.statut === "active"     ? "Active"     :
                   conversation.statut === "transferee" ? "Transférée" : "Terminée"}
                </Badge>
              </div>
              {contact.nom && (
                <div className="flex items-center gap-2 text-[12px]">
                  <User  className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
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
                  <Mail  className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-[var(--text)]">{contact.email}</span>
                </div>
              )}
              {!contact.nom && !contact.phone && !contact.email && (
                <p className="text-[11px] text-[var(--text-muted)] italic">
                  Aucune donnée collectée pour l&apos;instant.
                </p>
              )}
              {iterCount !== undefined && (
                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--text-muted)]">Itération</span>
                  <span className="text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                    {iterCount} message{iterCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {summary && (
                <div className="mt-2 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {summary}
                </div>
              )}
              {hasTransfer && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    {t.testHandoffAlert}
                  </p>
                </div>
              )}
            </div>
          )}
        </PanelAccordion>

        {/* ── Accordéon 2 : Actions déclenchées ── */}
        <PanelAccordion
          icon={<Zap className="w-3 h-3" />}
          title="Actions effectuées"
          badge={actions.length}
          defaultOpen
        >
          <ActionsLog actions={actions} onActionClick={setActiveAction} />
        </PanelAccordion>

        {/* ── Accordéon 3 : Configuration du bot (lecture seule) ── */}
        <PanelAccordion icon={<Settings className="w-3 h-3" />} title={t.configReadonlyTitle}>
          {!savedConfig && !pair.waBot ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">{t.configIANotLoaded}</p>
          ) : (
            <BotConfigSections
              mode="readonly"
              pair={pair}
              chatbotConfig={savedConfig}
            />
          )}
        </PanelAccordion>

        {/* ── Accordéon 4 : Sessions de test ── */}
        <PanelAccordion
          icon={<Clock className="w-3 h-3" />}
          title={t.testSessions}
          badge={sessionCount}
        >
          {loadingSessions ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">Chargement…</p>
          ) : sessionCount === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] italic py-1">{t.testSessionsEmpty}</p>
          ) : (
            <div className="space-y-1.5 pt-1">
              {/* Session active en cours */}
              {conversation && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[var(--text)] truncate">
                      {getSessionContact(conversation)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {getSessionLastMsg(conversation)}
                    </p>
                  </div>
                  <span className="text-[9px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Active
                  </span>
                </div>
              )}
              {/* Sessions passées */}
              {pastSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
                >
                  <MessageSquare className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[var(--text)] truncate">
                      {getSessionContact(s)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {getSessionLastMsg(s)}
                    </p>
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
                    {(s.messages ?? []).filter((m) => m.role === "user" || m.role === "assistant").length} msg
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelAccordion>
      </div>

      {/* ── Footer — bouton Ajuster ── */}
      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={() => setConfigOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-[12px] font-medium transition-all duration-200 hover:opacity-80"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Settings className="w-3.5 h-3.5" />
          {t.configAdjustBtn}
        </button>
      </div>

      {/* ── Modals actions ── */}
      <ModalReservation        open={modalType === "reservation"}          onClose={closeModal} action={activeAction} />
      <ModalFAQ                open={modalType === "faq"}                  onClose={closeModal} action={activeAction} />
      <ModalEmail              open={modalType === "email"}                onClose={closeModal} action={activeAction} />
      <ModalCommande           open={modalType === "commande"}             onClose={closeModal} action={activeAction} />
      <ModalInscriptionDossier open={modalType === "inscription_dossier"} onClose={closeModal} action={activeAction} />
      <ModalFinance            open={modalType === "finance"}              onClose={closeModal} action={activeAction} />
      <ModalConsultation       open={modalType === "consultation"}         onClose={closeModal} action={activeAction} />

      {/* ── Modal config bot enrichie ── */}
      <ModalConfigIA
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        config={savedConfig}
        pair={pair}
        onSaved={handleConfigSaved}
      />
    </div>
  );
}