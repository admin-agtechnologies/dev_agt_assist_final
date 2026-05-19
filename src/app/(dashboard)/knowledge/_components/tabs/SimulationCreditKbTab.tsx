// src/app/(dashboard)/knowledge/_components/tabs/SimulationCreditKbTab.tsx
"use client";

import { Calculator, Info, CheckCircle } from "lucide-react";
import { useSector } from "@/hooks/useSector";

export function SimulationCreditKbTab() {
  const { theme } = useSector();
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="h-20 flex items-center px-6 gap-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}35)` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}25` }}>
            <Calculator className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div>
            <p className="font-bold text-[var(--text)]">Simulation Crédit</p>
            <p className="text-xs text-[var(--text-muted)]">Calcul automatique par le bot depuis vos produits financiers</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            Prochaine session
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Aucune configuration requise ici
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                Le bot calcule les simulations automatiquement à partir de vos
                <strong> Produits financiers</strong> (taux, montants min/max, conditions).
                Configurez vos produits dans l'onglet <em>Produits financiers</em>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Le client donne le montant et la durée souhaitée",
              "Le bot récupère le taux depuis DetailsFinanciers",
              "Calcul : mensualité, coût total, TAEG simulé",
              "Disclaimer automatique : simulation indicative",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-muted)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}