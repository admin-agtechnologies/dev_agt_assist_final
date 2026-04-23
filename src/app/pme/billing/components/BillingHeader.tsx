// src/app/pme/billing/components/BillingHeader.tsx
"use client";
import { Wallet, ArrowDownLeft, CalendarDays, Clock } from "lucide-react";
import { Badge, UsageBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Subscription, Wallet as WalletType } from "@/types/api";

interface BillingHeaderProps {
  wallet: WalletType | null;
  sub: Subscription | null;
  onTopUp: () => void;
}

function daysRemaining(dateStr: string): number {
  const fin = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BillingHeader({ wallet, sub, onTopUp }: BillingHeaderProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;

  const msgPct = sub
    ? Math.min(Math.round((sub.usage_messages / (sub.plan?.limite_messages || 1)) * 100), 100)
    : 0;
  const callPct = sub
    ? Math.min(Math.round((sub.usage_appels / (sub.plan?.limite_appels || 1)) * 100), 100)
    : 0;

  const joursRestants = sub?.periode_fin ? daysRemaining(sub.periode_fin) : null;
  const isExpiringSoon = joursRestants !== null && joursRestants <= 7;

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
            {wallet ? formatCurrency(wallet.solde) : "—"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {wallet?.devise ?? "XAF"}
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
              {sub?.plan?.nom ?? "—"}
            </p>
          </div>
          {sub && (
            <Badge variant={sub.statut === "actif" ? "green" : "red"}>
              {sub.statut === "actif" ? t.statusActive : t.statusSuspended}
            </Badge>
          )}
        </div>

        {/* Dates d'abonnement */}
        {sub && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <CalendarDays className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wide">
                  Début
                </p>
                <p className="text-xs font-semibold text-[var(--text)]">
                  {formatDate(sub.periode_debut)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
              isExpiringSoon
                ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                : "bg-[var(--bg)] border-[var(--border)]"
            }`}>
              <Clock className={`w-4 h-4 flex-shrink-0 ${isExpiringSoon ? "text-red-500" : "text-[var(--text-muted)]"}`} />
              <div>
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isExpiringSoon ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                  Expire le
                </p>
                <p className={`text-xs font-semibold ${isExpiringSoon ? "text-red-600" : "text-[var(--text)]"}`}>
                  {formatDate(sub.periode_fin)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Décompte jours restants */}
        {joursRestants !== null && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
            isExpiringSoon
              ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:border-red-800"
              : joursRestants <= 14
              ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20"
              : "bg-[#075E54]/5 text-[#075E54] border border-[#075E54]/20"
          }`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            {joursRestants === 0
              ? "⚠️ Abonnement expiré aujourd'hui"
              : joursRestants === 1
              ? "⚠️ Expire demain"
              : `${joursRestants} jours restants`}
          </div>
        )}

        {/* Barres d'usage */}
        {sub && (
          <div className="space-y-3">
            <UsageBar
              label={t.messagesUsage}
              used={sub.usage_messages}
              total={sub.plan?.limite_messages ?? 0}
              pct={msgPct}
              color="#25D366"
            />
            <UsageBar
              label={t.callsUsage}
              used={sub.usage_appels}
              total={sub.plan?.limite_appels ?? 0}
              pct={callPct}
              color="#6C3CE1"
            />
          </div>
        )}
      </div>
    </div>
  );
}