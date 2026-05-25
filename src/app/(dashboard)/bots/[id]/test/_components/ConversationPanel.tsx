"use client";
// src/app/(dashboard)/bots/[id]/test/_components/ConversationPanel.tsx
// Panneau droit : 4 accordéons + footer.
// S65 — données collectées toujours visible · sessions 3 max + voir plus
//        · clic session → ConversationModal · callback onLoadSession.
// S68 — ConvModal remplacé par ConversationModal (composant partagé unifié).
// S69 — formatSessionDate() : affiche date + heure (Aujourd'hui / Hier / date courte).

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
import { agentRepository }       from "@/repositories/agent.repository";
import { ConversationModal }     from "@/components/shared/ConversationModal";
import type { ChatbotConfig }    from "@/types/api";
import type { AIConversation, AIActionDeclenchee } from "@/types/api/agent.types";
import type { BotPair }          from "../../../_components/bots.types";
import { getModalType }          from "./action-helpers";
import { PanelAccordion }        from "./_ui/PanelAccordion";
import { ActionsLog }            from "./_ui/ActionsLog";
import { BotConfigSections }     from "../../../_components/tabs/_ui/BotConfigSections";
import {
  ModalReservation, ModalFAQ, ModalEmail, ModalCommande,
  ModalInscriptionDossier, ModalFinance, ModalConsultation,
} from "./modals/ActionModals";
import { ModalConfigIA } from "./modals/SystemModals";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  conversation: AIConversation | null;
  pair:         BotPair;
  config:       ChatbotConfig | null;
  onConfigSaved: (c: ChatbotConfig) => void;
  onLoadSession: (conv: AIConversation) => void;
}

const SESSIONS_VISIBLE = 3;

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

/**
 * S69 — Affiche date + heure intelligemment :
 * - Même jour       → "21:41"
 * - Hier            → "Hier 21:41"
 * - Autre jour      → "23 mai 21:41"
 */
