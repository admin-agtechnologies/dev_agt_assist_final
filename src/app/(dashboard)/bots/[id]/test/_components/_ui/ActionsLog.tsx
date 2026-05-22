"use client";
// src/app/(dashboard)/bots/[id]/test/_components/_ui/ActionsLog.tsx
// Liste des actions déclenchées par l'agent : boutons, icônes, badge statut.
// Reçoit un callback onActionClick — la logique des modals reste dans ConversationPanel.

import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIActionDeclenchee } from "@/types/api/agent.types";
import { getActionMeta, summarizePayload } from "../action-helpers";

interface ActionsLogProps {
  actions: AIActionDeclenchee[];
  onActionClick: (action: AIActionDeclenchee) => void;
}

export function ActionsLog({ actions, onActionClick }: ActionsLogProps) {
  if (actions.length === 0) {
    return (
      <p className="text-[11px] text-[var(--text-muted)] italic py-1">
        Aucune action déclenchée pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="pt-1">
      {actions.map(action => {
        const meta = getActionMeta(action.action_slug);
        const Icon = meta.icon;
        const summ = summarizePayload(action.action_slug, action.response_recue);
        const isOk = action.statut === "succes";

        return (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
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
  );
}