// src/app/pme/dashboard/_components/ActiveConversations.tsx
"use client";
import { Activity } from "lucide-react";
import type { TenantStats } from "@/types/api";

interface Props {
  stats: TenantStats;
  label: string;
}

export function ActiveConversations({ stats, label }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#075E54]" />
        </div>
        <div>
          <p className="text-2xl font-black text-[#075E54]">{stats.conversations_actives}</p>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
        </div>
      </div>
    </div>
  );
}