function formatSessionDate(isoDate: string | undefined): string {
  if (!isoDate) return "";
  const date  = new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const now   = new Date();
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const isToday =
    date.getDate()     === now.getDate()     &&
    date.getMonth()    === now.getMonth()    &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return heure;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate()     === yesterday.getDate()     &&
    date.getMonth()    === yesterday.getMonth()    &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Hier ${heure}`;

  const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${dateStr} ${heure}`;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ConversationPanel({
  conversation, pair, config, onConfigSaved, onLoadSession,
}: Props) {
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const toast = useToast();
  const { theme } = useSector();

  const [activeAction, setActiveAction] = useState<AIActionDeclenchee | null>(null);
  const [configOpen,   setConfigOpen]   = useState(false);
  const [modalConv,    setModalConv]    = useState<AIConversation | null>(null);
  const [showAllSess,  setShowAllSess]  = useState(false);

  // Sessions passées
  const [pastSessions,    setPastSessions]    = useState<AIConversation[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const contexte    = conversation?.contexte ?? {};
  const contact     = (contexte.contact ?? {}) as Record<string, string>;
  const summary     = contexte.summary as string | undefined;
  const iterCount   = contexte.iteration_count as number | undefined;
  const actions     = conversation?.actions_declenchees ?? [];
  const hasTransfer = conversation?.statut === "transferee";

  const [savedConfig, setSavedConfig] = useState(config);
  useEffect(() => { setSavedConfig(config); }, [config]);

  // Charger les sessions passées
  const botId = pair.waBot?.id;
  const loadPastSessions = useCallback(async () => {
    if (!botId) return;
    setLoadingSessions(true);
    try {
      const res = await agentRepository.listConversations({ bot_id: botId, mode: "test" });
      const all = (res as { results?: AIConversation[] }).results ?? [];
      const past = conversation
        ? all.filter((s) => s.id !== conversation.id)
        : all;
      setPastSessions(past);
    } catch {
      // silencieux
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

  // Sessions affichées (3 max, ou toutes si "voir plus")
  const sessionsToShow = showAllSess
    ? pastSessions
    : pastSessions.slice(0, SESSIONS_VISIBLE);
  const hasMore = pastSessions.length > SESSIONS_VISIBLE;
  const sessionCount = (conversation ? 1 : 0) + pastSessions.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">

        {/* ── Accordéon 1 : Données collectées — TOUJOURS VISIBLE ── */}
        <PanelAccordion icon={<Database className="w-3 h-3" />} title={t.testCollectedData} defaultOpen>
          <div className="space-y-1 pt-1">
            {conversation && (
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
            )}
            <DataField icon={<User  className="w-3 h-3 text-[var(--text-muted)]" />} value={contact.nom}   label={t.testCardContactNom}   />
            <DataField icon={<Phone className="w-3 h-3 text-[var(--text-muted)]" />} value={contact.phone} label={t.testCardContactPhone} />
            <DataField icon={<Mail  className="w-3 h-3 text-[var(--text-muted)]" />} value={contact.email} label={t.testCardContactEmail} />
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
            {!conversation && !contact.nom && !contact.phone && !contact.email && (
              <p className="text-[11px] text-[var(--text-muted)] italic py-1">{t.testDataEmpty}</p>
            )}
          </div>
        </PanelAccordion>

        {/* ── Accordéon 2 : Actions effectuées ── */}
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
            <BotConfigSections mode="readonly" pair={pair} chatbotConfig={savedConfig} />
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
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] group">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-medium text-[var(--text)] truncate">
                        {getSessionContact(conversation)}
                      </p>
                      {/* S69 — date + heure */}
                      {formatSessionDate(
                        (conversation as unknown as Record<string, string>).updated_at ??
                        (conversation as unknown as Record<string, string>).created_at
                      ) && (
                        <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
                          {formatSessionDate(
                            (conversation as unknown as Record<string, string>).updated_at ??
                            (conversation as unknown as Record<string, string>).created_at
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {getSessionLastMsg(conversation)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[9px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                    <button
                      onClick={() => onLoadSession(conversation)}
                      className="opacity-0 group-hover:opacity-100 text-[9px] px-1.5 py-0.5 rounded text-white transition-all"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {t.testSessionLoadBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* Sessions passées */}
              {sessionsToShow.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] group"
                >
                  <MessageSquare className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-medium text-[var(--text)] truncate">
                        {getSessionContact(s)}
                      </p>
                      {/* S69 — date + heure */}
                      {formatSessionDate(
                        (s as unknown as Record<string, string>).updated_at ??
                        (s as unknown as Record<string, string>).created_at
                      ) && (
                        <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
                          {formatSessionDate(
                            (s as unknown as Record<string, string>).updated_at ??
                            (s as unknown as Record<string, string>).created_at
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {getSessionLastMsg(s)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setModalConv(s)}
                      className="opacity-0 group-hover:opacity-100 text-[9px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] px-1.5 py-0.5 rounded hover:text-[var(--text)] transition-all"
                    >
                      {t.modalSeeChat}
                    </button>
                    <button
                      onClick={() => onLoadSession(s)}
                      className="opacity-0 group-hover:opacity-100 text-[9px] px-1.5 py-0.5 rounded text-white transition-all"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {t.testSessionLoadBtn}
                    </button>
                  </div>
                </div>
              ))}

              {/* Voir plus / moins */}
              {hasMore && (
                <button
                  onClick={() => setShowAllSess(v => !v)}
                  className="w-full text-center text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] py-1 transition-colors"
                >
                  {showAllSess ? t.testSessionSeeLess : `${t.testSessionSeeMore} (${pastSessions.length - SESSIONS_VISIBLE})`}
                </button>
              )}
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

      {/* ── Modal config bot ── */}
      <ModalConfigIA
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        config={savedConfig}
        pair={pair}
        onSaved={handleConfigSaved}
      />

      {/* ── ConversationModal — session passée (composant partagé unifié) ── */}
      {modalConv && (
        <ConversationModal
          conversation={modalConv}
          onClose={() => setModalConv(null)}
          colors={{ primary: theme.primary, accent: theme.primary }}
        />
      )}
    </div>
  );
}

// ── DataField (interne) ───────────────────────────────────────────────────────

function DataField({
  icon, value, label,
}: {
  icon: React.ReactNode;
  value: string | undefined;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] flex-shrink-0">
        {icon}
        {label}
      </span>
      {value ? (
        <span className="text-[12px] font-medium text-[var(--text)] text-right max-w-[160px] truncate">{value}</span>
      ) : (
        <span className="text-[11px] text-[var(--text-muted)] italic">—</span>
      )}
    </div>
  );
}