// src/app/pme/bots/[id]/test/_components/accordion-content/HumanTransferBlock.tsx
"use client";
import { Users, AlertTriangle, User } from "lucide-react";
import type { HumanTransfer } from "../test.types";

interface HumanTransferBlockProps { transfer: HumanTransfer; }

export function HumanTransferBlock({ transfer }: HumanTransferBlockProps) {
  if (!transfer.triggered) return (
    <div className="pt-1 text-center py-4">
      <Users className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
      <p className="text-[10px] text-[var(--text-muted)] italic">Aucun transfert déclenché</p>
    </div>
  );
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Escalade déclenchée</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{transfer.reason}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span>Heure de transfert</span>
        <span className="font-bold text-[var(--text)]">{transfer.at}</span>
      </div>
      <div className="flex items-center gap-2 p-2 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
        <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-[#25D366]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[var(--text)]">Agent disponible</p>
          <p className="text-[9px] text-[var(--text-muted)]">Prise en charge en cours...</p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-[#25D366] animate-pulse flex-shrink-0" />
      </div>
    </div>
  );
}