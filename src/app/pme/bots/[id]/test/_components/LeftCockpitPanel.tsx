// src/app/pme/bots/[id]/test/_components/LeftCockpitPanel.tsx
"use client";
import { Bot, FileText, Users, Mail, Zap } from "lucide-react";
import type { Bot as BotType, Tenant } from "@/types/api";
import { AccordionBlock } from "./AccordionBlock";
import { ClientReportBlock }   from "./accordion-content/ClientReportBlock";
import { HumanTransferBlock }  from "./accordion-content/HumanTransferBlock";
import { EmailBotBlock }       from "./accordion-content/EmailBotBlock";
import type { ClientReport, HumanTransfer, EmailPhase, LeftPanel, SectorTheme } from "./test.types";

interface LeftCockpitPanelProps {
  bot: BotType;
  tenant: Tenant | null;
  theme: SectorTheme;
  clientReport: ClientReport;
  humanTransfer: HumanTransfer;
  emailStep: EmailPhase | null;
  openPanels: Record<LeftPanel, boolean>;
  highlightPanel: LeftPanel | null;
  onTogglePanel: (panel: LeftPanel) => void;
}

export function LeftCockpitPanel({
  bot, tenant, theme,
  clientReport, humanTransfer, emailStep,
  openPanels, highlightPanel, onTogglePanel,
}: LeftCockpitPanelProps) {
  const reportBadge   = clientReport.status !== "idle" ? "●" : undefined;
  const transferBadge = humanTransfer.triggered ? "!" : undefined;
  const emailBadge    = emailStep ? (emailStep.phase === "sent" ? "✓" : "…") : undefined;

  return (
    <div className="space-y-3">
      {/* ── Infos bot ── */}
      <AccordionBlock
        id="info"
        title={`${tenant?.name ?? "Bot"} — ${theme.name}`}
        icon={<Bot className="w-3.5 h-3.5" />}
        isOpen={openPanels.info}
        onToggle={() => onTogglePanel("info")}
        highlight={highlightPanel === "info"}
        primaryColor={theme.primary}
      >
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base"
              style={{ backgroundColor: theme.primary }}>
              {tenant?.name?.[0] ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text)] truncate">{tenant?.name ?? "—"}</p>
              {tenant?.description && (
                <p className="text-[10px] text-[var(--text-muted)] leading-snug line-clamp-2 mt-0.5">
                  {tenant.description}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-2 space-y-1.5">
            {[
              { label: "Personnalité", value: bot.personnalite },
              { label: "Langues",      value: bot.langues.join(", ").toUpperCase() },
              { label: "WhatsApp",     value: bot.config_whatsapp ?? "—" },
              { label: "IA Vocale",    value: bot.config_voice_ai ?? "—" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">{item.label}</span>
                <span className="text-[10px] font-semibold text-[var(--text)] text-right truncate max-w-[140px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-2 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: theme.primary }} />
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Essayez : &quot;Je veux un RDV&quot;, &quot;Vos services ?&quot;, &quot;Vos horaires ?&quot;,
              &quot;Je veux parler à quelqu&apos;un&quot;
            </p>
          </div>
        </div>
      </AccordionBlock>

      {/* ── Rapport client ── */}
      <AccordionBlock
        id="report"
        title="Rapport client"
        icon={<FileText className="w-3.5 h-3.5" />}
        badge={reportBadge}
        isOpen={openPanels.report}
        onToggle={() => onTogglePanel("report")}
        highlight={highlightPanel === "report"}
        primaryColor={theme.primary}
      >
        <ClientReportBlock report={clientReport} primaryColor={theme.primary} />
      </AccordionBlock>

      {/* ── Transfert humain ── */}
      <AccordionBlock
        id="transfer"
        title="Transfert humain"
        icon={<Users className="w-3.5 h-3.5" />}
        badge={transferBadge}
        badgeColor="#F59E0B"
        isOpen={openPanels.transfer}
        onToggle={() => onTogglePanel("transfer")}
        highlight={highlightPanel === "transfer"}
        primaryColor="#F59E0B"
      >
        <HumanTransferBlock transfer={humanTransfer} />
      </AccordionBlock>

      {/* ── Email bot ── */}
      <AccordionBlock
        id="email"
        title="Email bot"
        icon={<Mail className="w-3.5 h-3.5" />}
        badge={emailBadge}
        badgeColor={emailStep?.phase === "sent" ? "#25D366" : "#3B82F6"}
        isOpen={openPanels.email}
        onToggle={() => onTogglePanel("email")}
        highlight={highlightPanel === "email"}
        primaryColor="#3B82F6"
      >
        <EmailBotBlock emailStep={emailStep} />
      </AccordionBlock>
    </div>
  );
}