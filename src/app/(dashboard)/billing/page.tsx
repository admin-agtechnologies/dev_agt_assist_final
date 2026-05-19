"use client";
// C7 — Remplacement bouton "Imprimer l'historique" par :
//   · Sélecteur mois/année
//   · Bouton "Bilan PDF" filtré sur la période
// Tout le reste est identique à la version précédente

import { useState, useEffect, useCallback } from "react";
import { useAuth }      from "@/contexts/AuthContext";
import { useLanguage }  from "@/contexts/LanguageContext";
import { useToast }     from "@/components/ui/Toast";
import { useRouter }    from "next/navigation";
import {
  subscriptionsRepository,
  walletsRepository,
  plansRepository,
  transactionsRepository,
  billingRepository,
  featuresRepository,
} from "@/repositories";
import { SectionHeader, PageLoader } from "@/components/ui";
import { FileDown } from "lucide-react";
import { generateBillingReportPDF } from "@/lib/pdf/invoice-generator";
import type {
  Subscription,
  Wallet as WalletType,
  Plan,
  Transaction,
} from "@/types/api";
import type { ActiveFeature } from "@/repositories/features.repository";

import { BillingHeader }        from "./components/BillingHeader";
import { PlanList }             from "./components/PlanList";
import { TransactionList }      from "./components/TransactionList";
import { TopUpModal }           from "./components/TopUpModal";
import { ChangePlanModal }      from "./components/ChangePlanModal";
import { QuotaProgressSection } from "@/components/billing/QuotaProgressSection";
import { ROUTES }               from "@/lib/constants";

// ── Helpers période ───────────────────────────────────────────────────────────

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function buildPeriodOptions(): { label: string; value: string }[] {
  const options = [];
  const now     = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ label: `${MOIS[d.getMonth()]} ${d.getFullYear()}`, value: val });
  }
  return options;
}

function filterByPeriod(transactions: Transaction[], period: string): Transaction[] {
  const [year, month] = period.split("-").map(Number);
  return transactions.filter((tr) => {
    const d = new Date(tr.created_at);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PmeBillingPage() {
  const { user } = useAuth();

  const FALLBACK_WALLET: WalletType = {
    id:              "temp-wallet-id",
    entreprise:      "unknown",
    entreprise_name: "Entreprise",
    solde:           0,
    frozen_balance:  0,
    total_balance:   0,
    devise:          "XAF",
    updated_at:      new Date().toISOString(),
  };

  const { dictionary: d } = useLanguage();
  const t                 = d.billing;
  const toast             = useToast();
  const router            = useRouter();

  const [sub,          setSub]          = useState<Subscription | null>(null);
  const [wallet,       setWallet]       = useState<WalletType | null>(null);
  const [plans,        setPlans]        = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [features,     setFeatures]     = useState<ActiveFeature[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [topUpOpen,    setTopUpOpen]    = useState(false);
  const [changePlanId, setChangePlanId] = useState<string | null>(null);
  const [pollingTxnId, setPollingTxnId] = useState<string | null>(null);

  // ── C7 — état sélecteur période ───────────────────────────────────────────
  const periodOptions                         = buildPeriodOptions();
  const [selectedPeriod, setSelectedPeriod]   = useState(periodOptions[0].value);

  const fetchData = useCallback(async () => {
    try {
      const [s, w, p, tr, feat] = await Promise.all([
        subscriptionsRepository.getMine(),
        walletsRepository.getMine().catch(() => null),
        plansRepository.getList(),
        transactionsRepository.getMine().catch(() => []),
        featuresRepository.getActive().catch(() => ({ features: [] })),
      ]);

      setSub(s);
      setPlans(p);
      setFeatures(feat.features ?? []);

      if (!w) {
        console.warn("Portefeuille non trouvé, chargement des données de secours.");
        setWallet(FALLBACK_WALLET);
      } else {
        setWallet(w);
      }

      setTransactions(
        tr.sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (error) {
      console.error("Erreur critique lors du fetch:", error);
      toast.error(d.common.error);
      if (!wallet) setWallet(FALLBACK_WALLET);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, d.common.error, toast]); // eslint-disable-line

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
      } catch { /* continue */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [pollingTxnId, fetchData, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── C7 — handler bilan PDF ────────────────────────────────────────────────
  const handleBilanPDF = () => {
    const periodLabel = periodOptions.find((o) => o.value === selectedPeriod)?.label ?? selectedPeriod;
    const filtered    = filterByPeriod(transactions, selectedPeriod);
    const name        = user?.entreprise?.name ?? wallet?.entreprise_name ?? "Mon entreprise";
    generateBillingReportPDF(filtered, periodLabel, name);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── En-tête page ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionHeader title={t.title} subtitle={t.subtitle} />

        {/* C7 — Sélecteur période + bouton bilan PDF */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-xl px-3 py-2
                       bg-[var(--bg)] text-[var(--text)] focus:outline-none
                       focus:ring-2 focus:ring-[var(--color-primary)]/30"
          >
            {periodOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleBilanPDF}
            className="btn-primary flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Bilan PDF
          </button>
        </div>
      </div>

      {/* ── Wallet + Abonnement ───────────────────────────────────────────── */}
      <BillingHeader
        wallet={wallet}
        sub={sub}
        onTopUp={() => setTopUpOpen(true)}
      />

      {/* ── Consommation modules — C4 S31 ────────────────────────────────── */}
      {features.length > 0 && (
        <QuotaProgressSection features={features} />
      )}

      {/* ── Plans disponibles ─────────────────────────────────────────────── */}
      <PlanList
        plans={plans}
        sub={sub}
        wallet={wallet}
        onSelectPlan={setChangePlanId}
      />

      {/* ── Historique transactions ───────────────────────────────────────── */}
      <TransactionList transactions={transactions} />

      {/* ── Modales ───────────────────────────────────────────────────────── */}
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