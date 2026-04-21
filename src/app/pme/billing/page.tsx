"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import {
  subscriptionsRepository,
  walletsRepository,
  plansRepository,
  transactionsRepository,
  billingRepository,
} from "@/repositories";
import { SectionHeader, PageLoader } from "@/components/ui";
import { Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateTime } from "@/lib/utils";
import type {
  Subscription,
  Wallet as WalletType,
  Plan,
  Transaction,
} from "@/types/api";

// Import des composants isolés
import { BillingHeader } from "./components/BillingHeader";
import { PlanList } from "./components/PlanList";
import { TransactionList } from "./components/TransactionList";
import { TopUpModal } from "./components/TopUpModal";
import { ChangePlanModal } from "./components/ChangePlanModal";

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

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [changePlanId, setChangePlanId] = useState<string | null>(null);
  const [pollingTxnId, setPollingTxnId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.tenant_id) return;
    try {
      const [s, w, p, tr] = await Promise.all([
        subscriptionsRepository.getByTenant(user.tenant_id),
        walletsRepository.getByTenant(user.tenant_id),
        plansRepository.getList(),
        transactionsRepository.getByTenant(user.tenant_id),
      ]);
      setSub(s);
      setWallet(w);
      setPlans(p);
      setTransactions(
        tr.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch {
      toast.error(d.common.error);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, d.common.error, toast]);

  // Polling transaction
  useEffect(() => {
    if (!pollingTxnId) return;

    const interval = setInterval(async () => {
      try {
        const res = (await billingRepository.pollTransaction(pollingTxnId)) as {
          is_success: boolean;
        };
        if (res.is_success) {
          toast.success("Paiement validé !");
          setPollingTxnId(null);
          fetchData();
        }
      } catch {
        // En cas d'erreur de polling, on continue d'attendre
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingTxnId, fetchData, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Historique des Transactions - AGT Assist", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);
    const tableRows = transactions.map((tr) => [
      formatDateTime(tr.created_at),
      tr.label,
      tr.type === "credit" ? "Crédit" : "Débit",
      tr.operator || "Système",
      tr.reference || "-",
      tr.amount.toLocaleString() + " FCFA",
    ]);
    autoTable(doc, {
      startY: 40,
      head: [
        ["Date", "Description", "Type", "Opérateur", "Référence", "Montant"],
      ],
      body: tableRows,
      theme: "grid",
    });
    doc.save(`facturation-agt-${new Date().getTime()}.pdf`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionHeader title={t.title} subtitle={t.subtitle} />
        <button
          onClick={handleExportPDF}
          className="btn-primary flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Imprimer l'historique
        </button>
      </div>

      <BillingHeader
        wallet={wallet}
        sub={sub}
        onTopUp={() => setTopUpOpen(true)}
      />

      <PlanList
        plans={plans}
        sub={sub}
        wallet={wallet}
        onSelectPlan={setChangePlanId}
      />

      <TransactionList transactions={transactions} />

      {/* Modales Orchestrées */}
      {topUpOpen && wallet && (
        <TopUpModal
          wallet={wallet}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setTopUpOpen(false)}
          onSuccess={() => {
            setTopUpOpen(false);
            fetchData();
          }}
          setPollingTxnId={setPollingTxnId}
        />
      )}

      {changePlanId && sub && wallet && (
        <ChangePlanModal
          plan={plans.find((p) => p.id === changePlanId)!}
          currentSub={sub}
          wallet={wallet}
          tenantId={user?.tenant_id ?? ""}
          onClose={() => setChangePlanId(null)}
          onSuccess={() => {
            setChangePlanId(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
