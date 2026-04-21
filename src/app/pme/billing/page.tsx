// src/app/pme/billing/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer } from "lucide-react"; // Si tu utilises lucide-react pour les icônes
import {
  subscriptionsRepository, walletsRepository,
  plansRepository, transactionsRepository,
} from "@/repositories";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { Badge, SectionHeader, UsageBar, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import {
  Wallet, CreditCard, Check, ArrowDownLeft, ArrowUpRight,
  X, ChevronRight, AlertCircle, Smartphone,
} from "lucide-react";
import type { Subscription, Wallet as WalletType, Plan, Transaction } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function genReference(operator: string, phone: string): string {
  return `${operator.toUpperCase()}-${phone.replace(/\D/g, "").slice(-9)}-${Date.now()}`;
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function PmeBillingPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.billing;
  const toast = useToast();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // ── Modales ───────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [changePlanId, setChangePlanId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.tenant_id) return;
    startTransition(async () => {
      try {
        const [s, w, p, tr] = await Promise.all([
          subscriptionsRepository.getByTenant(user.tenant_id!),
          walletsRepository.getByTenant(user.tenant_id!),
          plansRepository.getList(),
          transactionsRepository.getByTenant(user.tenant_id!),
        ]);
        setSub(s);
        setWallet(w);
        setPlans(Array.isArray(p) ? p : []);
        setTransactions(tr.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } catch {
        toast.error(d.common.error);
      } finally {
        setLoading(false);
      }
    });
  }, [user?.tenant_id, d.common.error, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const msgPct = sub ? Math.min(Math.round((sub.messages_used / sub.messages_limit) * 100), 100) : 0;
  const callPct = sub ? Math.min(Math.round((sub.calls_used / sub.calls_limit) * 100), 100) : 0;

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 card bg-[var(--bg)]" />)}
    </div>
  );

  const selectedPlan = plans.find(p => p.id === changePlanId) ?? null;
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.text("Historique des Transactions - AGT Assist", 14, 22);

    // Date de génération
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);

    // Préparation des données du tableau
    const tableRows = transactions.map((tr) => [
      formatDateTime(tr.created_at), // Utilisation de ton helper formatDateTime
      tr.label,
      tr.type === 'credit' ? 'Crédit' : 'Débit',
      tr.operator || 'Système',
      tr.reference || '-',
      `${tr.amount.toLocaleString()} FCFA`
    ]);

    // Génération du tableau
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Description', 'Type', 'Opérateur', 'Référence', 'Montant']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [7, 94, 84] }, // Le vert foncé (#075E54) de ton app
      styles: { fontSize: 8 },
    });

    // Téléchargement
    doc.save(`facturation-agt-${new Date().getTime()}.pdf`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* En-tête avec titre à gauche et bouton à droite */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SectionHeader title={t.title} subtitle={t.subtitle} />

          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2 bg-[#075E54] hover:bg-[#05463e] shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer l'historique</span>
          </button>
        </div>

        {/* ── Ligne 1 : Wallet + Abonnement ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Wallet */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#075E54]/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#075E54]" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {t.walletBalance}
                </p>
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-[#075E54]">
                {wallet ? formatCurrency(wallet.balance) : "—"}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{wallet?.currency ?? "XAF"}</p>
            </div>
            <button onClick={() => setTopUpOpen(true)} className="btn-primary w-full justify-center mt-auto">
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
                <p className="text-3xl font-black text-[var(--text)]">{sub?.plan_name ?? "—"}</p>
                {sub && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {t.renewsOn} {new Date(sub.current_period_end).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
              {sub && (
                <Badge variant={
                  sub.status === "active" ? "green" :
                    sub.status === "suspended" ? "red" : "slate"
                }>
                  {sub.status === "active" ? t.statusActive :
                    sub.status === "suspended" ? t.statusSuspended : t.statusCancelled}
                </Badge>
              )}
            </div>

            {sub && (
              <div className="space-y-3">
                <UsageBar
                  label={`${t.messagesUsage} — ${sub.messages_used.toLocaleString()} / ${sub.messages_limit.toLocaleString()}`}
                  used={sub.messages_used} total={sub.messages_limit}
                  pct={msgPct} color="#25D366"
                />
                <UsageBar
                  label={`${t.callsUsage} — ${sub.calls_used} / ${sub.calls_limit}`}
                  used={sub.calls_used} total={sub.calls_limit}
                  pct={callPct} color="#6C3CE1"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.changePlanSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* ── Plans disponibles ───────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-4">{t.availablePlans}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => {
              const isCurrent = sub?.plan_slug === plan.slug;
              const canAfford = wallet ? wallet.balance >= plan.price : false;
              return (
                <div key={plan.id} className={cn(
                  "card p-6 flex flex-col gap-4 transition-all",
                  isCurrent ? "ring-2 ring-[#25D366]" : "hover:shadow-md"
                )}>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t.currentPlanBadge}
                    </span>
                  )}
                  <div>
                    <p className="text-xl font-black text-[var(--text)]">{plan.name}</p>
                    <p className="text-3xl font-black text-[#075E54] mt-1">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-[var(--text-muted)]">{t.monthly}</span>
                    </p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-[var(--text-muted)] flex gap-2">
                        <Check className="w-3 h-3 text-[#25D366] flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && !canAfford && (
                    <p className="text-[10px] text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {t.changePlanInsufficient}
                    </p>
                  )}
                  <button
                    disabled={isCurrent}
                    onClick={() => !isCurrent && setChangePlanId(plan.id)}
                    className={cn(
                      "btn-primary w-full justify-center",
                      isCurrent && "opacity-50 cursor-not-allowed"
                    )}>
                    {isCurrent ? t.currentPlanBadge : (
                      <>{t.changePlan} <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Historique transactions ─────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-4">{t.historyTitle}</h2>
          <div className="card divide-y divide-[var(--border)]">
            {transactions.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-[var(--text-muted)]">{t.historyEmpty}</p>
            ) : (
              transactions.map(tr => (
                <div key={tr.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg)] transition-colors">
                  {/* Icône */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    tr.type === "credit"
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : "bg-red-100 dark:bg-red-900/20 text-red-500"
                  )}>
                    {tr.type === "credit"
                      ? <ArrowDownLeft className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{tr.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDateTime(tr.created_at)}
                      </p>
                      {tr.operator && (
                        <Badge variant={tr.operator === "orange" ? "amber" : "green"}>
                          {tr.operator === "orange" ? t.historyOperatorOrange : t.historyOperatorMtn}
                        </Badge>
                      )}
                      {!tr.operator && (
                        <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">
                          {t.historyOperatorSystem}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {t.historyReference} {tr.reference}
                    </p>
                  </div>

                  {/* Montant */}
                  <p className={cn(
                    "text-base font-black flex-shrink-0",
                    tr.type === "credit" ? "text-[#25D366]" : "text-red-500"
                  )}>
                    {tr.type === "credit" ? "+" : "−"}{formatCurrency(tr.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modale recharge ────────────────────────────────────────────────── */}
      {mounted && topUpOpen && wallet && createPortal(
        <TopUpModal
          wallet={wallet}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setTopUpOpen(false)}
          onSuccess={() => { setTopUpOpen(false); fetchData(); }}
        />,
        document.body
      )}

      {/* ── Modale changement de plan ──────────────────────────────────────── */}
      {mounted && changePlanId && selectedPlan && sub && wallet && createPortal(
        <ChangePlanModal
          plan={selectedPlan}
          currentSub={sub}
          wallet={wallet}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setChangePlanId(null)}
          onSuccess={() => { setChangePlanId(null); fetchData(); }}
        />,
        document.body
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODALE RECHARGE WALLET
// ════════════════════════════════════════════════════════════════════════════
interface TopUpModalProps {
  wallet: WalletType;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function TopUpModal({ wallet, tenantId, onClose, onSuccess }: TopUpModalProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;
  const toast = useToast();
  const [operator, setOperator] = useState<"orange" | "mtn">("orange");
  const [amount, setAmount] = useState<number>(10000);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1000) { toast.error(t.topUpMin); return; }
    setSaving(true);
    try {
      const newBalance = wallet.balance + amount;
      const reference = genReference(operator, phone);
      // 1. Créer la transaction
      await transactionsRepository.create({
        tenant_id: tenantId,
        wallet_id: wallet.id,
        type: "credit",
        amount,
        balance_after: newBalance,
        label: `Recharge ${operator === "orange" ? "Orange Money" : "MTN MoMo"}`,
        operator,
        reference,
      });
      // 2. Mettre à jour le solde wallet
      await walletsRepository.patch(wallet.id, { balance: newBalance });
      toast.success(t.topUpSuccess);
      onSuccess();
    } catch { toast.error(t.topUpError); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] animate-zoom-in">

        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">{t.topUpTitle}</h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-[var(--text-muted)]">{t.topUpSubtitle}</p>

          {/* Choix opérateur */}
          <div>
            <label className="label-base">{t.topUpOperator}</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(["orange", "mtn"] as const).map(op => (
                <button key={op} type="button"
                  onClick={() => setOperator(op)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    operator === op
                      ? op === "orange"
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                        : "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-[var(--border)] hover:border-[var(--text-muted)]"
                  )}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm",
                    op === "orange" ? "bg-orange-500 text-white" : "bg-yellow-400 text-black"
                  )}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {op === "orange" ? t.operatorOrange : t.operatorMtn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Numéro */}
          <div>
            <label className="label-base">{t.topUpPhone}</label>
            <input required className="input-base" placeholder="+237 6XX XXX XXX"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {/* Montant */}
          <div>
            <label className="label-base">{t.topUpAmount}</label>
            <input required type="number" min={1000} step={500} className="input-base"
              value={amount} onChange={e => setAmount(Number(e.target.value))} />
            <p className="text-xs text-[var(--text-muted)] mt-1">{t.topUpMin}</p>
          </div>

          {/* Résumé */}
          <div className="bg-[var(--bg)] rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t.walletBalance}</span>
              <span className="font-semibold text-[var(--text)]">{formatCurrency(wallet.balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">+ Recharge</span>
              <span className="font-semibold text-[#25D366]">+{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--border)] pt-2 mt-1">
              <span className="font-bold text-[var(--text)]">Nouveau solde</span>
              <span className="font-black text-[#075E54]">{formatCurrency(wallet.balance + amount)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {t.topUpBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODALE CHANGEMENT DE PLAN
// ════════════════════════════════════════════════════════════════════════════
interface ChangePlanModalProps {
  plan: Plan;
  currentSub: Subscription;
  wallet: WalletType;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ChangePlanModal({ plan, currentSub, wallet, tenantId, onClose, onSuccess }: ChangePlanModalProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const canAfford = wallet.balance >= plan.price;
  const balanceAfter = wallet.balance - plan.price;

  const handleConfirm = async () => {
    if (!canAfford) { toast.error(t.changePlanInsufficient); return; }
    setSaving(true);
    try {
      const reference = `SUB-${plan.slug.toUpperCase()}-${Date.now()}`;
      // 1. Débiter le wallet
      await walletsRepository.patch(wallet.id, { balance: balanceAfter });
      // 2. Créer la transaction de débit
      await transactionsRepository.create({
        tenant_id: tenantId,
        wallet_id: wallet.id,
        type: "debit",
        amount: plan.price,
        balance_after: balanceAfter,
        label: `Abonnement ${plan.name} — ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
        operator: null,
        reference,
      });
      // 3. Mettre à jour l'abonnement
      await subscriptionsRepository.patch(currentSub.id, {
        plan_name: plan.name,
        plan_slug: plan.slug,
        price: plan.price,
        messages_limit: plan.messages_limit,
        calls_limit: plan.calls_limit,
        status: "active",
      });
      toast.success(t.changePlanSuccess);
      onSuccess();
    } catch { toast.error(t.changePlanError); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] animate-zoom-in">

        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">{t.changePlanTitle}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Plans actuel → nouveau */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[var(--bg)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">{t.changePlanCurrent}</p>
              <p className="text-lg font-black text-[var(--text)]">{currentSub.plan_name}</p>
              <p className="text-sm text-[var(--text-muted)]">{formatCurrency(currentSub.price)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
            <div className="flex-1 bg-[#25D366]/10 border-2 border-[#25D366] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#25D366] mb-1">{t.changePlanNew}</p>
              <p className="text-lg font-black text-[var(--text)]">{plan.name}</p>
              <p className="text-sm font-bold text-[#075E54]">{formatCurrency(plan.price)}</p>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-[var(--bg)] rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t.changePlanBalance}</span>
              <span className="font-semibold text-[var(--text)]">{formatCurrency(wallet.balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t.changePlanCost}</span>
              <span className="font-semibold text-red-500">−{formatCurrency(plan.price)}</span>
            </div>
            <div className={cn(
              "flex justify-between text-sm border-t border-[var(--border)] pt-2 mt-1"
            )}>
              <span className="font-bold text-[var(--text)]">{t.changePlanAfter}</span>
              <span className={cn(
                "font-black",
                canAfford ? "text-[#075E54]" : "text-red-500"
              )}>
                {formatCurrency(balanceAfter)}
              </span>
            </div>
          </div>

          {/* Alerte solde insuffisant */}
          {!canAfford && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{t.changePlanInsufficient}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button onClick={handleConfirm} disabled={saving || !canAfford}
            className={cn("btn-primary", !canAfford && "opacity-50 cursor-not-allowed")}>
            {saving && <Spinner className="border-white/30 border-t-white" />}
            <CreditCard className="w-4 h-4" /> {t.changePlanConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}