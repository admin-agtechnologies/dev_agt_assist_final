// src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx
"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, MousePointerClick } from "lucide-react";
import { useLanguage }        from "@/contexts/LanguageContext";
import { useToast }           from "@/components/ui/Toast";
import { menuRepository }     from "@/repositories/menu.repository";
import { MenuCategoriePanel } from "../menu/MenuCategoriePanel";
import { MenuPlatGrid }       from "../menu/MenuPlatGrid";
import { AgenceListSkeleton } from "../KnowledgeSkeleton";
import type { MenuCategorie, MenuPlat } from "@/types/api/menu.types";

export function MenuTab() {
  const { dictionary: d } = useLanguage();
  const toast             = useToast();

  const [categories, setCategories] = useState<MenuCategorie[]>([]);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    menuRepository.getCategories()
      .then((list) => {
        setCategories(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => toast.error(t.errorLoad))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers catégories ────────────────────────────────────────────────────
  const handleCatCreated = (cat: MenuCategorie) => {
    setCategories((prev) => [...prev, cat]);
    setSelectedId(cat.id);
  };
  const handleCatUpdated = (cat: MenuCategorie) =>
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, ...cat } : c)));
  const handleCatDeleted = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  // ── Handlers plats ─────────────────────────────────────────────────────────
  const updatePlatsInCat = (catId: string, updater: (plats: MenuPlat[]) => MenuPlat[]) =>
    setCategories((prev) =>
      prev.map((c) => c.id === catId ? { ...c, plats: updater(c.plats) } : c),
    );

  const handlePlatCreated = (plat: MenuPlat) =>
    updatePlatsInCat(plat.categorie, (plats) => [...plats, plat]);
  const handlePlatUpdated = (plat: MenuPlat) =>
    updatePlatsInCat(plat.categorie, (plats) => plats.map((p) => (p.id === plat.id ? plat : p)));
  const handlePlatDeleted = (id: string) =>
    setCategories((prev) =>
      prev.map((c) => ({ ...c, plats: c.plats.filter((p) => p.id !== id) })),
    );

  // ── i18n ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = ((d.knowledge as unknown as any).menu as Record<string, string>) ?? {};
  const tCommon = { save: d.common.save, cancel: d.common.cancel ?? "Annuler", ...t };

  const selectedCat = categories.find((c) => c.id === selectedId) ?? null;

  if (loading) return <AgenceListSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">

      {/* ── Colonne catégories ──────────────────────────────────────────── */}
      <MenuCategoriePanel
        categories={categories}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreated={handleCatCreated}
        onUpdated={handleCatUpdated}
        onDeleted={handleCatDeleted}
        t={tCommon}
      />

      {/* ── Colonne plats ───────────────────────────────────────────────── */}
      <div>
        {selectedCat ? (
          <MenuPlatGrid
            categorie={selectedCat}
            onPlatCreated={handlePlatCreated}
            onPlatUpdated={handlePlatUpdated}
            onPlatDeleted={handlePlatDeleted}
            t={tCommon}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
            bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)] min-h-[200px]">
            <UtensilsCrossed className="w-8 h-8 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{t.emptyCategories}</p>
          </div>
        )}
      </div>

    </div>
  );
}