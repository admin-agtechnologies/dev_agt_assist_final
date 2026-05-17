// src/app/(dashboard)/knowledge/_components/tabs/CatalogueTab.tsx
"use client";

import { useActiveFeatures } from "@/hooks/useFeatures";
import { Loader2 }           from "lucide-react";
import { CatalogueProduitTab }  from "../catalogue/CatalogueProduitTab";
import { CatalogueServiceTab }  from "../catalogue/CatalogueServiceTab";
import { CatalogueTrajetTab }   from "../catalogue/CatalogueTrajetTab";
import { ProduitFinancierTab }  from "../catalogue/ProduitFinancierTab";

/**
 * Détecte quelle feature catalogue est active et affiche le bon sous-composant.
 * Ordre de priorité si plusieurs actives (rare) :
 *   produits → services → trajets → financiers
 */
export function CatalogueTab() {
  const { features, isLoading } = useActiveFeatures();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  const active = (slug: string) => features.some((f) => f.slug === slug && f.is_active);

  if (active("catalogue_produits"))              return <CatalogueProduitTab />;
  if (active("catalogue_services"))              return <CatalogueServiceTab />;
  if (active("catalogue_trajets"))               return <CatalogueTrajetTab />;
  if (active("catalogue_produits_financiers"))   return <ProduitFinancierTab />;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
      bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
      <p className="text-sm text-[var(--text-muted)]">
        Aucune feature catalogue active pour ce compte.
      </p>
    </div>
  );
}