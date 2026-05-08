// src/app/pme/bots/[id]/test/_components/accordion-content/ClientReportBlock.tsx
"use client";
import { User, Phone, AtSign, Zap, Briefcase, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientReport } from "../test.types";

interface ClientReportBlockProps {
  report: ClientReport;
  primaryColor: string;
}

export function ClientReportBlock({ report, primaryColor }: ClientReportBlockProps) {
  const fields: { label: string; value: string | null; icon: React.ReactNode }[] = [
    { label: "Nom",       value: report.name,  icon: <User    className="w-3 h-3" /> },
    { label: "Téléphone", value: report.phone, icon: <Phone   className="w-3 h-3" /> },
    { label: "Email",     value: report.email, icon: <AtSign  className="w-3 h-3" /> },
  ];
  const statusLabel: Record<ClientReport["status"], string> = { idle: "En attente", active: "En cours", closed: "Terminé" };
  const statusColor: Record<ClientReport["status"], string> = {
    idle:   "text-[var(--text-muted)]",
    active: "text-emerald-600 dark:text-emerald-400",
    closed: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Contact</span>
        <span className={cn("text-[10px] font-bold", statusColor[report.status])}>
          ● {statusLabel[report.status]}
        </span>
      </div>
      <div className="space-y-2">
        {fields.map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] flex-shrink-0">{f.icon}</span>
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">{f.label}</span>
            {f.value
              ? <span className="text-xs font-semibold text-[var(--text)] truncate">{f.value}</span>
              : <span className="text-[10px] text-[var(--text-muted)] italic">Non détecté</span>}
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]" />
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Conversation</span>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
          <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">Intention</span>
          {report.intention
            ? <span className="text-xs font-semibold text-[var(--text)]">{report.intention}</span>
            : <span className="text-[10px] text-[var(--text-muted)] italic">Analyse en cours...</span>}
        </div>
        {report.services.length > 0 && (
          <div className="flex items-start gap-2">
            <Briefcase className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">Services</span>
            <div className="flex flex-wrap gap-1">
              {report.services.map(s => (
                <span key={s} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {report.appointmentDate && (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
            <span className="text-[10px] text-[var(--text-muted)] w-14 flex-shrink-0">RDV</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {report.appointmentDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}