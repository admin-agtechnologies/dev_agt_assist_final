// src/app/(dashboard)/modules/catalogue/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { cataloguesRepository } from "@/repositories/catalogues.repository";
import { getFeatureLabel } from "@/lib/sector-labels";
import { CatalogueCard } from "@/components/catalogue/CatalogueCard";
import { CategorySection } from "@/components/catalogue/CategorySection";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Catalogue, CatalogueDetail } from "@/types/api/catalogue.types";

const CATALOGUE_SLUGS = [
  "menu_digital", "catalogue_produits", "catalogue_services",
  "catalogue_trajets", "catalogue_produits_financiers", "conciergerie",
];

export default function CataloguePage() {
  const { locale } = useLanguage();
  const { theme } = useSector();
  const { features } = useActiveFeatures();

  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [selected, setSelected] = useState<CatalogueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Trouver le label de la feature catalogue active pour ce secteur
  const activeFeature = features.find(
    (f) => CATALOGUE_SLUGS.includes(f.slug) && f.is_active,
  );
  const pageTitle = activeFeature
    ? getFeatureLabel(activeFeature.slug, locale).pageTitle
    : locale === "fr" ? "Catalogue" : "Catalogue";

  const loadCatalogues = useCallback(() => {
    setLoading(true);
    cataloguesRepository
      .list()
      .then((res) => setCatalogues(res.results))
      .catch(() => setCatalogues([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCatalogues(); }, [loadCatalogues]);

  const openCatalogue = (id: string) => {
    setLoadingDetail(true);
    cataloguesRepository
      .getById(id)
      .then(setSelected)
      .catch(() => setSelected(null))
      .finally(() => setLoadingDetail(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            ← {locale === "fr" ? "Retour" : "Back"}
          </button>
          <h1 className="text-lg font-bold text-[var(--text)]">{selected.nom}</h1>
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center h-32"><Spinner /></div>
        ) : selected.categories.length === 0 ? (
          <div className="card p-8 text-center text-[var(--text-muted)] text-sm">
            {locale === "fr" ? "Aucune catégorie" : "No categories"}
          </div>
        ) : (
          <div className="space-y-3">
            {selected.categories.map((cat) => (
              <CategorySection key={cat.id} categorie={cat} locale={locale} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title={pageTitle} />

      {catalogues.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            {activeFeature
              ? getFeatureLabel(activeFeature.slug, locale).empty
              : locale === "fr" ? "Aucun catalogue" : "No catalogue"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {catalogues.map((cat) => (
            <CatalogueCard
              key={cat.id}
              catalogue={cat}
              locale={locale}
              onClick={() => openCatalogue(cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}