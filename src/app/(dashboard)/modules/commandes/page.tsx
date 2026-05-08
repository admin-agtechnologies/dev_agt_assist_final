// src/app/(dashboard)/modules/commandes/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { commandesRepository } from "@/repositories/commandes.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { CommandeCard } from "@/components/commandes/CommandeCard";
import { CommandeFilters } from "@/components/commandes/CommandeFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Commande, CommandeStatut } from "@/types/api/commande.types";

const COMMANDE_SLUGS = ["commande_paiement", "suivi_commande", "conciergerie"];

export default function CommandesPage() {
  const { locale } = useLanguage();
  const { features } = useActiveFeatures();

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [statut, setStatut] = useState<CommandeStatut | "">("");
  const [loading, setLoading] = useState(true);

  const activeFeature = features.find(
    (f) => COMMANDE_SLUGS.includes(f.slug) && f.is_active,
  );
  const labels = activeFeature
    ? getFeatureLabel(activeFeature.slug, locale)
    : { pageTitle: locale === "fr" ? "Commandes" : "Orders", empty: locale === "fr" ? "Aucune commande" : "No orders", nav: "", cta: "" };

  const load = useCallback(() => {
    setLoading(true);
    commandesRepository
      .list({ statut: statut || undefined })
      .then((res) => setCommandes(res.results))
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title={labels.pageTitle} />

      <CommandeFilters statut={statut} onChange={setStatut} locale={locale} />

      {loading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : commandes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{labels.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commandes.map((c) => (
            <CommandeCard key={c.id} commande={c} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}