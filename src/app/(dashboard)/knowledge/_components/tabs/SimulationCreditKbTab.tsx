// src/app/(dashboard)/knowledge/_components/tabs/SimulationCreditKbTab.tsx
// B5 S39 — Badge "Bientôt disponible" FR/EN explicite (cohérence avec les 3 autres)
"use client";

import { Calculator, Info, CheckCircle, Sparkles } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";

export function SimulationCreditKbTab() {
  const { theme }  = useSector();
  const { locale } = useLanguage();
  const soon = locale === "fr"
    ? "Bientôt disponible — dès la prochaine mise à jour"
    : "Available soon — in the next project update";

  const steps = locale === "fr" ? [
    "Le client donne le montant et la durée souhaitée",
    "Le bot récupère le taux depuis DetailsFinanciers",
    "Calcul : mensualité, coût total, TAEG simulé",
    "Disclaimer automatique : simulation indicative",
  ] : [
    "Client provides desired amount and duration",
    "Bot retrieves the rate from DetailsFinanciers",
    "Calculation: monthly payment, total cost, simulated APR",
    "Automatic disclaimer: indicative simulation only",
  ];

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
            <p className="font-bold text-[var(--text)]">
              {locale === "fr" ? "Simulation Crédit" : "Credit Simulation"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr"
                ? "Calcul automatique par le bot depuis vos produits financiers"
                : "Automatic calculation by the bot from your financial products"}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            <Sparkles className="w-3 h-3" />
            {locale === "fr" ? "Bientôt disponible" : "Coming soon"}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                {locale === "fr" ? "Aucune configuration requise ici" : "No configuration required here"}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                {locale === "fr"
                  ? <>Le bot calcule les simulations automatiquement à partir de vos <strong>Produits financiers</strong> (taux, montants min/max, conditions). Configurez vos produits dans l'onglet <em>Produits financiers</em>.</>
                  : <>The bot calculates simulations automatically from your <strong>Financial Products</strong> (rates, min/max amounts, conditions). Configure products in the <em>Financial Products</em> tab.</>}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-muted)]">{step}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
            <p className="text-xs font-medium" style={{ color: theme.primary }}>{soon}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// END OF FILE: src/app/(dashboard)/knowledge/_components/tabs/SimulationCreditKbTab.tsx