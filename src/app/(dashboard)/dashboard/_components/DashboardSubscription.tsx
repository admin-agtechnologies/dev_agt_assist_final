"use client";
// src/app/(dashboard)/dashboard/_components/DashboardSubscription.tsx
// Bloc abonnement enrichi — plan + statut + barres de progression quota.
// Inspiré du pattern billing/page.tsx existant.
// S63 — création.

import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn }          from "@/lib/utils";
import type { Subscription } from "@/types/api";

// ── Barre de progression quota ────────────────────────────────────────────────

interface QuotaBarProps {
  label:   string;
  used:    number;
  limit:   number | null; // null = illimité
  primary: string;
}

function QuotaBar({ label, used, limit, primary }: QuotaBarProps) {
  if (limit === null || limit === -1) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold text-[var(--text)]">{used} / ∞</span>
      </div>
    );
  }

  const pct   = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : primary;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold text-[var(--text)]">{used} / {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sub: Subscription | null;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function DashboardSubscription({ sub }: Props) {
  const { theme }   = useSector();
  const { locale }  = useLanguage();
  const primary     = theme?.primary ?? "var(--color-primary)";

  const labels = {
    title:        locale === "fr" ? "Mon abonnement"     : "My subscription",
    noSub:        locale === "fr" ? "Aucun abonnement"   : "No subscription",
    active:       locale === "fr" ? "Actif"              : "Active",
    suspended:    locale === "fr" ? "Suspendu"           : "Suspended",
    renewsOn:     locale === "fr" ? "Renouvellement"     : "Renews on",
    messages:     locale === "fr" ? "Messages"           : "Messages",
    manage:       locale === "fr" ? "Gérer"              : "Manage",
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${primary}18`, color: primary }}
          >
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            {labels.title}
          </p>
        </div>
        <Link
          href="/billing"
          className="flex items-center gap-1 text-[10px] font-bold hover:opacity-75 transition-opacity"
          style={{ color: primary }}
        >
          {labels.manage}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!sub ? (
        <p className="text-sm text-[var(--text-muted)]">{labels.noSub}</p>
      ) : (
        <div className="space-y-3">

          {/* Plan + statut */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text)]">
              {sub.plan?.nom ?? "—"}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
              )}
              style={{
                background: sub.statut === "actif"
                  ? "var(--status-success-bg)"
                  : "var(--status-amber-bg)",
                color: sub.statut === "actif"
                  ? "var(--status-success-text)"
                  : "var(--status-amber-text)",
              }}
            >
              {sub.statut === "actif" ? labels.active : labels.suspended}
            </span>
          </div>

          {/* Date renouvellement */}
          {sub.periode_fin && (
            <p className="text-xs text-[var(--text-muted)]">
              {labels.renewsOn} : {new Date(sub.periode_fin).toLocaleDateString(locale)}
            </p>
          )}

          {/* Barres de progression */}
          <div className="space-y-2 pt-1">
            <QuotaBar
              label={labels.messages}
              used={sub.usage_messages ?? 0}
              limit={sub.plan?.limite_messages ?? null}
              primary={primary}
            />
          </div>

        </div>
      )}
    </div>
  );
}