// src/app/pme/bots/[id]/test/_components/accordion-content/EmailBotBlock.tsx
"use client";
import { Mail, FileText, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailPhase } from "../test.types";

interface EmailBotBlockProps { emailStep: EmailPhase | null; }

export function EmailBotBlock({ emailStep }: EmailBotBlockProps) {
  if (!emailStep) return (
    <div className="pt-1 text-center py-4">
      <Mail className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
      <p className="text-[10px] text-[var(--text-muted)] italic">En attente d&apos;un événement déclencheur</p>
    </div>
  );

  const steps: { key: EmailPhase["phase"]; label: string; icon: React.ReactNode }[] = [
    { key: "drafting", label: "Rédaction",       icon: <FileText     className="w-3 h-3" /> },
    { key: "preview",  label: "Prévisualisation", icon: <Mail         className="w-3 h-3" /> },
    { key: "sent",     label: "Envoyé",           icon: <CheckCircle  className="w-3 h-3" /> },
  ];
  const currentIdx = steps.findIndex(s => s.key === emailStep.phase);

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                done   ? "bg-[#25D366] text-white" :
                active ? "bg-blue-500 text-white animate-pulse" :
                         "bg-[var(--border)] text-[var(--text-muted)]",
              )}>
                {done   ? <CheckCircle className="w-3 h-3" />
                : active && emailStep.phase === "drafting" ? <Loader2 className="w-3 h-3 animate-spin" />
                : step.icon}
              </div>
              <span className={cn("text-[9px] font-bold truncate",
                done || active ? "text-[var(--text)]" : "text-[var(--text-muted)]")}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 mx-1", done ? "bg-[#25D366]" : "bg-[var(--border)]")} />
              )}
            </div>
          );
        })}
      </div>

      {emailStep.phase === "drafting" && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">Le bot rédige l&apos;email de confirmation...</p>
        </div>
      )}
      {emailStep.phase === "preview" && (
        <div className="space-y-2 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text)] truncate">{emailStep.subject}</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{emailStep.body}</p>
        </div>
      )}
      {emailStep.phase === "sent" && (
        <div className="flex items-center gap-2 p-3 bg-[#25D366]/10 rounded-xl border border-[#25D366]/30">
          <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#25D366]">Email envoyé avec succès</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">À : {emailStep.to}</p>
          </div>
        </div>
      )}
    </div>
  );
}