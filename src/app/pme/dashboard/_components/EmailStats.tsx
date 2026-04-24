// src/app/pme/dashboard/_components/EmailStats.tsx
"use client";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import type { TenantStats } from "@/types/api";

interface Props {
  stats: TenantStats | null;
  labels: {
    title: string;
    sentWeek: string;
    opened: string;
    failed: string;
  };
}

export function EmailStats({ stats, labels }: Props) {
  const sent = stats?.email_rappels_semaine ?? 0;
  const opened = stats?.email_rappels_envoyes ?? 0;
  const failed = stats?.email_rappels_echoues ?? 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--text)]">{labels.title}</h2>
        <Mail className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
      <div className="text-center mb-4">
        <p className="text-4xl font-black text-[var(--text)]">{sent}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{labels.sentWeek}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg)] rounded-xl p-3 text-center">
          <CheckCircle className="w-5 h-5 text-[#25D366] mx-auto mb-1" />
          <p className="text-lg font-black text-[var(--text)]">{opened}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{labels.opened}</p>
        </div>
        <div className="bg-[var(--bg)] rounded-xl p-3 text-center">
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-black text-[var(--text)]">{failed}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{labels.failed}</p>
        </div>
      </div>
    </div>
  );
}