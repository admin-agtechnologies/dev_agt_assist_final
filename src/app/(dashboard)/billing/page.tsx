// src/app/(dashboard)/billing/page.tsx
// Migration de src/app/pme/billing/page.tsx
// Adaptation : useLanguage hook + import direct fr/en au lieu de LanguageContext
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import {
  subscriptionsRepository,
  walletsRepository,
  plansRepository,
  transactionsRepository,
  billingActionsRepository,
} from "@/repositories/commandes.repository";
import { SectionHeader, PageLoader } from "@/components/ui";
import { Printer } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Subscription, Wallet as WalletType, Plan, Transaction } from "@/types/api";
import { fr } from "@/dictionaries/fr";
import { en } from "@/dictionaries/en";
import { ROUTES } from "@/lib/constants";

import { BillingHeader } from "./_components/BillingHeader";
import { PlanList } from "./_components/PlanList";
import { TransactionList } from "./_components/TransactionList";
import { TopUpModal } from "./_components/TopUpModal";
import { ChangePlanModal } from "./_components/ChangePlanModal";

const FALLBACK_WALLET: WalletType = {
  id: "temp-wallet-id",
  entreprise: "unknown",
  entreprise_name: "Entreprise",
  solde: 0,
  frozen_balance: 0,
  total_balance: 0,
  devise: "XAF",
  updated_at: new Date().toISOString(),
};

export default function BillingPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const d = lang === "fr" ? fr : en;
  const t = d.billing;
  const toast = useToast();
  const router = useRouter();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [changePlanId, setChangePlanId] = useState<string | null>(null);
  const [pollingTxnId, setPollingTxnId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [s, w, p, tr] = await Promise.all([
        subscriptionsRepository.getMine(),
        walletsRepository.getMine().catch(() => null),
        plansRepository.getList(),
        transactionsRepository.getMine().catch(() => []),
      ]);
      setSub(s);
      setPlans(p);
      setWallet(w ?? FALLBACK_WALLET);
      setTransactions(
        (tr as Transaction[]).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch {
      toast.error(d.common.error);
      if (!wallet) setWallet(FALLBACK_WALLET);
    } finally {
      setLoading(false);
    }
  }, [d.common.error, toast]); // eslint-disable-line

  // Polling transaction après top-up Mobile Money
  useEffect(() => {
    if (!pollingTxnId) return;
    const interval = setInterval(async () => {
      try {
        const res = await billingActionsRepository.pollTransaction(pollingTxnId) as { is_success: boolean };
        if (res.is_success) {
          toast.success("Paiement validé !");
          setPollingTxnId(null);
          fetchData();
        }
      } catch { /* continue polling */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [pollingTxnId, fetchData, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Historique des Transactions - AGT Assist", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);
    const tableRows = transactions.map((tr) => [
      formatDateTime(tr.created_at), tr.label,
      tr.type === "credit" ? "Crédit" : "Débit",
      tr.service_paiement_nom || "Système",
      tr.reference || "-",
      tr.montant.toLocaleString() + " FCFA",
    ]);
    autoTable(doc, {
      startY: 40,
      head: [["Date", "Description", "Type", "Opérateur", "Référence", "Montant"]],
      body: tableRows,
      theme: "grid",
    });
    doc.save(`facturation-agt-${Date.now()}.pdf`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionHeader title={t.title} subtitle={t.subtitle} />
        <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" /> {t.historyTitle}
        </button>
      </div>

      <BillingHeader wallet={wallet} sub={sub} onTopUp={() => setTopUpOpen(true)} />
      <PlanList plans={plans} sub={sub} wallet={wallet} onSelectPlan={setChangePlanId} />
      <TransactionList transactions={transactions} />

      {topUpOpen && wallet && (
        <TopUpModal
          wallet={wallet}
          onClose={() => setTopUpOpen(false)}
          onSuccess={() => { setTopUpOpen(false); fetchData(); }}
          setPollingTxnId={setPollingTxnId}
        />
      )}
      {changePlanId && sub && wallet && (
        <ChangePlanModal
          plan={plans.find((p) => p.id === changePlanId)!}
          currentSub={sub}
          wallet={wallet}
          tenantId={user?.entreprise?.id ?? ""}
          onClose={() => setChangePlanId(null)}
          onSuccess={() => { setChangePlanId(null); router.push(ROUTES.dashboard); }}
        />
      )}
    </div>
  );
}