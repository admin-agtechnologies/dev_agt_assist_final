// src/app/pme/dashboard/_components/QuickLinks.tsx
"use client";
import Link from "next/link";
import { Bot, Wrench, CalendarDays, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface Props {
  labels: {
    title: string;
    bots: string;
    services: string;
    appointments: string;
    billing: string;
  };
}

const LINKS = [
  { icon: Bot, key: "bots" as const, href: ROUTES.bots, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
  { icon: Wrench, key: "services" as const, href: ROUTES.services, color: "text-[#6C3CE1]", bg: "bg-[#6C3CE1]/10" },
  { icon: CalendarDays, key: "appointments" as const, href: ROUTES.appointments, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { icon: CreditCard, key: "billing" as const, href: ROUTES.billing, color: "text-[#075E54]", bg: "bg-[#075E54]/10" },
] as const;

export function QuickLinks({ labels }: Props) {
  return (
    <div className="card p-4">
      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
        {labels.title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LINKS.map(({ icon: Icon, key, href, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg)] transition-colors group"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[#075E54] transition-colors">
              {labels[key]}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}