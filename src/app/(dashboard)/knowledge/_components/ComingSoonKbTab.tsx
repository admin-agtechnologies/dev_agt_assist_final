// src/app/(dashboard)/knowledge/_components/ComingSoonKbTab.tsx
"use client";

import { Clock }        from "lucide-react";
import { useLanguage }  from "@/contexts/LanguageContext";

interface ComingSoonKbTabProps {
  featureName: string;
}

export function ComingSoonKbTab({ featureName }: ComingSoonKbTabProps) {
  const { dictionary: d } = useLanguage();
  const t = d.knowledge.comingSoon;

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center
      bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg)] flex items-center justify-center">
        <Clock className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text)]">{t.title}</p>
        <p className="text-xs text-[var(--text-muted)] max-w-xs">
          {t.subtitle.replace("{feature}", featureName)}
        </p>
      </div>
    </div>
  );
}