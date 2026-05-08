// src/app/(dashboard)/modules/catalogue/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cataloguesRepository } from "@/repositories/catalogues.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { CatalogueDetail } from "@/types/api/catalogue.types";

export default function CatalogueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dictionary: d, locale } = useLanguage();
  const t = d.catalogue.detail;

  const [catalogue, setCatalogue] = useState<CatalogueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    cataloguesRepository
      .getById(id)
      .then(setCatalogue)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (notFound || !catalogue) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-[var(--text-muted)] text-sm">{t.notFound}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm text-[var(--primary)] underline"
        >
          {d.common.back}
        </button>
      </div>
    );
  }

  const catCount = catalogue.categories.length;
  const itemCount = catalogue.categories.reduce(
    (acc, cat) => acc + cat.items.length,
    0,
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title={catalogue.nom}
        subtitle={catalogue.description}
        onBack={() => router.back()}
      />

      <div className="card p-4 flex gap-6 text-sm">
        <span className="text-[var(--text-muted)]">
          {catCount}{" "}
          {catCount <= 1 ? t.categories : t.categories_plural}
        </span>
        <span className="text-[var(--text-muted)]">
          {itemCount}{" "}
          {itemCount <= 1 ? t.items : t.items_plural}
        </span>
      </div>

      {catalogue.categories.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{t.noCats}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {catalogue.categories.map((cat) => (
            <div key={cat.id} className="card p-4">
              <h2 className="font-semibold text-[var(--text)] mb-3">
                {cat.nom}
              </h2>
              {cat.items.length === 0 ? (
                <p className="text-[var(--text-muted)] text-xs">{t.noItems}</p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {cat.items.map((item) => {
                    const prixLabel = item.est_gratuit
                      ? t.gratuit
                      : item.est_sur_devis
                        ? t.surDevis
                        : item.prix !== null
                          ? `${item.prix.toLocaleString(locale)} ${item.devise}`
                          : t.surDevis;
                    return (
                      <li
                        key={item.id}
                        className="flex items-start justify-between py-2 gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">
                            {item.nom}
                          </p>
                          {item.description && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {item.description}
                            </p>
                          )}
                          {!item.disponible && (
                            <span className="inline-block mt-1 text-xs text-red-500">
                              {t.indisponible}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-[var(--primary)] whitespace-nowrap">
                          {prixLabel}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}