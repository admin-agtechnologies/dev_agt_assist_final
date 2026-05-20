// src/app/(dashboard)/dashboard/_components/SubscriptionUsage.tsx
"use client";
import Link from "next/link";
import { Zap, Infinity } from "lucide-react";
import { Badge, UsageBar } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Subscription, TenantStats } from "@/types/api";

interface PlanConfig {
  name: string;
  slug: string;
  messages_limit: number;
  calls_limit: number;
}

interface Props {
  subscription: Subscription | null;
  stats: TenantStats | null;
  currentPlan: PlanConfig | null;
  labels: {
    title: string;
    active: string;
    suspended: string;
    renewsOn: string;
    changePlan: string;
    usageMessages: string;
    usageCalls: string;
    noSubscription: string;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * -1 = illimité côté backend (convention AGT).
 * Affiche "∞" dans l'UI au lieu de "-1".
 */
function formatLimit(v: number): string {
  return v === -1 ? "∞" : String(v);
}

/**
 * Calcule le pourcentage d'usage pour la barre de progression.
 * Si la limite est -1 (illimité) → barre pleine à 100 % en vert.
 * Si la limite est 0 (feature absente) → 0 %.
 */
function calcPct(used: number, total: number): number {
  if (total === -1) return 100;
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

/**
 * Couleur de la barre selon le pourcentage.
 * Illimité → vert accent fixe.
 */
function barColor(pct: number, isUnlimited: boolean): string {
  if (isUnlimited) return "#25D366";
  if (pct >= 90) return "#EF4444"; // rouge critique
  if (pct >= 70) return "#F59E0B"; // orange avertissement
  return "#25D366";                 // vert nominal
}

// ── Composant ────────────────────────────────────────────────────────────────

export function SubscriptionUsage({ subscription, stats, currentPlan, labels }: Props) {
  const msgUsed    = stats?.messages_semaine ?? 0;
  const msgTotal   = currentPlan?.messages_limit ?? 2000;
  const callsUsed  = stats?.appels_aujourdhui ?? 0;
  const callsTotal = currentPlan?.calls_limit ?? 100;

  const msgUnlimited   = msgTotal === -1;
  const callsUnlimited = callsTotal === -1;

  const msgPct   = calcPct(msgUsed, msgTotal);
  const callsPct = calcPct(callsUsed, callsTotal);

  return (
    <div className="card p-5 space-y-4">
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text)]">{labels.title}</h2>
        {subscription && (
          <Badge variant={subscription.statut === "actif" ? "green" : "red"}>
            {subscription.statut === "actif" ? labels.active : labels.suspended}
          </Badge>
        )}
      </div>

      {currentPlan ? (
        <>
          {/* ── Nom du plan + date renouvellement ── */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[#075E54]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--text)] truncate">
                {currentPlan.name}
              </p>
              {subscription?.date_renouvellement && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {labels.renewsOn} {formatDate(subscription.date_renouvellement)}
                </p>
              )}
            </div>
            <Link
              href={ROUTES.billing}
              className="ml-auto text-xs text-[#075E54] font-semibold hover:underline flex-shrink-0"
            >
              {labels.changePlan}
            </Link>
          </div>

          {/* ── Barres d'usage ── */}
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">

            {/* Messages */}
            {msgUnlimited ? (
              <UnlimitedRow label={labels.usageMessages} used={msgUsed} />
            ) : (
              <UsageBar
                label={labels.usageMessages}
                used={msgUsed}
                total={msgTotal}
                pct={msgPct}
                color={barColor(msgPct, false)}
              />
            )}

            {/* Appels */}
            {callsUnlimited ? (
              <UnlimitedRow label={labels.usageCalls} used={callsUsed} />
            ) : (
              <UsageBar
                label={labels.usageCalls}
                used={callsUsed}
                total={callsTotal}
                pct={callsPct}
                color={barColor(callsPct, false)}
              />
            )}

          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">{labels.noSubscription}</p>
      )}
    </div>
  );
}

// ── Ligne "illimité" ─────────────────────────────────────────────────────────
// Remplace UsageBar quand la limite est -1 : affiche une barre pleine verte
// avec le badge ∞ au lieu d'un chiffre.

interface UnlimitedRowProps {
  label: string;
  used: number;
}

function UnlimitedRow({ label, used }: UnlimitedRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--text-muted)] font-medium">{label}</span>
        <span className="flex items-center gap-1 font-bold text-[#25D366]">
          <span>{used}</span>
          <span className="text-[var(--text-muted)]">/</span>
          <Infinity size={12} className="text-[#25D366]" />
        </span>
      </div>
      {/* Barre pleine verte — illimité */}
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#25D366] transition-all"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}