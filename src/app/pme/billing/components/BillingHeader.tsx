"use client";
import { Wallet, ArrowDownLeft } from "lucide-react";
import { Badge, UsageBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Subscription, Wallet as WalletType } from "@/types/api";

interface BillingHeaderProps {
  wallet: WalletType | null;
  sub: Subscription | null;
  onTopUp: () => void;
}

export function BillingHeader({ wallet, sub, onTopUp }: BillingHeaderProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;

  const msgPct = sub
    ? Math.min(Math.round((sub.messages_used / sub.messages_limit) * 100), 100)
    : 0;
  const callPct = sub
    ? Math.min(Math.round((sub.calls_used / sub.calls_limit) * 100), 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wallet */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-[#075E54]" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            {t.walletBalance}
          </p>
        </div>
        <div>
          <p className="text-4xl font-black text-[#075E54]">
            {wallet ? formatCurrency(wallet.balance) : "—"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {wallet?.currency ?? "XAF"}
          </p>
        </div>
        <button
          onClick={onTopUp}
          className="btn-primary w-full justify-center mt-auto"
        >
          <ArrowDownLeft className="w-4 h-4" /> {t.topUp}
        </button>
      </div>

      {/* Abonnement */}
      <div className="lg:col-span-2 card p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
              {t.currentPlan}
            </p>
            <p className="text-3xl font-black text-[var(--text)]">
              {sub?.plan_name ?? "—"}
            </p>
          </div>
          {sub && (
            <Badge variant={sub.status === "active" ? "green" : "red"}>
              {sub.status === "active" ? t.statusActive : t.statusSuspended}
            </Badge>
          )}
        </div>
        {sub && (
          <div className="space-y-3">
            <UsageBar
              label={t.messagesUsage}
              used={sub.messages_used}
              total={sub.messages_limit}
              pct={msgPct}
              color="#25D366"
            />
            <UsageBar
              label={t.callsUsage}
              used={sub.calls_used}
              total={sub.calls_limit}
              pct={callPct}
              color="#6C3CE1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
