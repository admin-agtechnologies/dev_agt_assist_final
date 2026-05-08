// src/app/pme/dashboard/_components/SubscriptionUsage.tsx
"use client";
import Link from "next/link";
import { Zap } from "lucide-react";
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

export function SubscriptionUsage({ subscription, stats, currentPlan, labels }: Props) {
  const msgUsed = stats?.messages_semaine ?? 0;
  const msgTotal = currentPlan?.messages_limit ?? 2000;
  const callsUsed = stats?.appels_aujourdhui ?? 0;
  const callsTotal = currentPlan?.calls_limit ?? 100;

  return (
    <div className="card p-5 space-y-4">
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#075E54]" />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text)]">{currentPlan.name}</p>
              {subscription?.date_renouvellement && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {labels.renewsOn} {formatDate(subscription.date_renouvellement)}
                </p>
              )}
            </div>
            <Link
              href={ROUTES.billing}
              className="ml-auto text-xs text-[#075E54] font-semibold hover:underline"
            >
              {labels.changePlan}
            </Link>
          </div>
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            <UsageBar
              label={labels.usageMessages}
              used={msgUsed}
              total={msgTotal}
              pct={Math.round((msgUsed / msgTotal) * 100)}
              color="#25D366"
            />
            <UsageBar
              label={labels.usageCalls}
              used={callsUsed}
              total={callsTotal}
              pct={Math.round((callsUsed / callsTotal) * 100)}
              color="#6C3CE1"
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">{labels.noSubscription}</p>
      )}
    </div>
  );
}