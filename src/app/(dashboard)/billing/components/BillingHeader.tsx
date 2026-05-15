// src/app/(dashboard)/billing/components/BillingHeader.tsx
"use client";
import { Wallet, ArrowDownLeft, CalendarDays, Clock } from "lucide-react";
import { Badge, UsageBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Subscription, Wallet as WalletType } from "@/types/api";
import { useSector } from "@/hooks/useSector";

interface BillingHeaderProps {
  wallet: WalletType | null;
  sub:    Subscription | null;
  onTopUp: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// Calcule le pourcentage d'usage — gère null (illimité) et 0 (absent)
function calcPct(used: number, limite: number | null | undefined): number {
  if (!limite || limite === -1) return 0;
  return Math.min(Math.round((used / limite) * 100), 100);
}

// Retourne true si la fonctionnalité est incluse dans le plan
function isIncluded(limite: number | null | undefined): boolean {
  if (limite === null || limite === undefined) return true;
  if (limite === -1) return true;
  if (limite === 0) return false;
  return true;
}

// Mapping statut → badge
// "green" et "red" sont les variants confirmés du composant Badge.
// Si Badge supporte "yellow", remplacer la variante "suspendu" par "yellow".
type BadgeVariant = "green" | "red";
const STATUT_BADGE: Record<string, { variant: BadgeVariant; labelKey: "statusActive" | "statusSuspended" | "statusCancelled" | "statusNoSubscription" }> = {
  actif:    { variant: "green", labelKey: "statusActive" },
  suspendu: { variant: "red",   labelKey: "statusSuspended" },
  resilie:  { variant: "red",   labelKey: "statusCancelled" },
};

export function BillingHeader({ wallet, sub, onTopUp }: BillingHeaderProps) {
  const { theme }         = useSector();
  const { dictionary: d } = useLanguage();
  const t                 = d.billing;

  const msgPct   = calcPct(sub?.usage_messages ?? 0, sub?.plan?.limite_messages);
  const callPct  = calcPct(sub?.usage_appels   ?? 0, sub?.plan?.limite_appels);
  const rdvPct   = calcPct(sub?.usage_rdv      ?? 0, sub?.plan?.limite_rdv);
  const emailPct = calcPct(sub?.usage_emails   ?? 0, sub?.plan?.limite_emails);

  const joursRestants  = sub?.days_remaining ?? null;
  const isExpiringSoon = joursRestants !== null && joursRestants <= 7;

  const badgeCfg = sub?.statut
    ? (STATUT_BADGE[sub.statut] ?? { variant: "red" as BadgeVariant, labelKey: "statusSuspended" as const })
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Wallet */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}18` }}
          >
            <Wallet className="w-4 h-4" style={{ color: theme.primary }} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            {t.walletBalance}
          </p>
        </div>
        <div>
          <p className="text-4xl font-black" style={{ color: theme.primary }}>
            {wallet ? formatCurrency(wallet.solde) : "—"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {wallet?.devise ?? "XAF"}
          </p>
        </div>
        <button onClick={onTopUp} className="btn-primary w-full justify-center mt-auto">
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
          {badgeCfg && (
            <Badge variant={badgeCfg.variant}>
              {t[badgeCfg.labelKey]}
            </Badge>
          )}
          {!sub && (
            <Badge variant="red">{t.statusNoSubscription}</Badge>
          )}
        </div>

        {/* Dates d'abonnement */}
        {sub && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <CalendarDays className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wide">Début</p>
                <p className="text-xs font-semibold text-[var(--text)]">{formatDate(sub.periode_debut)}</p>
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
            {isIncluded(sub.plan?.limite_messages) && (
              <UsageBar
                label={t.messagesUsage}
                used={sub.usage_messages}
                total={sub.plan?.limite_messages ?? null}
                pct={msgPct}
                color="#25D366"
                unlimited={sub.plan?.limite_messages === null || sub.plan?.limite_messages === -1}
              />
            )}
            {isIncluded(sub.plan?.limite_appels) && (
              <UsageBar
                label={t.callsUsage}
                used={sub.usage_appels}
                total={sub.plan?.limite_appels ?? null}
                pct={callPct}
                color="#6C3CE1"
                unlimited={sub.plan?.limite_appels === null || sub.plan?.limite_appels === -1}
              />
            )}
            {isIncluded(sub.plan?.limite_rdv) && (
              <UsageBar
                label="RDV utilisés"
                used={sub.usage_rdv ?? 0}
                total={sub.plan?.limite_rdv ?? null}
                pct={rdvPct}
                color="#F59E0B"
                unlimited={sub.plan?.limite_rdv === null || sub.plan?.limite_rdv === -1}
              />
            )}
            {isIncluded(sub.plan?.limite_emails) && (
              <UsageBar
                label="Emails utilisés"
                used={sub.usage_emails ?? 0}
                total={sub.plan?.limite_emails ?? null}
                pct={emailPct}
                color="#0EA5E9"
                unlimited={sub.plan?.limite_emails === null || sub.plan?.limite_emails === -1}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}