"use client";
import { Check, Building2, Star, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_ICONS = [Building2, Star, CreditCard];

interface Props {
  labels: string[];
  currentIndex: number;
}

export function OnboardingStepper({ labels, currentIndex }: Props) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {labels.slice(0, 3).map((label, i) => {
        const Icon = STEP_ICONS[i];
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              done ? "bg-[#25D366] text-white" : active ? "bg-[#075E54] text-white" : "bg-[var(--border)] text-[var(--text-muted)]"
            )}>
              {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-xs font-semibold hidden sm:block",
              active ? "text-[var(--text)]" : "text-[var(--text-muted)]"
            )}>
              {label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-[var(--border)] ml-2" />}
          </div>
        );
      })}
    </div>
  );
}