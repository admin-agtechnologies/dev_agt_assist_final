// ============================================================
// FICHIER : src/app/_components/landing/FeatureCard.tsx
// Card feature individuelle — utilisée dans FeaturesSection.
// ============================================================
"use client";
import { CheckCircle2 } from "lucide-react";

interface FeatureCardProps {
  label:       string;
  accentColor: string;
  variant:     "sector" | "common";
}

export function FeatureCard({ label, accentColor, variant }: FeatureCardProps) {
  if (variant === "sector") {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-200"
        style={{ borderLeftWidth: "3px", borderLeftColor: accentColor }}
      >
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#25D366]" />
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

// END OF FILE: src/app/_components/landing/FeatureCard.tsx